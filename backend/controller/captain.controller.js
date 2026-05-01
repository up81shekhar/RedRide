const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const blackListTokenModel = require("../models/blackListToken");
const { validationResult } = require("express-validator");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainExist = await captainModel.findOne({ email });

  if (isCaptainExist) {
    return res.status(400).json({ message: "Captain with this email already exists" });
  }

  const hashPassword = await captainModel.hashPassword(password);

  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  // Immediately active so they can receive rides after registration
  captain.status = 'active';
  await captain.save();

  const token = captain.generateAuthToken();

  res.status(201).json({ token, captain });
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select('+password');

  if (!captain) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Mark captain as active so ride broadcasts reach them
  captain.status = 'active';
  await captain.save();

  const token = captain.generateAuthToken();
  res.cookie('token', token);

  res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res, next) => {
  res.status(200).json({ captain: req.captain });
}
 
module.exports.logoutCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  await blackListTokenModel.create({ token });

  // Mark captain as inactive so they stop receiving ride requests
  if (req.captain?._id) {
    await captainModel.findByIdAndUpdate(req.captain._id, { status: 'inactive', socketId: null });
  }

  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

/* Update online/offline status */
module.exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Status must be active or inactive' });
  }
  try {
    const captain = await captainModel.findByIdAndUpdate(
      req.captain._id,
      { status },
      { new: true }
    );
    res.status(200).json({ captain });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};