const express = require('express');
const router  = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controller/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// User routes
router.post(
  '/create',
  authMiddleware.authUser,
  [
    body('pickup').isString().isLength({ min: 3 }).withMessage('Pickup is required'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Destination is required'),
    body('vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type'),
  ],
  rideController.createRide
);

router.get(
  '/get-fare',
  authMiddleware.authUser,
  [
    query('pickup').isString().isLength({ min: 3 }).withMessage('Pickup is required'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Destination is required'),
  ],
  rideController.getFare
);

router.get('/history', authMiddleware.authUser, rideController.getUserRideHistory);

// Captain routes
router.post(
  '/confirm',
  authMiddleware.authCaptain,
  [body('rideId').isMongoId().withMessage('Invalid ride ID')],
  rideController.confirmRide
);

router.get(
  '/start-ride',
  authMiddleware.authCaptain,
  [
    query('rideId').isMongoId().withMessage('Invalid ride ID'),
    query('otp').isString().isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits'),
  ],
  rideController.startRide
);

router.post(
  '/end-ride',
  authMiddleware.authCaptain,
  [body('rideId').isMongoId().withMessage('Invalid ride ID')],
  rideController.endRide
);

router.get('/captain-history', authMiddleware.authCaptain, rideController.getCaptainRideHistory);

module.exports = router;
