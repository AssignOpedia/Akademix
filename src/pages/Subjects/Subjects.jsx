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
import SubjectComparePanel from '../../components/SubjectCompare/SubjectComparePanel'

const foundationDepartments = {
  Mathematics: ['Science & Research', 'Business & Finance'],
  Physics: ['Science & Research', 'Engineering & Technology'],
  Chemistry: ['Science & Research', 'Medical & Health'],
  Biology: ['Science & Research', 'Medical & Health'],
  English: ['Humanities & Social Sciences'],
  History: ['Humanities & Social Sciences'],
  Geography: ['Humanities & Social Sciences', 'Science & Research'],
  Economics: ['Business & Finance', 'Humanities & Social Sciences'],
  'Political Science': ['Humanities & Social Sciences', 'Law'],
  Sociology: ['Humanities & Social Sciences'],
  Psychology: ['Medical & Health', 'Humanities & Social Sciences'],
  'Computer Science': ['Computer Science', 'Engineering & Technology'],
  Statistics: ['Science & Research', 'Business & Finance'],
  'Environmental Science': ['Science & Research', 'Engineering & Technology'],
  Accountancy: ['Business & Finance'],
  'Business Studies': ['Business & Finance'],
}

export default function Subjects() {
  const { slug } = useParams()
  const [active, setActive] = useState('all-subjects')
  const [subjectQuery, setSubjectQuery] = useState('')
  const [subjectA, setSubjectA] = useState(null)
  const [subjectB, setSubjectB] = useState(null)
  const [compareTarget, setCompareTarget] = useState('A')
  const category = subjectCategories.find((c) => c.slug === active)
  const subjectNames = active === 'all-subjects' ? allSubjects.map((subject) => subject.name) : (category?.subjects ?? [])
  const filteredSubjects = subjectNames.filter((name) =>
    name.toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )

  function selectComparisonSubject(slot, name) {
    if (!name) {
      slot === 'A' ? setSubjectA(null) : setSubjectB(null)
      return
    }
    if (slot === 'A' && name === subjectB) {
      setSubjectA(subjectB)
      setSubjectB(subjectA)
      return
    }
    if (slot === 'B' && name === subjectA) {
      setSubjectB(subjectA)
      setSubjectA(subjectB)
      return
    }
    slot === 'A' ? setSubjectA(name) : setSubjectB(name)
    setCompareTarget(slot === 'A' ? 'B' : 'A')
  }

  function compareFromCard(name) {
    if (name === subjectA) { setCompareTarget('B'); return }
    if (name === subjectB) { setCompareTarget('A'); return }
    if (compareTarget === 'A') {
      setSubjectA(name)
      setCompareTarget('B')
    } else {
      setSubjectB(name)
      setCompareTarget('A')
    }
  }

  function clearComparison() {
    setSubjectA(null)
    setSubjectB(null)
    setCompareTarget('A')
  }

  if (slug) {
    const subject = allSubjects.find((item) => item.slug === slug)
    if (!subject) return <Navigate to="/subjects" replace />
    const exactDepartments = departments.filter((department) => department.subjects.includes(subject.name))
    const relatedDepartments = exactDepartments.length ? exactDepartments : departments.filter((department) => foundationDepartments[subject.name]?.includes(department.name))
    const relatedCourses = courses.filter((course) => course.subject === subject.name)
    const exactProfessors = professors.filter((professor) => professor.subjects.includes(subject.name))
    const professorMatches = exactProfessors.length ? exactProfessors : professors.filter((professor) => relatedDepartments.some((department) => department.name === professor.department))
    const relatedProfessors = professorMatches.slice(0, 3)
    const exactUniversities = universities.filter((university) => university.popularSubjects.includes(subject.name))
    const universityMatches = exactUniversities.length ? exactUniversities : universities.filter((university) => relatedDepartments.some((department) => university.departments.includes(department.name)))
    const relatedUniversities = universityMatches.slice(0, 3)
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
        <button
          type="button"
          onClick={() => setActive('all-subjects')}
          className={`rounded-full border px-4 py-2 text-sm ${
            active === 'all-subjects' ? 'border-brass bg-brass/5' : 'border-line text-slate hover:text-ink'
          }`}
        >
          All subjects
        </button>
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
            <SubjectCard key={name} subject={{ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name }} onCompare={compareFromCard} compareSlot={subjectA === name ? 'A' : subjectB === name ? 'B' : null} />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-medium text-ink">No subjects found in {category?.name}.</p>
          <button type="button" onClick={() => setSubjectQuery('')} className="mt-3 text-sm text-brass-dark underline underline-offset-2">Clear search</button>
        </div>
      )}
      <SubjectComparePanel
        subjects={allSubjects}
        subjectA={subjectA}
        subjectB={subjectB}
        activeSlot={compareTarget}
        onSelect={selectComparisonSubject}
        onSetActiveSlot={setCompareTarget}
        onSwap={() => { setSubjectA(subjectB); setSubjectB(subjectA) }}
        onClear={clearComparison}
        onRestore={(first, second) => { setSubjectA(first); setSubjectB(second) }}
      />
    </div>
  )
}

