# Uber Backend

This folder contains the backend API for the Uber-like application.

## Overview

The backend is built with Express, MongoDB, Mongoose, JWT authentication, and request validation.
It exposes separate authentication endpoints for users and captains, plus a health check route.

### Main files

- `server.js` - creates and starts the HTTP server.
- `app.js` - configures Express, middleware, routes, and database connection.
- `db/db.js` - connects to MongoDB using Mongoose.
- `models/user.model.js` - defines the user schema, password hashing, and JWT token generation.
- `models/captain.model.js` - defines the captain schema, password hashing, and JWT token generation.
- `models/blackListToken.js` - stores blacklisted JWTs for logout handling.
- `routes/user.routes.js` - user authentication route definitions.
- `routes/captain.routes.js` - captain authentication route definitions.
- `controller/user.controller.js` - user request validation and controller logic.
- `controller/captain.controller.js` - captain request validation and controller logic.
- `services/user.service.js` - business logic for user creation.
- `services/captain.service.js` - business logic for captain creation.
- `middlewares/auth.middleware.js` - protects profile/logout routes and validates JWTs.

## Prerequisites

- Node.js 18+ (or compatible)
- npm
- MongoDB connection string

## Install

From the `backend` directory:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend root with:

```env
PORT=3000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

### Required

- `PORT` - port used by the server, defaults to `3000`.
- `MONGO_URI` - MongoDB connection URI.
- `JWT_SECRET` - secret used to sign JWT access tokens.

## Run

Production:

```bash
node server.js
```

Development with automatic reload:

```bash
npx nodemon server.js
```

## API Endpoints

### Health Check

`GET /`

Response:

- `200 OK` with body `Hello World!`

### User Endpoints

#### Register User

`POST /users/register`

Request body:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john@example.com",
  "password": "password123"
}
```

Validation:

- `email` must be a valid email.
- `fullname.firstname` must be at least 3 characters.
- `password` must be at least 6 characters.

Response:

- `201 Created` - returns `token` and created `user` data.
- `400 Bad Request` - invalid input or email already exists.

#### Login User

`POST /users/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Validation:

- `email` must be a valid email.
- `password` must be at least 6 characters.

Response:

- `200 OK` - returns `token` and authenticated `user` data.
- `400 Bad Request` - invalid credentials or validation error.

#### Get User Profile

`GET /users/profile`

Details:

- Protected endpoint requiring a valid JWT.
- Token may be provided via the `token` cookie or the `Authorization` header as `Bearer <token>`.

Response:

- `200 OK` - authenticated user profile.
- `401 Unauthorized` - missing, invalid, or blacklisted token.

#### Logout User

`GET /users/logout`

Details:

- Protected endpoint requiring a valid JWT.
- The token is blacklisted and the `token` cookie is cleared.

Response:

- `200 OK` - `{ "message": "Logged out successfully" }`
- `401 Unauthorized` - missing, invalid, or blacklisted token.

### Captain Endpoints

#### Register Captain

`POST /captains/register`

Request body:

```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "jane@example.com",
  "password": "password123",
  "vehicle": {
    "color": "blue",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

Validation:

- `fullname.firstname` must be at least 3 characters.
- `email` must be a valid email.
- `password` must be at least 6 characters.
- `vehicle.color` must be at least 3 characters.
- `vehicle.plate` must be at least 3 characters.
- `vehicle.capacity` must be an integer of at least 1.
- `vehicle.vehicleType` must be one of `car`, `motorcycle`, or `auto`.

Response:

- `201 Created` - returns `token` and created `captain` data.
- `400 Bad Request` - invalid input or email already exists.

#### Login Captain

`POST /captains/login`

Request body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Validation:

- `email` must be a valid email.
- `password` must be at least 6 characters.

Response:

- `200 OK` - returns `token` and authenticated `captain` data.
- `400 Bad Request` - invalid credentials or validation error.

#### Get Captain Profile

`GET /captains/profile`

Details:

- Protected endpoint requiring a valid JWT.
- Token may be provided via the `token` cookie or the `Authorization` header as `Bearer <token>`.

Response:

- `200 OK` - authenticated captain profile.
- `401 Unauthorized` - missing, invalid, or blacklisted token.

#### Logout Captain

`GET /captains/logout`

Details:

- Protected endpoint requiring a valid JWT.
- The token is blacklisted and the `token` cookie is cleared.

Response:

- `200 OK` - `{ "message": "Logged out successfully" }`
- `401 Unauthorized` - missing, invalid, or blacklisted token.

## Auth Details

- JWT tokens are generated when a user or captain logs in or registers.
- Tokens are sent in HTTP-only cookies and can also be passed via `Authorization: Bearer <token>`.
- Blacklisted tokens are stored in `models/blackListToken.js` during logout.

## Full File Map

- `app.js` - app initialization, middleware, and route mounting.
- `server.js` - starts the HTTP server.
- `db/db.js` - MongoDB connection.
- `models/user.model.js` - user schema and helpers.
- `models/captain.model.js` - captain schema and helpers.
- `models/blackListToken.js` - blacklisted JWT storage.
- `routes/user.routes.js` - user auth routes.
- `routes/captain.routes.js` - captain auth routes.
- `controller/user.controller.js` - user controllers.
- `controller/captain.controller.js` - captain controllers.
- `services/user.service.js` - user create logic.
- `services/captain.service.js` - captain create logic.
- `middlewares/auth.middleware.js` - authorization middleware.

## Notes

- Passwords are hashed with `bcrypt` before saving.
- `jsonwebtoken` is used for token creation and verification.
- Input validation is performed by `express-validator`.
- CORS and cookie parsing are enabled via `cors` and `cookie-parser`.
