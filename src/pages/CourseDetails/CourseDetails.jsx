import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock3, GraduationCap, MonitorPlay } from 'lucide-react'
import { courses } from '../../data/courses'

export default function CourseDetails() {
  const { id } = useParams()
  const course = courses.find((item) => item.id === id)

  if (!course) return <Navigate to="/courses" replace />

  return (
    <div className="container-content py-14">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-slate hover:text-ink">
        <ArrowLeft size={15} /> All courses
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="eyebrow mb-2">{course.level} course · {course.subject}</p>
          <h1 className="max-w-3xl font-display text-4xl text-ink">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">
            A structured {course.level.toLowerCase()} course in {course.subject}, taught by {course.instructor}.
            Learn through {course.lessons} lessons delivered {course.mode.toLowerCase()} over {course.duration}.
          </p>

          <section className="mt-10">
            <h2 className="mb-4 font-display text-2xl text-ink">Course overview</h2>
            <p className="leading-relaxed text-slate">
              This course is organized into focused lessons to help you build knowledge in {course.subject}.
              Its {course.level.toLowerCase()} level and guided format provide a clear path through the material.
            </p>
          </section>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <Clock3 size={18} className="text-brass-dark" />
              <p className="mt-3 text-xs text-slate">Duration</p>
              <p className="mt-1 font-medium text-ink">{course.duration}</p>
            </div>
            <div className="card p-4">
              <BookOpen size={18} className="text-brass-dark" />
              <p className="mt-3 text-xs text-slate">Lessons</p>
              <p className="mt-1 font-medium text-ink">{course.lessons} lessons</p>
            </div>
            <div className="card p-4">
              <MonitorPlay size={18} className="text-brass-dark" />
              <p className="mt-3 text-xs text-slate">Format</p>
              <p className="mt-1 font-medium text-ink">{course.mode}</p>
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone text-ink">
            <GraduationCap size={22} />
          </div>
          <p className="eyebrow mt-5">Your instructor</p>
          <h2 className="mt-1 font-display text-2xl text-ink">{course.instructor}</h2>
          <p className="mt-5 border-t border-line pt-4 text-sm text-slate">Course level: {course.level}</p>
          <Link to="/assignment-guidance" className="btn-primary mt-6 w-full">Get assignment guidance</Link>
          <Link to="/courses" className="btn-secondary mt-3 w-full">Browse all courses</Link>
        </aside>
      </div>
    </div>
  )
}
