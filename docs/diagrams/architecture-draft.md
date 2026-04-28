# Theatre Reservation App — Architecture Draft

## Purpose

This document describes the current architecture of the **Theatre Reservation App**, a CN6035 distributed mobile application for booking seats in theatre performances.

The system follows a three-tier architecture:

```text
React Native / Expo Mobile Client
        |
        | HTTP/REST requests
        | JWT token for protected operations
        v
Node.js / Express REST API
        |
        | SQL queries via mysql2
        | Transactions for reservation consistency
        v
MariaDB Relational Database
```

---

## 1. Three-Tier Architecture

### 1.1 Mobile Client Layer

The frontend is planned as a React Native / Expo application. It will provide the user-facing mobile interface for:

- user registration,
- user login,
- browsing theatres and performances,
- searching by title, theatre, location, and date,
- viewing showtimes,
- viewing seat availability,
- selecting one or more seats,
- creating reservations,
- viewing reservation history,
- editing or cancelling future reservations.

The mobile client communicates with the backend through HTTP/REST requests. Public endpoints can be accessed without authentication, while reservation-related operations require a JWT token.

Planned secure token storage:

```text
Expo SecureStore
```

This supports the coursework requirement for secure token handling on the mobile device.

---

### 1.2 Backend API Layer

The backend is implemented using Node.js and Express. It acts as the central coordination layer between the mobile client and the MariaDB database.

The backend is responsible for:

- request parsing,
- input validation,
- user registration,
- password hashing with bcrypt,
- user login,
- JWT generation,
- JWT verification,
- public catalogue queries,
- protected reservation operations,
- business rule enforcement,
- transaction-based reservation creation/editing,
- clean JSON error responses.

Implemented backend endpoints include:

| Area | Endpoint |
|---|---|
| System | `GET /health` |
| System | `GET /db-test` |
| Authentication | `POST /register` |
| Authentication | `POST /login` |
| Catalogue | `GET /theatres` |
| Catalogue | `GET /shows` |
| Catalogue | `GET /showtimes?showId=` |
| Catalogue | `GET /seats?showtimeId=` |
| Reservations | `POST /reservations` |
| Reservations | `GET /user/reservations` |
| Reservations | `PUT /reservations/:id` |
| Reservations | `DELETE /reservations/:id` |

Protected endpoints require:

```text
Authorization: Bearer <token>
```

---

## 2. Backend Code Organisation

The backend follows a modular structure:

```text
backend/src/
├─ controllers/
├─ db/
├─ middleware/
├─ routes/
├─ services/
├─ utils/
└─ app.js
```

### routes/

Defines the API paths and connects each endpoint to the relevant controller.

Examples:

```text
authRoutes.js
catalogRoutes.js
reservationRoutes.js
```

### controllers/

Receives HTTP requests, calls the correct service function, and returns JSON responses.

Examples:

```text
authController.js
catalogController.js
reservationController.js
```

### services/

Contains the main business logic and database queries.

Examples:

```text
authService.js
catalogService.js
reservationService.js
```

### middleware/

Handles cross-cutting concerns such as JWT authentication and global error handling.

Examples:

```text
authMiddleware.js
errorHandler.js
```

### db/

Contains the MariaDB connection pool.

Example:

```text
pool.js
```

### utils/

Contains reusable helper functions.

Examples:

```text
asyncHandler.js
httpError.js
jwt.js
```

This separation improves maintainability and supports the coursework marking criterion for clear backend architecture.

---

## 3. Database Layer

The database is implemented using MariaDB. It stores all core theatre reservation entities.

Main tables:

| Table | Role |
|---|---|
| `users` | Registered users |
| `theatres` | Theatre venues |
| `halls` | Halls/stages inside theatres |
| `shows` | Theatre performances |
| `showtimes` | Available dates and times |
| `seat_categories` | Seat categories such as Standard, Premium, and VIP |
| `seats` | Physical seats inside halls |
| `reservations` | Reservation records |
| `reservation_seats` | Link table between reservations and selected seats |

Key relationships:

```text
Theatre 1 ──── * Halls
Theatre 1 ──── * Shows
Show    1 ──── * Showtimes
Hall    1 ──── * Seats
User    1 ──── * Reservations
Showtime 1 ─── * Reservations
Reservation 1 ─── * Reservation Seats
Seat 1 ─── * Reservation Seats
```

---

## 4. Authentication Flow

The authentication flow is implemented with JWT.

