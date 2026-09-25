import CareerExplorer from '../../components/CareerExplorer/CareerExplorer'

export default function CareerGuidance() {
  return (
    <div>
      <div className="container-content pt-14">
        <p className="eyebrow mb-2">Career guidance</p>
        <h1 className="font-display text-4xl text-ink mb-3">Plan where your subject can take you</h1>
        <p className="text-slate max-w-xl">
          Explore possible career pathways connected to your subject and interests.
        </p>
      </div>
      <CareerExplorer />
    </div>
  )
}
