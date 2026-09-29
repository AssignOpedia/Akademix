import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { careerPaths } from '../../data/careerPaths'
import { allSubjects } from '../../data/subjects'
import { departments } from '../../data/departments'
import { countries } from '../../data/countries'
import { courses } from '../../data/courses'
import { universities } from '../../data/universities'
import { professors } from '../../data/professors'
import CountryFlag from '../UI/CountryFlag'
import StudyAbroadSupportForm from '../StudyAbroadSupportForm/StudyAbroadSupportForm'

const levels = ['School', 'Undergraduate', 'Postgraduate', 'Professional', 'Research']
const degrees = ['Certificate', 'Diploma', "Bachelor's degree", "Master's degree", 'Doctorate']
const departmentsByInterest = {
  Technology: ['Engineering & Technology', 'Computer Science'],
  Business: ['Business & Finance'],
  Health: ['Medical & Health'],
  Creative: ['Design & Creative'],
  Society: ['Humanities & Social Sciences', 'Law'],
  Science: ['Science & Research', 'Engineering & Technology'],
}
const schoolSubjectsByInterest = {
  Technology: ['Mathematics', 'Physics', 'Computer Science', 'Statistics'],
  Business: ['Mathematics', 'Economics', 'Accountancy', 'Business Studies'],
  Health: ['Biology', 'Chemistry', 'Psychology'],
  Creative: ['English', 'History'],
  Society: ['English', 'History', 'Geography', 'Economics', 'Political Science', 'Sociology', 'Psychology'],
  Science: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Statistics', 'Environmental Science'],
}

