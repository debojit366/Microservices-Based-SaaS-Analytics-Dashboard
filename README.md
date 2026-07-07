Microservices-Based SaaS Analytics Dashboard

A microservices-based analytics platform for SaaS products. Incoming data is ingested through a dedicated service, queued for asynchronous processing, and turned into reports/metrics by a worker service — with MongoDB, RabbitMQ, and Redis backing the system, all orchestrated via Docker Compose.

🏗️ Architecture

                ┌───────────────────────┐
                │   analytics-dashboard │   (frontend UI)
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │    ingestion-service   │  :5001
                │  (receives incoming    │
                │   analytics events)    │
                └───────────┬───────────┘
                            │  publishes events
                            ▼
                  ┌───────────────────┐
                  │     RabbitMQ       │  :5672 (broker)
                  │   (message queue)  │  :15672 (mgmt UI)
                  └─────────┬─────────┘
                            │  consumes events
                            ▼
                ┌───────────────────────┐
                │     report-service     │  :5002
                │ (processes events into │
                │   reports & metrics)   │
                └──────┬───────────┬─────┘
                       │           │
                       ▼           ▼
              ┌──────────────┐ ┌──────────┐
              │   MongoDB    │ │  Redis   │
              │  :27017      │ │  :6379   │
              │ (persistence)│ │ (caching/│
              │              │ │  rate    │
              │              │ │  limiting)│
              └──────────────┘ └──────────┘

🧩 Services

ServiceDescriptionPort(s)analytics-dashboardFrontend client for viewing analytics/reports—ingestion-serviceReceives incoming data/events and publishes them to RabbitMQ5001report-serviceBackground worker that consumes queued events, generates reports, and persists results5002MongoDBPrimary data store for processed analytics data27017RabbitMQMessage broker connecting the ingestion and report services (includes management UI)5672, 15672RedisCaching and rate limiting6379


analytics-dashboard is not currently wired into docker-compose.yml — see its own folder for setup/run instructions, or serve it with your preferred static/Node server.



🛠️ Tech Stack


Language: JavaScript (Node.js)
Messaging: RabbitMQ
Database: MongoDB
Caching: Redis
Containerization: Docker & Docker Compose


📋 Prerequisites


Docker and Docker Compose
Node.js (only needed if you want to run a service outside of Docker)


🚀 Getting Started


Clone the repository


bash   git clone https://github.com/debojit366/Microservices-Based-SaaS-Analytics-Dashboard.git
   cd Microservices-Based-SaaS-Analytics-Dashboard


Start the backend infrastructure and services


bash   docker-compose up --build

This spins up:


MongoDB on localhost:27017
RabbitMQ on localhost:5672 (management UI at localhost:15672, default user/pass: guest / guest)
Redis on localhost:6379
ingestion-service on localhost:5001
report-service on localhost:5002



Run the dashboard
From the analytics-dashboard directory, follow its own setup steps (e.g. install dependencies and start it with Node, or open it with a static file server), since it isn't included in docker-compose.yml yet.
Stop everything


bash   docker-compose down

⚙️ Environment Variables

These are set automatically by docker-compose.yml for the containerized services:

ServiceVariableDefault (Docker)ingestion-servicePORT5001ingestion-serviceRABBITMQ_URLamqp://rabbitmq:5672report-serviceRABBITMQ_URLamqp://rabbitmq:5672report-serviceMONGO_URImongodb://mongo:27017/analytics_dbreport-serviceREDIS_URLredis://redis:6379

If running a service outside Docker, point these at localhost instead of the service names (e.g. amqp://localhost:5672).

📁 Project Structure

Microservices-Based-SaaS-Analytics-Dashboard/
├── analytics-dashboard/   # Frontend dashboard client
├── ingestion-service/     # Ingests incoming data, publishes to RabbitMQ
├── report-service/        # Consumes events, generates reports, persists to MongoDB/Redis
├── docker-compose.yml     # Orchestrates all services and infrastructure
└── .gitignore

🗺️ Roadmap Ideas


 Add analytics-dashboard as a service in docker-compose.yml
 Add authentication/authorization across services
 Add automated tests and CI
 Document ingestion API endpoints and event schema


🤝 Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

📄 License

No license has been specified for this repository yet. Add a LICENSE file if you intend to make usage terms explicit.
