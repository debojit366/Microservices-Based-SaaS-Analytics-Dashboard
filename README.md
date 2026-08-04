# 📊 Microservices-Based SaaS Analytics Dashboard

A microservices-based analytics platform for SaaS products. Incoming events are ingested through a dedicated service, queued for asynchronous processing via RabbitMQ, aggregated and persisted by a worker service, and served to a React dashboard through a dedicated reporting API — all backed by MongoDB and Redis, and orchestrated with Docker Compose.

---

## 🏗️ Architecture

```
                    ┌──────────────────────────┐
                    │    analytics-dashboard    │  :5173  (React + Vite)
                    └─────────────┬─────────────┘
                        │ signup/login          │ fetch reports
                        ▼                       ▼
            ┌───────────────────┐   ┌───────────────────┐
            │    auth-service    │   │   report-service   │
            │  :5003 (JWT + API  │   │  :5004 (reports &  │
            │   key management)  │   │   chart data API)  │
            └─────────┬──────────┘   └─────────┬──────────┘
                      │                         │
                      │        ┌────────────────┘
                      ▼        ▼
            ┌────────────────────────┐
            │   ingestion-service     │  :5001
            │ (receives & validates   │
            │  incoming analytics     │
            │  events via API key)    │
            └────────────┬────────────┘
                          │ publishes events
                          ▼
                ┌───────────────────┐
                │     RabbitMQ       │  :5672 (broker)
                │   (message queue)  │  :15672 (mgmt UI)
                └─────────┬──────────┘
                          │ consumes events
                          ▼
            ┌────────────────────────┐
            │    analytics-service    │
            │ (worker: consumes queue,│
            │  aggregates & persists) │
            └──────┬────────────┬─────┘
                   ▼            ▼
          ┌──────────────┐ ┌──────────┐
          │   MongoDB    │ │  Redis   │
          │  :27017      │ │  :6379   │
          │ (persistence)│ │ (caching/│
          │              │ │  rate    │
          │              │ │  limiting)│
          └──────────────┘ └──────────┘
```

---

## 🧩 Services

| Service | Description | Port |
|---|---|---|
| **analytics-dashboard** | React (Vite) frontend for signup/login and viewing analytics reports/charts | 5173 |
| **auth-service** | Handles signup, login, JWT access/refresh tokens, and issues per-user API keys | 5003 |
| **ingestion-service** | Receives incoming analytics events (authenticated via API key), rate-limits, and publishes them to RabbitMQ | 5001 |
| **analytics-service** | Background worker that consumes queued events, writes raw events + daily aggregations to MongoDB, and warms the Redis cache | — (no HTTP API) |
| **report-service** | Authenticated (JWT) API that serves summary stats, chart data, and recent events for the dashboard | 5004 |
| **MongoDB** | Primary data store (`analytics_db`) shared across services | 27017 (exposed on host as 27018) |
| **RabbitMQ** | Message broker connecting ingestion → analytics-service (includes management UI) | 5672, 15672 |
| **Redis** | Caching, rate limiting, and recent-events list cache | 6379 |
| **RedisInsight** | Optional GUI for inspecting Redis data (dev/debug only) | 5540 |

---

## 🔄 Data Flow

1. User signs up / logs in via **auth-service** → receives a short-lived **access token** (15m), a **refresh token** (httpOnly cookie, 7d), and a permanent **API key**.
2. Client app sends analytics events to **ingestion-service** (`POST /api/v1/analytics/track`) using the `x-api-key` header.
3. Ingestion-service validates the key (Redis-cached, MongoDB fallback), rate-limits the request, and publishes the event to the `analytics_events` RabbitMQ queue.
4. **analytics-service** consumes the queue, saves the raw event and updates the day's aggregation counters in MongoDB, and refreshes the user's recent-events cache in Redis.
5. Dashboard calls **report-service** (`GET /api/v1/reports`, JWT-protected) to fetch summary stats, chart-ready data, and recent events (Redis-first, MongoDB fallback).

---

## 🛠️ Tech Stack

- **Language:** JavaScript (Node.js, ES Modules)
- **Frontend:** React 19 + Vite + Tailwind CSS + Recharts
- **Messaging:** RabbitMQ (`amqplib`)
- **Database:** MongoDB (`mongoose`)
- **Caching / Rate Limiting:** Redis (`redis`, `rate-limit-redis`)
- **Auth:** JWT (access + refresh tokens) + API keys, `bcrypt` for password hashing
- **Containerization:** Docker & Docker Compose

