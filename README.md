# Skill Tournaments — Dev Guide

## Docker Compose

```bash
# Build all services
docker compose -f docker-compose.develop.yml build

# Build without cache (use when dependencies change)
docker compose -f docker-compose.develop.yml build --no-cache

# Start everything
docker compose -f docker-compose.develop.yml up -d

# Stop everything
docker compose -f docker-compose.develop.yml down

# Logs for a specific service
docker compose -f docker-compose.develop.yml logs gateway --tail=30
docker compose -f docker-compose.develop.yml logs tournament-service --tail=30
docker compose -f docker-compose.develop.yml logs user-service --tail=30
```

---

## Dev Tools

| Tool        | URL                    | Description                        |
|-------------|------------------------|------------------------------------|
| Dozzle      | http://localhost:9999  | Live logs for all containers       |
| Kafka UI    | http://localhost:8090  | Topics, messages, consumer groups  |
| Adminer     | http://localhost:8080  | PostgreSQL UI                      |
| NATS Box    | `docker logs nats-box` | Live NATS message stream           |

**Adminer** — login: System: `PostgreSQL`, Server: `postgres`, User: `postgres`, Password: `postgres`, DB: `tournaments`

---

## API Examples

### Command — Join tournament

```bash
# player-001 joins
clear && curl -X POST http://localhost:3000/tournaments/join \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-001",
    "gameType": "chess",
    "tournamentType": "ranked",
    "entryFee": 10
  }'

# player-002 joins the same tournament
clear && curl -X POST http://localhost:3000/tournaments/join \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-002",
    "gameType": "chess",
    "tournamentType": "ranked",
    "entryFee": 10
  }'
```

### Query — Get my tournaments

```bash
clear && curl http://localhost:3000/tournaments/players/player-001/tournaments

clear && curl http://localhost:3000/tournaments/players/player-002/tournaments
```

---

## Hardcoded Users (user-service)

| ID         | Username     | Skill | Country |
|------------|--------------|-------|---------|
| player-001 | dragonSlayer | 1500  | BG      |
| player-002 | nightOwl     | 1800  | DE      |
| player-003 | speedRunner  | 2100  | US      |
| player-004 | proGamer99   | 950   | FR      |
| player-005 | ironFist     | 1650  | BG      |

---

## Architecture

**Gateway** — NestJS HTTP server on port 3000. Accepts REST requests, validates them, and forwards to tournament-service via **Kafka** (request-reply pattern). No database.

**Tournament Service** — NestJS Kafka consumer. Handles commands and queries from the gateway. Fetches user info from user-service via **NATS** when needed. Reads and writes tournament data to PostgreSQL.

**User Service** — NestJS NATS microservice. Serves hardcoded users. Responds to `user.get_by_id` requests from tournament-service.

```
HTTP          Kafka                    NATS
Client ──► Gateway ──► Tournament ──► User
                       Service        Service
                          │
                       PostgreSQL
```

### Kafka Topics

| Topic                                   | Direction            | Type    |
|-----------------------------------------|----------------------|---------|
| `tournament.join.command`               | gateway → tournament | Command |
| `tournament.join.command.reply`         | tournament → gateway | Reply   |
| `tournament.my-tournaments.query`       | gateway → tournament | Query   |
| `tournament.my-tournaments.query.reply` | tournament → gateway | Reply   |

### NATS Patterns

| Pattern          | Direction                         |
|------------------|-----------------------------------|
| `user.get_by_id` | tournament-service → user-service |