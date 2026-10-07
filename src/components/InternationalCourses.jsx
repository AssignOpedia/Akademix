import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { internationalCourses } from '../data/internationalCourses'
import { countries } from '../data/countries'
import CountryFlag from './UI/CountryFlag'

const featuredCountries = ['Australia', 'New Zealand', 'Poland', 'Singapore', 'United Kingdom']
const priorityCountries = [...featuredCountries, ...countries.map(({ name }) => name).filter((name) => !featuredCountries.includes(name))]

export default function InternationalCourses() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const courses = [...internationalCourses].sort((a, b) => priorityCountries.indexOf(a.country) - priorityCountries.indexOf(b.country))

  const openDetails = (course) => {
    setSelectedCourse(course)
    setSubmitted(false)
  }

  const closeDetails = () => {
    setSelectedCourse(null)
    setSubmitted(false)
  }
  return <section id="coaching" className="relative z-10 border-t border-stone-300/60 bg-white/45 py-16 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-amber-700">Study around the world</span>
          <h2 className="font-serif text-3xl text-slate-900 sm:text-5xl">Live international courses</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-700">Explore official course listings, current fee information and upcoming intakes from leading universities.</p>
        </div>
        <div className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">{countries.length} countries | Australia to Bahrain</div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">{courses.length} courses | moving continuously across all destinations</p>
        <span className="text-xs text-slate-500">Pause by hovering over the cards</span>
      </div>
      <div className="overflow-hidden py-3" aria-label="International courses from Australia through Bahrain" style={{ maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)' }}>
        <div className="flex w-max shrink-0 gap-3 whitespace-nowrap animate-ticker transform-gpu hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ animationDuration: '200s' }}>
          {[...courses, ...courses].map((course, index) => {
            const isDuplicate = index >= courses.length
            const countryInfo = countries.find((item) => item.code === course.countryCode)
            return <article key={`${course.id}-${index}`} aria-hidden={isDuplicate || undefined} className="flex w-[270px] shrink-0 flex-col whitespace-normal rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-sm transition hover:shadow-md sm:w-[290px]">
              <div className="mb-2 flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800"><CountryFlag country={countryInfo}/>{course.country}</span><span className="text-[10px] text-slate-500">Verified {course.lastVerified}</span></div>
              <h3 className="text-xs font-bold text-slate-700">{course.university}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 font-serif text-base leading-snug text-slate-900">{course.courseName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700">{course.field}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700">{course.level}</span></div>
              <div className="mt-3 space-y-1 text-xs text-slate-700"><p><span className="font-semibold">Duration:</span> {course.duration}</p><p className="line-clamp-1"><span className="font-semibold">Fee:</span> {course.tuitionFee}</p><p className="line-clamp-1"><span className="font-semibold">Intake:</span> {course.intake}</p></div>
              <div className="mt-auto flex gap-2 pt-4">
                <button type="button" tabIndex={isDuplicate ? -1 : undefined} onClick={() => openDetails(course)} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600">View Details</button>
                <a tabIndex={isDuplicate ? -1 : undefined} className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-3 text-amber-800 hover:border-amber-500" href={course.officialUrl} target="_blank" rel="noreferrer" aria-label={`Open official page for ${course.courseName}`}><ExternalLink size={15}/></a>
              </div>
            </article>
          })}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-600">Course details and fees were reviewed on 7 October 2026 using the linked university pages. Availability and fees can change; confirm them with the institution before applying.</p>
    </div>

    {selectedCourse && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="course-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-widest text-amber-700">{selectedCourse.country} � {selectedCourse.field}</span><h3 id="course-dialog-title" className="mt-2 font-serif text-2xl leading-tight text-slate-900">{selectedCourse.courseName}</h3><p className="mt-1 text-sm font-semibold text-slate-700">{selectedCourse.university}</p></div><button type="button" onClick={closeDetails} aria-label="Close details" className="rounded-full border border-stone-200 p-2 text-slate-600 hover:bg-stone-50"><X size={18}/></button></div>
        <div className="my-5 grid grid-cols-2 gap-3 rounded-2xl bg-amber-50/70 p-4 text-xs sm:grid-cols-3">{[['Level', selectedCourse.level], ['Duration', selectedCourse.duration], ['Tuition fee', selectedCourse.tuitionFee], ['Intake', selectedCourse.intake], ['English requirement', selectedCourse.englishRequirement], ['Application status', selectedCourse.applicationStatus], ['Location', selectedCourse.location]].map(([label, value]) => <div key={label}><p className="mb-1 font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="text-slate-800">{value}</p></div>)}</div>
        {submitted ? <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">Thanks for your interest. Use the official course page below to confirm availability and contact the university directly.</div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="space-y-3">
          <h4 className="font-serif text-xl text-slate-900">Request course guidance</h4>
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700">Your name<input required name="name" autoComplete="name" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="Full name"/></label><label className="text-xs font-semibold text-slate-700">Email address<input required type="email" name="email" autoComplete="email" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="you@example.com"/></label></div>
          <label className="block text-xs font-semibold text-slate-700">What would you like help with?<textarea required name="message" rows="3" className="mt-1 w-full resize-y rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder="Ask about eligibility, fees, or applying�"/></label>
          <p className="text-[11px] text-slate-500">This form is a local demo and does not send or store your information.</p>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between"><a href={selectedCourse.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-amber-500">Official course page <ExternalLink size={14}/></a><button type="submit" className="rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600">Submit request</button></div>
        </form>}
      </section>
    </div>}
  </section>
}

