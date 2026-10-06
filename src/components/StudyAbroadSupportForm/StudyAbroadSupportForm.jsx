import { useState } from 'react'
import { showFormSubmissionAlert } from '../../utils/formSubmissionAlert'
import { countries } from '../../data/countries'

const supportOptions = [
  'Choosing a country and university',
  'Course applications and admission documents',
  'Scholarships and funding',
  'Student visa application and documents',
  'Accommodation and travel preparation',
]

export default function StudyAbroadSupportForm({ pathway }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const request = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      type: 'study-abroad-support',
      name: form.get('name').trim(),
      email: form.get('email').trim(),
      currentEducation: form.get('education'),
      destination: form.get('destination'),
      subject: form.get('subject'),
      qualification: form.get('qualification'),
      startDate: form.get('startDate'),
      supportNeeded: form.getAll('supportNeeded'),
      message: form.get('message').trim(),
      submittedAt: new Date().toISOString(),
    }

    try {
      const existing = JSON.parse(localStorage.getItem('akademix-inquiries') || '[]')
      localStorage.setItem('akademix-inquiries', JSON.stringify([...existing, request]))
      showFormSubmissionAlert('study abroad support', request.name, { Education: request.currentEducation, Destination: request.destination, Subject: request.subject, Qualification: request.qualification, StartDate: request.startDate, SupportNeeded: request.supportNeeded, Message: request.message })
      setSubmitted(true)
      setError('')
    } catch {
      setError('We could not save your request in this browser. Please try again.')
    }
  }

  return (
    <section id="abroad-support" className="scroll-mt-8">
      <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-10 items-start">
        <div>
          <p className="eyebrow mb-2">One to one support</p>
          <h2 className="font-display text-3xl text-ink">We’ll help you through the process.</h2>
          <p className="mt-4 leading-relaxed text-slate">From finding a suitable programme to preparing applications, visa paperwork, funding plans, and pre-departure details, tell us where you need support and our study abroad team can help you plan the next steps.</p>
        </div>
        <div className="card p-6 md:p-8">
          {submitted ? <div role="status"><p className="eyebrow mb-2">Request saved</p><h3 className="font-display text-2xl text-ink">Your study abroad support request is ready.</h3><p className="mt-3 text-sm text-slate">This demo saved your details in this browser only; it has not sent them to the Akademix team yet.</p><button type="button" onClick={() => setSubmitted(false)} className="btn-secondary mt-5">Edit request</button></div> : <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-display text-2xl text-ink">Tell us what you need</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm text-ink">Your name<input required name="name" autoComplete="name" maxLength={100} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass" /></label>
              <label className="block text-sm text-ink">Email address<input required type="email" name="email" autoComplete="email" maxLength={254} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass" /></label>
              <label className="block text-sm text-ink">Education level<select required name="education" defaultValue={pathway?.level || ''} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass"><option value="" disabled>Select your level</option>{['School', 'Undergraduate', 'Postgraduate', 'Professional', 'Research', 'Graduate', 'Working professional'].map((level) => <option key={level}>{level}</option>)}</select></label>
              <label className="block text-sm text-ink">Preferred destination<select required name="destination" defaultValue={pathway?.country || ''} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass"><option value="" disabled>Select a country</option>{countries.map((country) => <option key={country.code}>{country.name}</option>)}<option>Not sure yet</option></select></label>
              <label className="block text-sm text-ink">Subject<input readOnly name="subject" value={pathway?.subject || ''} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-stone px-3" /></label>
              <label className="block text-sm text-ink">Qualification<input readOnly name="qualification" value={pathway?.degree || ''} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-stone px-3" /></label>
              <label className="block text-sm text-ink sm:col-span-2">When would you like to start?<input name="startDate" placeholder="e.g. September 2027 or still exploring" maxLength={80} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brass" /></label>
            </div>
            <fieldset><legend className="mb-2 text-sm font-medium text-ink">What would you like help with?</legend><div className="grid sm:grid-cols-2 gap-2">{supportOptions.map((option) => <label key={option} className="flex items-start gap-2 rounded-lg border border-line p-3 text-sm text-slate"><input type="checkbox" name="supportNeeded" value={option} className="mt-0.5 accent-amber-700" />{option}</label>)}</div></fieldset>
            <label className="block text-sm text-ink">Anything else we should know?<textarea name="message" rows={3} maxLength={2000} className="mt-1.5 w-full rounded-lg border border-line bg-white p-3 outline-none focus:border-brass" /></label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary">Request study abroad support</button>
            <p className="text-xs text-slate">Your information stays in this browser in this demo and is not sent to our team.</p>
          </form>}
        </div>
      </div>
    </section>
  )
}
