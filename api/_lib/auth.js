import jwt from 'jsonwebtoken'

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.')
  }
  return secret
}

export function extractToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim()
  }
  return null
}

export function signToken(user) {
  const secret = getJwtSecret()
  const payload = {
    userId: user._id ? user._id.toString() : user.id,
    email: user.email.toLowerCase(),
    role: user.role || 'student',
    name: user.name,
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(req) {
  const token = extractToken(req)
  if (!token) return null

  try {
    const secret = getJwtSecret()
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

export function requireAuth(req, res) {
  const tokenPayload = verifyToken(req)
  if (!tokenPayload) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid authentication token required.',
    })
    return null
  }
  return tokenPayload
}

export function requireAdmin(req, res) {
  const token = extractToken(req)
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication token is missing.',
    })
    return null
  }

  let decoded = null
  try {
    const secret = getJwtSecret()
    decoded = jwt.verify(token, secret)
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication token is invalid or expired.',
    })
    return null
  }

  if (decoded.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required for this resource.',
    })
    return null
  }

  return decoded
}

