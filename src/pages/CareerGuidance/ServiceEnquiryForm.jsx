import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  Send,
  Upload,
  User,
  X,
} from 'lucide-react'
import { serviceConfigs } from '../../data/academicServices'
import { submitServiceEnquiry } from '../../services/enquiryService'
import { showFormSubmissionAlert } from '../../utils/formSubmissionAlert'

const SESSION_KEY = 'akademix-auth-session'
const PROFILE_KEY = 'akademix-student-profile'

export default function ServiceEnquiryForm() {
  const { serviceSlug } = useParams()
  const config = serviceConfigs[serviceSlug]

  // Auth session tracking
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })

  // Form states
  const [formValues, setFormValues] = useState({})
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  // Sync auth state
  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'))
      } catch {
        setUser(null)
      }
    }
    window.addEventListener('akademix-auth-change', syncUser)
    window.addEventListener('storage', syncUser)
    return () => {
      window.removeEventListener('akademix-auth-change', syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])

  const userHasName = Boolean(user?.name && user.name.trim())
  const userHasEmail = Boolean(user?.email && user.email.trim())
  const userHasPhone = Boolean(user?.phone && user.phone.trim())

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    // Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setErrors((prev) => ({
        ...prev,
        existingCv: 'File size exceeds 5 MB. Please upload a smaller document.',
      }))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    // Validate extension
    const validExtensions = ['.pdf', '.doc', '.docx']
    const fileName = file.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext))
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        existingCv: 'Invalid file format. Please upload a PDF or DOC/DOCX document.',
      }))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    setErrors((prev) => ({ ...prev, existingCv: '' }))
    setSelectedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type,
    })
  }

  const removeFile = () => {
    setSelectedFile(null)
    setErrors((prev) => ({ ...prev, existingCv: '' }))
    const fileInput = document.getElementById('field-existingCv')
    if (fileInput) fileInput.value = ''
  }

  const validate = () => {
    const newErrors = {}

    // Common fields validation (for guest or missing profile field)
    if (!userHasName) {
      if (!formValues.fullName?.trim()) {
        newErrors.fullName = 'Full name is required'
      }
    }

    if (!userHasEmail) {
      const email = formValues.email?.trim() || ''
      if (!email) {
        newErrors.email = 'Email address is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please provide a valid email address'
      }
    }

    if (!userHasPhone) {
      const phone = formValues.phone?.trim() || ''
      const cleanedPhone = phone.replace(/[\s\-()]/g, '')
      if (!phone) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\+?[0-9]{10,14}$/.test(cleanedPhone) || cleanedPhone.replace(/^\+/, '').length < 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number'
      }
    }

    // Service-specific fields validation
    if (config?.fields) {
      config.fields.forEach((field) => {
        if (field.required) {
          const val = formValues[field.name]
          if (!val || (typeof val === 'string' && !val.trim())) {
            newErrors[field.name] = `${field.label} is required`
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    const commonFields = {
      fullName: userHasName ? user.name : formValues.fullName.trim(),
      email: userHasEmail ? user.email : formValues.email.trim(),
      phone: userHasPhone ? user.phone : formValues.phone.trim(),
    }

    const serviceSpecificAnswers = {}
    config.fields.forEach((field) => {
      if (field.type === 'file') {
        if (selectedFile) {
          serviceSpecificAnswers[field.name] = selectedFile.name
        }
      } else if (formValues[field.name] !== undefined) {
        serviceSpecificAnswers[field.name] = formValues[field.name]
      }
    })

    const payload = {
      serviceSlug: config.slug,
      serviceTitle: config.title,
      commonFields,
      serviceSpecificAnswers,
      additionalNotes: formValues.additionalNotes?.trim() || '',
      userId: user?.id || user?.email || null,
      authToken: user?.token || null,
      timestamp: new Date().toISOString(),
    }

    try {
      await submitServiceEnquiry(payload)

      // Optionally save missing phone back to user profile if user opted in
      if (!userHasPhone && savePhoneToProfile && user) {
        try {
          const updatedUser = { ...user, phone: commonFields.phone }
          localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
          localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedUser))
          setUser(updatedUser)
          window.dispatchEvent(new Event('akademix-auth-change'))
        } catch {
          // ignore profile update error
        }
      }

      // Trigger app-level toast alert
      showFormSubmissionAlert(
        `${config.title} enquiry`,
        commonFields.fullName,
        serviceSpecificAnswers
      )

      setSubmittedData(payload)
      setIsSubmitted(true)
      setFormValues({})
      setSelectedFile(null)
    } catch (err) {
      setSubmitError(
        err.message || 'We could not submit your enquiry at this time. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setSubmittedData(null)
    setFormValues({})
    setErrors({})
    setSelectedFile(null)
    setSubmitError('')
  }

  // Not Found view if invalid slug
  if (!config) {
    return (
      <div className="container-content py-16">
        <div className="card mx-auto max-w-xl p-8 text-center">
          <AlertCircle size={44} className="mx-auto text-amber-700" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Service Not Found
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            The requested career guidance service could not be located. Please choose from our available services under Full Academics Under One Roof.
          </p>
          <Link
            to="/career-guidance"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Career Guidance
          </Link>
        </div>
      </div>
    )
  }

  const ServiceIcon = config.icon

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="container-content py-16">
        <section
          role="status"
          aria-live="polite"
          className="card mx-auto max-w-2xl p-8 sm:p-10 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={36} />
          </div>

          <p className="eyebrow mt-5 mb-1">Enquiry Received</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
            Thanks! We&apos;ll contact you within 1-2 working days
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate">
            Your enquiry for <strong className="text-ink font-semibold">{config.title}</strong> has been successfully recorded. An academic specialist will review your details and reach out shortly.
          </p>

          {/* Submission summary snippet */}
          <div className="mt-8 rounded-2xl border border-line bg-stone/50 p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brass-dark mb-3">
              Submission Summary
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate block">Name</span>
                <span className="font-medium text-ink">{submittedData?.commonFields?.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-slate block">Email</span>
                <span className="font-medium text-ink">{submittedData?.commonFields?.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate block">Phone</span>
                <span className="font-medium text-ink">{submittedData?.commonFields?.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate block">Service</span>
                <span className="font-medium text-ink">{config.title}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/career-guidance" className="btn-primary">
              <ArrowLeft size={16} /> Back to Career Guidance
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              Submit another enquiry
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="container-content py-12 sm:py-16 max-w-4xl">
      {/* Navigation Breadcrumb / Back Link */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/career-guidance"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} /> Back to Career Guidance
        </Link>
      </nav>

      {/* Page Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70 text-brass-dark">
            <ServiceIcon size={24} />
          </div>
          <div>
            <p className="eyebrow">Service Enquiry</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
              {config.title}
            </h1>
          </div>
        </div>
        <p className="text-slate text-base sm:text-lg max-w-2xl leading-relaxed">
          {config.intro} Fill out the details below to request customized guidance.
        </p>
      </header>

      {/* Authenticated User Status Summary Card */}
      {user ? (
        <div className="mb-8 rounded-2xl border border-line bg-gradient-to-br from-white/95 via-stone/40 to-white/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brass/15 text-brass-dark font-display text-base font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brass-dark">
                  Submitting as
                </p>
                <p className="text-sm font-medium text-ink">
                  {user.name || 'Member'}{' '}
                  <span className="text-slate/50">·</span> {user.email}{' '}
                  {user.phone && (
                    <>
                      <span className="text-slate/50">·</span> {user.phone}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link
                to="/profile"
                className="font-medium text-brass-dark hover:underline"
              >
                Edit profile
              </Link>
              <span className="text-slate/40">·</span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(SESSION_KEY)
                  window.dispatchEvent(new Event('akademix-auth-change'))
                }}
                className="text-slate hover:text-ink cursor-pointer hover:underline"
              >
                Not you?
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Form Card */}
      <div className="card p-6 sm:p-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Section: Contact Information */}
          {(!userHasName || !userHasEmail || !userHasPhone) && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-1">
                Contact Information
              </h2>
              <p className="text-xs text-slate mb-4">
                We will use these details to contact you regarding your enquiry.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!userHasName && (
                  <div>
                    <label
                      htmlFor="field-fullName"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Full Name <span className="text-amber-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="field-fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={formValues.fullName || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm text-ink outline-none transition-colors ${
                        errors.fullName
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                      }`}
                    />
                    {errors.fullName && (
                      <p id="error-fullName" role="alert" className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                {!userHasEmail && (
                  <div>
                    <label
                      htmlFor="field-email"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Email Address <span className="text-amber-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="field-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formValues.email || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm text-ink outline-none transition-colors ${
                        errors.email
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                      }`}
                    />
                    {errors.email && (
                      <p id="error-email" role="alert" className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {!userHasPhone && (
                  <div className={!userHasName && !userHasEmail ? 'md:col-span-2' : ''}>
                    <label
                      htmlFor="field-phone"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Phone Number <span className="text-amber-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="field-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formValues.phone || ''}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'error-phone' : undefined}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm text-ink outline-none transition-colors ${
                        errors.phone
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                      }`}
                    />
                    {errors.phone && (
                      <p id="error-phone" role="alert" className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}

                    {user && (
                      <label className="mt-2.5 flex items-center gap-2 text-xs text-slate cursor-pointer">
                        <input
                          type="checkbox"
                          checked={savePhoneToProfile}
                          onChange={(e) => setSavePhoneToProfile(e.target.checked)}
                          className="rounded border-line text-brass focus:ring-brass"
                        />
                        Save this phone number to my profile for future requests
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Service Requirements */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-1">
              Service Requirements
            </h2>
            <p className="text-xs text-slate mb-4">
              Help us understand your exact requirements for {config.title}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map((field) => {
                const fieldId = `field-${field.name}`
                const isError = Boolean(errors[field.name])
                const containerClass = field.halfWidth ? 'md:col-span-1' : 'md:col-span-2'

                return (
                  <div key={field.name} className={containerClass}>
                    <label
                      htmlFor={fieldId}
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      {field.label}{' '}
                      {field.required && (
                        <span className="text-amber-700" aria-hidden="true">*</span>
                      )}
                    </label>

                    {/* SELECT input */}
                    {field.type === 'select' && (
                      <select
                        id={fieldId}
                        name={field.name}
                        value={formValues[field.name] || ''}
                        onChange={handleInputChange}
                        aria-invalid={isError}
                        aria-describedby={isError ? `error-${field.name}` : undefined}
                        className={`h-11 w-full rounded-xl border px-3.5 text-sm text-ink outline-none transition-colors cursor-pointer ${
                          isError
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                        }`}
                      >
                        <option value="">Select an option</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* TEXT, DATE, URL input */}
                    {['text', 'date', 'url'].includes(field.type) && (
                      <input
                        id={fieldId}
                        name={field.name}
                        type={field.type}
                        value={formValues[field.name] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        min={field.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
                        aria-invalid={isError}
                        aria-describedby={isError ? `error-${field.name}` : undefined}
                        className={`h-11 w-full rounded-xl border px-3.5 text-sm text-ink outline-none transition-colors ${
                          isError
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                        }`}
                      />
                    )}

                    {/* FILE input */}
                    {field.type === 'file' && (
                      <div>
                        {selectedFile ? (
                          <div className="flex items-center justify-between rounded-xl border border-line bg-stone/40 p-3">
                            <div className="flex items-center gap-2.5 truncate">
                              <FileCheck size={18} className="text-emerald-700 shrink-0" />
                              <div className="truncate text-xs">
                                <span className="font-medium text-ink block truncate">{selectedFile.name}</span>
                                <span className="text-slate">{selectedFile.size}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="rounded-lg p-1.5 text-slate hover:bg-stone hover:text-ink transition-colors"
                              aria-label="Remove attached file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor={fieldId}
                            className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center cursor-pointer transition-colors ${
                              isError
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-line hover:border-brass/70 bg-stone/20 hover:bg-stone/40'
                            }`}
                          >
                            <Upload size={20} className="text-slate mb-1" />
                            <span className="text-xs font-medium text-ink">
                              Click to choose a file
                            </span>
                            <span className="text-[11px] text-slate mt-0.5">
                              {field.helperText || 'PDF or DOC/DOCX, max 5 MB'}
                            </span>
                            <input
                              id={fieldId}
                              name={field.name}
                              type="file"
                              accept={field.accept}
                              onChange={handleFileChange}
                              className="sr-only"
                              aria-invalid={isError}
                              aria-describedby={isError ? `error-${field.name}` : undefined}
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* TEXTAREA input */}
                    {field.type === 'textarea' && (
                      <textarea
                        id={fieldId}
                        name={field.name}
                        rows={4}
                        value={formValues[field.name] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        aria-invalid={isError}
                        aria-describedby={isError ? `error-${field.name}` : undefined}
                        className={`w-full resize-y rounded-xl border p-3.5 text-sm text-ink outline-none transition-colors ${
                          isError
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-line bg-white focus:border-brass focus:ring-2 focus:ring-brass/20'
                        }`}
                      />
                    )}

                    {isError && (
                      <p id={`error-${field.name}`} role="alert" className="mt-1 text-xs text-red-600">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section: Additional Notes (Always Optional) */}
          <div>
            <label
              htmlFor="field-additionalNotes"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Additional Notes (Optional)
            </label>
            <textarea
              id="field-additionalNotes"
              name="additionalNotes"
              rows={3}
              value={formValues.additionalNotes || ''}
              onChange={handleInputChange}
              placeholder="Any specific instructions, current challenges, or scheduling preferences..."
              className="w-full resize-y rounded-xl border border-line bg-white p-3.5 text-sm text-ink outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
            />
          </div>

          {/* Submit Error Banner */}
          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-2.5"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Submission failed</p>
                <p className="mt-0.5 text-xs text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line/70">
            <Link
              to="/career-guidance"
              className="text-sm font-medium text-slate hover:text-ink transition-colors"
            >
              Cancel and return
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Enquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

