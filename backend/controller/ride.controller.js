const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const { sendMessageToSocketId } = require('../socket');
const rideModel   = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const mapsService = require('../services/maps.service');

/* ── Create ride (user) ────────────────────────────────────────────── */
module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { pickup, destination, vehicleType, paymentMethod } = req.body;
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
      paymentMethod,
    });

    const ridePopulated = await rideModel
      .findById(ride._id)
      .populate('user')
      .select('+otp');

    // Find nearby captains (all active captains for now)
    const pickupCoords = await mapsService.getAddressCoordinate(pickup);
    const nearbyCaptains = await captainModel.find({
      status: 'active',
      socketId: { $ne: null },
    });

    nearbyCaptains.forEach((captain) => {
      if (captain.socketId) {
        sendMessageToSocketId(captain.socketId, {
          event: 'new-ride',
          data: ridePopulated,
        });
      }
    });

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Get fare estimate (user) ───────────────────────────────────────── */
module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { pickup, destination } = req.query;
    const { fares, distance, duration } = await rideService.getFare(pickup, destination);
    res.status(200).json({ fares, distance, duration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Confirm ride (captain) ─────────────────────────────────────────── */
module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const ride = await rideService.confirmRide({
      rideId:  req.body.rideId,
      captain: req.captain,
    });

    // Notify user
    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-confirmed',
        data: ride,
      });
    }

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Start ride (captain, OTP verified) ─────────────────────────────── */
module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const ride = await rideService.startRide({
      rideId:  req.query.rideId,
      otp:     req.query.otp,
      captain: req.captain,
    });

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-started',
        data: ride,
      });
    }

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── End ride (captain) ─────────────────────────────────────────────── */
module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const ride = await rideService.endRide({
      rideId:  req.body.rideId,
      captain: req.captain,
    });

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-ended',
        data: ride,
      });
    }

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Ride history ────────────────────────────────────────────────────── */
module.exports.getUserRideHistory = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ user: req.user._id })
      .populate('captain')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getCaptainRideHistory = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ captain: req.captain._id })
      .populate('user')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
