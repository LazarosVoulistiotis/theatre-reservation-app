# Theatre Reservation App

A three-tier mobile distributed system for booking specific seats in theatre performances.

This project is developed for **CN6035 — Mobile & Distributed Systems**. It demonstrates a distributed architecture where a **React Native / Expo mobile client** communicates with a **Node.js / Express REST API**, which stores and retrieves data from a **MariaDB relational database**.

---

## Project Overview

The **Theatre Reservation App** allows users to browse theatre performances, view available showtimes, select specific seats, and manage their reservations through a mobile application.

The system is designed around a realistic theatre booking workflow:

- users register and log in securely,
- users browse theatres and performances,
- users search by show title, theatre name, location, and date,
- users view available showtimes,
- users view seat availability for a selected showtime,
- users select one or more specific seats,
- users create reservations,
- users view their own reservation history,
- users edit or cancel future reservations.

The main technical focus is not only basic reservation CRUD, but also **seat availability management**, **reservation consistency**, **JWT-protected access**, and **double-booking prevention**.

---

## Coursework Alignment

The project is aligned with the CN6035 coursework requirements and assessment criteria.

| Assessment Area | Weight | Project Evidence |
|---|---:|---|
| Frontend | 30% | React Native / Expo mobile application with clean UI, backend communication, feedback states, search, seat selection, and reservation flow |
| Backend | 20% | Node.js / Express REST API with routes, controllers, services, middleware, JWT authentication, validation, and MariaDB integration |
| Database | 20% | MariaDB schema with normalized tables, primary keys, foreign keys, indexes, and reservation constraints |
| Presentation | 30% | README, architecture evidence, backend/frontend screenshots, Postman evidence, PowerPoint, and live demo flow |

The project follows the required distributed system model:

```text
React Native Mobile Client
        ↓
Node.js / Express REST API
        ↓
MariaDB Database
```

---

## Key Features

### Implemented in Day 1

- Project repository and folder structure
- Backend scaffold with Express
- Environment configuration example
- MariaDB connection pool
- Health endpoint
- Database connectivity endpoint
- MariaDB schema
- Seed data
- Architecture draft
- Initial documentation
- Day 1 backend and database evidence screenshots

### Implemented in Day 2

- User registration endpoint
- User login endpoint
- Input validation for authentication requests
- Duplicate email rejection
- Password hashing with bcrypt
- JWT token generation
- JWT authentication middleware
- Protected reservation endpoints
- Public theatre listing endpoint
- Public show listing endpoint with filters
- Public showtime listing endpoint
- Public seat availability endpoint
- Reservation creation with selected seats
- User reservation history endpoint
- Future reservation editing endpoint
- Future reservation cancellation endpoint
- Transaction-based reservation creation and editing
- Double-booking prevention through backend validation and database constraints
- Clean JSON error handling
- Full backend testing with Postman

### Planned for Day 3

- React Native / Expo frontend
- Authentication flow
- Secure token storage using Expo SecureStore
- Show listing and search
- Show details screen
- Showtime selection
- Seat selection
- Reservation confirmation
- My Reservations screen
- Edit/cancel reservation flow from the mobile UI

### Planned for Day 4

- Final README polish
- Architecture diagram
- Database ERD
- Backend screenshots review
- Frontend screenshots
- PowerPoint presentation
- Demo script
- Final regression testing and submission preparation

---

## Tech Stack

### Frontend

- React Native
- Expo
- JavaScript
- Axios
- React Navigation
- Expo SecureStore for secure token storage

### Backend

- Node.js
- Express
- mysql2
- bcrypt
- jsonwebtoken
- dotenv
- cors
- nodemon

### Database

- MariaDB
- SQL schema with:
  - primary keys,
  - foreign keys,
  - indexes,
  - unique constraints,
  - normalized reservation structure.

### Development Tools

- WebStorm or Visual Studio Code
- HeidiSQL / MariaDB client
- Postman
- Git
- GitHub

---

## System Architecture

The application follows a three-tier architecture.

```text
React Native Mobile Client
        |
        | HTTP/REST requests with JWT authentication
        v
Node.js / Express REST API
        |
        | SQL queries using mysql2
        v
MariaDB Database
```

### Frontend Layer

The frontend provides the mobile user interface for:

- registration,
- login,
- theatre and show browsing,
- search,
- showtime selection,
- seat selection,
- reservation confirmation,
- user reservation history,
- future reservation editing/cancellation.

### Backend Layer

The backend exposes REST API endpoints and handles:

- request validation,
- authentication,
- JWT verification,
- business logic,
- reservation rules,
- transaction-based booking,
- database queries,
- error handling.

The backend is organised into:

```text
routes/
controllers/
services/
middleware/
db/
utils/
```

This separation supports clean architecture and directly aligns with the backend architecture criterion of the coursework.

### Database Layer

The MariaDB database stores all core entities:

- users,
- theatres,
- halls,
- shows,
- showtimes,
- seat categories,
- seats,
- reservations,
- reservation seats.

---

## Project Structure

