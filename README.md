# Bestarz Backend (Node.js + Express + MongoDB)

## Quick start

1. Create `.env` in this folder with:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bestarz
JWT_SECRET=replace_with_strong_secret
```

2. Install deps and run:

```
npm install
npm run dev
```

Server runs at http://localhost:5000 and exposes `/api/*` routes.

## API Overview

- Auth
  - POST `/api/auth/signup` { firstName, lastName, email, password, userType('provider'|'client'), businessName? }
  - POST `/api/auth/signin` { email, password }
  - GET `/api/auth/me` Bearer token

- Providers
  - GET `/api/providers` query: category, location, minPrice, maxPrice
  - GET `/api/providers/:id`
  - PUT `/api/providers/me` Bearer token (provider)

- Bookings
  - POST `/api/bookings` Bearer token (client)
  - GET `/api/bookings/me` Bearer token (client|provider)
  - PATCH `/api/bookings/:id/status` { status } Bearer token (provider)

## Notes
- JWT required for protected routes (send `Authorization: Bearer <token>`)
- Models in `src/models`: `User`, `Provider`, `Booking`
- Edit CORS in `src/server.js` if frontend origin needs to be restricted.
