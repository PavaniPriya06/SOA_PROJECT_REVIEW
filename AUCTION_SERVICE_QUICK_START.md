# Quick Start Guide - AuctionService

## One-Command Startup

```bash
cd backend/auction-service
.\mvnw spring-boot:run
```

Service runs on: **http://localhost:8082**

---

## Quick API Tests (Copy & Paste)

### 1️⃣ Create Auction
```bash
curl -X POST http://localhost:8082/auctions \
  -H "Content-Type: application/json" \
  -d "{\"itemName\": \"Laptop\", \"startingPrice\": 500, \"startTime\": \"2024-10-05T10:00:00\", \"endTime\": \"2024-10-05T18:00:00\", \"sellerId\": \"seller123\"}"
```

### 2️⃣ List All Auctions
```bash
curl http://localhost:8082/auctions
```

### 3️⃣ Get Auction by ID (replace 1 with actual ID)
```bash
curl http://localhost:8082/auctions/1
```

### 4️⃣ Get Active Auctions
```bash
curl http://localhost:8082/auctions/active
```

### 5️⃣ Start Auction
```bash
curl -X PUT http://localhost:8082/auctions/1/start
```

### 6️⃣ Close Auction
```bash
curl -X PUT http://localhost:8082/auctions/1/close
```

---

## Key Files Location

| Component | File Path |
|-----------|-----------|
| **Entity** | `backend/auction-service/src/main/java/com/bidvelocity/auction/entity/Auction.java` |
| **Repository** | `backend/auction-service/src/main/java/com/bidvelocity/auction/repository/AuctionRepository.java` |
| **Service** | `backend/auction-service/src/main/java/com/bidvelocity/auction/service/AuctionService.java` |
| **Controller** | `backend/auction-service/src/main/java/com/bidvelocity/auction/controller/AuctionController.java` |
| **Config** | `backend/auction-service/src/main/resources/application.properties` |
| **Build** | `backend/auction-service/pom.xml` |

---

## Database Connection

- **URL**: jdbc:postgresql://localhost:5432/auctiondb
- **User**: postgres (default)
- **Password**: postgres (default)
- **Auto-create**: Yes (Hibernate ddl-auto=update)

---

## Eureka Registration

Verify at: **http://localhost:8761**

Look for **AUCTION-SERVICE** in the dashboard

---

## REST API Status Codes

| Operation | Status |
|-----------|--------|
| Create | **201** Created |
| Read | **200** OK |
| Update | **200** OK |
| Bad Request | **400** Bad Request |
| Not Found | **404** Not Found |
| Error | **500** Internal Server Error |

---

## Architecture Overview

```
Frontend (React)
       ↓
API Gateway (8080)
       ↓
AuctionService (8082)
       ↓
PostgreSQL Database
       
Eureka Discovery (8761)
  └─ Registers all services
```

---

## Status Flow

```
Created: UPCOMING
   ↓
Start: UPCOMING → ACTIVE
   ↓
Close: ACTIVE → ENDED
```

---

## Business Rules Summary

✅ New auctions = UPCOMING status  
✅ Cannot start ENDED auction  
✅ Cannot close already closed auction  
✅ End time must be after start time  
✅ Seller ID required  
✅ Starting price must be positive  
✅ Item name required  

---

## Next Microservices to Create

1. **BiddingService** (Port 8083) - Manage bids
2. **PaymentService** (Port 8084) - Process payments
3. **NotificationService** (Port 8085) - Send alerts
4. **UserService** (Port 8086) - User management

---

**AuctionService Status: ✅ COMPLETE AND READY FOR TESTING**
