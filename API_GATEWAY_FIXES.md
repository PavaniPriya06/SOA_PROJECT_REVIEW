# API Gateway Bug Fixes and Configuration Corrections

## Summary
Fixed **5 critical configuration errors** in the API Gateway that would prevent proper routing to microservices.

---

## Errors Found and Fixed

### 1. ❌ **Duplicate `spring:` Key in YAML** 
**Severity:** CRITICAL (Configuration Parse Error)

**File:** `backend/api-gateway/src/main/resources/application.yml`

**Issue:**
```yaml
spring:
  application:
    name: api-gateway          # First spring: key
    
spring:                        # ❌ Second spring: key (DUPLICATED)
  cloud:
    gateway: ...
```

**Fix:** Merged both `spring:` configurations into a single section maintaining proper YAML hierarchy.

---

### 2. ❌ **Service Name Mismatch**
**Severity:** HIGH (Routing Failure)

**Issue:** Service names were inconsistent across configurations:
- YAML routes: `lb://auth-service` (lowercase)
- Java config: `lb://AUTH-SERVICE` (uppercase)

**Problem:** This mismatch could cause routing failures or unexpected behavior.

**Fix:** 
- Kept Java config with uppercase names (`AUTH-SERVICE`, `AUCTION-SERVICE`, etc.)
- Added `lower-case-service-id: true` in YAML to ensure consistent lookup
- Service names now correctly convert to lowercase during Eureka discovery lookup

---

### 3. ❌ **Missing Routes in Configuration**
**Severity:** MEDIUM (Incomplete Routing)

**Issue:** YAML defined only 2 routes (auth, auction) but Java config defined 4 routes:
- ❌ Missing: `BIDDING-SERVICE` (bids endpoint)
- ❌ Missing: `PAYMENT-SERVICE` (payments endpoint)

**Fix:** Removed duplicate route definitions from YAML and rely on Java config which is complete and cleaner.

---

### 4. ❌ **Typo in Request Header Filter**
**Severity:** LOW (Formatting Issue)

**Issue:** Extra space in header name:
```yaml
AddRequestHeader= X-Forwarded-Proto,https  # ❌ Space before X-Forwarded-Proto
```

**Fix:** Removed duplicate/incorrect filter entries.

---

### 5. ❌ **Conflicting Configuration Files**
**Severity:** MEDIUM (Unpredictable Behavior)

**Issue:** Both `application.properties` and `application.yml` exist with overlapping configs
- Spring Boot processes both files, causing potential conflicts

**Fix:** 
- Disabled `application.properties` 
- Moved all configuration to `application.yml`
- Single source of truth for configuration

---

## Current Configuration

### API Gateway Routes (via Java Config)

| Route ID | Path Pattern | Target Service | Port |
|----------|--------------|-----------------|------|
| auth-route | `/api/auth/**` | AUTH-SERVICE | 8081 |
| auctions-route | `/api/auctions/**` | AUCTION-SERVICE | TBD |
| bids-route | `/api/bids/**` | BIDDING-SERVICE | TBD |
| payments-route | `/api/payments/**` | PAYMENT-SERVICE | TBD |

**Gateway Port:** 8080

### Path Rewriting
All routes use regex-based path rewriting to strip the `/api/{service}` prefix:
```
/api/auth/login → /login
/api/auctions/list → /list
/api/bids/place → /place
/api/payments/process → /process
```

### Service Discovery
- **Eureka Server:** `http://localhost:8761/eureka/`
- **Service Registration:** Enabled
- **Registry Fetch:** Enabled  
- **Service Name Conversion:** Lowercase (`lower-case-service-id: true`)

---

## Files Modified

1. ✅ `backend/api-gateway/src/main/resources/application.yml` - Fixed YAML structure, removed duplicate routes
2. ✅ `backend/api-gateway/src/main/resources/application.properties` - Disabled in favor of YAML
3. ✅ `backend/api-gateway/src/main/java/com/bidsphere/apigateway/config/GatewayRoutesConfig.java` - No changes (already correct)

---

## Verification Checklist

- [x] YAML syntax is valid (single `spring:` key)
- [x] All 4 routes defined in Java config
- [x] Service names consistent with Eureka registrations
- [x] Path rewriting patterns correct
- [x] Discovery client configuration complete
- [x] No duplicate route definitions

---

## Testing Recommendations

1. Ensure all services are registered in Eureka:
   ```
   http://localhost:8761/
   ```

2. Test routing to each service:
   ```
   curl http://localhost:8080/api/auth/login
   curl http://localhost:8080/api/auctions/list
   curl http://localhost:8080/api/bids/place
   curl http://localhost:8080/api/payments/process
   ```

3. Verify path rewriting works (check backend service logs)

4. Check gateway logs for any routing errors:
   ```
   tail -f logs/api-gateway.log
   ```

---

## Total Issues Fixed: 5
- **Critical:** 1 (YAML syntax error)
- **High:** 1 (Service name mismatch)
- **Medium:** 2 (Missing routes, conflicting config files)
- **Low:** 1 (Filter typo)
