# Truth Layer Backend

Spring Boot backend for the Truth Layer application.

## Requirements

- Java 21
- Maven 3.9+ or an IDE with Maven support
- Docker Desktop for PostgreSQL

## Run dependencies

```bash
docker compose up -d postgres
```

## Run the API

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

- Health: `GET /actuator/health`
- OpenAPI: `http://localhost:8080/swagger-ui.html`
- API prefix: `/api/v1`

## Configuration

Environment variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET` (use a unique secret of at least 32 bytes outside local development)
- `FRONTEND_ORIGIN`
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_APP_ID`
- `GITHUB_APP_SLUG`
- `GITHUB_PRIVATE_KEY` (server-side PEM value; never expose to the frontend)
- `GITHUB_SETUP_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `TOKEN_ENCRYPTION_KEY` (base64-encoded 32-byte key for OAuth tokens)
- `AI_PROVIDER` (`disabled` by default or `anthropic`)
- `AI_API_KEY` (required when Anthropic is enabled)
- `AI_MODEL`
- `PORT`

The frontend can opt into the backend with:

```text
VITE_API_BASE_URL=http://localhost:8080
```

When this variable is absent, the frontend continues to use its existing mock API.
