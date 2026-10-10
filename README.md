# YouTube Playlist Tracker (YPT)

A full-stack web application designed to analyze YouTube playlists, calculate playlist metrics, and track your video watch progress with authenticated user sessions.

---

## Features

- **Authentication & Security**
  - User registration & secure login with password hashing (`bcryptjs`).
  - Stateless authentication using JSON Web Tokens (JWT).
  - Protected API routes and client-side route guards (`ProtectedRoute`).
  - Persistent login session across browser reloads via token hydration.
  - User profile menu with single-click sign-out.

- **Playlist Analytics**
  - Fetch complete metadata for any public YouTube playlist using YouTube Data API v3.
  - Summary metrics: total video count, total playlist duration, average video duration, and most-viewed video.

- **Watch Progress Tracking**
  - Interactive embedded YouTube player.
  - Video selector list with title, duration, view count, and individual watched checkmarks.
  - Real-time progress bar calculation (`% completed`).
  - Quick action controls: *Mark All Watched* and *Clear Progress*.
  - LocalStorage persistence per playlist.

- **Search & Sort**
  - Instant client-side search across video titles.
  - Sort videos by original playlist order, duration, views, or title.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, React-Bootstrap / Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **External API**: Google YouTube Data API v3

---

## Project Structure

```text
Youtube-Videos-Tracker/
├── backend/
│   ├── database/        # SQLite connection & schema initialization
│   ├── middleware/      # JWT authentication middleware
│   ├── routes/          # Express routes (/auth, /playlist)
│   ├── services/        # YouTube API & Auth helper services
│   ├── utensils/        # ISO duration parser & URL extractor utilities
│   ├── index.js         # Backend server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # ProtectedRoute & reusable components
│   │   ├── config/      # Centralized API base URL config
│   │   ├── context/     # AuthContext & AuthProvider
│   │   ├── pages/       # PlaylistTracker, Login, Register pages
│   │   ├── utils/       # Navbar & formatting helpers
│   │   ├── App.jsx      # Router & Route declarations
│   │   └── main.jsx     # Root render
│   ├── vercel.json      # Single-Page-App routing rewrite for Vercel
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Cloud Console project with **YouTube Data API v3** enabled and an API Key.

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   YOUTUBE_API_KEY=your_youtube_data_api_v3_key
   ```

4. Start the backend server:
   ```bash
   npm start
   # or with nodemon:
   npm run dev
   ```
   The backend will be running on `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file inside `frontend/` if you want to override the backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user (`name`, `email`, `password`) |
| `POST` | `/auth/login` | No | Log in user and receive JWT token |
| `GET` | `/auth/me` | Yes (`Bearer <token>`) | Get logged-in user details from JWT |
| `POST` | `/playlist` | Yes (`Bearer <token>`) | Fetch YouTube playlist details & video statistics |

---

## Deployment Guide

### Backend (Render.com)
1. Create a **New Web Service** linked to your repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Set Environment Variables: `JWT_SECRET` and `YOUTUBE_API_KEY`.
6. Copy the assigned URL (e.g. `https://your-api.onrender.com`).

### Frontend (Vercel)
1. Create a **New Project** linked to your repository.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Set Environment Variable: `VITE_API_BASE_URL` = `https://your-api.onrender.com`
5. Deploy.
