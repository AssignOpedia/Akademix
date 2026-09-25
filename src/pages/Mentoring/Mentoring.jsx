import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import { mentorProfiles } from '../../data/mentors'
import ProfessorAvatar from '../../components/ProfessorAvatar/ProfessorAvatar'

export default function Mentoring() {
  const [contactMentor, setContactMentor] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')

  const openContactForm = (mentor) => {
    let savedProfile = null
    try {
      savedProfile = JSON.parse(localStorage.getItem('akademix-student-profile') || 'null')
    } catch {
      savedProfile = null
    }
    setStudentName(savedProfile?.name || '')
    setStudentEmail(savedProfile?.email || '')
    setContactMentor(mentor)
    setSubmitted(false)
  }

  const closeContactForm = () => {
    setContactMentor(null)
    setSubmitted(false)
  }

  useEffect(() => {
    if (!contactMentor) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeContactForm()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contactMentor])

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Meet your student guides</p>
      <h1 className="font-display text-4xl text-ink mb-3">Mentors who help you plan your next step</h1>
      <p className="text-slate max-w-xl mb-10">
        These mentors guide students through subject choices, college planning, and study goals.
        They can also help you decide what to look for in a college professor. They are student
        guides, not professors offering classes.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentorProfiles.map((mentor) => (
          <article key={mentor.id} className="card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <ProfessorAvatar professor={mentor} size="profile" />
              <div>
                <h2 className="text-ink font-medium">{mentor.name}</h2>
                <p className="text-xs text-brass-dark mt-1">Student guide</p>
              </div>
            </div>
            <p className="font-medium text-ink">{mentor.role}</p>
            <p className="text-xs text-slate mt-1">Focus: {mentor.focus}</p>
            <p className="text-sm text-slate mt-3 leading-relaxed">{mentor.description}</p>
            <div className="mt-auto pt-5">
              <button type="button" onClick={() => openContactForm(mentor)} className="btn-secondary text-sm">
                Contact this mentor
              </button>
            </div>
          </article>
        ))}

      </div>

      <Link to="/professors" className="btn-primary mt-10 inline-flex">
        Browse college professors
      </Link>

      {contactMentor && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 px-4 pb-[8vh] pt-[6vh] backdrop-blur-sm sm:pt-[8vh]" onMouseDown={(event) => { if (event.target === event.currentTarget) closeContactForm() }}>
          <section role="dialog" aria-modal="true" aria-labelledby="mentor-contact-title" className="relative max-h-[calc(100dvh-16vh)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/80 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-2xl shadow-ink/30">
            <button type="button" onClick={closeContactForm} aria-label="Close contact form" className="absolute right-4 top-4 rounded-lg p-2 text-slate hover:bg-stone hover:text-ink">
              <X size={18} />
            </button>

            {submitted ? (
              <div className="px-6 py-10 text-center sm:px-10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass-dark"><CheckCircle2 className="h-7 w-7" /></span>
                <h2 id="mentor-contact-title" className="mt-5 font-display text-2xl text-ink">Message delivered</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate">
                  Your message has been delivered to {contactMentor.name}. Thank you for reaching out.
                </p>
                <button type="button" onClick={closeContactForm} className="btn-primary mt-6">Done</button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-6 pb-5 pt-7 sm:px-8">
                  <div className="flex items-center gap-4 pr-8">
                    <ProfessorAvatar professor={contactMentor} size="profile" />
                    <div>
                      <p className="eyebrow mb-1">Mentor inquiry</p>
                      <h2 id="mentor-contact-title" className="font-display text-2xl text-ink">Contact {contactMentor.name}</h2>
                      <p className="mt-1 text-sm text-slate">{contactMentor.role}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
                  <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="mentor-contact-name" className="mb-1 block text-sm font-medium text-ink">Your name</label>
                    <input id="mentor-contact-name" name="name" required autoComplete="name" value={studentName} onChange={(event) => setStudentName(event.target.value)} className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brass" />
                  </div>
                  <div>
                    <label htmlFor="mentor-contact-email" className="mb-1 block text-sm font-medium text-ink">Email</label>
                    <input id="mentor-contact-email" name="email" type="email" required autoComplete="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brass" />
                  </div>
                  <div>
                    <label htmlFor="mentor-contact-message" className="mb-1 block text-sm font-medium text-ink">What guidance do you need?</label>
                    <textarea id="mentor-contact-message" name="message" required rows="4" className="w-full resize-y rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brass" />
                  </div>
                    <button type="submit" className="btn-primary w-full justify-center">Send message</button>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
