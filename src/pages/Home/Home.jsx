
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/Search/SearchBar';
import ProfessorAvatar from '../../components/ProfessorAvatar/ProfessorAvatar';
import { subjectCategories as appSubjectCategories, allSubjects } from '../../data/subjects';
import { universities as appUniversities } from '../../data/universities';
import AnalyticsDashboard from '../../components/AnalyticsDashboard/AnalyticsDashboard';
import Testimonials from '../../components/AnalyticsDashboard/Testimonials/Testimonials';
import { mentorProfiles } from '../../data/mentors';
import {
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  Search,
  ArrowRight,
  Sparkles,
  UserCheck,
  Compass,
  FileText,
  Briefcase,
  ChevronRight,
  Star,
  ShieldCheck,
  Users,
  Lightbulb,
  PlayCircle,
} from 'lucide-react';

function AnimatedStat({ value, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let frameId
    const start = () => {
      const duration = 1600
      const startedAt = performance.now()
      const animate = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const easedProgress = 1 - (1 - progress) ** 4
        setCount(value * easedProgress)
        if (progress < 1) frameId = requestAnimationFrame(animate)
        else setCount(value)
      }
      frameId = requestAnimationFrame(animate)
    }

    if (document.documentElement.dataset.introSplash === 'active') {
      window.addEventListener('intro-splash-complete', start, { once: true })
    } else {
      start()
    }

    return () => {
      window.removeEventListener('intro-splash-complete', start)
      cancelAnimationFrame(frameId)
    }
  }, [value])

  const formattedCount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count)

  return (
    <span aria-label={`${new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)}${suffix}`}>
      <span aria-hidden="true">{formattedCount}{suffix}</span>
    </span>
  )
}

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  // Use the same catalogue as the directory pages so every subject link resolves.
  const homeSubjectCategories = appSubjectCategories.map((category) => ({
    category: category.name,
    subjects: category.subjects,
  }));
  const homeFeaturedSubjects = allSubjects.map((subject) => ({
    ...subject,
    category: homeSubjectCategories.find((category) => category.subjects.includes(subject.name))?.category ?? 'School & Foundation',
  }));
  const normalizedSubjectQuery = searchQuery.trim().toLowerCase();
  const filteredSubjects = homeFeaturedSubjects.filter((subject) =>
    (activeTab === 'all' || subject.category === activeTab) &&
    (!normalizedSubjectQuery || subject.name.toLowerCase().includes(normalizedSubjectQuery))
  );
  const visibleSubjects = normalizedSubjectQuery || showAllSubjects
    ? filteredSubjects
    : filteredSubjects.slice(0, 12);
  const homeUniversities = appUniversities.slice(0, 6).map((university, index) => ({
    ...university,
    location: `${university.city}, ${university.country}`,
    rank: `Featured ${String(index + 1).padStart(2, '0')}`,
    students: 'Explore profile',
  }));

  return (
    <div className="min-h-screen text-slate-900 font-sans relative selection:bg-amber-500 selection:text-white overflow-x-clip">
      {/* Reveal / hover animation styles (background now comes from PageBackground) */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.8s ease both;
        }

        /* ---- Animated hero headline ---- */
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(30px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .word-in {
          display: inline-block;
          opacity: 0;
          animation: wordIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .text-shimmer {
          display: inline-block;
          background-image: linear-gradient(90deg, #9a3412, #be123c, #6d28d9, #9a3412);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 2px 5px rgba(16,24,38,0.14));
          animation:
            wordIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.55s both,
            gradientFlow 4s linear 1.4s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .word-in, .text-shimmer { animation: none; opacity: 1; }
        }
        /* ---- End animated hero headline ---- */

        .hover-lift {
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 45px rgba(217,119,6,0.18);
        }
        .hover-tilt {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .hover-tilt:hover {
          transform: perspective(800px) rotateX(2deg) rotateY(-2deg) translateY(-6px);
          box-shadow: 0 18px 40px rgba(129,140,248,0.18);
        }
        .hover-glow {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .hover-glow:hover {
          box-shadow: 0 0 0 3px rgba(245,158,11,0.25), 0 12px 30px rgba(245,158,11,0.25);
          transform: translateY(-2px);
        }
        a, button {
          transition: color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        nav a {
          position: relative;
        }
        nav a::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg,#d97706,#f472b6);
          transition: width 0.3s ease;
        }
        nav a:hover::after {
          width: 100%;
        }
        .card-anim {
          position: relative;
          overflow: hidden;
          animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-anim::before {
          content: '';
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s ease;
          pointer-events: none;
          z-index: 1;
        }
        .card-anim:hover::before {
          left: 130%;
        }
        .icon-pop {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, color 0.3s ease;
        }
        .card-anim:hover .icon-pop {
          transform: scale(1.15) rotate(-6deg);
        }
        .badge-pop {
          transition: transform 0.3s ease;
        }
        .card-anim:hover .badge-pop {
          transform: translateY(-2px) scale(1.05);
        }
      `}</style>

      {/* Hero */}
      <section className="relative z-10 pt-8 pb-24 lg:pt-20 lg:pb-36 fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-amber-500/30 text-amber-800 text-xs sm:text-sm font-bold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            Empowering 120,000+ Global Scholars & Researchers
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-5xl mx-auto leading-[1.1] mb-8 text-slate-900">
            {['Learn', 'from', 'the', 'best.'].map((word, i) => (
              <span
                key={i}
                className="word-in mr-[0.25em]"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {word}
              </span>
            ))}
            <span className="text-shimmer">Become the best.</span>
          </h1>

          <p className="text-slate-700 text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Connect directly with elite professors, Ivy League mentors, and structured academic guidance tailored to your exact milestone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <button 
              onClick={() => navigate('/professors')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-base shadow-xl shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 hover-glow"
            >
              Find Your Professor <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#subjects"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/90 hover:bg-white border border-stone-300 text-slate-900 font-bold text-base backdrop-blur-md shadow-sm transition-all duration-300 hover-lift"
            >
              Explore Subjects
            </a>
          </div>

          <div className="max-w-xl mx-auto -mt-8 mb-14">
            <SearchBar />
          </div>

          {/* Glassmorphic Quick-Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { label: 'Global Students', value: 1400, suffix: '+', icon: <GraduationCap className="w-8 h-8 text-amber-600" /> },
              { label: 'Universities Covered', value: 350, suffix: '+', icon: <Globe className="w-8 h-8 text-indigo-600" /> },
              { label: 'Success Rate', value: 98.4, suffix: '%', decimals: 1, icon: <ShieldCheck className="w-8 h-8 text-emerald-600" /> },
              { label: 'Research Papers Guided', value: 4500, suffix: '+', icon: <Lightbulb className="w-8 h-8 text-amber-500" /> }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 backdrop-blur-xl border border-amber-200/70 hover:border-amber-400/70 hover:from-white hover:via-amber-50 hover:to-rose-50 transition-all duration-500 transform hover:-translate-y-1.5 shadow-xl shadow-stone-300/40 hover-tilt card-anim"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 w-fit icon-pop">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mb-1 group-hover:text-amber-700 transition-colors"><AnimatedStat value={stat.value} suffix={stat.suffix} decimals={stat.decimals} /></div>
                <div className="text-xs sm:text-sm text-slate-700 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

         <AnalyticsDashboard />

      {/* Subjects */}
      <section id="subjects" className="relative z-10 py-24 border-t border-stone-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Explore Subjects</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">Every subject, one platform.</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex max-w-full flex-wrap gap-2 rounded-2xl border border-stone-300 bg-white/95 p-1.5 shadow-md">
              {['all', ...homeSubjectCategories.map((category) => category.category)].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all capitalize ${
                    activeTab === tab 
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-stone-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 max-w-md relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-500" />
            <input
              type="text"
              placeholder="Search specific subject (e.g., Quantum Physics)..."
              aria-label="Search subjects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/95 border border-stone-300 text-slate-900 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-lg shadow-stone-300/40"
            />
          </div>

          <p className="mb-5 text-sm text-slate-700" aria-live="polite">
            Showing {visibleSubjects.length} of {filteredSubjects.length} subject{filteredSubjects.length === 1 ? '' : 's'}
          </p>

          {visibleSubjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSubjects.map((subject) => (
                <button
                  type="button"
                  key={subject.slug}
                  onClick={() => navigate(`/subjects/${subject.slug}`)}
              className="group relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 p-7 text-left shadow-xl shadow-stone-300/40 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/70 hover:from-white hover:via-amber-50 hover:to-rose-50 hover-lift card-anim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-amber-500/5 transition-transform duration-500 group-hover:scale-125" />
                  <span className="badge-pop mb-4 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-800">
                    {subject.category}
                  </span>
                  <span className="mb-2 flex items-center justify-between gap-3 font-serif text-xl text-slate-900 transition-colors group-hover:text-amber-700">
                    {subject.name}
                    <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-stone-500 transition-all group-hover:translate-x-1.5 group-hover:text-amber-700" />
                  </span>
                  <span className="block text-sm text-slate-700">Explore related courses, professors, universities, and career paths.</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-300 bg-white/85 p-8 text-center shadow-lg">
              <p className="font-serif text-xl text-slate-900">No subjects match your search.</p>
              <p className="mt-2 text-sm text-slate-700">Try another subject name or clear your filters.</p>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveTab('all') }} className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                Clear search and filters
              </button>
            </div>
          )}

          {!normalizedSubjectQuery && filteredSubjects.length > 12 && (
            <button type="button" onClick={() => setShowAllSubjects((value) => !value)} className="mt-8 rounded-full border border-stone-300 bg-white/90 px-6 py-3 text-sm font-bold text-slate-900 shadow-md transition hover:border-amber-500/50 hover:text-amber-700">
              {showAllSubjects ? 'Show fewer subjects' : `View all ${filteredSubjects.length} subjects`}
            </button>
          )}
        </div>
      </section>

      {/* Coaching */}
      <section id="coaching" className="relative z-10 py-24 border-t border-stone-300/60 bg-white/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Learn with Akademix</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 mb-4">Coaching, beyond the classroom.</h2>
            <p className="text-slate-700 text-sm sm:text-base">Comprehensive programs tailored to every stage of your academic career.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'School Coaching', desc: 'IB, AP, IGCSE & A-Levels mastery with distinction.' },
              { title: 'Entrance Preparation', desc: 'SAT, ACT, GRE, GMAT & LNAT elite test strategies.' },
              { title: 'University Subjects', desc: 'Rigorous collegiate tutoring for top-tier GPA.' },
              { title: 'Assignment Guidance', desc: 'Understand briefs, plan research, and work through difficult concepts.' },
              { title: 'Skill Development', desc: 'Critical thinking, public speaking & academic writing.' },
              { title: 'Exam Preparation', desc: 'Timed mock tests, score analysis & weakness correction.' },
              { title: 'Research Support', desc: 'Co-authoring papers & journal publication assistance.' },
              { title: 'Career Preparation', desc: 'Resume building, networking & mentorship loops.' },
            ].map((coach, index) => (
              <div
                key={index}
                onClick={() => navigate(coach.title === 'Assignment Guidance' ? '/assignment-guidance' : '/courses')}
                className="group p-6 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 border border-amber-200/70 hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-md hover-lift card-anim"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm icon-pop">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-serif text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{coach.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{coach.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities */}
      <section id="universities" className="relative z-10 py-24 border-t border-stone-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Global Universities</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">Explore universities worldwide.</h2>
            </div>
            <button 
              onClick={() => navigate('/universities')}
              className="text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
            >
              View all universities <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeUniversities.map((u) => (
              <div
                key={u.id} 
                onClick={() => navigate(`/universities/${u.id}`)}
                className="group p-7 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 backdrop-blur-xl border border-amber-200/70 hover:border-amber-400/70 hover:from-white hover:via-amber-50 hover:to-rose-50 transition-all duration-300 cursor-pointer shadow-xl shadow-stone-300/40 relative overflow-hidden hover-tilt card-anim"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300 flex items-center justify-center font-serif text-amber-700 text-lg shadow-inner icon-pop">
                    <Globe className="w-6 h-6 text-amber-700" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold">
                    {u.rank}
                  </span>
                </div>
                <h3 className="text-xl font-serif text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{u.name}</h3>
                <p className="text-xs text-slate-600 mb-6 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {u.location}
                </p>
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-slate-700">
                  <span>{u.type}</span>
                  <span className="text-amber-700 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">View profile <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentoring */}
      <section id="mentoring" className="relative z-10 py-24 border-t border-stone-300/60 bg-white/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Student Mentoring</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 mb-4">Get a guide for your academic next step.</h2>
            <p className="text-slate-700 text-sm sm:text-base">Our mentors help you explore subjects, plan for college, and decide what kind of professor will support your goals.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mentorProfiles.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate('/mentoring')}
                className="group p-6 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 border border-amber-200/70 hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between hover-lift card-anim"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ProfessorAvatar professor={m} size="card" />
                    <p className="text-xs uppercase tracking-wider text-amber-700 font-bold">Student guide</p>
                  </div>
                  <h3 className="text-lg font-serif text-slate-900 group-hover:text-amber-700 transition-colors">{m.name}</h3>
                  <p className="text-sm font-medium text-slate-800 mt-1 mb-2">{m.role}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{m.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-amber-700 font-bold">
                  <span>Explore this guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/mentoring')}
            className="px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-xl hover-lift"
          >
            Meet all mentors
          </button>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="relative z-10 py-24 border-t border-stone-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-amber-50/60 to-white border border-stone-300/70 shadow-2xl relative overflow-hidden hover-tilt card-anim">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Assignment Guidance</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mb-6">Structured guidance, not shortcuts.</h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-8">
                Get structured academic guidance, concept clarification, research direction and feedback to help you understand and complete your academic work independently with absolute confidence.
              </p>
              <button 
                onClick={() => navigate('/assignment-guidance')}
                className="px-6 py-3.5 rounded-full bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all flex items-center gap-2 hover-glow"
              >
                Explore Assignment Guidance <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/85 to-rose-50/75 backdrop-blur-xl border border-amber-200/70 shadow-2xl shadow-stone-300/40 hover-tilt card-anim">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-2 block">Career Explorer</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mb-6">Chart your trajectory from classroom to industry.</h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-8">
                Explore study routes and career areas connected to technology, finance, health, creative work, and research.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Quantitative Finance', 'AI Research Scientist', 'Biotech Venture Capital', 'Global Trade Attorney', 'Quantum Engineer'].map((career, i) => (
                  <span key={i} className="px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-300 text-xs text-slate-800 font-bold shadow-sm hover-glow cursor-default">
                    {career}
                  </span>
                ))}
              </div>
              <button type="button" onClick={() => navigate('/career-guidance')} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900">
                Build my pathway <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

     {/*
      <section className="relative z-10 py-24 border-t border-stone-300/60 bg-gradient-to-b from-white/60 to-stone-100/60 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 mb-6">
            Tell us where you are. We'll help you find the way.
          </h2>
          <p className="text-slate-700 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Explore academic options and find guidance for your next step.
          </p>
          <button 
            onClick={() => navigate('/professors')}
            className="px-10 py-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg shadow-2xl shadow-amber-500/30 transform hover:-translate-y-1 transition-all hover-glow"
          >
            Find Your Professor Now
          </button>
        </div>
      </section>
      */}
      <Testimonials />
      

    </div>
  );
}
