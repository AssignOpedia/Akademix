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

    const { name, email, password, phone, college, course, year } = req.body || {}
    const trimmedName = (name || '').toString().trim()
    const normalizedEmail = (email || '').toString().trim().toLowerCase()

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Role always defaults to student upon public signup for security
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: (phone || '').toString().trim(),
      college: (college || '').toString().trim(),
      course: (course || '').toString().trim(),
      year: (year || '').toString().trim(),
      role: 'student',
    })

    const token = signToken(newUser)

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        college: newUser.college,
        course: newUser.course,
        year: newUser.year,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error('[API /api/auth/signup] Signup error:', error)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during registration.',
    })
  }
}

