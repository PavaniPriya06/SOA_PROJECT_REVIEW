# Auction Service

Real-Time Distributed Bidding & Auction Clearance Engine - Auction Microservice

## Overview

This is a Spring Boot microservice that manages auctions in the bidding system. It handles auction creation, status management, and retrieval of auction information.

## Technology Stack

- **Spring Boot** 3.3.13
- **Spring Data JPA** - ORM/Database access
- **Spring Cloud Eureka** - Service discovery and registration
- **PostgreSQL** - Relational database
- **Java** 17

## Project Structure

```
com.bidvelocity.auction
├── AuctionServiceApplication.java
├── controller
│   └── AuctionController.java
├── service
│   └── AuctionService.java
├── repository
│   └── AuctionRepository.java
├── entity
│   ├── Auction.java
│   └── AuctionStatus.java
└── exception
    ├── AuctionNotFoundException.java
    ├── InvalidAuctionOperationException.java
    └── GlobalExceptionHandler.java
```

## Configuration

### Port
- **Server Port**: 8082

### Database
- **URL**: `jdbc:postgresql://localhost:5432/auctiondb`
- **Username**: `postgres` (configurable via `DB_USERNAME` env var)
- **Password**: `postgres` (configurable via `DB_PASSWORD` env var)

### Eureka Registration
- **Eureka URL**: `http://localhost:8761/eureka/`
- **Service Name**: `auction-service`

## Prerequisites

1. **Java 17+** installed
2. **PostgreSQL** installed and running on `localhost:5432`
3. **Eureka Server** running on `http://localhost:8761`
4. PostgreSQL database named `auctiondb` created

## Building the Service

```bash
# Navigate to auction-service directory
cd backend/auction-service

# Build with Maven
./mvnw clean package
```

## Running the Service

### Option 1: Using Maven directly
```bash
cd backend/auction-service
./mvnw spring-boot:run
```

### Option 2: Running JAR file
```bash
cd backend/auction-service
./mvnw clean package
java -jar target/auction-service-0.0.1-SNAPSHOT.jar
```

### Option 3: Setting environment variables
```bash
# For PostgreSQL credentials
export DB_USERNAME=postgres
export DB_PASSWORD=your_password

# Then run
./mvnw spring-boot:run
```

## API Endpoints

All endpoints are under `/auctions` base path.

### 1. Create Auction
```
POST /auctions
Content-Type: application/json

{
  "itemName": "Vintage Watch",
  "startingPrice": 100.00,
  "startTime": "2024-10-01T10:00:00",
  "endTime": "2024-10-01T18:00:00",
  "sellerId": "seller123"
}

Response: 201 Created
{
  "auctionId": 1,
  "itemName": "Vintage Watch",
  "startingPrice": 100.00,
  "startTime": "2024-10-01T10:00:00",
  "endTime": "2024-10-01T18:00:00",
  "sellerId": "seller123",
  "status": "UPCOMING"
}
```

### 2. Get All Auctions
```
GET /auctions

Response: 200 OK
[
  {
    "auctionId": 1,
    "itemName": "Vintage Watch",
    "startingPrice": 100.00,
    "startTime": "2024-10-01T10:00:00",
    "endTime": "2024-10-01T18:00:00",
    "sellerId": "seller123",
    "status": "UPCOMING"
  },
  ...
]
```

### 3. Get Auction by ID
```
GET /auctions/{id}

Response: 200 OK
{
  "auctionId": 1,
  "itemName": "Vintage Watch",
  "startingPrice": 100.00,
  "startTime": "2024-10-01T10:00:00",
  "endTime": "2024-10-01T18:00:00",
  "sellerId": "seller123",
  "status": "UPCOMING"
}
```

### 4. Get Active Auctions
```
GET /auctions/active

Response: 200 OK
[
  {
    "auctionId": 1,
    "itemName": "Vintage Watch",
    "startingPrice": 100.00,
    "startTime": "2024-10-01T10:00:00",
    "endTime": "2024-10-01T18:00:00",
    "sellerId": "seller123",
    "status": "ACTIVE"
  },
  ...
]
```

