import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Clock3, Feather, PenLine, Tag, UsersRound } from 'lucide-react'

const storageKey = 'akademix-community-blogs'
const featuredBlogs = [
  { id: 'first-semester-abroad', category: 'Student life', readTime: '5 min read', title: 'What I wish I knew before my first semester abroad', excerpt: 'From building a tiny support system to treating office hours as an invitation, the habits that made a new campus feel like home.', author: 'Meera Shah', role: 'Student | University of Toronto', date: 'September 24, 2026', accent: 'from-amber-100 via-orange-50 to-rose-100' },
  { id: 'research-curiosity', category: 'Academic growth', readTime: '6 min read', title: 'The best research questions start with curiosity, not certainty', excerpt: 'A professor shares a practical way to turn an interesting observation into a focused, manageable research question.', author: 'Dr. Arun Iyer', role: 'Professor | Computer Science', date: 'September 18, 2026', accent: 'from-emerald-100 via-teal-50 to-sky-100' },
  { id: 'portfolio-matters', category: 'Careers', readTime: '4 min read', title: 'Your portfolio is a story - make every project earn its place', excerpt: 'A recruiter explains what makes an early-career portfolio memorable, even when you do not have years of experience.', author: 'Nadia Fernandes', role: 'Recruiter | Product & Design', date: 'September 10, 2026', accent: 'from-violet-100 via-fuchsia-50 to-pink-100' },
  { id: 'quiet-confidence', category: 'Wellbeing', readTime: '3 min read', title: 'A quieter way to build confidence before interviews', excerpt: 'Small, repeatable practice can make the biggest conversations feel much less intimidating.', author: 'Owen Brooks', role: 'Career mentor', date: 'September 4, 2026', accent: 'from-blue-100 via-indigo-50 to-slate-100' },
]

function readBlogs() { try { const posts = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(posts) ? posts : [] } catch { return [] } }
function formatDate(date) { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date) }

export default function Blogs() {
  const [communityBlogs, setCommunityBlogs] = useState(readBlogs)
  const [composerOpen, setComposerOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState('Student life')
  const [filter, setFilter] = useState('All')
  const allBlogs = useMemo(() => [...communityBlogs, ...featuredBlogs], [communityBlogs])
  const categories = ['All', ...new Set(allBlogs.map((blog) => blog.category))]
  const visibleBlogs = filter === 'All' ? allBlogs : allBlogs.filter((blog) => blog.category === filter)

  const openComposer = () => {
    let user = null
    try { user = JSON.parse(localStorage.getItem('akademix-auth-session') || 'null') } catch { user = null }
    if (!user) { window.dispatchEvent(new CustomEvent('akademix-open-auth', { detail: { redirectTo: '/blogs' } })); return }
    setNotice('')
    setComposerOpen(true)
  }

  const publishBlog = (event) => {
    event.preventDefault()
    let user = null
    try { user = JSON.parse(localStorage.getItem('akademix-auth-session') || 'null') } catch { user = null }
    if (!user) return
    const form = new FormData(event.currentTarget)
    const post = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`, title: form.get('title').trim(), excerpt: form.get('excerpt').trim(), category, author: user.name || 'Akademix community member', role: user.role || 'Student', date: formatDate(new Date()), readTime: 'New story', accent: 'from-stone-100 via-amber-50 to-emerald-100' }
    const updated = [post, ...communityBlogs]
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setCommunityBlogs(updated)
    setComposerOpen(false)
    setNotice('Your blog is published and now appears at the top of the community feed.')
  }

  return <>
    <div className="container-content py-12 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="relative max-w-3xl"><p className="eyebrow mb-3">The Akademix journal</p><h1 className="font-display text-4xl text-ink sm:text-5xl">Ideas for every next step.</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">Useful perspectives from students finding their footing, professors sharing what they have learned, and recruiters opening a window into the world of work.</p><button type="button" onClick={openComposer} className="btn-primary mt-7"><PenLine size={17} /> Write a blog</button><p className="mt-3 text-xs text-slate">Students, professors, and recruiters can sign in to share a story.</p></div>
      </section>
      <section className="mt-12" aria-labelledby="community-stories-title">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">Read, reflect, grow</p><h2 id="community-stories-title" className="font-display text-3xl text-ink">Community stories</h2></div><div className="flex flex-wrap gap-2" aria-label="Filter blogs by category">{categories.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${filter === item ? 'bg-ink text-white' : 'border border-line bg-white/70 text-slate hover:border-brass hover:text-ink'}`}>{item}</button>)}</div></div>
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
        <div className="mt-6 grid gap-5 md:grid-cols-2">{visibleBlogs.map((blog) => <article key={blog.id} className="card flex min-h-[265px] flex-col p-6"><div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${blog.accent} text-ink`}><BookOpen size={20} /></div><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate"><span className="inline-flex items-center gap-1 text-brass-dark"><Tag size={12} />{blog.category}</span><span className="inline-flex items-center gap-1"><Clock3 size={12} />{blog.readTime}</span></div><h3 className="mt-3 font-display text-2xl leading-tight text-ink">{blog.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate">{blog.excerpt}</p><div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-sm font-medium text-ink">{blog.author}</p><p className="mt-0.5 text-xs text-slate">{blog.role}</p></div><time className="text-right text-xs text-slate">{blog.date}</time></div></article>)}</div>
      </section>
      <section className="mt-12 grid gap-4 rounded-2xl border border-line bg-white/60 p-6 sm:grid-cols-3" aria-label="Who can write for Akademix"><div className="flex gap-3"><UsersRound className="mt-0.5 text-brass-dark" /><div><h2 className="font-medium text-ink">Students</h2><p className="mt-1 text-sm text-slate">Share what helped you learn, apply, and settle in.</p></div></div><div className="flex gap-3"><Feather className="mt-0.5 text-brass-dark" /><div><h2 className="font-medium text-ink">Professors</h2><p className="mt-1 text-sm text-slate">Turn your experience into clear guidance for learners.</p></div></div><div className="flex gap-3"><BookOpen className="mt-0.5 text-brass-dark" /><div><h2 className="font-medium text-ink">Recruiters</h2><p className="mt-1 text-sm text-slate">Help emerging talent understand the path ahead.</p></div></div></section>
    </div>
    {composerOpen && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false) }}><section role="dialog" aria-modal="true" aria-labelledby="write-blog-title" className="my-auto w-full max-w-xl rounded-3xl border border-white bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow mb-1">Share your perspective</p><h2 id="write-blog-title" className="font-display text-3xl text-ink">Write a blog</h2></div><button type="button" onClick={() => setComposerOpen(false)} className="rounded-lg px-2 py-1 text-slate hover:bg-stone hover:text-ink" aria-label="Close blog editor">Close</button></div><form onSubmit={publishBlog} className="mt-6 space-y-4"><label className="block text-sm font-medium text-ink">Title<input name="title" required maxLength="120" placeholder="Give your story a clear title" className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" /></label><label className="block text-sm font-medium text-ink">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal outline-none focus:border-brass"><option>Student life</option><option>Academic growth</option><option>Careers</option><option>Wellbeing</option></select></label><label className="block text-sm font-medium text-ink">Your story<textarea name="excerpt" required rows="6" maxLength="600" placeholder="Write your perspective, advice, or experience..." className="mt-1.5 w-full resize-y rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-brass" /></label><p className="text-xs text-slate">Your post is saved and displayed in this browser.</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setComposerOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Publish blog</button></div></form></section></div>, document.body)}
  </>
}
