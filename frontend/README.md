# Uber Frontend

This folder contains the React frontend for the Uber-like application, built with Vite and React Router.

## Overview

The frontend provides authentication pages for users and captains, and a homepage entry point. It is designed to work with the backend API located in `../backend`.

## Prerequisites

- Node.js 18+ and npm

## Install

From the `frontend` directory:

```bash
npm install
```

## Run

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## App structure

- `src/App.jsx` - React Router setup for route navigation.
- `src/main.jsx` - application entry point.
- `src/pages/Home.jsx` - default landing page.
- `src/pages/UserLogin.jsx` - user login page.
- `src/pages/UserSignup.jsx` - user signup page.
- `src/pages/captainLogin.jsx` - captain login page.
- `src/pages/CaptainSignup.jsx` - captain signup page.
- `src/index.css` and `src/App.css` - global and app styles.

## Routes

- `/` - Home
- `/login` - User login
- `/signup` - User signup
- `/captain-login` - Captain login
- `/captain-signup` - Captain signup

## Notes

- The frontend currently uses Vite with React and ESLint.
- Make sure the backend server is running before using the auth pages.
- If you add API calls, configure the backend origin or proxy as needed in `vite.config.js`.
