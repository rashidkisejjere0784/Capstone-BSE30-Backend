const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    confirm_email_token: {
      type: String,
      default: null,
    },
    reset_token: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImg: {
      type: String, // URL of the image
      default: null,
    },
  },
  { timestamps: true },
);

// Export the model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
