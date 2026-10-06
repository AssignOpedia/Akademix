import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

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

function readProfileActivity(email) {
  if (!email) return []
  const normalizedEmail = email.toLowerCase()
  const belongsToUser = (item) => item.email
    ? item.email.toLowerCase() === normalizedEmail
    : true

  const inquiries = readList('akademix-inquiries')
    .map((item, storageIndex) => ({ ...item, storageKey: 'akademix-inquiries', storageIndex, formKind: item.type === 'study-abroad-support' ? 'Study abroad support' : 'Professor enquiry' }))
    .filter((item) => item.email?.toLowerCase() === normalizedEmail)
  const mentorRequests = readList('akademix-mentor-requests')
    .map((item, storageIndex) => ({ ...item, storageKey: 'akademix-mentor-requests', storageIndex, formKind: 'Mentor request' }))
    .filter((item) => item.email?.toLowerCase() === normalizedEmail)
  const pathways = readList('akademix-pathways')
    .map((item, storageIndex) => ({ ...item, storageKey: 'akademix-pathways', storageIndex, formKind: 'Career pathway' }))
    .filter(belongsToUser)
  const reviews = readList('akademix-student-reviews')
    .map((item, storageIndex) => ({ ...item, storageKey: 'akademix-student-reviews', storageIndex, formKind: 'Student review' }))
    .filter(belongsToUser)

  return [...inquiries, ...mentorRequests, ...pathways, ...reviews].sort((a, b) => (
    new Date(b.submittedAt || b.savedAt || 0) - new Date(a.submittedAt || a.savedAt || 0)
  ))
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
  const [activities, setActivities] = useState([])
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!user?.email) return undefined
    const loadActivities = () => setActivities(readProfileActivity(user.email))
    loadActivities()
    window.addEventListener('storage', loadActivities)
    return () => window.removeEventListener('storage', loadActivities)
  }, [user])

  const deleteActivity = (activity) => {
    try {
      const storedItems = readList(activity.storageKey)
      const updatedItems = storedItems.filter((_, index) => index !== activity.storageIndex)
      localStorage.setItem(activity.storageKey, JSON.stringify(updatedItems))
      setActivities(readProfileActivity(user.email))
      setDeleteError('')
    } catch {
      setDeleteError('We could not delete that submission from this browser. Please try again.')
    }
  }

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
        <div><h1 className="font-display text-4xl text-ink">Your profile</h1><p className="mt-2 text-slate">Your account details and saved form submissions are collected here.</p></div>
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
        <h2 id="student-activity-title" className="font-display text-2xl text-ink">Your submitted forms</h2>
        <p className="mt-2 text-sm text-slate">Requests, study pathways, and reviews saved with your account on this device.</p>
        {deleteError && <p role="alert" className="mt-3 text-sm text-red-700">{deleteError}</p>}
        {activities.length ? <div className="mt-5 space-y-4">
          {activities.map((item, index) => {
            const submittedAt = item.submittedAt || item.savedAt
            const title = item.mentorName || item.subject || item.destination || item.formKind
            return (
              <article key={item.id || `${item.formKind}-${submittedAt}-${index}`} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="eyebrow">{item.formKind}</p><h3 className="mt-1 font-medium text-ink">{title}</h3></div>
                  <div className="flex items-center gap-3">
                    <time className="text-xs text-slate" dateTime={submittedAt}>{submittedAt ? new Date(submittedAt).toLocaleString() : 'Date unavailable'}</time>
                    <button type="button" onClick={() => deleteActivity(item)} aria-label={`Delete ${item.formKind}`} title="Delete submission" className="rounded-lg p-2 text-slate hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {Object.entries(item).filter(([key, value]) => !['id', 'submittedAt', 'savedAt', 'name', 'email', 'mentorName', 'subject', 'destination', 'context', 'type', 'formKind', 'storageKey', 'storageIndex', 'courseIds', 'professorIds', 'universityIds', 'image'].includes(key) && value != null && value !== '').map(([key, value]) => (
                    <div key={key}><dt className="text-xs text-slate">{prettyLabel(key)}</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>
                  ))}
                  {item.message && <div className="sm:col-span-2"><dt className="text-xs text-slate">Message</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{item.message}</dd></div>}
                  {item.text && <div className="sm:col-span-2"><dt className="text-xs text-slate">Review</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{item.text}</dd></div>}
                </dl>
              </article>
            )
          })}
        </div> : <div className="card mt-5 p-6"><p className="text-ink">No saved form submissions yet.</p><p className="mt-1 text-sm text-slate">Requests, study pathways, and reviews you save using {user.email} will appear here.</p><Link to="/mentoring" className="btn-secondary mt-4">Meet the mentors</Link></div>}
      </section>
    </div>
  )
}
