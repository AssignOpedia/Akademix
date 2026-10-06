import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, RotateCcw, Send, X } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'
import { allSubjects } from '../../data/subjects'
import assistantAvatar from './image.png'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const suggestions = [
  'How do I plan an assignment?',
  'How should I start learning Python?',
  'Help me choose a subject',
  'What should I compare in a college?',
]

const welcomeMessage = {
  id: 0,
  from: 'assistant',
  text: 'Welcome to Akademix! What can I help you find today?',
}

function getReply(message) {
  const text = message.trim().toLowerCase()
  const isAssignment = /assignment|homework|project|coursework|report|lab work/.test(text)

  if (/hello|hi\b|hey\b|good morning|good afternoon/.test(text)) {
    return { text: 'Hi! Tell me what you are studying or trying to decide. I can help you plan an assignment, understand a topic, compare study options, or find relevant guidance.' }
  }
  if (/power\s?bi|business intelligence/.test(text)) {
    return { text: `${isAssignment ? 'For a Power BI assignment' : 'To get started with Power BI'}, first clarify the question your report needs to answer. Import and clean the data, check relationships between tables, then choose visuals that make the comparison easy to understand. Add measures only when they answer a clear question, and finish with a short explanation of what the report shows.`, to: '/assignment-guidance?q=Power%20BI', label: 'Power BI assignment guidance' }
  }
  if (/sql|database query/.test(text)) {
    return { text: `${isAssignment ? 'For an SQL task' : 'When learning SQL'}, start by identifying the table and the result you need. Build the query in stages: SELECT the fields, choose the source with FROM, filter with WHERE, then add JOIN or GROUP BY only if required. Test each step and check whether duplicate or missing rows affect the result.`, to: '/assignment-guidance?q=SQL', label: 'SQL assignment guidance' }
  }
  if (/access|ms access|microsoft access/.test(text)) {
    return { text: 'For Microsoft Access work, define the entities first, give each table a primary key, and connect related tables with the correct foreign keys. Then test queries on a small set of records before building forms or reports. Check that the relationships prevent duplicate or inconsistent data.', to: '/assignment-guidance?q=Microsoft%20Access', label: 'Access assignment guidance' }
  }
  if (/network|router|tcp|ip address|subnet|dns/.test(text)) {
    return { text: `${isAssignment ? 'For a networking assignment' : 'To understand a network problem'}, trace the path from the device to the destination: addressing and subnet, local network, router, DNS if a name is involved, then the transport or application protocol. Write down what each layer is expected to do and test one layer at a time.`, to: '/assignment-guidance?q=networking', label: 'Networking assignment guidance' }
  }
  if (/data analys|data set|dataset|statistics|powerbi/.test(text)) {
    return { text: `${isAssignment ? 'For a data analysis assignment' : 'A useful data analysis workflow'}, start with a specific question. Inspect and clean the data, document missing values or assumptions, summarize the variables, then choose a chart or method that fits the question. Explain the result in context instead of listing numbers alone.`, to: '/assignment-guidance?q=data%20analysis', label: 'Data analysis guidance' }
  }
  if (/python|coding|programming|debug|code/.test(text)) {
    return { text: `${isAssignment ? 'For a programming assignment' : 'If you are starting with Python'}, restate the task as inputs, steps, and expected output. Write a small version first, test normal and edge cases, then explain what each part does. If you share the prompt or error message, I can help break down the next step.`, to: '/assignment-guidance?q=Python', label: 'Programming assignment guidance' }
  }
  if (/\br\b|r studio|tidyverse/.test(text)) {
    return { text: `${isAssignment ? 'For an R assignment' : 'A good way to begin in R'}, import the data, inspect its structure, check missing values, and make one transformation at a time. Summarize the result with a table or plot, then explain what it means for the original question. Keep the code reproducible so someone else can follow it.`, to: '/assignment-guidance?q=R', label: 'R assignment guidance' }
  }
  if (/assignment|homework|coursework|project|essay|research|report|lab work/.test(text)) {
    return { text: 'Start by turning the brief into a checklist: what you must answer, what evidence or calculations are needed, the format, and the deadline. Make a short outline, work through one section at a time, and leave time to check the rubric and citations. Tell me your subject and task if you want help planning the steps.', to: '/assignment-guidance', label: 'Explore assignment guidance' }
  }
  if (/professor|expert|tutor|teacher|faculty/.test(text)) {
    return { text: 'When comparing professors, look for a close subject match, relevant expertise, the kind of guidance you need, and language or location preferences. A profile is a starting point; prepare a few questions about your goals before reaching out.', to: '/professors', label: 'Browse professor profiles' }
  }
  if (/subject|what should i study|choose.*study|interested in/.test(text)) {
    return { text: 'Compare subjects by the questions you enjoy, the skills they use, and the kind of work you want to do. Try one introductory topic or small project before committing, then compare related courses and career paths.', to: '/subjects', label: 'Explore subjects' }
  }
  if (/universit|college|admission|school/.test(text)) {
    return { text: 'Compare colleges by the exact program and curriculum, entry requirements, total cost, location, learning support, and opportunities that matter to you. Verify deadlines and requirements with the institution because they can change.', to: '/universities', label: 'Explore university profiles' }
  }
  if (/career|job|profession|pathway/.test(text)) {
    return { text: 'Start with subjects and tasks you enjoy, then look at roles that use those skills. Compare the usual study routes and practical skills for each role; career paths are options to explore, not guarantees.', to: '/career-guidance', label: 'Build a study pathway' }
  }
  if (/mentor|mentoring/.test(text)) {
    return { text: 'A student mentor can help you organize goals, compare study options, and prepare questions for professors. Think about what decision you need help with before starting a conversation.', to: '/mentoring', label: 'Meet the mentors' }
  }
  if (/course|class|program|programme/.test(text)) {
    return { text: 'Choose a course by checking its subject, level, format, lesson count, and duration against what you want to learn. Open a course profile to review those details.', to: '/courses', label: 'Browse courses' }
  }
  if (/countr|abroad|international|global/.test(text)) {
    return { text: 'When comparing study destinations, consider language, entry requirements, cost of living, visa rules, and whether the program fits your goals. Check current requirements with official institutions and government sources.', to: '/countries', label: 'Explore countries' }
  }
  if (/study plan|study schedule|exam|revision|procrastinat/.test(text)) {
    return { text: 'Make a realistic plan by listing topics, ranking them by difficulty and deadline, and scheduling short focused sessions. Add practice questions and a quick review at the end of each session. Leave buffer time for topics that take longer than expected.' }
  }
  if (/about|contact|support|help/.test(text)) {
    return { text: 'Akademix brings subject exploration, professor and university profiles, student mentoring, assignment guidance, and career planning into one portal. What are you trying to work on?', to: '/about', label: 'About Akademix' }
  }

  const matchedSubject = allSubjects.find((subject) => text.includes(subject.name.toLowerCase()))
  if (matchedSubject) {
    return { text: `For ${matchedSubject.name}, start with the core ideas, then apply them to a small example or practice question. Write down what you understand and where you get stuck; that makes it easier to choose the right next resource or ask a focused question.`, to: `/subjects/${matchedSubject.slug}`, label: `Explore ${matchedSubject.name}` }
  }

  return { text: 'I can help with study planning, subject questions, assignment steps, college comparisons, and finding guidance. Share the subject and what you are trying to do, and I’ll give you a more specific starting point.' }
}

