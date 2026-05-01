const mapsService = require('../services/maps.service');
const { validationResult } = require('express-validator');

module.exports.getCoordinates = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { address } = req.query;
    const coordinates = await mapsService.getAddressCoordinate(address);
    res.status(200).json(coordinates);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports.getDistanceTime = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { origin, destination } = req.query;
    const originCoord = await mapsService.getAddressCoordinate(origin);
    const destCoord   = await mapsService.getAddressCoordinate(destination);
    const data        = await mapsService.getDistanceTime(originCoord, destCoord);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { input } = req.query;
    const suggestions = await mapsService.getAutoCompleteSuggestions(input);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
