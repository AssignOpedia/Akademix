import { Enquiry } from '../_lib/models/Enquiry.js'
import { connectDB } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  const admin = requireAdmin(req, res)
  if (!admin) return
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed.` })
  }
  try {
    const id = req.query?.id
    if (!id) return res.status(400).json({ success: false, message: 'Enquiry ID is required.' })
    await connectDB()
    const enquiry = await Enquiry.findById(id).select('attachment').lean()
    const attachment = enquiry?.attachment
    if (!attachment?.data || !attachment?.filename) return res.status(404).json({ success: false, message: 'No document is attached to this enquiry.' })
    const filename = attachment.filename.replace(/[\\/:*?"<>|\r\n]/g, '_')
    res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream')
    res.setHeader('Content-Length', attachment.size || attachment.data.length)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(attachment.data)
  } catch (error) {
    console.error('[API /api/admin/attachment] Error:', error)
    return res.status(500).json({ success: false, message: 'The attached document could not be downloaded.' })
  }
}
