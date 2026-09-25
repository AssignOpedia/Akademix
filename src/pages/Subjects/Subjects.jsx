import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { allSubjects, subjectCategories } from '../../data/subjects'
import { departments } from '../../data/departments'
import { courses } from '../../data/courses'
import { professors } from '../../data/professors'
import { universities } from '../../data/universities'
import { careerPaths } from '../../data/careerPaths'
import SubjectCard from '../../components/SubjectCard/SubjectCard'
import CourseCard from '../../components/CourseCard/CourseCard'
import ProfessorCard from '../../components/ProfessorCard/ProfessorCard'
import UniversityCard from '../../components/UniversityCard/UniversityCard'

export default function Subjects() {
  const { slug } = useParams()
  const [active, setActive] = useState(subjectCategories[0].slug)
  const [subjectQuery, setSubjectQuery] = useState('')
  const category = subjectCategories.find((c) => c.slug === active)
  const filteredSubjects = (category?.subjects ?? []).filter((name) =>
    name.toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )

  if (slug) {
    const subject = allSubjects.find((item) => item.slug === slug)
    if (!subject) return <Navigate to="/subjects" replace />
    const relatedDepartments = departments.filter((department) => department.subjects.includes(subject.name))
    const relatedCourses = courses.filter((course) => course.subject === subject.name)
    const relatedProfessors = professors.filter((professor) => professor.subjects.includes(subject.name)).slice(0, 3)
    const relatedUniversities = universities.filter((university) => university.popularSubjects.includes(subject.name)).slice(0, 3)
    const careers = careerPaths[subject.name] || ['Researcher', 'Subject Specialist', 'Academic Consultant', 'Industry Professional']

    return (
      <div className="container-content py-14">
        <Link to="/subjects" className="inline-flex items-center gap-2 text-sm text-slate hover:text-ink"><ArrowLeft size={15} /> All subjects</Link>
        <div className="mt-8 max-w-3xl"><p className="eyebrow mb-2">Subject pathway</p><h1 className="font-display text-4xl md:text-5xl text-ink">{subject.name}</h1><p className="text-slate mt-4 leading-relaxed">Build a clear route from foundational learning to university study, specialist courses, research, and the careers this subject can unlock.</p></div>
        <section className="mt-12 grid md:grid-cols-3 gap-4">
          {relatedDepartments.map((department) => <Link key={department.slug} to={`/professors?department=${department.slug}`} className="card p-5 hover:border-brass/60 transition-colors"><p className="text-xs text-brass-dark uppercase tracking-wider">Department</p><p className="font-medium text-ink mt-2">{department.name}</p><p className="text-sm text-slate mt-2">Explore professors and academic guidance.</p></Link>)}
        </section>
        <section className="mt-14"><div className="flex items-end justify-between mb-6"><div><p className="eyebrow mb-2">Learn next</p><h2 className="font-display text-2xl text-ink">Courses in {subject.name}</h2></div><Link to="/courses" className="text-sm text-ink hover:text-brass-dark">All courses →</Link></div>{relatedCourses.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{relatedCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <p className="text-slate card p-5">New {subject.name} courses are being added to the learning catalogue.</p>}</section>
        <section className="mt-14"><div className="flex items-end justify-between mb-6"><div><p className="eyebrow mb-2">Find guidance</p><h2 className="font-display text-2xl text-ink">Recommended professors</h2></div><Link to="/professors" className="text-sm text-ink hover:text-brass-dark">Browse all →</Link></div>{relatedProfessors.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{relatedProfessors.map((professor) => <ProfessorCard key={professor.id} professor={professor} />)}</div> : <p className="text-slate card p-5">No matching professors yet. Browse the full directory for adjacent expertise.</p>}</section>
        <section className="mt-14"><h2 className="font-display text-2xl text-ink mb-6">Universities and careers</h2><div className="grid lg:grid-cols-2 gap-8"><div>{relatedUniversities.length ? <div className="grid sm:grid-cols-2 gap-4">{relatedUniversities.map((university) => <UniversityCard key={university.id} university={university} />)}</div> : <p className="text-slate">University listings for this subject are growing.</p>}</div><div className="bg-ink text-paper rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/15"><p className="eyebrow text-brass-light mb-2">Where it can lead</p><h3 className="font-display text-2xl mb-5">Career pathways</h3><div className="grid sm:grid-cols-2 gap-2">{careers.map((career) => <span key={career} className="border border-white/15 rounded-lg px-3 py-2 text-sm text-paper/80 transition-colors hover:border-brass/60 hover:bg-white/5">{career}</span>)}</div><Link to="/career-guidance" className="btn-secondary mt-6 bg-paper text-ink border-paper hover:bg-white">Plan my pathway</Link></div></div></section>
      </div>
    )
  }

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Subject ecosystem</p>
      <h1 className="font-display text-4xl text-ink mb-3">Explore subjects & departments</h1>
      <p className="text-slate max-w-xl mb-10">
        From school foundations to specialised university departments — pick a category to
        explore.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        {subjectCategories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActive(c.slug)}
            className={`rounded-full border px-4 py-2 text-sm ${
              active === c.slug ? 'border-brass bg-brass/5' : 'border-line text-slate hover:text-ink'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-md">
        <Search aria-hidden="true" size={17} className="absolute left-3.5 top-3.5 text-slate" />
        <input
          type="search"
          value={subjectQuery}
          onChange={(event) => setSubjectQuery(event.target.value)}
          placeholder={`Search ${category?.name ?? 'subjects'}...`}
          aria-label="Search subjects in this category"
          className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-brass"
        />
      </div>

      <p className="mb-4 text-sm text-slate" aria-live="polite">
        {filteredSubjects.length} subject{filteredSubjects.length === 1 ? '' : 's'} found
      </p>

      {filteredSubjects.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSubjects.map((name) => (
            <SubjectCard key={name} subject={{ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name }} />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-medium text-ink">No subjects found in {category?.name}.</p>
          <button type="button" onClick={() => setSubjectQuery('')} className="mt-3 text-sm text-brass-dark underline underline-offset-2">Clear search</button>
        </div>
      )}
    </div>
  )
}
