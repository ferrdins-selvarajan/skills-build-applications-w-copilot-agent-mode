# OctoFit Tracker API

The Express and TypeScript API listens on port `8000` and connects to MongoDB
database `octofit_db` on port `27017`.

## Run locally

Install the dependencies and set a private signing key before starting the API:

```bash
npm install --prefix octofit-tracker/backend
JWT_SECRET='replace-with-a-private-secret-of-at-least-32-characters' npm run dev --prefix octofit-tracker/backend
```

Set `MONGODB_URI` to override the default MongoDB connection string, and `PORT`
to override the API port. In Codespaces the API base URL is printed using
`CODESPACE_NAME`; browser requests are allowed from the corresponding
Codespaces frontend URL on port `5173` and from `http://localhost:5173`.

Populate the database with repeatable demo users, teams, activities, leaderboard
totals, and workout plans:

```bash
npm run seed --prefix octofit-tracker/backend
```

The script is safe to rerun and does not delete existing users, teams, activities,
or workout plans. Demo accounts use `@example.test` addresses and have random,
undisclosed passwords by default, so they cannot be used to sign in. To make
them sign-in capable for local demos, set `SEED_DEMO_PASSWORD` (at least 12
characters) the first time the database is seeded. The same password is used
for all four demo accounts; do not use it outside local development.

## API

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | API and MongoDB readiness |
| `POST` | `/api/auth/register` | No | Create account and issue a bearer token |
| `POST` | `/api/auth/login` | No | Sign in and issue a bearer token |
| `GET`, `PATCH` | `/api/users/me` | Bearer token | Read or update the signed-in profile |
| `GET`, `POST` | `/api/teams` | `POST` requires token | List teams or create a team |
| `POST` | `/api/teams/:id/join` | Bearer token | Join a team |
| `POST` | `/api/teams/:id/leave` | Bearer token | Leave a team |
| `GET`, `POST` | `/api/activities` | Bearer token | List or log personal activities |
| `DELETE` | `/api/activities/:id` | Bearer token | Delete a personal activity |
| `GET` | `/api/leaderboard` | No | List ranked activity points |
| `GET`, `POST` | `/api/workouts` | `POST` requires token | List or add workout plans |
| `GET` | `/api/workouts/recommended` | Bearer token | Recommend plans using goals and recent activity |

Protected endpoints use `Authorization: Bearer <token>`. Activity points are
calculated as duration in minutes plus 10 points per kilometer, rounded to a
whole number.
