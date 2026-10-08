import { Parser } from 'json2csv'
import { connectDB } from '../_lib/db.js'
import { Enquiry } from '../_lib/models/Enquiry.js'
import { requireAdmin } from '../_lib/auth.js'

function formatAnswers(answers) {
  if (!answers || typeof answers !== 'object') return ''
  return Object.entries(answers)
    .filter(([_, val]) => val !== null && val !== undefined && val !== '')
    .map(([key, val]) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
      const formattedVal = Array.isArray(val)
        ? val.join(', ')
        : typeof val === 'object'
        ? JSON.stringify(val)
        : String(val).trim()
      return `${label}: ${formattedVal}`
    })
    .join(' | ')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed. Only GET is supported.`,
    })
  }

  // Enforce admin authentication
  const admin = requireAdmin(req, res)
  if (!admin) return

  try {
    await connectDB()

    const { service, status } = req.query || {}
    const filter = {}

    if (service && service !== 'all') {
      filter.serviceSlug = service
    }
    if (status && status !== 'all') {
      filter.status = status
    }

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    const fields = ['date', 'service', 'name', 'email', 'phone', 'status', 'details']

    const data = enquiries.map((item) => ({
      date: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '',
      service: item.serviceTitle || item.serviceSlug,
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      status: item.status || 'new',
      details: formatAnswers(item.answers),
    }))

    const parser = new Parser({ fields })
    const csv = parser.parse(data)

    // Set headers for file download with UTF-8 BOM so Excel displays correctly
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="akademix-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`
    )

    // Prepend UTF-8 BOM (\uFEFF)
    return res.status(200).send('\uFEFF' + csv)
  } catch (error) {
    console.error('[API /api/admin/export] Error exporting enquiries:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to export enquiries to CSV.',
    })
  }
}

