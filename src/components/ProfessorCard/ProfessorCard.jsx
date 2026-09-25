import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, MapPin, GitCompare, Clock } from 'lucide-react'
import { selectExpertForGuidance, toggleFavoriteProfessor, toggleCompareProfessor } from '../../features/professors/professorSlice'
import { getCountryByCode } from '../../data/countries'
import CountryFlag from '../UI/CountryFlag'
import ProfessorAvatar from '../ProfessorAvatar/ProfessorAvatar'

export default function ProfessorCard({ professor }) {
  const dispatch = useDispatch()
  const { selectedExperts, favoriteExperts, comparedExperts } = useSelector((s) => s.professors)
  const isSelected = selectedExperts.includes(professor.id)
  const isFavorite = favoriteExperts.includes(professor.id)
  const isCompared = comparedExperts.includes(professor.id)
  const compareLimitReached = comparedExperts.length >= 3 && !isCompared
  const country = getCountryByCode(professor.countryCode)

  return (
    <div className="card p-5 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5 transition-all duration-300">
      <div className="flex items-start gap-3">
        <ProfessorAvatar professor={professor} />
        <div className="min-w-0">
          <p className="text-ink font-medium leading-snug">{professor.name}</p>
          <p className="text-sm text-slate leading-snug">{professor.title}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => dispatch(toggleFavoriteProfessor(professor.id))} aria-label={isFavorite ? `Remove ${professor.name} from favorites` : `Favorite ${professor.name}`} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-brass-dark bg-brass/10' : 'text-slate-light hover:text-ink hover:bg-stone'}`}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /></button>
          <button type="button" onClick={() => dispatch(toggleCompareProfessor(professor.id))} disabled={compareLimitReached} title={compareLimitReached ? 'Remove a professor from the comparison shortlist first' : undefined} aria-label={isCompared ? `Remove ${professor.name} from comparison` : `Compare ${professor.name}`} className={`p-2 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isCompared ? 'text-ink bg-stone' : 'text-slate-light hover:text-ink hover:bg-stone'}`}><GitCompare size={16} /></button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-sm text-slate">
        <MapPin size={14} />
        <span className="truncate">
          <span className="inline-flex items-center gap-2"><CountryFlag country={country} /> {professor.university}</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate">
        <Clock size={14} />
        <span>{professor.experience} years experience</span>
      </div>

      <div className="mt-2 text-sm text-slate">
        <span className="font-medium text-ink">Guidance:</span> {professor.guidance.slice(0, 2).join(', ')}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {professor.subjects.slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-xs px-2.5 py-1 rounded-full bg-stone text-ink/80 border border-line"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
        <Link
          to={`/professors/${professor.id}`}
          className="text-sm font-medium text-ink hover:text-brass-dark transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => dispatch(selectExpertForGuidance(professor.id))}
          className={`ml-auto text-sm rounded-full px-4 py-2 transition-colors ${
            isSelected
              ? 'bg-brass/10 text-brass-dark border border-brass/30'
              : 'bg-ink text-paper hover:bg-ink-light'
          }`}
        >
          {isSelected ? 'Selected' : 'Select for Guidance'}
        </button>
      </div>
    </div>
  )
}
