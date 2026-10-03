# Bookhaven

Bookhaven is a responsive book discovery app. Search the Google Books catalog, see the essentials at a glance, and keep a persistent reading list without creating an account.

## Features

- Search Google Books through the backend with debounced input
- Responsive book cards with cover fallbacks, author details, and visual star ratings
- Persistent wishlist stored in MongoDB, with duplicate prevention
- Immediate wishlist state updates and accessible loading, error, and empty states
- Docker Compose support for the complete application stack

## Tech Stack

React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, Docker, and Docker Compose.

## Architecture

```text
React / Vite → Express API → Google Books API
React / Vite → Express API → MongoDB (Mongoose)
```

The browser calls the Express API for search and wishlist data. The backend normalizes external book data and stores wishlist entries in MongoDB.

## Local Development

Requirements: Node.js 20+ and MongoDB 7+ (local install or a MongoDB service).

1. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string.
2. Install dependencies in each app directory: `cd backend && npm install`, then `cd ../frontend && npm install`.
3. In one terminal, run `npm run dev` from `backend/`.
4. In another terminal, run `npm run dev` from `frontend/`.
5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

Set `VITE_API_BASE_URL=http://localhost:4000/api` in the root `.env` for local frontend development. Vite exposes only variables prefixed with `VITE_`. When running `npm run dev` from `backend/`, the backend loads `../.env`; you can also export backend variables in the process environment.

## Running with Docker

From the project root:

```bash
docker compose up --build
```

Open `http://localhost:8080`. The frontend container serves the production build and proxies `/api` to Express. MongoDB data is kept in the `mongodb_data` Docker volume, including across container restarts. Stop the stack with `Ctrl+C`; use `docker compose down` to stop and remove containers. The named data volume remains intact.

## Environment Variables

The root `.env.example` documents the application settings:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Express listen port for local development | `4000` |
| `MONGODB_URI` | MongoDB connection string | local MongoDB URL |
| `GOOGLE_BOOKS_API_URL` | Google Books volumes endpoint | Google Books API |
| `CORS_ORIGIN` | Allowed browser origins, comma-separated | Vite local URL |
| `VITE_API_BASE_URL` | Frontend API base for local development | `/api` |
| `FRONTEND_PORT` | Host port for the Docker frontend | `8080` |

Docker Compose uses the internal MongoDB service URL and the frontend's same-origin `/api` proxy. Set `FRONTEND_PORT` or `GOOGLE_BOOKS_API_URL` in `.env` to customize those settings.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health (`{"status":"ok"}`) |
| `GET` | `/api/books/search?q={keyword}` | Search Google Books (1–120 characters) |
| `GET` | `/api/wishlist` | List saved books |
| `POST` | `/api/wishlist` | Save a book (JSON: `googleBookId`, `title`, optional `authors`, `thumbnail`, `rating`) |
| `DELETE` | `/api/wishlist/:googleBookId` | Remove a saved book |

The wishlist uses `googleBookId` as a unique key. Repeated saves return the existing entry; invalid requests receive a `400` response and deleting a missing entry returns `404`.

## Deployment

The Docker Compose stack is suitable for a single-host demo. For a hosted deployment, build the frontend image and backend image separately, provide a managed MongoDB URI to the backend, expose the backend behind HTTPS, and set `CORS_ORIGIN` to the public frontend origin. When hosting frontend and API on separate domains, build the frontend with `VITE_API_BASE_URL` pointing to the public API URL; when serving through the included Nginx proxy, keep the same-origin `/api` path. Do not commit `.env` files or production credentials.

## Verification

Backend unit tests cover normalization of incomplete Google Books responses. Run them with `cd backend && npm test`; build the web client with `cd frontend && npm run build`. Docker health checks cover MongoDB, the API, and the web container.
