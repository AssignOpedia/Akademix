import bcrypt from 'bcryptjs'
import { connectDB } from '../_lib/db.js'
import { User } from '../_lib/models/User.js'
import { signToken } from '../_lib/auth.js'

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

    const { email, password } = req.body || {}
    const normalizedEmail = (email || '').toString().trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const token = signToken(user)

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        college: user.college || '',
        course: user.course || '',
        year: user.year || '',
        role: user.role || 'student',
      },
    })
  } catch (error) {
    console.error('[API /api/auth/login] Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login.',
    })
  }
}

