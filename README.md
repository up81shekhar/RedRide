# Uber Monorepo

This repository contains a simple Uber-like application with separate backend and frontend projects.

## Structure

- `backend/` - Express API server with MongoDB, JWT authentication, and user/captain routes.
- `frontend/` - React + Vite frontend with login and signup pages for users and captains.

## Features

- User registration and login
- Captain registration and login
- JWT-based protected profile and logout routes
- Separate user and captain flows

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance or connection URI

## Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
PORT=3000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

Run the backend:

```bash
node server.js
```

Or with automatic reload if you have nodemon installed:

```bash
npx nodemon server.js
```

The backend starts on `http://localhost:3000` by default.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser at the Vite dev server address (usually `http://localhost:5173`).

## Frontend pages

- `/` - Home page
- `/login` - User login page
- `/signup` - User signup page
- `/captain-login` - Captain login page
- `/captain-signup` - Captain signup page

## Notes

- The backend handles all authentication, validation, and token storage.
- The frontend is a Vite-powered React app using React Router for navigation.
- Update the frontend API integration if the backend is served from a different origin.
