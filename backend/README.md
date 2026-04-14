# Uber Backend

This folder contains the backend API for the Uber-like application.

## Overview

This backend provides a simple Express API with user registration and login functionality.
It uses MongoDB for data persistence, JWT for authentication, and request validation.

### Main files

- `server.js` - creates and starts the HTTP server.
- `app.js` - configures Express, middleware, routes, and database connection.
- `db/db.js` - connects to MongoDB using Mongoose.
- `models/user.model.js` - defines the `User` schema and hashing/token helpers.
- `routes/user.routes.js` - authentication route definitions.
- `controller/user.controller.js` - request validation and controller logic.
- `services/user.service.js` - business logic for user operations.

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

### Optional

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

### Health check

`GET /`

Response:

- `200 OK` with body `Hello World!`

### Register user

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

Response:

- `201 Created` - returns `token` and new `user` data without password
- `400 Bad Request` - invalid input or missing fields

### Login user

`POST /users/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

- `200 OK` - returns `token` and authenticated `user` data
- `400 Bad Request` - invalid credentials or validation error

### Get user profile

`GET /users/profile`

Details:

- Protected endpoint, requires a valid JWT token.
- Token can be provided either via the `token` cookie or the `Authorization` header as `Bearer <token>`.

Response:

- `200 OK` - returns the authenticated user's profile data
- `401 Unauthorized` - missing, invalid, or blacklisted token

### Logout user

`GET /users/logout`

Details:

- Protected endpoint, requires a valid JWT token.
- Clears the `token` cookie and blacklists the token on logout.

Response:

- `200 OK` - `{ "message": "Logged out successfully" }`
- `401 Unauthorized` - missing, invalid, or blacklisted token

## Notes

- Passwords are hashed using `bcrypt` before storing in MongoDB.
- JWT tokens are generated with `jsonwebtoken` using `JWT_SECRET`.
- The backend uses `cookie-parser`, `cors`, and `express-validator`.
- The server listens on `process.env.PORT || 3000`.

## Directory structure

```
backend/
  app.js
  server.js
  package.json
  .env
  db/
    db.js
  models/
    user.model.js
  routes/
    user.routes.js
  controller/
    user.controller.js
  services/
    user.service.js
  middlewares/
    auth.middleware.js
```
