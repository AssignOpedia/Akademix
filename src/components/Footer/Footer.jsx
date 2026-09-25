import { Link } from 'react-router-dom'
import { countries } from '../../data/countries'
import CountryFlag from '../UI/CountryFlag'

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Subjects', to: '/subjects' },
      { label: 'Departments', to: '/subjects' },
      { label: 'Professors', to: '/professors' },
      { label: 'Universities', to: '/universities' },
      { label: 'Courses', to: '/courses' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Courses', to: '/courses' },
      { label: 'Mentoring', to: '/mentoring' },
      { label: 'Career Guidance', to: '/career-guidance' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/about' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/80 mt-auto">
      <div className="container-content py-12 md:py-14 grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-8 lg:gap-10">
        <div>
          <p className="font-display text-xl text-paper">Akademix</p>
          <p className="mt-3 text-sm max-w-xs">
            Academic guidance for every stage of your journey — from Class 10 to higher studies.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs tracking-wide text-paper/75 mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm hover:text-paper transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs tracking-wide text-paper/75 mb-3">Global</p>
          <ul className="grid grid-cols-2 gap-y-2 gap-x-3">
            {countries.map((c) => (
              <li key={c.code}>
                <Link
                  to={`/countries/${c.code}`}
                  className="text-sm hover:text-paper transition-colors"
                >
                  <span className="inline-flex items-center gap-2"><CountryFlag country={c} /> {c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-content py-5 text-xs text-paper/75">
          © {new Date().getFullYear()} Akademix. Academic guidance for every stage of your journey.
        </div>
      </div>
    </footer>
  )
}
