import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: 20,
    },
    college: {
      type: String,
      default: '',
      trim: true,
      maxlength: 150,
    },
    course: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    year: {
      type: String,
      default: '',
      trim: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User

