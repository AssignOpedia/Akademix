/**
 * Service Enquiry API Layer
 * 
 * Target Endpoint: POST /api/career-guidance/enquiry
 * Note: Clearly marked placeholder endpoint awaiting backend implementation.
 * 
 * Expected Backend Contract:
 * - Method: POST
 * - Endpoint: /api/career-guidance/enquiry
 * - Headers:
 *     Content-Type: application/json
 *     Authorization: Bearer <authToken> (if user logged in)
 *     X-User-Id: <userId> (if user logged in)
 * - Payload Body:
 *     {
 *       serviceSlug: string,
 *       serviceTitle: string,
 *       commonFields: {
 *         fullName: string,
 *         email: string,
 *         phone: string
 *       },
 *       serviceSpecificAnswers: { [key: string]: any },
 *       additionalNotes?: string,
 *       userId?: string | null,
 *       authToken?: string | null,
 *       timestamp: string (ISO 8601)
 *     }
 * - Response Expected:
 *     200/201 JSON: { success: true, enquiryId?: string, message?: string }
 */

export const ENQUIRY_API_ENDPOINT = '/api/career-guidance/enquiry'

const LOCAL_STORAGE_KEY = 'akademix-inquiries'

export async function submitServiceEnquiry(payload) {
  // 1. Maintain client-side persistence for profile activity history and demo review
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const localRecord = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      type: 'service-enquiry',
      serviceSlug: payload.serviceSlug,
      subject: payload.serviceTitle,
      name: payload.commonFields?.fullName || '',
      email: payload.commonFields?.email || '',
      phone: payload.commonFields?.phone || '',
      submittedAt: payload.timestamp,
      ...payload,
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, localRecord]))
  } catch (storageError) {
    console.warn('[EnquiryService] LocalStorage persistence warning:', storageError)
  }

  // 2. Perform network POST request to designated backend endpoint
  const headers = {
    'Content-Type': 'application/json',
  }

  if (payload.userId) {
    headers['X-User-Id'] = payload.userId
  }
  if (payload.authToken) {
    headers['Authorization'] = `Bearer ${payload.authToken}`
  }

  const response = await fetch(ENQUIRY_API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = `Backend endpoint ${ENQUIRY_API_ENDPOINT} responded with status ${response.status} (${response.statusText})`
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

  return response.json()
}

