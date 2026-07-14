const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    boarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boarding',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
