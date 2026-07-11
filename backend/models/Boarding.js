const mongoose = require('mongoose');

const BoardingSchema = new mongoose.Schema({
  owner: {
    type: String, // email or user ID of the owner
    required: true,
  },
  boardingName: {
    type: String,
    required: [true, 'Please add a boarding name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  boardingType: {
    type: String,
    required: [true, 'Please specify boarding type'],
    enum: ['Hostel', 'Annex', 'Room'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  coverImage: {
    type: String,
  },
  morePhotos: [String],
  totalRooms: {
    type: Number,
    required: [true, 'Please specify total rooms'],
  },
  totalBeds: {
    type: Number,
    default: 0,
  },
  pricePerMonth: {
    type: Number,
    required: [true, 'Please specify price per month'],
  },
  facilities: {
    wifi: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false },
  },
  contactNumber: {
    type: String,
  },
  rules: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Boarding', BoardingSchema);