---

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 22+ (only needed if you want to run a service outside Docker)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/debojit366/Microservices-Based-SaaS-Analytics-Dashboard.git
cd Microservices-Based-SaaS-Analytics-Dashboard
```

### 2. Set up environment variables

Create a `.env` file (or export these in your shell) before running Compose — see [Environment Variables](#️-environment-variables) below. At minimum, set proper values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### 3. Start everything

```bash
docker-compose up --build
```

This spins up:

- MongoDB on `localhost:27018` (internal: `mongo:27017`)
- RabbitMQ on `localhost:5672` (management UI at `localhost:15672`, default user/pass: `guest` / `guest`)
- Redis on `localhost:6379`
- RedisInsight on `localhost:5540`
- `auth-service` on `localhost:5003`
- `ingestion-service` on `localhost:5001`
- `analytics-service` (background worker, no exposed port)
- `report-service` on `localhost:5004`
- `analytics-dashboard` on `localhost:5173`

### 4. Open the dashboard

Visit **http://localhost:5173**, sign up for an account, and start sending events to the ingestion API using the API key shown after signup.

### 5. Stop everything

```bash
docker-compose down
```

---

## ⚙️ Environment Variables

| Service | Variable | Default (Docker) | Notes |
|---|---|---|---|
| ingestion-service | `PORT` | `5001` | |
| ingestion-service | `RABBITMQ_URL` | `amqp://rabbitmq:5672` | |
| ingestion-service | `REDIS_URL` | `redis://redis:6379` | Used for API-key cache + rate limiter |
| auth-service | `PORT` | `5003` | |
| auth-service | `MONGO_URI` | `mongodb://mongo:27017/analytics_db` | |
| auth-service | `REDIS_URL` | `redis://redis:6379` | |
| auth-service | `JWT_ACCESS_SECRET` | *(must be set — not defaulted)* | Signing secret for short-lived access tokens |
| auth-service | `JWT_REFRESH_SECRET` | *(must be set — not defaulted)* | Signing secret for refresh tokens |
| analytics-service | `RABBITMQ_URL` | `amqp://rabbitmq:5672` | |
| analytics-service | `MONGO_URI` | `mongodb://mongo:27017/analytics_db` | |
| analytics-service | `REDIS_URL` | `redis://redis:6379` | |
| analytics-service | `QUEUE_NAME` | `analytics_events` | **Must match** the queue name used by ingestion-service |
| report-service | `PORT` | `5004` | |
| report-service | `MONGO_URI` | `mongodb://mongo:27017/analytics_db` | |
| report-service | `REDIS_URL` | `redis://redis:6379` | |
| report-service | `JWT_ACCESS_SECRET` | *(must be set — not defaulted)* | Must match auth-service's secret |
| analytics-dashboard | `VITE_API_URL` | — | Should point to a **host-reachable** URL (e.g. `http://localhost:5003`), not an internal Docker hostname |

> ⚠️ **Note:** `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are **not currently defined** in `docker-compose.yml` (only a generic `JWT_SECRET` is). Add them explicitly before running in any shared/production environment — do not rely on code-level fallback defaults.

If running a service outside Docker, point these at `localhost` instead of the service names (e.g. `amqp://localhost:5672`, `mongodb://localhost:27018/analytics_db`).

---

## 📡 API Endpoints

### auth-service (`:5003/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Create account, returns access token + API key, sets refresh-token cookie |
| POST | `/login` | Authenticate, returns access token + API key, sets refresh-token cookie |
| POST | `/refresh` | Rotate refresh token using the httpOnly cookie, returns new access token |
| POST | `/logout` | Invalidates the stored refresh token |

### ingestion-service (`:5001/api/v1/analytics`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/track` | `x-api-key` header | Accepts `{ eventType, ...metadata }`, queues the event (rate-limited to 10 req/min) |

### report-service (`:5004/api/v1`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports?startDate=&endDate=` | `Authorization: Bearer <access token>` | Returns summary stats, chart data, and recent events for the logged-in user |

---

## 📁 Project Structure

```
Microservices-Based-SaaS-Analytics-Dashboard/
├── analytics-dashboard/   # React (Vite) frontend
├── auth-service/          # Signup/login, JWT + API key issuance
├── ingestion-service/     # Receives events, publishes to RabbitMQ
├── analytics-service/     # Worker: consumes queue, aggregates & persists
├── report-service/        # Serves reports/charts to the dashboard (JWT-protected)
├── docker-compose.yml     # Orchestrates all services and infrastructure
└── .gitignore
```

---

## 🗺️ Roadmap

- [ ] Explicitly define `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in `docker-compose.yml`
- [ ] Fix `VITE_API_URL` to use a browser-reachable host, not an internal Docker hostname
- [ ] Add a Dead Letter Queue for messages that fail processing in analytics-service
- [ ] Add idempotency handling for at-least-once RabbitMQ delivery
- [ ] Add automated tests and CI
- [ ] Add an API Gateway / reverse proxy in front of all services
- [ ] Add centralized logging and metrics (e.g. ELK, Prometheus/Grafana)

---

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

## 📄 License

No license has been specified for this repository yet. Add a `LICENSE` file if you intend to make usage terms explicit.
