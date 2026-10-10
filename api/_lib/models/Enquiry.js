
import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      default: null,
      maxlength: 255,
    },
    contentType: {
      type: String,
      default: null,
      maxlength: 150,
    },
    size: {
      type: Number,
      default: null,
      min: 0,
    },
    url: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
)

const EnquirySchema = new mongoose.Schema(
  {
    serviceSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    cvUrl: {
      type: String,
      default: null,
      trim: true,
    },
    attachment: {
      type: AttachmentSchema,
      default: null,
    },
    submittedAtIST: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Enquiry =
  mongoose.models.Enquiry ||
  mongoose.model('Enquiry', EnquirySchema)

export default Enquiry
