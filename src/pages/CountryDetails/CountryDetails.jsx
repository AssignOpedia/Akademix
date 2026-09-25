import { useParams, Navigate, Link } from 'react-router-dom'
import { getCountryByCode } from '../../data/countries'
import { getProfessorsByCountry } from '../../data/professors'
import { universities } from '../../data/universities'
import { departments } from '../../data/departments'
import { courses } from '../../data/courses'
import ProfessorCard from '../../components/ProfessorCard/ProfessorCard'
import UniversityCard from '../../components/UniversityCard/UniversityCard'
import CountryFlag from '../../components/UI/CountryFlag'

export default function CountryDetails() {
  const { code } = useParams()
  const country = getCountryByCode(code)

  if (!country) return <Navigate to="/countries" replace />

  const countryProfessors = getProfessorsByCountry(country.name)
  const countryUniversities = universities.filter((u) => u.countryCode === country.code)
  const countryDepartments = departments.filter((department) => department.subjects.some((subject) => country.popularFields.includes(subject))).slice(0, 4)
  const countryCourses = courses.filter((course) => country.popularFields.includes(course.subject)).slice(0, 3)

  return (
    <div className="container-content py-14">
      <Link to="/countries" className="text-sm text-slate hover:text-ink">
        ← All countries
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <CountryFlag country={country} size="lg" />
        <div>
          <h1 className="font-display text-4xl text-ink">Study & Learn in {country.name}</h1>
        </div>
      </div>

      <p className="text-slate max-w-2xl mt-6 leading-relaxed">{country.overview}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {country.popularFields.map((f) => (
          <span key={f} className="text-sm px-3 py-1.5 rounded-full bg-stone text-ink/80 border border-line">
            {f}
          </span>
        ))}
      </div>

      <section className="mt-12 grid lg:grid-cols-[1.2fr_1fr] gap-5">
        <div className="card p-6"><p className="eyebrow mb-2">Academic pathways</p><h2 className="font-display text-2xl text-ink mb-4">What you can explore here</h2><div className="flex flex-wrap gap-2">{countryDepartments.map((department) => <Link key={department.slug} to={`/professors?department=${department.slug}`} className="rounded-full border border-line bg-stone px-3 py-1.5 text-sm text-ink hover:border-brass">{department.name}</Link>)}</div><div className="mt-5 flex gap-3"><Link to="/subjects" className="btn-secondary">Browse subjects</Link><Link to="/career-guidance" className="btn-primary">Plan a pathway</Link></div></div>
        <div className="card p-6"><p className="eyebrow mb-2">Courses</p><h2 className="font-display text-2xl text-ink mb-4">Relevant learning</h2>{countryCourses.length ? <div className="space-y-3">{countryCourses.map((course) => <Link key={course.id} to={`/courses/${course.id}`} className="block border-b border-line pb-3 text-sm text-ink hover:text-brass-dark">{course.title}<span className="block text-xs text-slate mt-1">{course.level} · {course.mode}</span></Link>)}</div> : <p className="text-sm text-slate">Course listings for this destination are growing.</p>}</div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-ink mb-6">Universities in {country.name}</h2>
        {countryUniversities.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {countryUniversities.map((u) => (
              <UniversityCard key={u.id} university={u} />
            ))}
          </div>
        ) : (
          <p className="text-slate">More university listings for {country.name} are on the way.</p>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-ink mb-6">Professors in {country.name}</h2>
        {countryProfessors.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {countryProfessors.map((p) => (
              <ProfessorCard key={p.id} professor={p} />
            ))}
          </div>
        ) : (
          <p className="text-slate">More expert profiles for {country.name} are on the way.</p>
        )}
      </section>
    </div>
  )
}
