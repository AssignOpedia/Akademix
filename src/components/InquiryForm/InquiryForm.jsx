import { useState } from 'react'
import { showFormSubmissionAlert } from '../../utils/formSubmissionAlert'

const REQUESTS_KEY = 'akademix-inquiries'

export default function InquiryForm({ subject, context, description }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const request = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      subject,
      context,
      name: form.get('name').trim(),
      email: form.get('email').trim(),
      message: form.get('message').trim(),
      submittedAt: new Date().toISOString(),
    }

    try {
      const saved = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]')
      localStorage.setItem(REQUESTS_KEY, JSON.stringify([...saved, request]))
      showFormSubmissionAlert('professor enquiry', request.name, { Subject: request.subject, Message: request.message })
      setSubmitted(true)
      setError('')
    } catch {
      setError('We could not save your request in this browser. Please try again.')
    }
  }

  if (submitted) return <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-medium text-ink">Your request is recorded.</p><p className="mt-1 text-sm text-slate">Your enquiry about {subject} has been saved in this browser. Our team will follow up when a contact service is connected.</p></div>

  return <form onSubmit={handleSubmit} className="space-y-4">
    <p className="text-sm text-slate">{description}</p>
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="block text-sm text-ink">Your name<input required name="name" autoComplete="name" maxLength={100} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass" /></label>
      <label className="block text-sm text-ink">Email address<input required type="email" name="email" autoComplete="email" maxLength={254} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass" /></label>
    </div>
    <label className="block text-sm text-ink">What would you like help with?<textarea required name="message" rows={4} maxLength={2000} defaultValue={context} className="mt-1.5 w-full rounded-lg border border-line bg-white p-3 outline-none focus:border-brass" /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="submit" className="btn-primary">Send enquiry</button>
    <p className="text-xs text-slate">This demo stores the request in this browser only; it does not email anyone.</p>
  </form>
}
