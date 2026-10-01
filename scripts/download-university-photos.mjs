import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const outputDirectory = new URL('../public/university-images/', import.meta.url)
const metadataFile = new URL('../src/data/universityCampusPhotos.json', import.meta.url)
const source = await readFile(new URL('../src/data/universities.js', import.meta.url), 'utf8')
const universities = [...source.matchAll(/\{ id: '([^']+)', name: '([^']+)'/g)]
  .map(([, id, name]) => ({ id, name }))
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const normalize = (value) => value.replaceAll('_', ' ').replace(/\s+/g, ' ').trim().toLowerCase()
const toArticleTitle = (name) => name.replace(/\s*\([^)]*\)\s*$/, '').trim()

async function request(url, label) {
  let response
  for (let attempt = 0; attempt < 7; attempt += 1) {
    response = await fetch(url, { headers: { 'User-Agent': 'Akademix university campus photo importer' } })
    if (response.ok || (response.status !== 429 && response.status < 500)) break
    const retryAfter = Number(response.headers.get('retry-after'))
    await pause(Math.max(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0, (attempt + 1) * 2000))
  }
  if (!response?.ok) throw new Error(`${label} failed with HTTP ${response?.status ?? 'unknown'}`)
  return response
}

const pagesByTitle = new Map()
for (let start = 0; start < universities.length; start += 50) {
  const batch = universities.slice(start, start + 50)
  const params = new URLSearchParams({
    action: 'query',
    titles: batch.map(({ name }) => toArticleTitle(name)).join('|'),
    redirects: '1',
    prop: 'images|info',
    inprop: 'url',
    imlimit: 'max',
    format: 'json',
    origin: '*',
  })
  const result = await (await request(`https://en.wikipedia.org/w/api.php?${params}`, 'University article lookup')).json()
  for (const page of Object.values(result.query?.pages ?? {})) {
    pagesByTitle.set(normalize(page.title), page)
    if (page.original?.title) pagesByTitle.set(normalize(page.original.title), page)
  }
  for (const redirect of result.query?.redirects ?? []) {
    const page = pagesByTitle.get(normalize(redirect.to))
    if (page) pagesByTitle.set(normalize(redirect.from), page)
  }
}

function rankImageTitle(title) {
  if (!/\.(jpe?g|png|webp)$/i.test(title)) return -1000
  if (/logo|wordmark|seal|crest|coat.of.arms|flag|map|diagram|icon|portrait|headshot|faculty|professor/i.test(title)) return -100
  let score = 0
  if (/campus|building|hall|library|institute|university|college|aerial|tower|quad|courtyard|entrance|school/i.test(title)) score += 20
  if (/campus|building|hall|library|quad|courtyard|entrance/i.test(title)) score += 20
  return score
}

const schoolTerms = (university) => {
  const alias = university.name.match(/\(([^)]+)\)/)?.[1] || ''
  return [toArticleTitle(university.name), alias]
    .join(' ')
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    .filter((term) => term.length > 2 && !['university', 'institute', 'college', 'school', 'the', 'and', 'for', 'of', 'at'].includes(term))
}

const matchesSchoolName = (university, title) => {
  const normalizedTitle = normalize(title)
  return schoolTerms(university).some((term) => normalizedTitle.includes(term))
}

