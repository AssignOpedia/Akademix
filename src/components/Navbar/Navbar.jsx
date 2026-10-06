import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import CountryTicker from '../CountryTicker/CountryTicker'
import { countries } from '../../data/countries'

const links = [
  { to: '/', label: 'Home' },
  { to: '/professors', label: 'Find a Professor' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/universities', label: 'Universities' },
  { to: '/countries', label: 'Countries' },
  { to: '/mentoring', label: 'Mentoring' },
  { to: '/career-guidance', label: 'Career Guidance' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/about', label: 'About' },
]

const accountStorageKey = 'akademix-local-accounts'
const sessionStorageKey = 'akademix-auth-session'

function readStoredAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(accountStorageKey) || '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256)
  return bytesToHex(new Uint8Array(bits))
}

function saveSignedInSession(user) {
  const session = { name: user.name, email: user.email, role: user.role || 'Student', phone: user.phone || '', dateOfBirth: user.dateOfBirth || '', gender: user.gender || '', country: user.country || user.location || '' }
  localStorage.setItem(sessionStorageKey, JSON.stringify(session))
  localStorage.setItem('akademix-student-profile', JSON.stringify(session))
  return session
}

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authNotice, setAuthNotice] = useState('')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(sessionStorageKey) || 'null')
    } catch {
      return null
    }
  })
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
  const [authorRole, setAuthorRole] = useState('Student')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [country, setCountry] = useState('')
  const [authDestination, setAuthDestination] = useState('/profile')

  useEffect(() => {
    const syncSession = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem(sessionStorageKey) || 'null'))
      } catch {
        setCurrentUser(null)
      }
    }
    const openAuth = (event) => {
      setAuthMode('login')
      setAuthNotice('')
      setPassword('')
      setProfileEmail(profile?.email || '')
      setAuthDestination(event.detail?.redirectTo || '/profile')
      setProfileOpen(true)
    }
    window.addEventListener('akademix-auth-change', syncSession)
    window.addEventListener('akademix-open-auth', openAuth)
    return () => {
      window.removeEventListener('akademix-auth-change', syncSession)
      window.removeEventListener('akademix-open-auth', openAuth)
    }
  }, [])

  const openAuthDialog = (mode = 'login') => {
    setAuthMode(mode)
    setAuthNotice('')
    setPassword('')
    setProfileEmail(profile?.email || '')
    setAuthDestination('/profile')
    setProfileOpen(true)
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    const email = profileEmail.trim().toLowerCase()

    try {
      const accounts = readStoredAccounts()
      if (authMode === 'signup') {
        if (accounts.some((account) => account.email === email)) {
          setAuthNotice('An account with this email already exists. Log in instead.')
          return
        }

        const salt = crypto.getRandomValues(new Uint8Array(16))
        const account = {
          name: profileName.trim(),
          email,
          salt: bytesToHex(salt),
          passwordHash: await hashPassword(password, salt),
          role: authorRole,
          phone: authorRole === 'Student' ? phone.trim() : '',
          dateOfBirth: authorRole === 'Student' ? dateOfBirth : '',
          gender: authorRole === 'Student' ? gender : '',
          country: authorRole === 'Student' ? country : '',
        }
        localStorage.setItem(accountStorageKey, JSON.stringify([...accounts, account]))
        const session = saveSignedInSession(account)
        setProfile(session)
        setCurrentUser(session)
        setProfileOpen(false)
        setPassword('')
        navigate(authDestination)
        return
      }

      const account = accounts.find((item) => item.email === email)
      if (!account) {
        setAuthNotice('No account was found for this email. Sign up to create one.')
        return
      }

      const salt = new Uint8Array(account.salt.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)))
      const passwordHash = await hashPassword(password, salt)
      if (passwordHash !== account.passwordHash) {
        setAuthNotice('The email or password is incorrect.')
        return
      }

      const session = saveSignedInSession(account)
      setProfile(session)
      setCurrentUser(session)
      setProfileOpen(false)
      setPassword('')
      navigate(authDestination)
    } catch {
      setAuthNotice('We could not complete that request. Please try again.')
    }
  }
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
              onClick={currentUser ? () => navigate('/profile') : () => openAuthDialog('signup')}
              className={currentUser ? 'px-2 py-2 text-sm font-semibold text-slate-800 transition-colors hover:text-slate-950' : 'btn-donate'}
            >
              {currentUser ? 'Profile' : 'Sign Up'}
            </button>

            {/* Get Guidance */}
            <Link
              to="/assignment-guidance"
              className="
                px-5
                py-2.5
                rounded-full
                bg-gradient-to-r
                from-amber-500
                to-amber-600
                hover:from-amber-600
                hover:to-amber-700
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

            <button type="button" onClick={currentUser ? () => { setOpen(false); navigate('/profile') } : () => { setOpen(false); openAuthDialog('signup') }} className="py-2.5 text-left text-sm font-semibold text-slate-800 hover:text-amber-700">
              {currentUser ? 'Profile' : 'Sign Up'}
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
                from-amber-500
                to-amber-600
                text-white
                font-semibold
                text-sm
                shadow-lg
                shadow-amber-500/25
                transition-all
                hover:from-amber-600
                hover:to-amber-700
              "
            >
              Assignment Guidance
            </Link>
          </nav>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="student-profile-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="eyebrow mb-1">Akademix account</p><h2 id="student-profile-title" className="font-display text-2xl text-ink">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-sm text-slate">{authMode === 'login' ? 'Log in to your student account.' : 'Sign up to get started with Akademix.'}</p></div>
              <button type="button" aria-label="Close login dialog" onClick={() => setProfileOpen(false)} className="rounded-lg p-2 text-slate hover:bg-stone"><X size={18} /></button>
            </div>
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone p-1">
              {['login', 'signup'].map((mode) => <button key={mode} type="button" aria-pressed={authMode === mode} onClick={() => { setAuthMode(mode); setAuthNotice('') }} className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${authMode === mode ? 'bg-white text-ink shadow-sm' : 'text-slate hover:text-ink'}`}>{mode === 'login' ? 'Log in' : 'Sign up'}</button>)}
            </div>
            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === 'signup' && <><label className="block text-sm font-medium text-ink">Name<input required maxLength={80} value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="name" /></label><label className="block text-sm font-medium text-ink">I am a<select value={authorRole} onChange={(event) => setAuthorRole(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal outline-none focus:border-brass"><option>Student</option><option>Professor</option><option>Recruiter</option></select></label>{authorRole === 'Student' && <><label className="block text-sm font-medium text-ink">Phone number<input required type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="tel" /></label><label className="block text-sm font-medium text-ink">Date of birth<input required type="date" max={new Date().toISOString().slice(0, 10)} value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="bday" /></label><label className="block text-sm font-medium text-ink">Gender<select required value={gender} onChange={(event) => setGender(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal outline-none focus:border-brass"><option value="">Select gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option><option>Other</option></select></label><label className="block text-sm font-medium text-ink">Country<select required value={country} onChange={(event) => setCountry(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal outline-none focus:border-brass" autoComplete="country-name"><option value="">Select a country</option>{countries.map((option) => <option key={option.code} value={option.name}>{option.name}</option>)}</select></label></>}</>}
              <label className="block text-sm font-medium text-ink">Email<input required type="email" maxLength={254} value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete="email" /></label>
              <label className="block text-sm font-medium text-ink">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 font-normal outline-none focus:border-brass" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} /></label>
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