async function getAiReply(message) {
  if (!API_KEY) throw new Error('Gemini API key is not configured')

  const ai = new GoogleGenAI({ apiKey: API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: message,
    config: {
      systemInstruction: "You are Akademix Assistant, a friendly academic guidance helper. Answer the student message directly in clear, concise language. Help with learning, assignments, subject and university exploration, and study planning. For current admissions, visa, or scholarship facts, tell the student to verify details with official sources. Do not claim that a request has been sent to staff or a human mentor.",
      maxOutputTokens: 350,
    },
  })

  const text = response.text?.trim()
  if (!text) throw new Error('The AI returned an empty response')
  return text
}

export default function HelpChat() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([welcomeMessage])
  const [isReplying, setIsReplying] = useState(false)
  const transcriptRef = useRef(null)
  const nextId = useRef(1)

  useEffect(() => {
    if (open && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, open])

  const sendMessage = async (value = question) => {
    const content = value.trim()
    if (!content || isReplying) return

    const assistantId = nextId.current++
    setMessages((current) => [
      ...current,
      { id: nextId.current++, from: 'user', text: content },
      { id: assistantId, from: 'assistant', text: 'Thinking...', pending: true },
    ])
    setQuestion('')
    setIsReplying(true)

    try {
      const reply = await getAiReply(content)
      setMessages((current) => current.map((message) => (
        message.id === assistantId ? { ...message, text: reply, pending: false } : message
      )))
    } catch {
      const fallback = getReply(content)
      setMessages((current) => current.map((message) => (
        message.id === assistantId ? { ...message, ...fallback, pending: false } : message
      )))
    } finally {
      setIsReplying(false)
    }
  }

  const resetChat = () => {
    setMessages([welcomeMessage])
    setQuestion('')
    setIsReplying(false)
  }

  return (
    <div className="fixed bottom-28 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-32 sm:right-6">
      {open && (
        <section
          aria-label="Akademix help chat"
          className="flex h-[min(32rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-slate-900/20"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-indigo-700 to-violet-700 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <img src={assistantAvatar} alt="" className="h-10 w-10 rounded-full border-2 border-white/30 object-cover shadow-inner" />
              <div>
                <p className="font-medium">Akademix Assistant</p>
                <p className="text-xs text-white/80">Here to help you find your way</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={resetChat} aria-label="Start a new chat" title="Start a new chat" className="rounded-lg p-2 text-white/75 hover:bg-white/10 hover:text-white">
                <RotateCcw size={16} />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-white/75 hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </header>

          <div ref={transcriptRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto bg-stone-50/80 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.from === 'user' ? 'items-end' : 'items-start'}`}>
                {message.from === 'assistant' && (
                  <img src={assistantAvatar} alt="" className="mb-1 h-7 w-7 rounded-full object-cover ring-1 ring-indigo-200" />
                )}
                <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === 'user' ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md border border-stone-200 bg-white text-ink'} ${message.pending ? 'animate-pulse text-slate' : ''}`}>
                  {message.text}
                </p>
                {message.to && (
                  <Link to={message.to} onClick={() => setOpen(false)} className="mt-1.5 px-2 text-sm font-medium text-indigo-700 underline-offset-2 hover:underline">
                    {message.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-stone-100 bg-white px-3 py-3">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" disabled={isReplying} onClick={() => sendMessage(suggestion)} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-slate hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
                {suggestion}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="flex items-center gap-2 border-t border-stone-200 bg-white p-3">
            <label className="sr-only" htmlFor="help-chat-question">Ask Akademix Assistant</label>
            <input id="help-chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." className="h-10 min-w-0 flex-1 rounded-xl border border-stone-200 px-3 text-sm text-ink outline-none placeholder:text-slate-light focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            <button type="submit" aria-label="Send message" disabled={!question.trim() || isReplying} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close help chat' : 'Open help chat'} aria-expanded={open} className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-900/25 transition-transform hover:scale-105 hover:from-indigo-700 hover:to-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
        {open ? <X size={22} /> : <img src={assistantAvatar} alt="" className="h-14 w-14 rounded-full object-cover" />}
      </button>
    </div>
  )
}
