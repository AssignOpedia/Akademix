import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const sessionKey = 'akademix-auth-session'

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function prettyLabel(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

export default function Profile() {
  const navigate = useNavigate()
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || 'null')
    } catch {
      return null
    }
  }, [])
  const activities = useMemo(() => {
    if (!user?.email) return []
    const email = user.email.toLowerCase()
    const inquiries = readList('akademix-inquiries').filter((item) => item.email?.toLowerCase() === email)
    const mentorRequests = readList('akademix-mentor-requests').filter((item) => item.email?.toLowerCase() === email)
    return [...inquiries, ...mentorRequests].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  }, [user])

  const logOut = () => {
    localStorage.removeItem(sessionKey)
    window.dispatchEvent(new Event('akademix-auth-change'))
    navigate('/', { replace: true })
  }

  if (!user) {
    return <div className="container-content py-16"><div className="card max-w-xl p-8"><h1 className="font-display text-3xl text-ink">Log in to view your profile</h1><p className="mt-3 text-slate">Your saved requests and student details will appear here.</p><Link to="/" className="btn-primary mt-6">Go to home</Link></div></div>
  }

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Student account</p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="font-display text-4xl text-ink">Your profile</h1><p className="mt-2 text-slate">Your account details and requests are collected here.</p></div>
        <button type="button" onClick={logOut} className="btn-secondary">Log out</button>
      </div>

      <section className="card mt-8 p-6" aria-labelledby="student-details-title">
        <h2 id="student-details-title" className="font-display text-2xl text-ink">Student details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs text-slate">Name</dt><dd className="mt-1 font-medium text-ink">{user.name || 'Not provided'}</dd></div>
          <div><dt className="text-xs text-slate">Email</dt><dd className="mt-1 font-medium text-ink">{user.email}</dd></div>
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="student-activity-title">
        <h2 id="student-activity-title" className="font-display text-2xl text-ink">Your applications and requests</h2>
        <p className="mt-2 text-sm text-slate">Requests you submitted with this email address on this device.</p>
        {activities.length ? <div className="mt-5 space-y-4">
          {activities.map((item, index) => (
            <article key={item.id || `${item.submittedAt}-${index}`} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="eyebrow">{item.mentorName ? 'Mentor contact' : item.type === 'study-abroad-support' ? 'Study abroad support' : 'Student enquiry'}</p><h3 className="mt-1 font-medium text-ink">{item.mentorName || item.subject || 'Support request'}</h3></div>
                <time className="text-xs text-slate" dateTime={item.submittedAt}>{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'Date unavailable'}</time>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {Object.entries(item).filter(([key, value]) => !['id', 'submittedAt', 'name', 'email', 'mentorName', 'subject', 'context', 'type'].includes(key) && value != null && value !== '').map(([key, value]) => (
                  <div key={key}><dt className="text-xs text-slate">{prettyLabel(key)}</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>
                ))}
              </dl>
            </article>
          ))}
        </div> : <div className="card mt-5 p-6"><p className="text-ink">No requests yet.</p><p className="mt-1 text-sm text-slate">When you contact a mentor or submit a guidance request using {user.email}, it will appear here.</p><Link to="/mentoring" className="btn-secondary mt-4">Meet the mentors</Link></div>}
      </section>
    </div>
  )
}
