export function showFormSubmissionAlert(formName, studentName, values = {}) {
  const details = Object.entries(values)
    .filter(([key, value]) => key.toLowerCase() !== 'email' && value != null && value !== '')
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
      const text = Array.isArray(value) ? value.join(', ') : String(value).trim()
      return text ? `${label}: ${text}` : ''
    })
    .filter(Boolean)
    .join(' | ')

  const greeting = studentName ? `Thank you, ${studentName}!` : 'Thank you!'
  const message = `${greeting} Your ${formName} form was submitted.${details ? ` Your responses: ${details}` : ''}`
  window.dispatchEvent(new CustomEvent('akademix-form-submitted', { detail: { message } }))
}
