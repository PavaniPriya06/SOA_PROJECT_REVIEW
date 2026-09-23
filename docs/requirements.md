# BidSphere — Requirements & Specification (Review 1)

## Project overview
BidSphere is a microservices-based auction platform. This document summarizes the core problem, functional requirements, microservice boundaries, and acceptance criteria relevant to Review 1.

## Problem statement
Enable users to create auctions, place bids, and complete payments while providing a secure authentication service and scalable routing via an API Gateway and service discovery.

## Goals
- Provide secure JWT-based authentication and user management.
- Expose services through an API Gateway with routing and basic authorization.
- Use Eureka for service discovery to enable dynamic routing between services.
- Deliver a responsive React frontend (Vite) that consumes backend APIs.

## Microservices
- `auth-service` — User registration, login, JWT issuance and validation.
- `api-gateway` — Edge routing, centralized policies, and request forwarding.
- `eureka-server` — Service registry for discovery.
- (future) `auction-service`, `bidding-service`, `payment-service` — Business logic and persistence.

## Key APIs (auth-service)
- POST `/api/auth/register` — body: `{ name, email, password, role }` — returns 201 + message.
- POST `/api/auth/login` — body: `{ email, password }` — returns 200 + `{ token, userId, name, email }`.
- GET `/api/auth/me` — header: `Authorization: Bearer <token>` — returns current user info.

## Security & Configuration
- JWT secret must be supplied via environment variable `JWT_SECRET`. Example (Linux/Windows PowerShell):

  ```bash
  export JWT_SECRET=your-very-secret-key
  # or (PowerShell)
  $env:JWT_SECRET = 'your-very-secret-key'
  ```

- Token expiry is configurable via `JWT_EXPIRATION_MS` (default 86400000 ms).
- Use HTTPS and secure cookie flags in production.

## API Gateway
- Define gateway routes for each microservice (path-based or host-based).
- Forward `Authorization` header and validate JWT at gateway or downstream depending on policy.

## Acceptance criteria (mapped to Review‑1 rubric)
- Problem spec: repository contains this `docs/requirements.md` and a short README describing intent. (Score 5→7)
- Microservices: modules exist and register with Eureka; basic discovery demonstrated. (Score 7)
- JWT authentication: implemented with tests; secret provided via env variable recommended. (Score 7→10 with refresh tokens)
- API Gateway: module present; add route config to reach score 7+. (Score 5)
- Article: draft located at `docs/linkedin-dti-article.md` to submit/publish. (Score 0→10 when posted)

## Next engineering tasks
1. Move JWT secret into environment (CI/CD secrets) and remove insecure defaults.
2. Add API Gateway routes configuration (application.yml or Java config) and sample policy for auth.
3. Add an integration test that boots `eureka-server`, `auth-service` (embedded) and verifies discovery + routing.
4. Publish LinkedIn DTI article and link it from README.
