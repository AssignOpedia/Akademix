
import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { v2 as cloudinary } from 'cloudinary'

import { connectDB } from './_lib/db.js'
import Enquiry from './_lib/models/Enquiry.js'
import { verifyToken } from './_lib/auth.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
})

const MAX_FILE_SIZE = 3 * 1024 * 1024
const CLOUDINARY_ENV_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

const ALLOWED_TYPES = {
  '.pdf': ['application/pdf', 'application/octet-stream'],
  '.doc': [
    'application/msword',
    'application/octet-stream',
  ],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
}

function uploadToCloudinary(buffer, filename) {
  const extension = extname(filename).toLowerCase()
  const safeName = basename(filename, extension)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80) || 'document'

  const publicId = `enquiries/${safeName}-${randomUUID()}${extension}`

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result?.secure_url) {
          return reject(new Error('Cloudinary did not return a file URL.'))
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    stream.end(buffer)
  })
}

function getAttachmentBuffer(rawAttachment) {
  if (!rawAttachment) return null

  const filename =
    typeof rawAttachment.filename === 'string'
      ? rawAttachment.filename.trim()
      : ''

  const contentType =
    typeof rawAttachment.contentType === 'string'
      ? rawAttachment.contentType.trim().toLowerCase()
      : ''

  const encodedData =
    typeof rawAttachment.data === 'string'
      ? rawAttachment.data
      : ''

  const extension = extname(filename).toLowerCase()

  if (
    !filename ||
    filename.length > 255 ||
    !ALLOWED_TYPES[extension] ||
    !ALLOWED_TYPES[extension].includes(contentType) ||
    !encodedData
  ) {
    throw new Error('Attach a valid PDF, DOC, or DOCX document.')
  }

  if (
    typeof rawAttachment.size !== 'number' ||
    !Number.isSafeInteger(rawAttachment.size) ||
    rawAttachment.size <= 0 ||
    rawAttachment.size > MAX_FILE_SIZE
  ) {
    throw new Error('The document must be 3 MB or smaller.')
  }

  // Check Base64 syntax and decode the file.
  if (
    encodedData.length > Math.ceil(MAX_FILE_SIZE * 4 / 3) + 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encodedData) ||
    encodedData.length % 4 !== 0
  ) {
    throw new Error('The uploaded document data is invalid.')
  }

  const buffer = Buffer.from(encodedData, 'base64')

  if (
    buffer.length !== rawAttachment.size ||
    buffer.length === 0 ||
    buffer.length > MAX_FILE_SIZE
  ) {
    throw new Error('The uploaded document could not be verified.')
  }

  return {
    filename,
    contentType,
    size: buffer.length,
    buffer,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    })
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: MONGODB_URI is missing.',
    })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {}

    const {
      serviceSlug,
      serviceTitle,
      commonFields = {},
      attachment: rawAttachment,
    } = body

    const name = String(
      commonFields.fullName || body.fullName || body.name || ''
    ).trim()

    const email = String(
      commonFields.email || body.email || ''
    ).trim().toLowerCase()

    const phone = String(
      commonFields.phone || body.phone || ''
    ).trim()

    if (!serviceSlug || !serviceTitle) {
      return res.status(400).json({
        success: false,
        message: 'Service information is required.',
      })
    }

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required.',
      })
    }

    // Validate and decode the optional file.
    let file = null

    try {
      file = getAttachmentBuffer(rawAttachment)
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    const missingCloudinaryKeys = CLOUDINARY_ENV_KEYS.filter(
      (key) => !process.env[key]?.trim()
    )

    if (file && missingCloudinaryKeys.length > 0) {
      return res.status(500).json({
        success: false,
        message: `Server configuration error: missing ${missingCloudinaryKeys.join(', ')}.`,
      })
    }

    // Connect before uploading so database configuration errors
    // are caught before creating a Cloudinary asset.
    await connectDB()

    // Upload the actual document to Cloudinary.
    let uploadedAttachment = null

    if (file) {
      const uploaded = await uploadToCloudinary(
        file.buffer,
        file.filename
      )

      uploadedAttachment = {
        filename: file.filename,
        contentType: file.contentType,
        size: file.size,
        url: uploaded.url,
        publicId: uploaded.publicId,
      }
    }

    let userId = null
    const authHeader =
      req.headers.authorization ||
      (body.authToken ? `Bearer ${body.authToken}` : null)

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.slice(7))
        userId = decoded?.id || decoded?.userId || null
      } catch {
        // Invalid optional token: retain a guest enquiry.
      }
    }

    // Do not trust an arbitrary client-supplied user ID.
    // Only use the ID from a verified token.

    const submittedAtIST = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: true,
    }).format(new Date())

    const rawAnswers =
      body.serviceSpecificAnswers || body.answers || {}

    const cleanAnswers = { ...rawAnswers }

    for (const key of [
      'existingCv',
      'cvFile',
      'cv',
      'resume',
      'file',
    ]) {
      delete cleanAnswers[key]
    }

    const enquiry = await Enquiry.create({
      serviceSlug,
      serviceTitle,
      user: userId,
      name,
      email,
      phone,
      answers: cleanAnswers,
      cvUrl: uploadedAttachment?.url || null,
      attachment: uploadedAttachment,
      submittedAtIST,
      status: 'new',
    })

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully.',
      data: {
        id: enquiry._id,
        serviceSlug: enquiry.serviceSlug,
        serviceTitle: enquiry.serviceTitle,
        cvUrl: enquiry.cvUrl,
        attachment: enquiry.attachment,
        submittedAtIST: enquiry.submittedAtIST,
        createdAt: enquiry.createdAt,
      },
    })
  } catch (error) {
    console.error('[API /api/enquiries] Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to submit the enquiry. Please try again.',
    })
  }
}