```text
1. User sends POST /register with name, email, and password.
2. Backend validates the request.
3. Backend checks whether the email already exists.
4. Backend hashes the password using bcrypt.
5. Backend stores the user in MariaDB.

6. User sends POST /login with email and password.
7. Backend checks the email and compares the password hash.
8. Backend returns a JWT token.
9. Mobile client stores the token securely.
10. Protected requests include Authorization: Bearer <token>.
```

Protected operations:

```text
POST /reservations
GET /user/reservations
PUT /reservations/:id
DELETE /reservations/:id
```

---

## 5. Catalogue Flow

Public catalogue endpoints allow users to browse theatres, shows, showtimes, and seats before making a reservation.

```text
Mobile Client
    ↓ GET /theatres
Backend API
    ↓ SQL SELECT theatres
MariaDB
```

```text
Mobile Client
    ↓ GET /shows?title=&theatreId=&location=&date=
Backend API
    ↓ SQL SELECT with optional filters
MariaDB
```

```text
Mobile Client
    ↓ GET /showtimes?showId=1
Backend API
    ↓ SQL SELECT future showtimes
MariaDB
```

```text
Mobile Client
    ↓ GET /seats?showtimeId=1
Backend API
    ↓ SQL SELECT seats + reservation availability
MariaDB
```

The `GET /seats` endpoint returns availability per seat:

```json
{
  "seat_id": 12,
  "row_label": "A",
  "seat_number": 4,
  "category": "VIP",
  "price": 25.00,
  "is_available": true
}
```

---

## 6. Reservation Flow

Reservation creation is protected and requires a valid JWT token.

```text
Mobile Client
    ↓ POST /reservations
    ↓ Authorization: Bearer <token>
Backend API
    ↓ Validate user
    ↓ Validate showtime
    ↓ Validate seats
    ↓ Check availability
    ↓ Create reservation inside transaction
MariaDB
```

Request example:

```json
{
  "showtimeId": 1,
  "seatIds": [1, 2]
}
```

Business rules:

- Only authenticated users can create reservations.
- Users can only view their own reservations.
- Users can only edit/cancel their own reservations.
- Past showtimes cannot be reserved.
- Past reservations cannot be edited or cancelled.
- Seats must belong to the correct hall for the selected showtime.
- A seat cannot be reserved twice for the same showtime.

---

## 7. Transaction-Based Reservation Logic

The main technical design decision is the use of transactions for reservation creation and editing.

```text
START TRANSACTION
1. Validate showtime.
2. Check that the showtime is not in the past.
3. Validate selected seats.
4. Check current seat availability.
5. Insert reservation.
6. Insert reservation_seats records.
7. COMMIT
```

If any step fails:

```text
ROLLBACK
```

This ensures that the database is not left in a partial state. For example, the system should never create a reservation record without its selected seats.

---

## 8. Double-Booking Prevention

The system prevents double booking at two levels.

### 8.1 Application-Level Validation

Before inserting a reservation, the backend checks whether any selected seat is already reserved for the same showtime.

If a selected seat is unavailable, the API returns a clean JSON error:

```json
{
  "message": "Selected seat is no longer available."
}
```

### 8.2 Database-Level Constraint

The database includes a unique constraint on the `reservation_seats` table:

```sql
UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
```

This ensures that even if two users attempt to reserve the same seat at the same time, MariaDB acts as the final consistency safeguard.

This is the strongest backend evidence for the distributed systems requirement, because it shows consistency handling under concurrent reservation attempts.

---

## 9. Error Handling

The backend returns clean JSON error responses instead of raw stack traces.

Examples:

```json
{
  "message": "Authentication token is required."
}
```

```json
{
  "message": "Email is already registered."
}
```

```json
{
  "message": "Selected seat is no longer available."
}
```

This improves API usability and makes Postman testing evidence clearer.

---

## 10. Current Implementation Status

### Completed

- Express backend scaffold
- MariaDB connection pool
- Health endpoint
- Database test endpoint
- Database schema
- Seed data
- Authentication endpoints
- JWT middleware
- Catalogue endpoints
- Seat availability endpoint
- Reservation CRUD endpoints
- Transaction-based reservation logic
- Double-booking rejection test
- Backend Postman evidence

### Next Step

The next implementation stage is the React Native / Expo frontend, including:

- mobile authentication screens,
- secure token storage,
- show browsing and search,
- showtime selection,
- seat selection,
- reservation creation,
- reservation history,
- edit/cancel future reservation flow.

---

## 11. One-Sentence Architecture Summary

The Theatre Reservation App uses a React Native mobile client, a Node.js / Express REST API, and a MariaDB database to provide secure authentication, searchable theatre performances, real-time seat availability, and transaction-based reservation management with double-booking prevention.
