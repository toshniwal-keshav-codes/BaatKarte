# 💬 BaatKarte

> **Conversations that Matter.**

BaatKarte is a modern, real-time one-to-one messaging platform built using the MERN stack. It features secure passwordless authentication via Email OTP, real-time messaging powered by Socket.io, automatic message expiry, and a clean, responsive user interface.

---

## 🚀 Features

### 🔐 Authentication
- Passwordless authentication using Email OTP
- OTP verification via Gmail SMTP (Nodemailer)
- JWT-based authentication
- Secure HTTP-only refresh tokens
- OTP expiry and resend functionality
- Unique email and username validation
- Protected routes

---

### 💬 Real-Time Chat
- One-to-one messaging
- Real-time communication using Socket.io
- Search users by email or username
- Automatic conversation creation
- Conversation history
- Message timestamps
- Sent message status
- Infinite scrolling
- Responsive chat interface

---

### 🗑 Auto Message Deletion
Messages automatically expire **7 days** after being sent using MongoDB TTL indexes.

---

### 👨‍💼 Admin Dashboard
- View all registered users
- Search users
- Delete users
- Dashboard statistics
- Role-based protected routes

---

### 🎨 UI/UX
- Responsive Design
- Auto Light / Dark Theme
- Premium modern interface
- Tailwind CSS
- shadcn/ui
- Framer Motion animations
- Lucide Icons

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- React Hook Form
- Zod
- Axios

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.io
- JWT Authentication
- Nodemailer
- Gmail SMTP
- Helmet
- CORS
- Express Rate Limiter

---

## Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Railway |
| Database | MongoDB Atlas |

---

# 📁 Project Structure

```
BaatKarte/
│
├── src/                    # React Frontend
│
├── public/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/BaatKarte.git

cd BaatKarte
```

---

## Frontend

```bash
npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

## Backend

```bash
cd server

npm install

npm run dev
```

Runs on

```
http://localhost:4000
```

---

# 🔑 Environment Variables

## Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## Backend (.env)

```env
PORT=4000

MONGO_URI=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_EMAIL=

SMTP_PASSWORD=

EMAIL_FROM=

CLIENT_ORIGIN=http://localhost:5173

COOKIE_SECURE=false
```

---

# 📦 API Overview

## Authentication

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/register/start |
| POST | /api/auth/login/start |
| POST | /api/auth/verify |
| POST | /api/auth/resend |
| POST | /api/auth/refresh |
| POST | /api/auth/logout |
| GET | /api/auth/me |

---

## Chat

| Method | Endpoint |
|----------|----------|
| GET | /api/chat/users/search |
| POST | /api/chat/conversation |
| GET | /api/chat/conversations |
| GET | /api/chat/messages |
| POST | /api/chat/messages |

---

## Admin

| Method | Endpoint |
|----------|----------|
| GET | /api/admin/users |
| DELETE | /api/admin/users/:id |

---

# 🔄 Authentication Flow

```
Register

↓

Enter Name

↓

Enter Username

↓

Enter Email

↓

Receive OTP

↓

Verify OTP

↓

Account Created

↓

JWT Generated

↓

Inbox
```

---

## Login

```
Enter Email

↓

Receive OTP

↓

Verify OTP

↓

Inbox
```

---

# 💬 Chat Flow

```
Login

↓

Search User

↓

Create/Open Conversation

↓

Join Socket Room

↓

Send Message

↓

Store in MongoDB

↓

Broadcast via Socket.io

↓

Receiver Gets Message

↓

Conversation Updated
```

---

# 🔒 Security

- JWT Authentication
- HTTP-only Cookies
- Helmet
- CORS Protection
- Rate Limiting
- Input Validation using Zod
- Environment Variables
- MongoDB Sanitization
- Passwordless Authentication

---

# 🧪 Testing Checklist

- [ ] User Registration
- [ ] Login
- [ ] OTP Verification
- [ ] Resend OTP
- [ ] Search Users
- [ ] Create Conversation
- [ ] Send Messages
- [ ] Receive Messages
- [ ] Socket Reconnection
- [ ] Auto Delete Messages
- [ ] Logout
- [ ] Admin Dashboard

---

## 🌐 Live Demo

Experience **BaatKarte** live using the links below:

- **Latest Production Deployment:** https://baat-karte.vercel.app
- **Version 1 Deployment:** https://baat-karte-7a73i8kgo-toshniwal-keshav-codes-projects.vercel.app

> **Note:** The Production Deployment always points to the latest stable version, while the Version 1 Deployment preserves the initial release for reference and comparison.

---

# 📈 Future Enhancements

- Profile Pictures
- User Bio
- User Status
- Last Seen
- Typing Indicator
- Read Receipts
- Delivered Status
- Push Notifications
- Group Chats
- Voice Messages
- Video Calling
- Screen Sharing
- File Sharing
- Message Reactions
- End-to-End Encryption
- AI Moderation

---

# 👨‍💻 Author

**Keshav Toshniwal**

- GitHub: https://github.com/toshniwal-keshav
- LinkedIn: *(Add your LinkedIn profile here)*

---

# 📜 License

This project is intended for educational and portfolio purposes.

Feel free to fork, learn, and improve upon it.

---

## ⭐ If you like this project

Please consider giving it a ⭐ on GitHub!