const dotenv = require('dotenv');
dotenv.config();

const express     = require('express');
const cors        = require('cors');
const cookieParser = require('cookie-parser');
const app         = express();

const connectDB      = require('./db/db');
const userRoutes     = require('./routes/user.routes');
const captainRoutes  = require('./routes/captain.routes');
const mapsRoutes     = require('./routes/maps.routes');
const rideRoutes     = require('./routes/ride.routes');

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => res.json({ status: 'RedRide API running 🚗' }));

app.use('/users',    userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps',     mapsRoutes);
app.use('/rides',    rideRoutes);

module.exports = app;