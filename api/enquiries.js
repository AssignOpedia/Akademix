import { connectDB } from './_lib/db.js'
import { Enquiry } from './_lib/models/Enquiry.js'
import { User } from './_lib/models/User.js'
import { verifyToken } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed. Only POST is supported.`,
    })
  }

  try {
    await connectDB()

    const body = req.body || {}

    // Support both structured frontend payload (commonFields) and direct field payloads
    const common = body.commonFields || {}
    let name = (common.fullName || common.name || body.name || '').toString().trim()
    let email = (common.email || body.email || '').toString().trim().toLowerCase()
    let phone = (common.phone || body.phone || '').toString().trim()
    const serviceSlug = (body.serviceSlug || '').toString().trim()
    const serviceTitle = (body.serviceTitle || '').toString().trim()
    const answers = body.serviceSpecificAnswers || body.answers || {}

    if (body.additionalNotes && typeof body.additionalNotes === 'string') {
      answers.additionalNotes = body.additionalNotes.trim()
    }

    let cvUrl = body.cvUrl || answers.existingCv || null
    if (typeof cvUrl !== 'string') {
      cvUrl = null
    }

    let userId = null

    // Check for authenticated user token
    const tokenPayload = verifyToken(req)
    if (tokenPayload && tokenPayload.userId) {
      try {
        const verifiedUser = await User.findById(tokenPayload.userId)
        if (verifiedUser) {
          userId = verifiedUser._id
          // Server-side authoritative user info
          name = verifiedUser.name
          email = verifiedUser.email.toLowerCase()
          if (verifiedUser.phone) {
            phone = verifiedUser.phone
          }
        }
      } catch (err) {
        console.error('Error fetching authenticated user for enquiry:', err)
      }
    }

    // Input Validation
    if (!serviceSlug) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: serviceSlug is required.',
      })
    }

    if (!serviceTitle) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: serviceTitle is required.',
      })
    }

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: A valid full name is required.',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: A valid email address is required.',
      })
    }

    const digitsOnly = phone.replace(/\D/g, '')
    if (!phone || digitsOnly.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: A valid 10-digit phone number is required.',
      })
    }

    // Create enquiry
    const enquiry = await Enquiry.create({
      serviceSlug,
      serviceTitle,
      user: userId,
      name,
      email,
      phone,
      answers,
      cvUrl,
      status: 'new',
    })

    return res.status(201).json({
      success: true,
      id: enquiry._id,
      message: 'Enquiry submitted successfully',
    })
  } catch (error) {
    // Log real error on server only, return generic message to client
    console.error('[API /api/enquiries] Error creating enquiry:', error)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while processing your enquiry. Please try again later.',
    })
  }
}

