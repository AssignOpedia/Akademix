import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  FileEdit,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Layers,
  Sparkles,
} from 'lucide-react'
import CareerExplorer from '../../components/CareerExplorer/CareerExplorer'

const academicServices = [
  {
    title: 'Grooming',
    description: 'Develop polished professional etiquette, confident body language, and interview-ready personal presentation.',
    icon: Sparkles,
  },
  {
    title: 'Spoken English',
    description: 'Enhance oral fluency, diction, and communication confidence for academic discussions and high-stakes interviews.',
    icon: Languages,
  },
  {
    title: 'CV/Resume Preparation',
    description: 'Craft ATS-compliant, industry-tailored resumes that effectively spotlight your achievements and potential.',
    icon: FileText,
  },
  {
    title: 'Cover Letter/Page Preparation',
    description: 'Write persuasive, role-targeted cover letters and professional executive bios that capture recruiter attention.',
    icon: FileEdit,
  },
  {
    title: 'Web Content Writing',
    description: 'Master digital copywriting, structured web articles, and audience-focused online narratives with modern SEO practices.',
    icon: Globe,
  },
  {
    title: 'Product Content Writing',
    description: 'Create concise UX microcopy, feature messaging, and engaging product documentation that guides users seamlessly.',
    icon: Layers,
  },
  {
    title: 'Technical Workshops',
    description: 'Gain practical expertise through intensive, hands-on masterclasses covering industry tools and core technologies.',
    icon: Code2,
  },
  {
    title: 'Customised Courses',
    description: 'Pursue personalized curricula and flexible learning tracks tailored specifically to your academic and career goals.',
    icon: GraduationCap,
  },
]

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
              <article
                key={service.title}
                className="card group flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
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
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/assignment-guidance" className="btn-primary">
            Enquire Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <CareerExplorer />
    </div>
  )
}
