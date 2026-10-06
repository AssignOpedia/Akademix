import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export default function FormSubmissionAlert() {
  const [message, setMessage] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    const handleSubmission = (event) => {
      window.clearTimeout(timerRef.current)
      setMessage(event.detail?.message || 'Thank you! Your form was submitted.')
      timerRef.current = window.setTimeout(() => setMessage(''), 5000)
    }
    window.addEventListener('akademix-form-submitted', handleSubmission)
    return () => {
      window.removeEventListener('akademix-form-submitted', handleSubmission)
      window.clearTimeout(timerRef.current)
    }
  }, [])

  if (!message) return null

  return (
    <div className="fixed right-5 top-5 z-[150] w-[min(28rem,calc(100vw-2.5rem))] rounded-2xl border border-emerald-200 bg-white p-4 pr-12 shadow-xl" role="alert" aria-live="assertive">
      <p className="font-semibold text-emerald-800">Form submitted</p>
      <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{message}</p>
      <button type="button" onClick={() => { window.clearTimeout(timerRef.current); setMessage('') }} aria-label="Close notification" className="absolute right-3 top-3 rounded-lg p-1.5 text-slate hover:bg-stone hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
        <X size={18} />
      </button>
    </div>
  )
}
