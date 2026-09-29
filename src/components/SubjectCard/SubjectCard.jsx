import { Link } from 'react-router-dom'
import { ArrowUpRight, GitCompareArrows } from 'lucide-react'

export default function SubjectCard({ subject, onCompare, compareSlot }) {
  return (
    <article className="card flex items-center justify-between gap-3 p-4 transition-colors hover:border-ink/30 sm:p-5">
      <Link to={`/subjects/${subject.slug}`} className="group flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-ink">{subject.name}</span>
        <ArrowUpRight size={16} className="shrink-0 text-slate transition-colors group-hover:text-brass-dark" />
      </Link>
      {onCompare && <button type="button" onClick={() => onCompare(subject.name)} aria-label={`Compare ${subject.name}`} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-semibold transition-colors sm:px-3 ${compareSlot ? 'border-indigo-200 bg-indigo-50 text-indigo-900' : 'border-line text-slate hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900'}`}><GitCompareArrows size={14} />{compareSlot ? `In ${compareSlot}` : 'Compare'}</button>}
    </article>
  )
}