```text
theatre-reservation-app/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ db/
│  │  │  └─ pool.js
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  └─ app.js
│  ├─ .env.example
│  ├─ package.json
│  └─ server.js
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ navigation/
│  │  ├─ screens/
│  │  ├─ services/
│  │  └─ utils/
│  └─ App.js
│
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
│
├─ docs/
│  ├─ diagrams/
│  │  └─ architecture-draft.md
│  ├─ postman/
│  ├─ screenshots/
│  │  ├─ backend/
│  │  └─ frontend/
│  └─ presentation/
│
└─ README.md
```

---

## Database Design

The database schema is designed around real theatre seat reservations.

### Main Tables

| Table | Purpose |
|---|---|
| `users` | Stores registered users |
| `theatres` | Stores theatre venues |
| `halls` | Stores theatre halls/stages |
| `shows` | Stores theatre performances |
| `showtimes` | Stores available dates and times |
| `seat_categories` | Stores Standard, Premium, and VIP seat categories |
| `seats` | Stores physical seats per hall |
| `reservations` | Stores reservation records |
| `reservation_seats` | Stores selected seats for each reservation |

### Key Relationships

- One theatre can have many halls.
- One theatre can host many shows.
- One show can have many showtimes.
- One hall has many seats.
- One reservation belongs to one user.
- One reservation belongs to one showtime.
- One reservation can contain one or more selected seats.
- One selected seat belongs to one reservation and one showtime.

### Seed Data

The Day 1 seed data creates:

| Entity | Count |
|---|---:|
| Theatres | 3 |
| Halls | 6 |
| Shows | 6 |
| Showtimes | 7 |
| Seat categories | 3 |
| Seats | 105 |

This gives the project enough realistic demo data for backend testing, frontend development, screenshots, and live presentation.

---

## Seat Availability and Double-Booking Prevention

A key design decision is the use of a dedicated `reservation_seats` table.

This table links a reservation with the selected seats and includes a database-level unique constraint:

```sql
UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
```

This means that the same physical seat cannot be reserved twice for the same showtime.

The backend also validates seat availability in the service layer before inserting a reservation. This gives the system two levels of protection:

1. **Application-level validation** in the backend service logic.
2. **Database-level protection** through the unique constraint.

This is important for a distributed reservation system because two users may attempt to reserve the same seat at nearly the same time. The database constraint acts as the final consistency safeguard.

### Backend Transaction Logic

Reservation creation and editing are handled using database transactions.

When a user creates a reservation, the backend follows this process:

```text
START TRANSACTION
1. Validate that the selected showtime exists.
2. Check that the showtime is not in the past.
3. Validate that all selected seats belong to the correct hall.
4. Check that the selected seats are still available.
5. Insert the reservation record.
6. Insert the selected seats into reservation_seats.
7. COMMIT
```

If any validation fails, the transaction is rolled back:

```text
ROLLBACK
```

This design improves data consistency and supports safe seat reservation handling in a distributed mobile application.

---

## Current API Endpoints

### System

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/health` | Confirms that the API server is running | Public |
| GET | `/db-test` | Confirms database connectivity | Public |

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Creates a new user account | Public |
| POST | `/login` | Authenticates a user and returns a JWT token | Public |

### Theatres, Shows, Showtimes, and Seats

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/theatres` | Returns available theatres | Public |
| GET | `/shows` | Returns theatre shows with optional filters | Public |
| GET | `/showtimes?showId=` | Returns showtimes for a selected show | Public |
| GET | `/seats?showtimeId=` | Returns seat availability for a selected showtime | Public |

### Reservations

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/reservations` | Creates a new reservation with selected seats | Protected |
| GET | `/user/reservations` | Returns reservations for the logged-in user | Protected |
| PUT | `/reservations/:id` | Updates a future reservation | Protected |
| DELETE | `/reservations/:id` | Cancels a future reservation | Protected |

---

## API Examples

### Register

```http
POST http://localhost:5000/register
Content-Type: application/json
```

```json
{
  "name": "Lazaros",
  "email": "lazaros@example.com",
  "password": "Password123"
}
```

### Login

```http
POST http://localhost:5000/login
Content-Type: application/json
```

```json
{
  "email": "lazaros@example.com",
  "password": "Password123"
}
```

### Create Reservation

```http
POST http://localhost:5000/reservations
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "showtimeId": 1,
  "seatIds": [1, 2]
}
```

### Update Future Reservation

```http
PUT http://localhost:5000/reservations/1
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "showtimeId": 1,
  "seatIds": [3, 4]
}
```

---

## Authentication and Security

The backend uses JWT authentication.

Protected requests must include:

```text
Authorization: Bearer <token>
```

Protected endpoints include:

```text
POST /reservations
GET /user/reservations
PUT /reservations/:id
DELETE /reservations/:id
```

Security-related backend decisions:

- Passwords are hashed using bcrypt before being stored.
- Duplicate email registration is rejected.
- Protected routes require a valid JWT token.
- Users can only view and modify their own reservations.
- Past showtimes cannot be reserved.
- Past reservations cannot be edited or cancelled.
- Seat double-booking is prevented at both application and database level.

The frontend will store the JWT token using Expo SecureStore.

---

## How to Run the Backend

From the project root:

```bash
cd backend
npm install
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

