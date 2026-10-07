import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, BookOpen, Clock3, Feather, PenLine, Tag, UsersRound, X } from 'lucide-react'

const storageKey = 'akademix-community-blogs'

const featuredBlogs = [
  {
    id: 'first-semester-abroad',
    category: 'Student life',
    readTime: '5 min read',
    title: 'What I wish I knew before my first semester abroad',
    excerpt: 'From building a tiny support system to treating office hours as an invitation, the habits that made a new campus feel like home.',
    content: `When my flight touched down in Toronto four years ago, my suitcase was packed with warm sweaters and spices from home, but mentally I felt completely unprepared. Everyone on social media made studying abroad look like an endless reel of architectural photos and cozy coffee shops. Nobody showed the sheer disorientation of figuring out city transit during rush hour or the sudden silence of a dorm room when classes end.

The first few weeks were a blur of campus tours and syllabi. I felt an acute case of imposter syndrome: in lectures with hundreds of students, everyone seemed so articulate and confident, while I was afraid to ask where the library printers were located.

What eventually changed everything was a conscious decision to shrink the campus down to size. Big universities feel terrifying until you build micro-communities. Here are the three key shifts that made a foreign campus finally feel like home:

1. Treat office hours as a conversation, not an interrogation.
For the first month, I thought office hours were only for students who had failed a quiz. When I finally forced myself to attend a literature professor's office hours just to ask for reading recommendations, I discovered professors are genuinely eager to connect with curious students. That single meeting gave me confidence and led to an on-campus research assistantship later that year.

2. Build a tiny, reliable routine before chasing every event.
You do not need to attend every club mixer. What anchored me was finding one regular quiet study spot on campus, one grocery store where I learned the aisles, and one weekday evening routine with two classmates. Predictability is the best antidote to culture shock.

3. Speak up about feeling homesick — you will realize everyone is masking it.
The moment I admitted to a classmate that I missed home and found the winter overwhelming, their shoulders dropped in visible relief. Everyone is fighting the same silent battles of adaptation. Once you start being vulnerable, genuine friendships begin to form.

Studying abroad isn't about transforming into a new person overnight. It is about learning that you can carry who you are into unfamiliar rooms, step by step, and gradually make them your own.`,
    author: 'Meera Shah',
    role: 'Student | University of Toronto',
    date: 'September 24, 2026',
    accent: 'from-amber-100 via-orange-50 to-rose-100'
  },
  {
    id: 'research-curiosity',
    category: 'Academic growth',
    readTime: '6 min read',
    title: 'The best research questions start with curiosity, not certainty',
    excerpt: 'A professor shares a practical way to turn an interesting observation into a focused, manageable research question.',
    content: `Every semester, bright undergraduate and graduate students walk into my office with proposed research topics. Almost invariably, they bring proposals that look like predetermined conclusions: "I want to prove that method X outperforms method Y" or "I want to show that artificial intelligence will transform healthcare in this specific way."

I always ask them to pause and take a step back. Research is not legal advocacy; your job is not to build a defense for a claim you decided before looking at the evidence. The most groundbreaking research invariably starts not with certainty, but with genuine, open-ended curiosity.

How do you find questions worth asking?

First, look for anomalies rather than confirmations. When you read recent publications or review datasets, do not just search for what aligns with prevailing wisdom. Pay close attention to the footnotes, the edge cases, and the anomalies that authors casually dismiss as noise. Some of the most influential discoveries in computer science and data systems began because a researcher wondered, "Why did this outlier occur under these specific edge conditions?"

Second, narrow your scope until it hurts. A common pitfall among enthusiastic learners is attempting to solve an entire domain in a single semester. A question like "How can we optimize distributed systems?" is virtually unanswerable in a single project. However, asking "How does network jitter affect tail latency in 3-node consensus protocols under partition scenarios?" gives you an actionable perimeter. Specificity is not a limitation; it is the lens that brings clarity.

Third, embrace the possibility of being wrong. If your hypothesis is disproven, you have not failed — you have eliminated an incorrect assumption, which is equally vital scientific progress.

When you learn to celebrate unexpected results instead of fearing them, the academic journey shifts from an anxiety-ridden performance into a thrilling exploration.`,
    author: 'Dr. Arun Iyer',
    role: 'Professor | Computer Science',
    date: 'September 18, 2026',
    accent: 'from-emerald-100 via-teal-50 to-sky-100'
  },
  {
    id: 'portfolio-matters',
    category: 'Careers',
    readTime: '4 min read',
    title: 'Your portfolio is a story - make every project earn its place',
    excerpt: 'A recruiter explains what makes an early-career portfolio memorable, even when you do not have years of experience.',
    content: `Over the past seven years of recruiting across tech companies and design consultancies, I have reviewed thousands of portfolios from students and early-career job seekers. The biggest misconception candidates have is that volume equals competency.

A portfolio packed with fifteen tutorial projects, simple clones, or half-finished hackathon repos tells a recruiter very little about how you actually think. In reality, a candidate with just two deeply considered, well-articulated projects will stand out far more than someone with twenty generic repos.

Here is what hiring teams actually look for when evaluating candidate work:

1. The "Why" behind your choices.
Anyone can follow a step-by-step tutorial to assemble an app. What hiring managers want to understand is your decision-making framework. Why did you choose PostgreSQL over MongoDB for this specific use case? What trade-offs did you make between developer velocity and data consistency? Documenting the decisions and trade-offs you faced reveals genuine engineering or design maturity.

2. How you navigate constraints and road-blocks.
Real-world projects never follow the happy path. When your initial architecture struggled under simulated load, how did you profile the bottleneck? When a user test revealed confusion, how did you iterate? Showing your debugging process and how you pivot when things go wrong proves that you will be resilient when joining a real production team.

3. Measurable outcomes and impact.
Even for personal or academic projects, define what success meant. Did your optimization cut bundle size by 38%? Did your peer survey validate a 20% faster task completion time? Demonstrating an awareness of outcomes shows you care about business and human value, not just isolated lines of code.

Curate your work ruthlessly. Give every project a clear narrative arc: context, challenge, choices, and reflection. When you do that, your portfolio ceases to be a list of homework assignments and becomes a compelling demonstration of your future potential.`,
    author: 'Nadia Fernandes',
    role: 'Recruiter | Product & Design',
    date: 'September 10, 2026',
    accent: 'from-violet-100 via-fuchsia-50 to-pink-100'
  },
  {
    id: 'quiet-confidence',
    category: 'Wellbeing',
    readTime: '3 min read',
    title: 'A quieter way to build confidence before interviews',
    excerpt: 'Small, repeatable practice can make the biggest conversations feel much less intimidating.',
    content: `When people talk about interview confidence, they often picture charismatic extraverts who command the room with commanding gestures and effortless charm. For many students and introverted professionals, this caricature feels alien and unattainable, leading them to believe that they simply "aren't cut out" for high-stakes interviews.

Confidence does not require bombastic charisma. In fact, some of the most compelling interviews I have witnessed came from thoughtful, soft-spoken candidates whose quiet conviction shone through their clarity and composure.

Here is how you can build genuine, grounded confidence before your next big interview:

1. Reframe the interview as a collaborative consultation.
If you think of the interview as an oral examination where an inquisitor is trying to catch you making mistakes, your nervous system will naturally trigger a fight-or-flight response. Instead, reframe it: the team has a set of problems they need help solving, and you are having a conversation to discover whether your skills and working style are the right mutual fit. You are evaluating them just as much as they are evaluating you.

2. Record and review just two minutes of speech.
Do not overwhelm yourself with hour-long mock interviews right away. Pick one standard question ("Tell me about a time you handled disagreement in a team") and record a 90-second voice note on your phone. Listen back once, note where you rambled or paused unnecessarily, and record it a second time. This small, low-stress feedback loop builds rapid speaking fluency.

3. Give yourself permission to pause.
Nervous speakers rush to fill every millisecond of silence. Remember: taking three seconds to take a breath and say "That is an insightful question; let me take a brief moment to structure my thoughts" makes you look deliberate, thoughtful, and composed, not uncertain.

Quiet confidence is not about being the loudest voice in the room. It is about knowing the value of your experience and communicating it with quiet precision.`,
    author: 'Owen Brooks',
    role: 'Career mentor',
    date: 'September 4, 2026',
    accent: 'from-blue-100 via-indigo-50 to-slate-100'
  }
]

