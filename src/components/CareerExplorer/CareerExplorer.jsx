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
  const update = (key, value) => setPath((current) => {
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

        {isComplete && (
          <div id="career-results" className="mt-8 grid scroll-mt-8 lg:grid-cols-[1fr_1fr] gap-8">
            <div>
              <p className="eyebrow mb-2">Your pathway</p>
              <h3 className="font-display text-2xl text-ink mb-4">{path.degree} in {path.subject}</h3>
              <div className="flex flex-wrap gap-2">
                {careers.map((role) => <span key={role} className="card px-4 py-3 text-sm text-ink">{role}</span>)}
              </div>
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
      </div>
    </section>
  )
}
