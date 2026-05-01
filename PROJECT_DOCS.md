# RedRide - Uber Clone Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Backend Documentation](#backend-documentation)
   - [Models](#models)
   - [Routes](#routes)
   - [Controllers](#controllers)
   - [Services](#services)
   - [Middleware](#middleware)
   - [Socket.IO](#socketio)
6. [Frontend Documentation](#frontend-documentation)
   - [Pages](#pages)
   - [Components](#components)
   - [Context Providers](#context-providers)
7. [API Endpoints](#api-endpoints)
8. [Real-time Communication](#real-time-communication)
9. [Fare Calculation](#fare-calculation)
10. [Setup Instructions](#setup-instructions)
11. [Environment Variables](#environment-variables)

---

## Project Overview

**RedRide** is a full-stack Uber-like ride-sharing application that connects users seeking transportation with captains (drivers) who provide vehicle services. The application features real-time ride booking, fare estimation, live location tracking, and Socket.IO-based communication between users and captains.

### Key Features

- User registration and authentication
- Captain registration with vehicle details
- Real-time ride creation and acceptance
- Live location tracking via Socket.IO
- Fare estimation for multiple vehicle types
- OTP-based ride verification
- Ride history for both users and captains
- Protected routes with JWT authentication

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │  Context    │             │
│  │  - Home     │  │ - LiveMap   │  │ - User      │             │
│  │  - Captain  │  │ - Confirm   │  │ - Captain    │             │
│  │  - Login    │  │ - Search    │  │ - Socket    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Express.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Routes    │  │ Controllers │  │  Services   │             │
│  │  - Users    │  │ - User      │  │ - User      │             │
│  │  - Captains │  │ - Captain   │  │ - Captain   │             │
│  │  - Rides    │  │ - Ride      │  │ - Ride      │             │
│  │  - Maps     │  │ - Maps      │  │ - Maps      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                              │                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Models    │  │ Middleware  │  │  Socket.IO  │             │
│  │  - User     │  │ - Auth      │  │  - Real-time│             │
│  │  - Captain  │  │             │  │  - Events   │             │
│  │  - Ride     │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                             │
│  Collections: users, captains, rides, blackListTokens           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Express.js | Web framework |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Socket.IO | Real-time communication |
| express-validator | Request validation |
| cookie-parser | Cookie handling |
| cors | Cross-origin resource sharing |
| axios | HTTP client for external APIs |
| dotenv | Environment variables |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool |
| React Router | Navigation |
| Socket.IO Client | Real-time client |
| Axios | HTTP client |
| Leaflet + React-Leaflet | Maps |
| GSAP | Animations |
| Tailwind CSS | Styling |

---

## Project Structure

```
uber/
├── README.md
├── backend/
│   ├── .env
│   ├── app.js              # Express app configuration
│   ├── server.js           # HTTP server entry point
│   ├── socket.js          # Socket.IO configuration
│   ├── package.json
│   ├── controller/
│   │   ├── user.controller.js
│   │   ├── captain.controller.js
│   │   ├── maps.controller.js
│   │   └── ride.controller.js
│   ├── db/
│   │   └── db.js           # MongoDB connection
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── captain.model.js
│   │   ├── ride.model.js
│   │   └── blackListToken.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── captain.routes.js
│   │   ├── maps.routes.js
│   │   └── ride.routes.js
│   └── services/
│       ├── user.service.js
│       ├── captain.service.js
│       ├── maps.service.js
│       └── ride.service.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── App.css
        ├── assets/
        ├── components/
        │   ├── ConfirmRidePanel.jsx
        │   ├── LiveMap.jsx
        │   └── LocationSearchPanel.jsx
        ├── context/
        │   ├── CaptainContext.jsx
        │   ├── SocketContext.jsx
        │   └── UserContext.jsx
        └── pages/
            ├── CaptainHome.jsx
            ├── CaptainLogin.jsx
            ├── CaptainLogout.jsx
            ├── CaptainProtectedWrapper.jsx
            ├── CaptainRiding.jsx
            ├── CaptainSignup.jsx
            ├── Home.jsx
            ├── RidingPage.jsx
            ├── Start.jsx
            ├── UserLogin.jsx
            ├── UserLogout.jsx
            ├── UserProtectWrapper.jsx
            └── UserSignup.jsx
```

---

## Backend Documentation

### Models

#### 1. User Model (`models/user.model.js`)

```javascript
{
  fullname: {
    firstname: String (required, min 3 chars),
    lastname: String
  },
  email: String (required, unique),
  password: String (required, hashed),
  socketId: String (for real-time communication)
}
```

**Methods:**
- `generateAuthToken()` - Creates JWT token (24h expiry)
- `comparePassword(password)` - Verifies password
- `hashPassword(password)` - Static method for hashing

#### 2. Captain Model (`models/captain.model.js`)

```javascript
{
  fullname: {
    firstname: String (required, min 3 chars),
    lastname: String
  },
  email: String (required, unique),
  password: String (required, hashed),
  socketId: String,
  status: String (enum: 'active' | 'inactive'),
  vehicle: {
    color: String (required),
    plate: String (required, unique),
    capacity: Number (required, min 1),
    vehicleType: String (enum: 'car' | 'motorcycle' | 'auto')
  },
  location: {
    lat: Number,
    lng: Number
  }
}
```

**Methods:** Same as User model

#### 3. Ride Model (`models/ride.model.js`)

```javascript
{
  user: ObjectId (ref: user, required),
  captain: ObjectId (ref: captain, default: null),
  pickup: String (required),
  destination: String (required),
  fare: Number (required),
  status: String (enum: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'),
  duration: Number (seconds),
  distance: Number (metres),
  paymentMethod: String (enum: 'cash' | 'upi' | 'card'),
  paymentStatus: String (enum: 'pending' | 'completed'),
  otp: String (4 digits, select: false),
  vehicleType: String (enum: 'car' | 'motorcycle' | 'auto'),
  rating: Number (min 1, max 5)
}
```

#### 4. BlackListToken Model (`models/blackListToken.js`)

```javascript
{
  token: String (required, unique),
  createdAt: Date (default: now, expires: 86400s = 24h)
}
```

Used for logout functionality - tokens are blacklisted to prevent reuse.

---

### Routes

#### User Routes (`routes/user.routes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/register` | No | Register new user |
| POST | `/users/login` | No | Login user |
| GET | `/users/profile` | Yes | Get user profile |
| GET | `/users/logout` | Yes | Logout user |

#### Captain Routes (`routes/captain.routes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/captains/register` | No | Register new captain |
| POST | `/captains/login` | No | Login captain |
| GET | `/captains/profile` | Yes | Get captain profile |
| GET | `/captains/logout` | Yes | Logout captain |
| PATCH | `/captains/status` | Yes | Toggle online/offline |

#### Maps Routes (`routes/maps.routes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/maps/get-coordinates` | Yes | Get lat/lng from address |
| GET | `/maps/get-coordinates-captain` | Yes | Captain version |
| GET | `/maps/get-distance-time` | Yes | Get distance & duration |
| GET | `/maps/get-suggestions` | Yes | Autocomplete suggestions |

#### Ride Routes (`routes/ride.routes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/rides/create` | User | Create new ride |
| GET | `/rides/get-fare` | User | Get fare estimate |
| GET | `/rides/history` | User | Get user ride history |
| POST | `/rides/confirm` | Captain | Accept ride |
| GET | `/rides/start-ride` | Captain | Start ride (OTP) |
| POST | `/rides/end-ride` | Captain | End ride |
| GET | `/rides/captain-history` | Captain | Get captain ride history |

---

### Controllers

#### User Controller (`controller/user.controller.js`)

- `registerUser` - Validates input, checks existing user, creates new user
- `loginUser` - Validates credentials, generates token, sets cookie
- `getUserProfile` - Returns authenticated user data
- `logoutUser` - Blacklists token, clears cookie

#### Captain Controller (`controller/captain.controller.js`)

- `registerCaptain` - Creates captain with vehicle details, sets status to 'active'
- `loginCaptain` - Authenticates captain, generates token, sets status to 'active'
- `getCaptainProfile` - Returns authenticated captain data
- `logoutCaptain` - Blacklists token, clears cookie
- `updateStatus` - Toggles captain online/offline status

#### Maps Controller (`controller/maps.controller.js`)

- `getCoordinates` - Converts address to lat/lng using Nominatim
- `getDistanceTime` - Calculates distance and duration using OSRM
- `getAutoCompleteSuggestions` - Returns address suggestions

#### Ride Controller (`controller/ride.controller.js`)

- `createRide` - Creates ride, notifies nearby captains via Socket.IO
- `getFare` - Returns fare estimates for all vehicle types
- `confirmRide` - Captain accepts ride, notifies user
- `startRide` - Verifies OTP, starts ride, notifies user
- `endRide` - Completes ride, notifies user
- `getUserRideHistory` - Returns user's ride history
- `getCaptainRideHistory` - Returns captain's ride history

---

### Services

#### User Service (`services/user.service.js`)

- `createUser({ firstname, lastname, email, password })` - Creates user document

#### Captain Service (`services/captain.service.js`)

- `createCaptain({ firstname, lastname, email, password, color, plate, capacity, vehicleType })` - Creates captain document

#### Maps Service (`services/maps.service.js`)

Uses external APIs:
- **Nominatim** (OpenStreetMap) for geocoding and autocomplete
- **OSRM** (Open Source Routing Machine) for routing

Key functions:
- `getAddressCoordinate(address)` - Geocoding
- `getDistanceTime(origin, destination)` - Routing
- `getAutoCompleteSuggestions(input)` - Address search

#### Ride Service (`services/ride.service.js`)

- `getFare(pickup, destination)` - Calculates fare for all vehicle types
- `createRide({ user, pickup, destination, vehicleType, paymentMethod })` - Creates ride with OTP
- `confirmRide({ rideId, captain })` - Accepts ride
- `startRide({ rideId, otp, captain })` - Verifies OTP, starts ride
- `endRide({ rideId, captain })` - Completes ride

---

### Middleware

#### Auth Middleware (`middlewares/auth.middleware.js`)

- `authUser` - Validates JWT token, attaches user to request
- `authCaptain` - Validates JWT token, attaches captain to request

Both middleware:
1. Extract token from cookie or Authorization header
2. Check token against blacklist
3. Verify JWT signature
4. Fetch user/captain from database
5. Attach to `req.user` or `req.captain`

---

### Socket.IO

#### Socket Events

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ userId, userType }` | Identify user/captain after login |
| `update-location-captain` | `{ userId, location }` | Captain sends live location |

**Server → Client:**

| Event | Data | Description |
|-------|------|-------------|
| `new-ride` | Ride object | Notify captain of new ride request |
| `ride-confirmed` | Ride object | Notify user ride is accepted |
| `ride-started` | Ride object | Notify user ride has started |
| `ride-ended` | Ride object | Notify user ride has completed |
| `captain-location-{captainId}` | `{ lat, lng }` | Broadcast captain location |

#### Socket Functions

- `initializeSocket(server)` - Sets up Socket.IO server
- `sendMessageToSocketId(socketId, { event, data })` - Send message to specific client

---

## Frontend Documentation

### Pages

#### Public Pages

1. **Start** (`pages/Start.jsx`)
   - Landing page with app branding
   - Entry point for user authentication

2. **UserLogin** (`pages/UserLogin.jsx`)
   - User login form
   - Email/password authentication

3. **UserSignup** (`pages/UserSignup.jsx`)
   - User registration form

4. **CaptainLogin** (`pages/CaptainLogin.jsx`)
   - Captain login form

5. **CaptainSignup** (`pages/CaptainSignup.jsx`)
   - Captain registration with vehicle details

#### Protected Pages (User)

6. **Home** (`pages/Home.jsx`)
   - Main user interface for booking rides
   - Location search with autocomplete
   - Fare estimation
   - Vehicle selection
   - Ride confirmation panel
   - Real-time ride status

7. **RidingPage** (`pages/RidingPage.jsx`)
   - Active ride tracking
   - Live map with captain location

8. **UserLogout** (`pages/UserLogout.jsx`)
   - Logout handler

#### Protected Pages (Captain)

9. **CaptainHome** (`pages/CaptainHome.jsx`)
   - Captain dashboard
   - View incoming ride requests
   - Accept/reject rides

10. **CaptainRiding** (`pages/CaptainRiding.jsx`)
    - Active ride management
    - Start/end ride with OTP
    - Location updates

11. **CaptainLogout** (`pages/CaptainLogout.jsx`)
    - Logout handler

---

### Components

1. **ConfirmRidePanel** (`components/ConfirmRidePanel.jsx`)
   - Displays ride confirmation details
   - Captain information
   - Vehicle details

2. **LiveMap** (`components/LiveMap.jsx`)
   - Leaflet map integration
   - Real-time captain location
   - Route visualization

3. **LocationSearchPanel** (`components/LocationSearchPanel.jsx`)
   - Pickup/destination search
   - Autocomplete suggestions
   - Location selection

---

### Context Providers

1. **UserContext** (`context/UserContext.jsx`)
   - Provides `user` and `setUser` state
   - Manages user authentication state

2. **CaptainContext** (`context/CaptainContext.jsx`)
   - Provides `captain` and `setCaptain` state
   - Manages captain authentication state

3. **SocketContext** (`context/SocketContext.jsx`)
   - Socket.IO connection management
   - Provides socket instance to components

---

## API Endpoints

### Authentication

```
POST /users/register
Body: { fullname: { firstname, lastname }, email, password }
Response: { token, user }

POST /users/login
Body: { email, password }
Response: { token, user }

POST /captains/register
Body: { fullname, email, password, vehicle: { color, plate, capacity, vehicleType } }
Response: { token, captain }

POST /captains/login
Body: { email, password }
Response: { token, captain }
```

### Maps

```
GET /maps/get-coordinates?address=<address>
Headers: Authorization: Bearer <token>
Response: { lat, lng }

GET /maps/get-distance-time?origin=<origin>&destination=<destination>
Headers: Authorization: Bearer <token>
Response: { distance: { value, text }, duration: { value, text } }

GET /maps/get-suggestions?input=<input>
Headers: Authorization: Bearer <token>
Response: [{ place_id, display_name, lat, lon, ... }]
```

### Rides

```
POST /rides/create
Headers: Authorization: Bearer <token>
Body: { pickup, destination, vehicleType, paymentMethod }
Response: { ride object }

GET /rides/get-fare?pickup=<pickup>&destination=<destination>
Headers: Authorization: Bearer <token>
Response: { fares: { car, motorcycle, auto }, distance, duration }

POST /rides/confirm
Headers: Authorization: Bearer <captain_token>
Body: { rideId }
Response: { ride object }

GET /rides/start-ride?rideId=<rideId>&otp=<otp>
Headers: Authorization: Bearer <captain_token>
Response: { ride object }

POST /rides/end-ride
Headers: Authorization: Bearer <captain_token>
Body: { rideId }
Response: { ride object }
```

---

## Real-time Communication

### Flow: User Creates Ride

1. User enters pickup & destination on Home page
2. User selects vehicle type and creates ride
3. Backend creates ride with OTP, status = 'pending'
4. Backend finds all active captains via Socket.IO
5. Backend emits `new-ride` event to all captains
6. Captain sees ride request on CaptainHome
7. Captain clicks "Accept" → `confirmRide` endpoint
8. Backend updates ride status to 'accepted', assigns captain
9. Backend emits `ride-confirmed` to user
10. User sees confirmation on RidingPage

### Flow: Ride Lifecycle

1. **Pending** → Captain accepts → **Accepted**
2. **Accepted** → Captain enters OTP, starts → **Ongoing**
3. **Ongoing** → Captain ends ride → **Completed**
4. User can cancel at any time → **Cancelled**

---

## Fare Calculation

### Fare Rates (INR per km)

| Vehicle | Base Fare | Per KM | Per Minute |
|---------|-----------|--------|-------------|
| Car | ₹50 | ₹15 | ₹2 |
| Motorcycle | ₹25 | ₹8 | ₹1.5 |
| Auto | ₹30 | ₹10 | ₹1.8 |

### Formula

```
fare = base + (distance_km × perKm) + (duration_min × perMin)
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=4000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start server:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend root:

```env
VITE_BASE_URL=http://localhost:4000
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 4000 |
| MONGO_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for JWT signing | your_secret_key |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_BASE_URL | Backend API URL | http://localhost:4000 |

---

## License

ISC License

---

## Author

RedRide Development Team