Test the health endpoint:

```text
GET http://localhost:5000/health
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=theatre_reservation_db

JWT_SECRET=theatre_reservation_super_secret_key
JWT_EXPIRES_IN=1d
```

An example file is provided as:

```text
backend/.env.example
```

The real `.env` file must not be committed to GitHub.

---

## How to Set Up the Database

Run the schema script first:

```bash
mysql -u root -p < database/schema.sql
```

Then insert demo data:

```bash
mysql -u root -p theatre_reservation_db < database/seed.sql
```

If the database user has no password:

```bash
mysql -u root < database/schema.sql
mysql -u root theatre_reservation_db < database/seed.sql
```

After the database is created, test the API endpoint:

```text
GET http://localhost:5000/db-test
```

---

## Planned Frontend Screens

The React Native frontend will include:

- Welcome Screen
- Register Screen
- Login Screen
- Shows Screen
- Show Details Screen
- Seat Selection Screen
- Reservation Success Screen
- My Reservations Screen

The frontend will provide loading states, success messages, error messages, empty states, and confirmation dialogs to improve the user experience.

---

## Testing Strategy

The backend has been tested using Postman.

Important Day 2 backend test cases:

- API health check
- Database connection check
- Register user
- Reject duplicate email
- Login user
- Fetch theatres
- Fetch shows/search results
- Fetch showtimes
- Fetch available seats
- Create reservation
- Reject double booking
- Fetch user reservations
- Edit future reservation
- Cancel future reservation
- Reject protected requests without token

The most important evidence screenshot is the double-booking rejection, because it demonstrates correct reservation consistency.

---

## Screenshots and Evidence

Screenshots are stored under:

```text
docs/screenshots/backend/
docs/screenshots/frontend/
```

### Day 1 Evidence

```text
01_day1_health_success.png
02_day1_db_test_success.png
03_day1_database_seeded_tables.png
04_day1_reservation_seats_indexes.png
```

These screenshots show:

- successful API health check,
- successful database connection,
- seeded MariaDB tables,
- `uq_showtime_seat` index for double-booking prevention.

### Day 2 Backend Evidence

```text
01_health_success.png
02_db_test_success.png
03_register_success.png
04_duplicate_email_error.png
05_login_success.png
06_get_theatres.png
07_get_shows_search.png
08_get_showtimes.png
09_get_seats_availability.png
10_create_reservation_success.png
11_double_booking_rejected.png
12_get_user_reservations.png
13_edit_future_reservation.png
14_delete_future_reservation.png
15_no_token_unauthorized.png
```

### Planned Frontend Evidence

```text
01_welcome.png
02_register.png
03_login.png
04_shows_list.png
05_search_results.png
06_search_empty_state.png
07_show_details.png
08_seat_selection.png
09_reservation_success.png
10_my_reservations.png
11_edit_reservation.png
12_delete_confirmation.png
```

---

## Implementation Status

### Day 1 — Analysis, Architecture, Database, and Scaffold

- [x] GitHub repository created
- [x] Project structure completed
- [x] Backend scaffold completed
- [x] Express server running
- [x] `/health` endpoint tested successfully
- [x] `/db-test` endpoint tested successfully
- [x] MariaDB database created
- [x] Database schema implemented
- [x] Seed data inserted and verified
- [x] Double-booking prevention index verified
- [x] Architecture draft completed
- [x] Initial README created and polished
- [x] Day 1 evidence screenshots captured
- [x] Initial commit pushed to GitHub

### Day 2 — Backend API and Reservation Logic

- [x] Register endpoint
- [x] Login endpoint
- [x] JWT middleware
- [x] Theatres endpoint
- [x] Shows endpoint with filters
- [x] Showtimes endpoint
- [x] Seats availability endpoint
- [x] Create reservation endpoint
- [x] User reservations endpoint
- [x] Edit future reservation endpoint
- [x] Cancel future reservation endpoint
- [x] Transaction-based reservation logic
- [x] Double-booking rejection test
- [x] Postman backend evidence screenshots

### Day 3 — React Native Frontend

- [ ] Expo setup
- [ ] Navigation
- [ ] Authentication flow
- [ ] Secure token storage
- [ ] Shows list
- [ ] Search
- [ ] Show details
- [ ] Seat selection
- [ ] Reservation creation
- [ ] My reservations
- [ ] Edit/cancel reservation UI

### Day 4 — Final Submission Preparation

- [ ] Final README
- [ ] Architecture diagram
- [ ] ERD
- [ ] Backend screenshots review
- [ ] Frontend screenshots
- [ ] PowerPoint presentation
- [ ] Demo script
- [ ] Final testing
- [ ] Final GitHub push


---

## One-Sentence Project Pitch

The Theatre Reservation App is a three-tier mobile distributed system that allows users to securely browse theatre performances, select available showtimes and seats, and manage their reservations through a React Native frontend, a Node.js / Express REST API, and a MariaDB database.