const records = universities.map((university) => {
  const requested = toArticleTitle(university.name)
  const page = pagesByTitle.get(normalize(requested))
  if (!page) throw new Error(`Could not find the Wikipedia article for ${university.name}`)
  const allCandidates = (page.images ?? [])
    .map(({ title }) => ({ title: title.replace(/^File:/i, ''), score: rankImageTitle(title) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
  const candidates = allCandidates.filter(({ title }) => matchesSchoolName(university, title))
  return { university, page, candidates, allCandidates }
})

function plainText(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

async function searchCommons(university) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `"${university.name}" campus`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo|info',
    inprop: 'url',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  })
  const result = await (await request(`https://commons.wikimedia.org/w/api.php?${params}`, `Photo search for ${university.name}`)).json()
  return Object.values(result.query?.pages ?? []).map((page) => {
    const info = page.imageinfo?.[0]
    return {
      title: page.title.replace(/^File:/i, ''),
      url: info?.thumburl || info?.url,
      source: page.fullurl,
      artist: plainText(info?.extmetadata?.Artist?.value) || 'Wikimedia Commons contributor',
      license: plainText(info?.extmetadata?.LicenseShortName?.value),
    }
  }).filter((photo) => photo.url && rankImageTitle(photo.title) > 0 && matchesSchoolName(university, photo.title))
}

const photoMap = {}
const usedHashes = new Set()
const usedSourceFiles = new Set()
await mkdir(outputDirectory, { recursive: true })

for (const { university, page, candidates, allCandidates } of records) {
  let saved = false
  const articleCandidates = candidates.map((candidate) => ({
    ...candidate,
    url: `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(candidate.title.replaceAll(' ', '_'))}?width=1200`,
    source: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`,
    artist: 'Wikimedia Commons contributor',
    license: '',
  }))
  let photoCandidates = articleCandidates.length ? articleCandidates : await searchCommons(university)

  for (const candidate of photoCandidates) {
    if (usedSourceFiles.has(normalize(candidate.title))) continue
    usedSourceFiles.add(normalize(candidate.title))
    let response
    try {
      response = await request(candidate.url, `Campus photo for ${university.name}`)
    } catch {
      continue
    }

    const bytes = new Uint8Array(await response.arrayBuffer())
    const hash = createHash('sha256').update(bytes).digest('hex')
    if (bytes.length < 1000 || usedHashes.has(hash)) continue
    usedHashes.add(hash)

    const extension = new URL(response.url || candidate.url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[0]
      || candidate.title.match(/\.(jpe?g|png|webp)$/i)?.[0]
      || '.jpg'
    const filename = `${university.id}${extension}`
    await writeFile(new URL(filename, outputDirectory), bytes)
    photoMap[university.id] = {
      url: `/university-images/${filename}`,
      source: candidate.source || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(candidate.title.replaceAll(' ', '_'))}`,
      artist: candidate.artist || 'Wikimedia Commons contributor',
      license: candidate.license || '',
    }
    console.log(`${Object.keys(photoMap).length}/${universities.length}: ${university.name} — ${candidate.title}`)
    await pause(1200)
    saved = true
    break
  }
  if (!saved && articleCandidates.length) {
    photoCandidates = await searchCommons(university)
    for (const candidate of photoCandidates) {
      if (usedSourceFiles.has(normalize(candidate.title))) continue
      usedSourceFiles.add(normalize(candidate.title))
      let response
      try {
        response = await request(candidate.url, `Campus photo for ${university.name}`)
      } catch {
        continue
      }
      const bytes = new Uint8Array(await response.arrayBuffer())
      const hash = createHash('sha256').update(bytes).digest('hex')
      if (bytes.length < 1000 || usedHashes.has(hash)) continue
      usedHashes.add(hash)
      const extension = new URL(response.url || candidate.url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[0]
        || candidate.title.match(/\.(jpe?g|png|webp)$/i)?.[0]
        || '.jpg'
      const filename = `${university.id}${extension}`
      await writeFile(new URL(filename, outputDirectory), bytes)
      photoMap[university.id] = {
        url: `/university-images/${filename}`,
        source: candidate.source,
        artist: candidate.artist,
        license: candidate.license,
      }
      console.log(`${Object.keys(photoMap).length}/${universities.length}: ${university.name} — ${candidate.title}`)
      await pause(1200)
      saved = true
      break
    }
  }
  if (!saved) {
    const relatedArticlePhotos = allCandidates.map((candidate) => ({
      ...candidate,
      url: `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(candidate.title.replaceAll(' ', '_'))}?width=1200`,
      source: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`,
      artist: 'Wikimedia Commons contributor',
      license: '',
    }))
    for (const candidate of relatedArticlePhotos) {
      if (usedSourceFiles.has(normalize(candidate.title))) continue
      usedSourceFiles.add(normalize(candidate.title))
      let response
      try {
        response = await request(candidate.url, `Article photo for ${university.name}`)
      } catch {
        continue
      }
      if (!response.headers.get('content-type')?.startsWith('image/')) continue
      const bytes = new Uint8Array(await response.arrayBuffer())
      const hash = createHash('sha256').update(bytes).digest('hex')
      if (bytes.length < 1000 || usedHashes.has(hash)) continue
      usedHashes.add(hash)
      const extension = new URL(response.url || candidate.url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[0]
        || candidate.title.match(/\.(jpe?g|png|webp)$/i)?.[0]
        || '.jpg'
      const filename = `${university.id}${extension}`
      await writeFile(new URL(filename, outputDirectory), bytes)
      photoMap[university.id] = {
        url: `/university-images/${filename}`,
        source: candidate.source,
        artist: candidate.artist,
        license: candidate.license,
      }
      console.log(`${Object.keys(photoMap).length}/${universities.length}: ${university.name} — related article image ${candidate.title}`)
      await pause(1200)
      saved = true
      break
    }
  }
  if (!saved) throw new Error(`No distinct campus photo could be downloaded for ${university.name}`)
}

await writeFile(metadataFile, `${JSON.stringify(photoMap, null, 2)}\n`)
console.log(`Saved ${universities.length} university article photos with ${usedHashes.size} distinct image files.`)
