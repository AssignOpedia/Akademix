import { connectDB } from '../_lib/db.js'
import { Enquiry } from '../_lib/models/Enquiry.js'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  // Enforce admin authentication
  const admin = requireAdmin(req, res)
  if (!admin) return

  try {
    await connectDB()

    if (req.method === 'GET') {
      const { service, status, search } = req.query || {}

      const filter = {}

      if (service && service !== 'all') {
        filter.serviceSlug = service
      }

      if (status && status !== 'all') {
        filter.status = status
      }

      if (search && typeof search === 'string' && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i')
        filter.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { serviceTitle: searchRegex },
        ]
      }

      const enquiries = await Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'name email phone college course year')
        .lean()

      return res.status(200).json({
        success: true,
        count: enquiries.length,
        enquiries,
      })
    }

    if (req.method === 'PATCH') {
      const id = req.query.id || req.body?.id
      const newStatus = req.body?.status

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Enquiry ID is required to update status.',
        })
      }

      const validStatuses = ['new', 'contacted', 'closed']
      if (!newStatus || !validStatuses.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        })
      }

      const updated = await Enquiry.findByIdAndUpdate(
        id,
        { status: newStatus },
        { new: true }
      ).lean()

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry not found.',
        })
      }

      return res.status(200).json({
        success: true,
        enquiry: updated,
      })
    }

    res.setHeader('Allow', ['GET', 'PATCH'])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed.`,
    })
  } catch (error) {
    console.error('[API /api/admin/enquiries] Error:', error)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred.',
    })
  }
}

