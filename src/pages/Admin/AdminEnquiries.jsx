import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { serviceConfigs } from '../../data/academicServices'

const SESSION_KEY = 'akademix-auth-session'

export default function AdminEnquiries() {
  const navigate = useNavigate()

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })

  // Tabs
  const [activeTab, setActiveTab] = useState('enquiries') // 'enquiries' | 'students'

  // Enquiries list state
  const [enquiries, setEnquiries] = useState([])
  const [enquiriesLoading, setEnquiriesLoading] = useState(true)
  const [enquiriesError, setEnquiriesError] = useState('')

  // Students list state
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')

  // Filters & Search
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Interactive row expand
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // Route protection: ensure user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [currentUser, navigate])

  // Fetch enquiries
  const fetchEnquiries = async () => {
    if (!currentUser?.token) return
    setEnquiriesLoading(true)
    setEnquiriesError('')

    try {
      const params = new URLSearchParams()
      if (serviceFilter !== 'all') params.append('service', serviceFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized: Admin access required.')
        }
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Failed to fetch enquiries (HTTP ${res.status})`)
      }

      const data = await res.json()
      setEnquiries(data.enquiries || [])
    } catch (err) {
      setEnquiriesError(err.message || 'Error loading enquiries.')
    } finally {
      setEnquiriesLoading(false)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    if (!currentUser?.token) return
    setStudentsLoading(true)
    setStudentsError('')

    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Failed to fetch students (HTTP ${res.status})`)
      }

      const data = await res.json()
      setStudents(data.students || [])
    } catch (err) {
      setStudentsError(err.message || 'Error loading students.')
    } finally {
      setStudentsLoading(false)
    }
  }

  // Trigger loads on filter/tab changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (activeTab === 'enquiries') {
        fetchEnquiries()
      } else {
        fetchStudents()
      }
    }
  }, [activeTab, serviceFilter, statusFilter, currentUser])

  // Update enquiry status
  const handleStatusChange = async (enquiryId, newStatus) => {
    if (!currentUser?.token) return
    setUpdatingStatusId(enquiryId)

    try {
      const res = await fetch(`/api/admin/enquiries?id=${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || 'Failed to update status.')
      }

      // Optimistically update local state
      setEnquiries((prev) =>
        prev.map((item) => (item._id === enquiryId ? { ...item, status: newStatus } : item))
      )
    } catch (err) {
      alert(`Could not update status: ${err.message}`)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const downloadAttachment = async (item) => {
    try {
      const response = await fetch(`/api/admin/attachment?id=${encodeURIComponent(item._id)}`, {
        headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Download failed.')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = item.attachment?.filename || 'enquiry-attachment'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(error.message || 'The attached document could not be downloaded.')
    }
  }

  // Download CSV export with Bearer token
  const handleExportCSV = async () => {
    if (!currentUser?.token) return
    setIsExporting(true)

    try {
      const params = new URLSearchParams()
      if (serviceFilter !== 'all') params.append('service', serviceFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/admin/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      if (!res.ok) {
        throw new Error(`Export failed with HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `akademix-leads-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      alert(`Export error: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  // If not admin, render restricted notice (backup to navigation effect)
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container-content py-20 text-center">
        <div className="card mx-auto max-w-md p-8">
          <ShieldAlert size={48} className="mx-auto text-amber-600 mb-4" />
          <h1 className="font-display text-2xl font-semibold text-ink">Admin Access Required</h1>
          <p className="mt-2 text-sm text-slate">
            You must be logged in as an administrator to access the enquiry dashboard.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-content py-12 sm:py-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-1">Administrative Leads Console</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'enquiries' && (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink-light disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Exporting CSV...
                </>
              ) : (
                <>
                  <Download size={16} /> Download CSV Leads
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={activeTab === 'enquiries' ? fetchEnquiries : fetchStudents}
            className="rounded-full border border-line bg-white/80 p-2.5 text-slate hover:text-ink hover:border-brass transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px cursor-pointer ${
            activeTab === 'enquiries'
              ? 'border-brass text-ink'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <FileSpreadsheet size={18} /> Service Enquiries
          <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-xs text-brass-dark font-medium">
            {enquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px cursor-pointer ${
            activeTab === 'students'
              ? 'border-brass text-ink'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <Users size={18} /> Registered Students
          <span className="rounded-full bg-stone px-2 py-0.5 text-xs text-slate font-medium">
            {students.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="card p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  activeTab === 'enquiries' ? fetchEnquiries() : fetchStudents()
                }
              }}
              placeholder={
                activeTab === 'enquiries'
                  ? 'Search by name, email, or phone...'
                  : 'Search by student name, college, email...'
              }
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-ink outline-none focus:border-brass focus:ring-2 focus:ring-brass/20"
            />
          </div>

          {/* Service filter (enquiries tab only) */}
          {activeTab === 'enquiries' && (
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-brass cursor-pointer"
            >
              <option value="all">All Services</option>
              {Object.values(serviceConfigs).map((cfg) => (
                <option key={cfg.slug} value={cfg.slug}>
                  {cfg.title}
                </option>
              ))}
            </select>
          )}

          {/* Status filter (enquiries tab only) */}
          {activeTab === 'enquiries' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-brass cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          )}

          <button
            type="button"
            onClick={activeTab === 'enquiries' ? fetchEnquiries : fetchStudents}
            className="btn-secondary h-11 px-5"
          >
            Apply Search
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ENQUIRIES TABLE */}
      {/* ============================================================== */}
      {activeTab === 'enquiries' && (
        <div>
          {enquiriesError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3"
            >
              <AlertCircle size={20} className="shrink-0 text-red-600" />
              <span>{enquiriesError}</span>
            </div>
          )}

          {enquiriesLoading ? (
            <div className="card p-16 text-center">
              <Loader2 size={36} className="mx-auto text-brass animate-spin mb-3" />
              <p className="text-sm font-medium text-slate">Loading lead records...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="card p-16 text-center">
              <Inbox size={48} className="mx-auto text-slate/50 mb-3" />
              <h2 className="font-display text-xl font-semibold text-ink">No Enquiries Found</h2>
              <p className="mt-1 text-sm text-slate">
                No leads match the selected filters or search query.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-800 border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-stone/40 text-xs font-semibold uppercase tracking-wider text-slate">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {enquiries.map((item) => {
                      const isExpanded = expandedRowId === item._id
                      const isUpdating = updatingStatusId === item._id

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-amber-50/30 transition-colors group"
                        >
                          {/* Date */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-slate">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>

                          {/* Service */}
                          <td className="py-4 px-4 font-medium text-ink whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-2.5 py-1 text-xs font-semibold text-slate-800">
                              {item.serviceTitle || item.serviceSlug}
                            </span>
                          </td>

                          {/* Applicant Name & User Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-semibold text-ink">{item.name}</div>
                            {item.user && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                                <GraduationCap size={12} /> Registered Student
                              </span>
                            )}
                          </td>

                          {/* Email & Phone */}
                          <td className="py-4 px-4 text-xs whitespace-nowrap space-y-0.5">
                            <div>
                              <a
                                href={`mailto:${item.email}`}
                                className="text-brass-dark hover:underline"
                              >
                                {item.email}
                              </a>
                            </div>
                            <div className="text-slate">
                              <a href={`tel:${item.phone}`} className="hover:underline">
                                {item.phone}
                              </a>
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <select
                                value={item.status}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition-colors cursor-pointer ${
                                  item.status === 'new'
                                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                                    : item.status === 'contacted'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                    : 'border-slate-300 bg-slate-100 text-slate-700'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="closed">Closed</option>
                              </select>
                              {isUpdating && <Loader2 size={14} className="animate-spin text-slate" />}
                            </div>
                          </td>

                          {/* Expand Details Toggle */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setExpandedRowId(isExpanded ? null : item._id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brass-dark hover:text-ink cursor-pointer"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <>
                                  Hide <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  View answers <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expanded Answers Card Modal/Drawer view */}
          {expandedRowId && (
            <div className="mt-6 card p-6 sm:p-8 bg-paper border-brass/40 shadow-xl">
              {(() => {
                const item = enquiries.find((e) => e._id === expandedRowId)
                if (!item) return null

                return (
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                      <div>
                        <p className="eyebrow">Detailed Lead Responses</p>
                        <h2 className="font-display text-2xl font-semibold text-ink">
                          {item.name} — {item.serviceTitle}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedRowId(null)}
                        className="btn-secondary text-xs h-9 px-4"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                      <div className="rounded-xl border border-line bg-white/70 p-3">
                        <span className="text-xs text-slate block font-medium">Applicant</span>
                        <span className="font-semibold text-ink">{item.name}</span>
                      </div>
                      <div className="rounded-xl border border-line bg-white/70 p-3">
                        <span className="text-xs text-slate block font-medium">Email</span>
                        <span className="font-semibold text-ink">{item.email}</span>
                      </div>
                      <div className="rounded-xl border border-line bg-white/70 p-3">
                        <span className="text-xs text-slate block font-medium">Phone</span>
                        <span className="font-semibold text-ink">{item.phone}</span>
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brass-dark mb-3">
                      Service-Specific Answers
                    </h3>
                    {item.answers && Object.keys(item.answers).length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {Object.entries(item.answers).map(([key, val]) => (
                          <div key={key} className="rounded-xl border border-line bg-white/90 p-4">
                            <span className="text-xs text-slate block font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-sm font-semibold text-ink whitespace-pre-wrap">
                              {Array.isArray(val) ? val.join(', ') : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate mb-6">No specific answers provided.</p>
                    )}

                    {(item.attachment?.filename || item.attachment?.url || item.cvUrl) && (
                      <div className="rounded-xl border border-line bg-amber-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-slate block">Attached document</span>
                          <span className="font-semibold text-ink">{item.attachment?.filename || 'Attached CV'}</span>
                          {item.attachment?.size && <span className="ml-2 text-xs text-slate">({(item.attachment.size / 1024 / 1024).toFixed(2)} MB)</span>}
                        </div>
                        {(item.attachment?.url || item.cvUrl) ? (
                          <a
                            href={item.attachment?.url || item.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs h-9 px-4"
                          >
                            <Download size={15} /> Open file
                          </a>
                        ) : (
                          <button type="button" onClick={() => downloadAttachment(item)} className="btn-secondary text-xs h-9 px-4">
                            <Download size={15} /> Download file
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REGISTERED STUDENTS TABLE */}
      {/* ============================================================== */}
      {activeTab === 'students' && (
        <div>
          {studentsError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3"
            >
              <AlertCircle size={20} className="shrink-0 text-red-600" />
              <span>{studentsError}</span>
            </div>
          )}

          {studentsLoading ? (
            <div className="card p-16 text-center">
              <Loader2 size={36} className="mx-auto text-brass animate-spin mb-3" />
              <p className="text-sm font-medium text-slate">Loading student directory...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="card p-16 text-center">
              <Users size={48} className="mx-auto text-slate/50 mb-3" />
              <h2 className="font-display text-xl font-semibold text-ink">No Students Found</h2>
              <p className="mt-1 text-sm text-slate">
                No student accounts have been registered yet or none match your search.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-800 border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-stone/40 text-xs font-semibold uppercase tracking-wider text-slate">
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">College</th>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-4 px-4 font-semibold text-ink whitespace-nowrap">
                          {student.name}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <a
                            href={`mailto:${student.email}`}
                            className="text-brass-dark hover:underline"
                          >
                            {student.email}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap text-slate">
                          {student.phone ? (
                            <a href={`tel:${student.phone}`} className="hover:underline">
                              {student.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap text-slate">
                          {student.college || '—'}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap text-slate">
                          {student.course || '—'}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap text-slate">
                          {student.year || '—'}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap text-slate text-right">
                          {student.createdAt
                            ? new Date(student.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
