# Eureka Server for BidSphere

## What is Eureka Server?

Eureka Server is a service discovery component built with Spring Cloud Netflix Eureka. It acts as a registry where microservices can register themselves and discover other services dynamically.

In a microservice architecture, each service does not need to know the exact IP address or port of every other service in advance. Instead, they register with Eureka and get service metadata from the registry.

## Why BidSphere needs Eureka

BidSphere is designed as a distributed auction platform with multiple backend services. As the system grows, services such as Auth, Auction, Bidding, and Payment need to communicate with each other without hardcoding network locations.

Eureka provides:
- service registration
- service discovery
- load balancing-friendly service metadata
- a central registry for the BidSphere backend ecosystem

This is the foundation for the future microservice-based architecture.

## How microservices will register with Eureka

Each future microservice will include Spring Cloud Eureka client dependencies and connect to the Eureka Server using its configuration. Once the service starts, it will register itself with the registry through the configured Eureka URL.

Typical configuration for a future service:

```properties
spring.application.name=auth-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

That service will then appear in the Eureka dashboard as an instance under the `AUTH-SERVICE` name (or similar), allowing other services to discover it automatically.

## How to run the server

From the `backend/eureka-server` directory:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The application starts on port `8761`.

## Eureka dashboard URL

Open the following URL in a browser:

```text
http://localhost:8761
```

When no services are registered yet, the dashboard will show:

```text
No instances currently registered
```

## Future BidSphere architecture

```text
React Frontend
      ↓
API Gateway
      ↓
Eureka Server
      ↓
Auth Service
Auction Service
Bidding Service
Payment Service
```

This project initializes the discovery layer only. The API Gateway and individual backend microservices will be added in future stages.
