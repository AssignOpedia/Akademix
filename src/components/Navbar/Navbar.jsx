import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import CountryTicker from '../CountryTicker/CountryTicker'

const links = [
  { to: '/', label: 'Home' },
  { to: '/professors', label: 'Find a Professor' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/universities', label: 'Universities' },
  { to: '/countries', label: 'Countries' },
  { to: '/mentoring', label: 'Mentoring' },
  { to: '/career-guidance', label: 'Career Guidance' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authNotice, setAuthNotice] = useState('')
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('akademix-student-profile') || 'null')
    } catch {
      return null
    }
  })
  const [profileName, setProfileName] = useState(profile?.name || '')
  const [profileEmail, setProfileEmail] = useState(profile?.email || '')
  const [password, setPassword] = useState('')
  return (
    <header className="sticky top-0 z-50">
      {/* Country ticker */}
      <CountryTicker />

      {/* Main Navbar */}
      <div className="backdrop-blur-2xl bg-white/70 border-b border-stone-300/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          {/* =========================
              LOGO
          ========================== */}
          <Link
            to="/"
            className="flex items-center shrink-0 group"
            aria-label="Akademix Home"
          >
            <img
              src="/akademix-logo.png"
              alt="Akademix"
              className="
                h-14
                sm:h-16
                w-auto
                object-contain
                transition-transform
                duration-300
                group-hover:scale-[1.03]
              "
            />
          </Link>

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}
          <nav className="hidden xl:flex flex-1 items-center justify-center gap-4 2xl:gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative whitespace-nowrap text-[13px] 2xl:text-sm font-medium transition-colors hover:text-amber-700
                   
                   after:content-['']
                   after:absolute
                   after:left-0
                   after:-bottom-1
                   after:h-0.5
                   after:bg-gradient-to-r
                   after:from-amber-600
                   after:to-pink-400
                   after:transition-all
                   after:duration-300

                   ${
                     isActive
                       ? 'text-amber-700 after:w-full'
                       : 'text-slate-800 after:w-0 hover:after:w-full'
                   }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* =========================
              DESKTOP ACTIONS
          ========================== */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">

            {/* Login and sign up */}
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthNotice(''); setProfileOpen(true) }}
              className="
                text-sm
                font-semibold
                text-slate-800
                hover:text-slate-950
                px-2
                py-2
                transition-colors
              "
            >
              Login / Sign up
            </button>

            {/* Get Guidance */}
            <Link
              to="/assignment-guidance"
              className="
                px-5
                py-2.5
                rounded-full
                bg-gradient-to-r
                from-amber-700
                to-amber-800
                hover:from-amber-800
                hover:to-amber-900
                text-white
                font-semibold
                text-sm
                shadow-lg
                shadow-amber-500/25
                transition-all
                transform
                hover:-translate-y-0.5
                active:translate-y-0
                whitespace-nowrap
              "
            >
              Assignment Guidance
            </Link>
          </div>

          {/* =========================
              MOBILE MENU BUTTON
          ========================== */}
          <button
            className="
              xl:hidden
              p-2
              -mr-2
              rounded-lg
              text-slate-800
              hover:bg-stone-200/60
              transition-colors
            "
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* =========================
          MOBILE MENU
      ========================== */}
      {open && (
        <div
          className="
            xl:hidden
            bg-white/95
            border-b
            border-stone-200
            backdrop-blur-2xl
            shadow-xl
          "
        >
          <nav className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-1">

            {/* Mobile Navigation Links */}
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5
                   text-sm
                   font-semibold
                   border-b
                   border-stone-200/70
                   last:border-none
                   transition-colors
                   hover:text-amber-700

                   ${
                     isActive
                       ? 'text-amber-700'
                       : 'text-slate-800'
                   }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            <button type="button" onClick={() => { setOpen(false); setAuthMode('login'); setAuthNotice(''); setProfileOpen(true) }} className="py-2.5 text-left text-sm font-semibold text-slate-800 hover:text-amber-700">
              Login / Sign up
            </button>

            {/* Mobile CTA */}
            <Link
              to="/assignment-guidance"
              onClick={() => setOpen(false)}
              className="
                mt-4
                w-full
                text-center
                py-3
                rounded-full
                bg-gradient-to-r
                from-amber-700
                to-amber-800
                text-white
                font-semibold
                text-sm
                shadow-lg
                shadow-amber-500/25
                transition-all
                hover:from-amber-800
                hover:to-amber-900
              "
            >
              Assignment Guidance
            </Link>
          </nav>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="student-profile-title" className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="eyebrow mb-1">Akademix account</p><h2 id="student-profile-title" className="font-display text-2xl text-ink">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-sm text-slate">{authMode === 'login' ? 'Log in to your student account.' : 'Sign up to get started with Akademix.'}</p></div>
              <button type="button" aria-label="Close login dialog" onClick={() => setProfileOpen(false)} className="rounded-lg p-2 text-slate hover:bg-stone"><X size={18} /></button>
            </div>
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone p-1">
              {['login', 'signup'].map((mode) => <button key={mode} type="button" aria-pressed={authMode === mode} onClick={() => { setAuthMode(mode); setAuthNotice('') }} className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${authMode === mode ? 'bg-white text-ink shadow-sm' : 'text-slate hover:text-ink'}`}>{mode === 'login' ? 'Log in' : 'Sign up'}</button>)}
            </div>
            <form onSubmit={(event) => {
              event.preventDefault()
              if (authMode === 'signup') {
                const savedProfile = { name: profileName.trim(), email: profileEmail.trim() }
                try {
                  localStorage.setItem('akademix-student-profile', JSON.stringify(savedProfile))
                  setProfile(savedProfile)
                  setAuthNotice('Your name and email are saved on this device for guidance forms. Account creation needs a connected authentication service; your password was not stored.')
                } catch {
                  setAuthNotice('Account creation is not connected yet. Your details could not be saved in this browser.')
                }
                return
              }
              setAuthNotice('Account login is not connected yet. Your password has not been sent or saved.')
            }} className="space-y-4">
              {authMode === 'signup' && <label className="block text-sm font-medium text-ink">Name<input required maxLength={80} value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="name" /></label>}
              <label className="block text-sm font-medium text-ink">Email<input required type="email" maxLength={254} value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="email" /></label>
              <label className="block text-sm font-medium text-ink">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} /></label>
              <p className="text-xs text-slate">Authentication is not connected yet. Passwords are not stored or transmitted.</p>
              {authNotice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-ink">{authNotice}</p>}
              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button type="button" onClick={() => setProfileOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{authMode === 'login' ? 'Log in' : 'Create account'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </header>
  )
}