### 5. Start Auction
```
PUT /auctions/{id}/start

Response: 200 OK
{
  "auctionId": 1,
  "itemName": "Vintage Watch",
  "startingPrice": 100.00,
  "startTime": "2024-10-01T10:00:00",
  "endTime": "2024-10-01T18:00:00",
  "sellerId": "seller123",
  "status": "ACTIVE"
}
```

### 6. Close Auction
```
PUT /auctions/{id}/close

Response: 200 OK
{
  "auctionId": 1,
  "itemName": "Vintage Watch",
  "startingPrice": 100.00,
  "startTime": "2024-10-01T10:00:00",
  "endTime": "2024-10-01T18:00:00",
  "sellerId": "seller123",
  "status": "ENDED"
}
```

## Error Handling

The service includes global exception handling that returns meaningful error messages with appropriate HTTP status codes.

### Common Error Responses

**404 Not Found**
```json
{
  "timestamp": "2024-10-01T12:30:45.123456",
  "status": 404,
  "error": "Not Found",
  "message": "Auction with ID 999 not found.",
  "path": "/auctions/999"
}
```

**400 Bad Request** (Invalid Operation)
```json
{
  "timestamp": "2024-10-01T12:30:45.123456",
  "status": 400,
  "error": "Invalid Operation",
  "message": "End time must be after start time.",
  "path": "/auctions"
}
```

**400 Bad Request** (Validation Error)
```json
{
  "timestamp": "2024-10-01T12:30:45.123456",
  "status": 400,
  "error": "Validation Error",
  "message": {
    "itemName": "Item name cannot be blank",
    "startingPrice": "Starting price must be positive"
  },
  "path": "/auctions"
}
```

## Business Rules

1. ✅ New auctions are created with status `UPCOMING`
2. ✅ Starting an auction changes status to `ACTIVE`
3. ✅ Closing an auction changes status to `ENDED`
4. ✅ Cannot start an already `ENDED` auction
5. ✅ Cannot close an already closed auction
6. ✅ Validates that `endTime` is after `startTime`
7. ✅ Returns proper HTTP status codes and meaningful error messages
8. ✅ Uses service layer for business logic
9. ✅ Uses constructor injection
10. ✅ Implements global exception handling with `@ControllerAdvice`

## Testing

### Using curl

```bash
# Create an auction
curl -X POST http://localhost:8082/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Laptop",
    "startingPrice": 500.00,
    "startTime": "2024-10-05T14:00:00",
    "endTime": "2024-10-05T20:00:00",
    "sellerId": "user456"
  }'

# Get all auctions
curl http://localhost:8082/auctions

# Get auction by ID
curl http://localhost:8082/auctions/1

# Get active auctions
curl http://localhost:8082/auctions/active

# Start auction
curl -X PUT http://localhost:8082/auctions/1/start

# Close auction
curl -X PUT http://localhost:8082/auctions/1/close
```

### Using Postman

1. Import the requests from the base frontend repository
2. Create new requests for the Auction Service endpoints above
3. Test each endpoint with sample data

## Database Schema

The service uses JPA with `hibernate.ddl-auto=update`, which automatically creates/updates tables based on entity definitions.

**Table: auctions**
```sql
CREATE TABLE auctions (
  auction_id BIGSERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  starting_price DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  seller_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  CONSTRAINT auctions_status_check
    CHECK (status IN ('UPCOMING', 'ACTIVE', 'ENDED', 'CLOSED'))
);
```

## Logging

The service logs SQL queries and Hibernate behavior. Adjust logging levels in `application.properties`:

```properties
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

## Service Registration with Eureka

Once the service starts, it automatically registers with Eureka Server. You can verify registration at:
```
http://localhost:8761
```

Under "Registered Services", you should see `AUCTION-SERVICE` listed.

## Integration with API Gateway

The API Gateway at `http://localhost:8080` can route requests to this service:

```
http://localhost:8080/auction-service/auctions
```

The gateway uses service discovery to route to the AuctionService instance.

## Development Notes

- The service uses **constructor injection** for all dependencies
- Bean validation is applied using Jakarta Bean Validation annotations
- SQL queries are formatted and displayed in logs for debugging
- CrossOrigin is enabled for frontend integration
- Transactions are managed automatically with `@Transactional`

## Support

For issues or questions, refer to the project documentation or check Eureka Server status at `http://localhost:8761`.
