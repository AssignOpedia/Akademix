import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, RotateCcw, Send, X } from 'lucide-react'

const suggestions = [
  'Find a professor',
  'Explore subjects',
  'Compare colleges',
  'Assignment help',
  'Meet the mentors',
]

const welcomeMessage = {
  id: 0,
  from: 'assistant',
  text: 'Welcome to Akademix! What can I help you find today?',
}

function getReply(message) {
  const text = message.toLowerCase()

  if (/hello|hi\b|hey\b|good morning|good afternoon/.test(text)) {
    return { text: 'Hi! I can help you find professors, subjects, universities, courses, mentoring, or career guidance. What are you looking for?' }
  }
  if (/professor|expert|tutor|teacher|faculty/.test(text)) {
    return { text: 'Browse the professor directory to filter experts by subject, university, country, and guidance type.', to: '/professors', label: 'Browse professors' }
  }
  if (/subject|department|study|learn/.test(text)) {
    return { text: 'Explore our subject and department catalogue, then open a subject to see related learning and guidance options.', to: '/subjects', label: 'Explore subjects' }
  }
  if (/universit|college|admission|school/.test(text)) {
    return { text: 'Browse universities to explore academic areas, popular subjects, and country pathways.', to: '/universities', label: 'Explore universities' }
  }
  if (/course|class|program|programme/.test(text)) {
    return { text: 'The course catalogue lists structured learning options. Select a course to see its details.', to: '/courses', label: 'Browse courses' }
  }
  if (/mentor|mentoring/.test(text)) {
    return { text: 'Our mentors guide students through subject choices, college planning, and academic goals. They can help you decide what to look for in a professor.', to: '/mentoring', label: 'Meet the mentors' }
  }
  if (/assignment|homework|research help|essay/.test(text)) {
    return { text: 'Get assignment support with programming, data analysis, Power BI, SQL, networking, research, and more.', to: '/assignment-guidance', label: 'Explore assignment guidance' }
  }
  if (/career|job|profession|pathway/.test(text)) {
    return { text: 'Career guidance connects your academic interests with possible career paths.', to: '/career-guidance', label: 'Explore career guidance' }
  }
  if (/countr|abroad|international|global/.test(text)) {
    return { text: 'Explore countries for destination information and related academic pathways.', to: '/countries', label: 'Explore countries' }
  }
  if (/about|contact|support|help/.test(text)) {
    return { text: 'Learn about Akademix and the guidance available on our About page.', to: '/about', label: 'About Akademix' }
  }

  return { text: 'I can help you find professors, subjects, universities, courses, mentors, countries, or career guidance. Try asking about one of these.' }
}

export default function HelpChat() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([welcomeMessage])
  const transcriptRef = useRef(null)
  const nextId = useRef(1)

  useEffect(() => {
    if (open && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, open])

  const sendMessage = (value = question) => {
    const content = value.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { id: nextId.current++, from: 'user', text: content },
      { id: nextId.current++, from: 'assistant', ...getReply(content) },
    ])
    setQuestion('')
  }

  const resetChat = () => {
    setMessages([welcomeMessage])
    setQuestion('')
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="Akademix help chat"
          className="flex h-[min(32rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-slate-900/20"
        >
          <header className="flex items-center justify-between bg-ink px-4 py-3 text-paper">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-brass text-ink shadow-inner"><Bot size={21} /></span>
              <div>
                <p className="font-medium">Akademix Assistant</p>
                <p className="text-xs text-paper/80">Here to help you find your way</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={resetChat} aria-label="Start a new chat" title="Start a new chat" className="rounded-lg p-2 text-paper/75 hover:bg-white/10 hover:text-white">
                <RotateCcw size={16} />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-paper/75 hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </header>

          <div ref={transcriptRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto bg-stone-50/80 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.from === 'user' ? 'items-end' : 'items-start'}`}>
                {message.from === 'assistant' && (
                  <span aria-hidden="true" className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-brass/15 text-brass-dark ring-1 ring-brass/20">
                    <Bot size={15} />
                  </span>
                )}
                <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === 'user' ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md border border-stone-200 bg-white text-ink'}`}>
                  {message.text}
                </p>
                {message.to && (
                  <Link to={message.to} onClick={() => setOpen(false)} className="mt-1.5 px-2 text-sm font-medium text-brass-dark underline-offset-2 hover:underline">
                    {message.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-stone-100 bg-white px-3 py-3">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-slate hover:border-brass hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass">
                {suggestion}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="flex items-center gap-2 border-t border-stone-200 bg-white p-3">
            <label className="sr-only" htmlFor="help-chat-question">Ask Akademix Assistant</label>
            <input id="help-chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." className="h-10 min-w-0 flex-1 rounded-xl border border-stone-200 px-3 text-sm text-ink outline-none placeholder:text-slate-light focus:border-brass" />
            <button type="submit" aria-label="Send message" disabled={!question.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close help chat' : 'Open help chat'} aria-expanded={open} className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-xl shadow-slate-900/25 transition-transform hover:scale-105 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass">
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>
    </div>
  )
}
