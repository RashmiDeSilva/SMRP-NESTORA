const mongoose = require('mongoose');

const boardingSchema = new mongoose.Schema(
  {
    boardingName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    boardingType: {
      type: String,
      default: 'Annex',
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    morePhotos: [
      {
        type: String,
      }
    ],
    totalRooms: {
      type: Number,
      default: 0,
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      default: 0,
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Populate legacy fields name and address from boardingName and location
boardingSchema.pre('save', function (next) {
  if (this.boardingName && !this.name) {
    this.name = this.boardingName;
  }
  if (this.location && !this.address) {
    this.address = this.location;
  }
  next();
});

module.exports = mongoose.model('Boarding', boardingSchema);