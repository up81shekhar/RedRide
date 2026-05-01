const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'captain',
      default: null,
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    duration: {
      type: Number, // seconds
      default: null,
    },
    distance: {
      type: Number, // metres
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'auto'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ride', rideSchema);
