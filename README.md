# GArepas App

Monorepo with a Spring Boot backend and a React (Vite) frontend.

## Structure
- `backend/` — Spring Boot API (Java 21, Maven, PostgreSQL)
- `garepas-frontend/` — React + Vite single-page app

## Backend environment variables
For local development copy `.env.example` to `.env`. In production (Railway)
set these as environment variables instead:

| Variable             | Description                                  | Default |
|----------------------|----------------------------------------------|---------|
| `DB_URL`             | JDBC URL to PostgreSQL                       | localhost dev DB |
| `DB_USERNAME`        | DB user                                      | `postgres` |
| `DB_PASSWORD`        | DB password                                  | — |
| `APP_CORS_ORIGINS`   | Comma-separated allowed CORS origins         | localhost + vercel |
| `PORT`               | Server port                                  | `8080` |

## Deploy

### Backend → Railway (Docker)
1. Create a Railway project and add a service from this repository.
2. Set the service **root directory** to `backend/` and the builder to `Dockerfile`.
3. Add the environment variables above (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
   `APP_CORS_ORIGINS`, `PORT=8080`).
4. Deploy. Copy the generated `*.railway.app` URL.

### Frontend → Vercel
1. Import `garepas-frontend/` as a Vite project.
2. Build command `npm run build`, output directory `dist`.
3. After deploy, set `APP_CORS_ORIGINS` on the backend (Railway) to your
   Vercel URL so the API accepts requests from the frontend.
