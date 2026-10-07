import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CareerExplorer from '../../components/CareerExplorer/CareerExplorer'
import { academicServices } from '../../data/academicServices'

export default function CareerGuidance() {
  return (
    <div>
      <section className="container-content pt-14 pb-12" aria-labelledby="academic-services-title">
        <div className="max-w-3xl">
          <p className="eyebrow mb-2">Comprehensive academic solutions</p>
          <h2 id="academic-services-title" className="font-display text-4xl text-ink mb-3 sm:text-5xl">
            Full Academics Under One Roof
          </h2>
          <p className="text-slate max-w-2xl text-base sm:text-lg">
            Everything you need to prepare, present, and progress, in one place.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicServices.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.slug}
                to={`/career-guidance/enquiry/${service.slug}`}
                className="card group flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 block cursor-pointer"
                aria-label={`Enquire about ${service.title}`}
              >
                <div>
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70 text-brass-dark transition-transform duration-300 group-hover:scale-105"
                    aria-hidden="true"
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-brass-dark transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brass-dark">
                  <span>Enquire service</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/assignment-guidance" className="btn-primary">
            General Guidance <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <CareerExplorer />
    </div>
  )
}
