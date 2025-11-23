# PulseStream - Pet project
> High-Throughput Analytics Ingestion Engine

**PulseStream** is a scalable backend system designed to handle high-velocity event ingestion (clickstreams, logs, IoT data) without crashing the database.

It uses a **Write-Behind (Buffering)** pattern to decouple ingestion from persistence, achieving **4k+ requests/second** on a single node with <20ms latency.

## Architecture

[Client] -> [NestJS API] -> [Redis Queue (O(1))] -> [Worker] -> [Bulk Insert] -> [Postgres]

1. **Ingestion**: API accepts requests instantly and pushes to a Redis List (`LPUSH`).
2. **Buffering**: Redis acts as a shock absorber for traffic spikes.
3. **Persistence**: A background worker pulls batches (1000 items) and performs a single bulk SQL insert (`INSERT INTO ... VALUES ...`).
4. **Analytics**: Kysely is used for optimized time-series aggregation queries.

## Performance Results (k6 Load Test)

- **Throughput**: ~3,900 reqs/sec
- **Latency (p95)**: 20.8ms
- **Database Load**: <10% CPU (vs 70% with direct inserts)

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL, Kysely (Query Builder)
- **Caching/Queues**: Redis (ioredis)
- **Frontend**: React, TailwindCSS v4, Recharts
- **Infrastructure**: Docker Compose


## Necessary ENVS
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- REDIS_HOST
- REDIS_PORT 

## How to Run

1. `docker-compose up -d`
2. `npm install`
3. `npm run migrate`
4. `npm run start:dev`
5. `cd frontend`
6. `npm install`
7. `npm run dev`
8. `run type loadtest.js | k6 run - or k6 run "loadtest.js"`


 