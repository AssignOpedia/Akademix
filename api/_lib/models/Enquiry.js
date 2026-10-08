import mongoose from 'mongoose'

const EnquirySchema = new mongoose.Schema(
  {
    serviceSlug: {
      type: String,
      required: [true, 'Service slug is required'],
      trim: true,
      index: true,
    },
    serviceTitle: {
      type: String,
      required: [true, 'Service title is required'],
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
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
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

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema)
export default Enquiry

