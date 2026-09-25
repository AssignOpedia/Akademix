import ProfessorCard from '../ProfessorCard/ProfessorCard'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { clearComparedProfessors, toggleCompareProfessor } from '../../features/professors/professorSlice'
import { getProfessorById } from '../../data/professors'

export default function ProfessorGrid({ professors }) {
  const dispatch = useDispatch()
  const comparedExperts = useSelector((state) => state.professors.comparedExperts)
  const compared = comparedExperts.map(getProfessorById).filter(Boolean)

  if (!professors.length) {
    return (
      <div className="text-center py-16 border border-dashed border-line rounded-2xl">
        <p className="text-slate">No professors match these filters yet.</p>
        <p className="text-sm text-slate/70 mt-1">Try widening your search.</p>
      </div>
    )
  }

  return (
    <div>
      {compared.length > 0 && <div className="mb-6 rounded-2xl bg-ink text-paper p-4 md:p-5 animate-fade-up">
        <div className="flex items-center justify-between gap-4 mb-4"><div><p className="text-xs uppercase tracking-wider text-paper/75">Compare shortlist</p><p className="font-display text-xl mt-1">{compared.length} of 3 experts selected</p></div><button onClick={() => dispatch(clearComparedProfessors())} className="text-xs text-paper/80 hover:text-paper">Clear all</button></div>
        <div className="grid sm:grid-cols-3 gap-3">
          {compared.map((professor) => <div key={professor.id} className="border border-white/15 rounded-xl p-3 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-paper/10 flex items-center justify-center text-xs">{professor.name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ').map((name) => name[0]).slice(0, 2).join('')}</div><div className="min-w-0 flex-1"><p className="text-sm truncate">{professor.name}</p><p className="text-xs text-paper/75 truncate">{professor.experience} years · {professor.country}</p></div><Link to={`/professors/${professor.id}`} className="text-xs text-brass-light">View</Link><button onClick={() => dispatch(toggleCompareProfessor(professor.id))} aria-label={`Remove ${professor.name} from comparison`} className="text-paper/75 hover:text-paper"><X size={14} /></button></div>)}
        </div>
      </div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {professors.map((p) => <ProfessorCard key={p.id} professor={p} />)}
      </div>
    </div>
  )
}
