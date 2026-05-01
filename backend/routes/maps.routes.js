const express = require('express');
const router  = express.Router();
const { query } = require('express-validator');
const mapsController  = require('../controller/maps.controller');
const authMiddleware  = require('../middlewares/auth.middleware');

router.get(
  '/get-coordinates',
  query('address').isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapsController.getCoordinates
);

// Captain-auth version — used by CaptainRiding.jsx
router.get(
  '/get-coordinates-captain',
  query('address').isString().isLength({ min: 3 }),
  authMiddleware.authCaptain,
  mapsController.getCoordinates
);

router.get(
  '/get-distance-time',
  query('origin').isString().isLength({ min: 3 }),
  query('destination').isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapsController.getDistanceTime
);

router.get(
  '/get-suggestions',
  query('input').isString().isLength({ min: 2 }),
  authMiddleware.authUser,
  mapsController.getAutoCompleteSuggestions
);

module.exports = router;

