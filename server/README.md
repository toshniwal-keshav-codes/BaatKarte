# BaatKarte Server

Express + MongoDB + Socket.io backend for BaatKarte. Passwordless auth via OTP over email (Brevo).

## Local dev

```bash
cd server
cp .env.example .env
# fill BREVO_API_KEY, MONGO_URI, JWT secrets
npm install
npm run dev
```

Server runs on `http://localhost:4000` and expects the client on `http://localhost:8080` (configurable via `CLIENT_ORIGIN`).

## Deploying to Railway

1. Create a new Railway project, add a MongoDB plugin (or use MongoDB Atlas).
2. New service → Deploy from repo, root = `server`.
3. Set env vars from `.env.example`. `COOKIE_SECURE=true`, `NODE_ENV=production`, `CLIENT_ORIGIN=https://your-frontend`.
4. Start command: `npm start`.

## Auth flow

- `POST /api/auth/register/start` → `{ name, username, email }` sends OTP, returns `otpToken`.
- `POST /api/auth/login/start` → `{ email }` sends OTP, returns `otpToken`.
- `POST /api/auth/otp/verify` → `{ otpToken, code }` returns `{ user, accessToken }` and sets `refreshToken` httpOnly cookie.
- `POST /api/auth/otp/resend` → `{ otpToken }` re-sends OTP.
- `POST /api/auth/refresh` → rotates refresh cookie, returns new `accessToken`.
- `POST /api/auth/logout` → clears refresh cookie.
- `GET  /api/auth/me` → current user (requires `Authorization: Bearer <accessToken>`).