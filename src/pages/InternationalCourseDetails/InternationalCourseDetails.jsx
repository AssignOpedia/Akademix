import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, GraduationCap } from 'lucide-react'
import { internationalCourses } from '../../data/internationalCourses'
import { countries } from '../../data/countries'
import CountryFlag from '../../components/UI/CountryFlag'

export default function InternationalCourseDetails() {
  const { id } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const course = internationalCourses.find((item) => item.id === id)
  if (!course) return <Navigate to="/#coaching" replace />

  const details = [
    ['Field', course.field],
    ['Level', course.level],
    ['Duration', course.duration],
    ['Intake', course.intake],
    ['Application deadline', course.applicationDeadline],
    ['Application status', course.applicationStatus],
    ['English requirement', course.englishRequirement],
    ['Location', course.location],
    ['Last verified', course.lastVerified],
  ]
  const country = countries.find((item) => item.code === course.countryCode)

  return <main className="min-h-[70vh] py-10 sm:py-14">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <Link to="/#coaching" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700"><ArrowLeft size={16}/> Back to international courses</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="rounded-3xl border border-amber-200/80 bg-white/90 p-6 shadow-sm sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><CountryFlag country={country}/>{course.country}</div>
          <p className="mt-5 text-sm font-semibold text-slate-600">{course.university}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">{course.courseName}</h1>
          <p className="mt-3 text-sm text-slate-600">{course.field} <span aria-hidden="true">|</span> {course.level}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {details.map(([label, value]) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm leading-relaxed text-slate-800">{value}</p></div>)}
          </div>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <h2 className="font-serif text-xl text-slate-900">Cost overview</h2>
            <p className="mt-2 text-sm font-semibold text-slate-800">Tuition: {course.tuitionFee}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{course.additionalCosts}</p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">Course dates, fees and availability can change. Confirm current details with the university before applying.</p>
        </article>

        <aside className="h-fit rounded-3xl border border-stone-200 bg-white/95 p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800"><GraduationCap size={22}/></div>
          <h2 className="mt-4 font-serif text-2xl text-slate-900">Request course guidance</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Ask about eligibility, fees, intake dates or the application process for this course.</p>
          {submitted ? <div role="status" className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-900">Thanks for your interest. This demo form does not transmit or store your details yet. Use the official course page to contact the university.</div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Your name<input required name="name" autoComplete="name" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="Full name"/></label>
            <label className="block text-xs font-semibold text-slate-700">Email address<input required type="email" name="email" autoComplete="email" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="you@example.com"/></label>
            <label className="block text-xs font-semibold text-slate-700">Your question<textarea required name="message" rows="3" className="mt-1 w-full resize-y rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="How can we help?"/></label>
            <button type="submit" className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-600">Submit request</button>
          </form>}
          <a href={course.officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-500 hover:text-amber-800">Official course page <ExternalLink size={15}/></a>
          <p className="mt-3 text-[11px] text-slate-500">The form is a local demo and does not transmit submissions.</p>
        </aside>
      </div>
    </div>
  </main>
}