export default function CareerExplorer() {
  const [path, setPath] = useState({ interest: '', level: '', subject: '', department: '', degree: '', country: '' })
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [savedPathways, setSavedPathways] = useState(() => {
    try { return JSON.parse(localStorage.getItem('akademix-pathways') || '[]') } catch { return [] }
  })
  const update = (key, value) => setPath((current) => {
    setSaved(false)
    const next = { ...current, [key]: value }
    if (key === 'interest') return { ...next, level: '', subject: '', department: '', degree: '', country: '' }
    if (key === 'level') return { ...next, subject: '', department: '', degree: '', country: '' }
    if (key === 'subject') return { ...next, department: '', degree: '', country: '' }
    if (key === 'department') return { ...next, degree: '', country: '' }
    if (key === 'degree') return { ...next, country: '' }
    return next
  })
  const availableDepartments = departments.filter((department) => !path.subject || department.subjects.includes(path.subject))
  const departmentOptions = (availableDepartments.length
    ? availableDepartments
    : departments.filter((department) => departmentsByInterest[path.interest]?.includes(department.name)))
    .map((department) => department.name)
  const subjectOptions = path.interest
    ? allSubjects.map((subject) => subject.name).filter((name) =>
      departments.some((department) => departmentsByInterest[path.interest]?.includes(department.name) && department.subjects.includes(name)) ||
      schoolSubjectsByInterest[path.interest]?.includes(name)
    )
    : allSubjects.map((subject) => subject.name)
  const availableCourses = useMemo(
    () => courses.filter((course) => (!path.subject || course.subject.toLowerCase().includes(path.subject.toLowerCase()) || path.subject.toLowerCase().includes(course.subject.toLowerCase())) && (!path.level || course.level === path.level)),
    [path.subject, path.level]
  )
  const careers = path.subject ? (careerPaths[path.subject] || ['Researcher', 'Subject Specialist', 'Academic Consultant', 'Industry Professional']) : []
  const countryCode = countries.find((country) => country.name === path.country)?.code
  const matchingProfessors = professors.filter((professor) =>
    (!countryCode || professor.countryCode === countryCode) &&
    (professor.subjects.some((subject) => subject.toLowerCase().includes(path.subject.toLowerCase()) || path.subject.toLowerCase().includes(subject.toLowerCase())) || professor.department === path.department)
  ).slice(0, 3)
  const matchingUniversities = universities.filter((university) =>
    (!countryCode || university.countryCode === countryCode) &&
    (university.departments.includes(path.department) || university.popularSubjects.some((subject) => subject.toLowerCase().includes(path.subject.toLowerCase()) || path.subject.toLowerCase().includes(subject.toLowerCase())))
  ).slice(0, 3)
  const steps = [
    { key: 'interest', label: 'Interest', options: ['Technology', 'Business', 'Health', 'Creative', 'Society', 'Science'] },
    { key: 'level', label: 'Education level', options: levels },
    { key: 'subject', label: 'Subject', options: subjectOptions },
    { key: 'department', label: 'Department', options: departmentOptions },
    { key: 'degree', label: 'Degree', options: degrees },
    { key: 'country', label: 'Country', options: countries },
  ]
  const activeStep = steps[step]
  const isLastStep = step === steps.length - 1
  const isComplete = Object.values(path).every(Boolean)

  const savePathway = () => {
    const pathway = {
      ...path,
      careers,
      courseIds: availableCourses.slice(0, 3).map((course) => course.id),
      professorIds: matchingProfessors.map((professor) => professor.id),
      universityIds: matchingUniversities.map((university) => university.id),
      savedAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('akademix-pathways') || '[]')
      const updated = [pathway, ...existing.filter((item) => item.subject !== path.subject || item.country !== path.country)]
      localStorage.setItem('akademix-pathways', JSON.stringify(updated))
      setSavedPathways(updated)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  const startOver = () => {
    setPath({ interest: '', level: '', subject: '', department: '', degree: '', country: '' })
    setStep(0)
    setSaved(false)
  }

  const goToNextStep = () => {
    if (!path[activeStep.key]) return
    if (isLastStep) {
      document.getElementById('career-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setStep(step + 1)
  }

  return (
    <section className="border-b border-line">
      <div className="container-content py-16">
        <p className="eyebrow mb-2">Career guidance</p>
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-3">What can you become?</h2>
        <p className="text-slate max-w-xl mb-8">Build a study route one decision at a time, then explore the courses and career areas that fit.</p>

        <div className="flex gap-1 mb-8">
          {steps.map((item, index) => (
            <button
              key={item.key}
              onClick={() => setStep(index)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${path[item.key] ? 'bg-brass' : index === step ? 'bg-ink' : 'bg-line'}`}
              aria-label={`Go to ${item.label}`}
            />
          ))}
        </div>

        <div className="card p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate">Step {step + 1} of {steps.length}</p>
              <h3 className="font-display text-2xl text-ink mt-1">Choose your {activeStep.label.toLowerCase()}</h3>
            </div>
            {path.subject && <span className="text-sm text-brass-dark">{path.subject}</span>}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {activeStep.options.map((option) => {
              const isCountry = activeStep.key === 'country'
              const value = isCountry ? option.name : option
              return (
                <button
                  key={isCountry ? option.code : option}
                  onClick={() => {
                    update(activeStep.key, value)
                    if (!isLastStep) setStep(step + 1)
                  }}
                  className={`text-left rounded-lg border px-4 py-3 text-sm transition-colors ${path[activeStep.key] === value ? 'border-brass bg-brass/5 text-ink' : 'border-line text-slate hover:border-ink/30 hover:text-ink'}`}
                >
                  {isCountry ? <span className="inline-flex items-center gap-2"><CountryFlag country={option} /> {option.name}</span> : option}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="text-sm text-slate hover:text-ink disabled:opacity-30">&larr; Back</button>
            <button onClick={goToNextStep} disabled={!path[activeStep.key]} className="btn-primary disabled:opacity-40">
              {isLastStep ? 'View my pathway' : 'Next →'}
            </button>
          </div>
        </div>

        {isComplete && <StudyAbroadSupportForm pathway={path} />}
        {isComplete && (
          <div id="career-results" className="mt-8 grid scroll-mt-8 lg:grid-cols-[1fr_1fr] gap-8">
            <div>
              <p className="eyebrow mb-2">Your pathway</p>
              <h3 className="font-display text-2xl text-ink mb-4">{path.degree} in {path.subject}</h3>
              <p className="text-sm text-slate mb-5">A {path.level.toLowerCase()} route focused on {path.subject} in {path.country}, through {path.department}.</p>
              <ol className="space-y-3 mb-6">
                <li className="card p-4"><span className="text-xs font-semibold uppercase tracking-wider text-brass-dark">01 · Study</span><p className="mt-1 text-sm text-ink">Explore {path.degree} programmes in {path.country}.</p></li>
                <li className="card p-4"><span className="text-xs font-semibold uppercase tracking-wider text-brass-dark">02 · Build skills</span><p className="mt-1 text-sm text-ink">Use the recommended courses below to develop your {path.subject} foundation.</p></li>
                <li className="card p-4"><span className="text-xs font-semibold uppercase tracking-wider text-brass-dark">03 · Explore careers</span><p className="mt-1 text-sm text-ink">Compare the career roles below and talk with an expert about your preferred direction.</p></li>
              </ol>
              <div className="flex flex-wrap gap-2">
                {careers.map((role) => <span key={role} className="card px-4 py-3 text-sm text-ink">{role}</span>)}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" onClick={savePathway} className="btn-primary">{saved ? 'Pathway saved' : 'Save my pathway'}</button><button type="button" onClick={startOver} className="text-sm text-slate hover:text-ink">Start a new pathway</button></div>
              {saved && <p role="status" className="mt-3 text-sm text-emerald-800">Saved in this browser. Find it below under Saved pathways.</p>}
            </div>
            <div className="card bg-stone p-5">
              <p className="text-xs uppercase tracking-wider text-brass-dark">Recommended next steps</p>
              <div className="mt-4 space-y-5 text-sm text-ink">
                <div>
                  <p className="font-medium">Courses for {path.level.toLowerCase()} study</p>
                  {availableCourses.length ? <ul className="mt-2 space-y-1.5">{availableCourses.slice(0, 3).map((course) => <li key={course.id}><Link className="text-brass-dark hover:underline" to={`/courses/${course.id}`}>{course.title}</Link></li>)}</ul> : <p className="mt-1 text-slate">No exact course matches yet. <Link to="/courses" className="text-brass-dark underline">Browse all courses</Link></p>}
                </div>
                <div>
                  <p className="font-medium">Professors in {path.country}</p>
                  {matchingProfessors.length ? <ul className="mt-2 space-y-1.5">{matchingProfessors.map((professor) => <li key={professor.id}><Link className="text-brass-dark hover:underline" to={`/professors/${professor.id}`}>{professor.name}</Link></li>)}</ul> : <p className="mt-1 text-slate">No exact matches for this combination. <Link to="/professors" className="text-brass-dark underline">Browse professors</Link></p>}
                </div>
                <div>
                  <p className="font-medium">Universities in {path.country}</p>
                  {matchingUniversities.length ? <ul className="mt-2 space-y-1.5">{matchingUniversities.map((university) => <li key={university.id}><Link className="text-brass-dark hover:underline" to={`/universities/${university.id}`}>{university.name}</Link></li>)}</ul> : <p className="mt-1 text-slate">No exact matches for this combination. <Link to="/universities" className="text-brass-dark underline">Browse universities</Link></p>}
                </div>
                <p className="text-slate">Suggested guidance area: {path.department}</p>
              </div>
            </div>
          </div>
        )}
        {savedPathways.length > 0 && <section className="mt-10" aria-label="Saved pathways"><h3 className="font-display text-xl text-ink mb-3">Saved pathways</h3><div className="grid sm:grid-cols-2 gap-3">{savedPathways.map((item) => <button key={`${item.subject}-${item.country}`} type="button" onClick={() => { setPath({ interest: item.interest, level: item.level, subject: item.subject, department: item.department, degree: item.degree, country: item.country }); setStep(steps.length - 1); setSaved(true); document.getElementById('career-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="card p-4 text-left hover:border-brass"><span className="block font-medium text-ink">{item.degree} in {item.subject}</span><span className="mt-1 block text-sm text-slate">{item.level} · {item.country}</span></button>)}</div></section>}
      </div>
    </section>
  )
}
