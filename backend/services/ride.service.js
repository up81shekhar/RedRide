const rideModel  = require('../models/ride.model');
const mapsService = require('./maps.service');
const crypto      = require('crypto');

/* ── Fare table (₹ per km) ─────────────────────────────────────────────────── */
const FARE_RATES = {
  car:        { base: 50, perKm: 15, perMin: 2 },
  motorcycle: { base: 25, perKm:  8, perMin: 1.5 },
  auto:       { base: 30, perKm: 10, perMin: 1.8 },
};

/**
 * Calculate fare for all vehicle types
 */
module.exports.getFare = async (pickup, destination) => {
  const originCoord = await mapsService.getAddressCoordinate(pickup);
  const destCoord   = await mapsService.getAddressCoordinate(destination);
  const { distance, duration } = await mapsService.getDistanceTime(originCoord, destCoord);

  const distKm  = distance.value / 1000;
  const durMin  = duration.value / 60;

  const fares = {};
  for (const [type, rate] of Object.entries(FARE_RATES)) {
    fares[type] = Math.round(rate.base + rate.perKm * distKm + rate.perMin * durMin);
  }

  return { fares, distance, duration };
};

/**
 * Create a new ride
 */
module.exports.createRide = async ({
  user, pickup, destination, vehicleType, paymentMethod,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error('All fields are required');
  }

  const { fares, distance, duration } = await module.exports.getFare(pickup, destination);

  const otp = crypto.randomInt(1000, 9999).toString();

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    fare:        fares[vehicleType],
    vehicleType,
    paymentMethod: paymentMethod || 'cash',
    otp,
    distance: distance.value,
    duration: duration.value,
  });

  return ride;
};

/**
 * Captain confirms / accepts a ride
 */
module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) throw new Error('Ride ID is required');

  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId },
    { status: 'accepted', captain: captain._id },
    { new: true }
  ).populate('user').populate('captain').select('+otp');

  if (!ride) throw new Error('Ride not found');
  return ride;
};

/**
 * Captain starts the ride (OTP verified)
 */
module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) throw new Error('Ride ID and OTP are required');

  const ride = await rideModel
    .findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');

  if (!ride)                          throw new Error('Ride not found');
  if (ride.status !== 'accepted')     throw new Error('Ride is not accepted yet');
  if (ride.otp !== otp)              throw new Error('Invalid OTP');

  ride.status = 'ongoing';
  await ride.save();
  return ride;
};

/**
 * Captain ends the ride
 */
module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) throw new Error('Ride ID is required');

  const ride = await rideModel
    .findOne({ _id: rideId, captain: captain._id })
    .populate('user')
    .populate('captain');

  if (!ride)                        throw new Error('Ride not found');
  if (ride.status !== 'ongoing')    throw new Error('Ride is not ongoing');

  ride.status         = 'completed';
  ride.paymentStatus  = 'pending'; // user pays on the app
  await ride.save();
  return ride;
};
