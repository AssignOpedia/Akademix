import { connectDB } from '../_lib/db.js'
import { User } from '../_lib/models/User.js'
import { requireAdmin } from '../_lib/auth.js'

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

    const { search } = req.query || {}
    const filter = { role: 'student' }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { college: searchRegex },
        { course: searchRegex },
      ]
    }

    // Explicitly exclude password field
    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    })
  } catch (error) {
    console.error('[API /api/admin/students] Error retrieving students:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list.',
    })
  }
}

