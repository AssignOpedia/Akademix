/**
 * Service Enquiry API Layer
 * Connected to Vercel Serverless Function: POST /api/enquiries
 */

export const ENQUIRY_API_ENDPOINT = '/api/enquiries'
const LOCAL_STORAGE_KEY = 'akademix-inquiries'

export async function submitServiceEnquiry(payload) {
  // Resolve auth token if user is signed in
  let token = payload.authToken
  if (!token) {
    try {
      const session = JSON.parse(localStorage.getItem('akademix-auth-session') || 'null')
      token = session?.token || null
    } catch {
      token = null
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else if (payload.userId) {
    headers['X-User-Id'] = payload.userId
  }

  // Real HTTP POST request to /api/enquiries
  const response = await fetch(ENQUIRY_API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = `Submission failed (${response.status} ${response.statusText})`
    try {
      const errorJson = await response.json()
      if (errorJson && errorJson.message) {
        errorMessage = errorJson.message
      }
    } catch {
      // response body was not JSON
    }
    throw new Error(errorMessage)
  }

  const result = await response.json()

  // Maintain client-side persistence for local profile activity history
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const localPayload = { ...payload }
    delete localPayload.authToken
    delete localPayload.attachment

    const localRecord = {
      id: result.data?.id || result.id || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`),
      type: 'service-enquiry',
      serviceSlug: payload.serviceSlug,
      subject: payload.serviceTitle,
      name: payload.commonFields?.fullName || '',
      email: payload.commonFields?.email || '',
      phone: payload.commonFields?.phone || '',
      submittedAt: payload.timestamp,
      ...localPayload,
      cvUrl: result.data?.cvUrl || null,
      attachment: result.data?.attachment || null,
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, localRecord]))
  } catch (storageError) {
    console.warn('[EnquiryService] LocalStorage persistence warning:', storageError)
  }

  return result
}