function readBlogs() {
  try {
    const posts = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(posts) ? posts : []
  } catch {
    return []
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

function formatParagraphs(text) {
  if (!text) return null
  const paragraphs = text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length <= 1) {
    return <p className="whitespace-pre-line leading-relaxed text-slate/90">{text}</p>
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="leading-relaxed text-slate/90">
      {paragraph}
    </p>
  ))
}

export default function Blogs() {
  const [communityBlogs, setCommunityBlogs] = useState(readBlogs)
  const [composerOpen, setComposerOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState('Student life')
  const [filter, setFilter] = useState('All')
  const [storyContent, setStoryContent] = useState('')

  const allBlogs = useMemo(() => [...communityBlogs, ...featuredBlogs], [communityBlogs])
  const categories = useMemo(() => ['All', ...new Set(allBlogs.map((blog) => blog.category))], [allBlogs])
  const visibleBlogs = useMemo(
    () => (filter === 'All' ? allBlogs : allBlogs.filter((blog) => blog.category === filter)),
    [allBlogs, filter]
  )

  const wordCount = useMemo(() => {
    return storyContent.trim() ? storyContent.trim().split(/\s+/).filter(Boolean).length : 0
  }, [storyContent])

  const charCount = storyContent.length

  useEffect(() => {
    if (!selectedBlog && !composerOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (selectedBlog) setSelectedBlog(null)
        else if (composerOpen) setComposerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedBlog, composerOpen])

  const openComposer = () => {
    let user = null
    try {
      user = JSON.parse(localStorage.getItem('akademix-auth-session') || 'null')
    } catch {
      user = null
    }

    if (!user) {
      window.dispatchEvent(new CustomEvent('akademix-open-auth', { detail: { redirectTo: '/blogs' } }))
      return
    }

    setNotice('')
    setStoryContent('')
    setComposerOpen(true)
  }

  const publishBlog = (event) => {
    event.preventDefault()
    let user = null
    try {
      user = JSON.parse(localStorage.getItem('akademix-auth-session') || 'null')
    } catch {
      user = null
    }

    if (!user) return

    const form = new FormData(event.currentTarget)
    const title = (form.get('title') || '').toString().trim()
    const content = storyContent.trim()

    if (!title || !content) return

    const words = content.split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    const readTime = `${minutes} min read`

    const post = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      title,
      content,
      excerpt: content.length > 200 ? `${content.slice(0, 197)}...` : content,
      category,
      author: user.name || 'Akademix community member',
      role: user.role || 'Student',
      date: formatDate(new Date()),
      readTime,
      accent: 'from-amber-100 via-orange-50 to-emerald-100'
    }

    const updated = [post, ...communityBlogs]
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setCommunityBlogs(updated)
    setComposerOpen(false)
    setStoryContent('')
    setNotice('Your blog has been published and is now available in the community feed.')
  }

  return (
    <>
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-10 shadow-sm sm:px-10 sm:py-14">
          <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs tracking-normal text-brass-dark font-medium mb-3">The Akademix journal</p>
            <h1 className="font-display text-4xl text-ink sm:text-5xl font-semibold tracking-tight">Ideas for every next step.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
              Useful perspectives from students finding their footing, professors sharing what they have learned, and recruiters opening a window into the world of work.
            </p>
            <button
              type="button"
              onClick={openComposer}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink text-paper px-6 py-3 text-sm font-medium hover:bg-ink-light hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer mt-7 shadow-sm"
            >
              <PenLine size={17} /> Write a blog
            </button>
            <p className="mt-3 text-xs text-slate">Students, professors, and recruiters can sign in to share a story.</p>
          </div>
        </section>

        {/* Community Stories Section */}
        <section className="mt-12" aria-labelledby="community-stories-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-normal text-brass-dark font-medium mb-2">Read, reflect, grow</p>
              <h2 id="community-stories-title" className="font-display text-3xl font-semibold text-ink">
                Community stories
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter blogs by category">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    filter === item
                      ? 'bg-ink text-paper shadow-sm'
                      : 'border border-line bg-white/70 text-slate hover:border-brass/70 hover:text-ink hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {notice && (
            <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </p>
          )}

          {/* Blog Cards Grid */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {visibleBlogs.map((blog) => (
              <article
                key={blog.id}
                tabIndex={0}
                role="button"
                aria-haspopup="dialog"
                onClick={() => setSelectedBlog(blog)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedBlog(blog)
                  }
                }}
                className="group flex min-h-[280px] flex-col p-6 sm:p-7 rounded-2xl border border-line bg-gradient-to-br from-white/95 via-[#fff8ec]/90 to-[#fcf0f4]/80 shadow-[0_10px_28px_rgba(89,70,49,0.07)] [overflow-wrap:anywhere] relative transition-all duration-300 hover:border-brass/40 hover:shadow-[0_20px_42px_rgba(16,24,38,0.12)] hover:-translate-y-1.5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${blog.accent} text-ink shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                    <BookOpen size={20} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate">
                    <span className="inline-flex items-center gap-1 font-medium text-brass-dark">
                      <Tag size={12} />
                      {blog.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      {blog.readTime}
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl font-semibold leading-tight text-ink group-hover:text-brass-dark transition-colors duration-200">
                  {blog.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate line-clamp-3">
                  {blog.excerpt || (blog.content ? `${blog.content.slice(0, 180)}...` : '')}
                </p>

                <div className="mt-auto flex items-end justify-between gap-3 pt-6 border-t border-line/60">
                  <div>
                    <p className="text-sm font-semibold text-ink">{blog.author}</p>
                    <p className="mt-0.5 text-xs text-slate">{blog.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <time className="text-xs text-slate">{blog.date}</time>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brass-dark group-hover:translate-x-1 transition-transform duration-200">
                      Read story <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Roles Informational Section */}
        <section className="mt-12 grid gap-4 rounded-2xl border border-line bg-white/60 p-6 sm:grid-cols-3" aria-label="Who can write for Akademix">
          <div className="flex gap-3">
            <UsersRound className="mt-0.5 text-brass-dark shrink-0" />
            <div>
              <h3 className="font-semibold text-ink">Students</h3>
              <p className="mt-1 text-sm text-slate">Share what helped you learn, apply, and settle in.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Feather className="mt-0.5 text-brass-dark shrink-0" />
            <div>
              <h3 className="font-semibold text-ink">Professors</h3>
              <p className="mt-1 text-sm text-slate">Turn your experience into clear guidance for learners.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 text-brass-dark shrink-0" />
            <div>
              <h3 className="font-semibold text-ink">Recruiters</h3>
              <p className="mt-1 text-sm text-slate">Help emerging talent understand the path ahead.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Reading Window (In-Page Modal) */}
      {selectedBlog &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/60 p-4 sm:p-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedBlog(null)
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-blog-title"
              className="relative my-auto flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-line bg-paper shadow-2xl overflow-hidden"
            >
              {/* Reader Header */}
              <div className="flex items-center justify-between border-b border-line/70 bg-paper/95 px-6 py-4 sm:px-8">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-1 font-semibold text-brass-dark">
                    <Tag size={12} />
                    {selectedBlog.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate">
                    <Clock3 size={12} />
                    {selectedBlog.readTime}
                  </span>
                  <span className="text-slate/40">•</span>
                  <time className="text-slate">{selectedBlog.date}</time>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="rounded-full p-2 text-slate hover:bg-stone hover:text-ink transition-colors cursor-pointer"
                  aria-label="Close reading window"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reader Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 space-y-6">
                <h2
                  id="reader-blog-title"
                  className="font-display text-2xl sm:text-4xl font-semibold leading-tight text-ink"
                >
                  {selectedBlog.title}
                </h2>

                {/* Author Info Card */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-line/80 bg-white/80 p-4 shadow-sm">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                      selectedBlog.accent || 'from-amber-100 via-orange-50 to-emerald-100'
                    } text-ink font-display text-lg font-bold shadow-sm`}
                  >
                    {selectedBlog.author ? selectedBlog.author.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">{selectedBlog.author}</p>
                    <p className="text-xs sm:text-sm text-slate">{selectedBlog.role}</p>
                  </div>
                </div>

                {/* Story Content */}
                <div className="space-y-4 text-base sm:text-lg leading-relaxed font-sans text-ink">
                  {formatParagraphs(selectedBlog.content || selectedBlog.excerpt)}
                </div>
              </div>

              {/* Reader Footer */}
              <div className="flex items-center justify-between border-t border-line/70 bg-paper/95 px-6 py-4 sm:px-8">
                <p className="text-xs text-slate hidden sm:block">The Akademix Journal • Ideas for every next step</p>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedBlog(null)}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-ink px-6 py-2 text-sm font-medium text-paper hover:bg-ink-light transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    Close story
                  </button>
                </div>
              </div>
            </section>
          </div>,
          document.body
        )}

      {/* Composer Modal */}
      {composerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/60 p-4 sm:p-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setComposerOpen(false)
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="write-blog-title"
              className="relative my-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-line bg-white shadow-2xl overflow-hidden p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-normal text-brass-dark font-medium mb-1">Share your perspective</p>
                  <h2 id="write-blog-title" className="font-display text-3xl font-semibold text-ink">
                    Write a blog
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="rounded-full p-2 text-slate hover:bg-stone hover:text-ink transition-colors cursor-pointer"
                  aria-label="Close blog editor"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={publishBlog} className="mt-6 flex flex-col gap-4 overflow-y-auto pr-1">
                <label className="block text-sm font-medium text-ink">
                  Title
                  <input
                    name="title"
                    required
                    placeholder="Give your story a clear title"
                    className="mt-1.5 h-11 w-full rounded-xl border border-line px-3.5 text-base font-normal text-ink outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
                  />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Category
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-base font-normal text-ink outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20 cursor-pointer"
                  >
                    <option>Student life</option>
                    <option>Academic growth</option>
                    <option>Careers</option>
                    <option>Wellbeing</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-ink">
                  Your story
                  <textarea
                    name="story"
                    required
                    rows={8}
                    value={storyContent}
                    onChange={(event) => setStoryContent(event.target.value)}
                    placeholder="Write your perspective, advice, or experience... There are no word or character limits."
                    className="mt-1.5 w-full resize-y rounded-xl border border-line p-3.5 text-base font-normal text-ink outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20 leading-relaxed min-h-[180px]"
                  />
                </label>

                <div className="flex items-center justify-between text-xs text-slate">
                  <span>No word or character limit — write as much as you wish</span>
                  <span>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'letter' : 'letters'}
                  </span>
                </div>

                <p className="text-xs text-slate">Your post is saved and displayed in this browser.</p>

                <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-line/60">
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50 hover:bg-black/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink-light hover:-translate-y-0.5 cursor-pointer shadow-sm"
                  >
                    Publish blog
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </>
  )
}
