import CareerExplorer from '../../components/CareerExplorer/CareerExplorer'

export default function CareerGuidance() {
  return (
    <div>
      <div className="container-content pt-14">
        <p className="eyebrow mb-2">Study abroad guidance</p>
        <h1 className="font-display text-4xl text-ink mb-3">Plan your studies abroad</h1>
        <p className="text-slate max-w-2xl">We help students plan overseas study from choosing a course and university through admissions, documents, funding, student visa preparation, and getting ready to travel. Start with a personalized pathway, then tell us what support you need.</p>
      </div>
      <CareerExplorer />
    </div>
  )
}
