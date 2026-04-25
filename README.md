# Theatre Reservation App

A three-tier mobile distributed system for booking seats in theatre performances.

This project is developed for **CN6035 — Mobile & Distributed Systems**. It demonstrates a distributed architecture where a **React Native mobile client** communicates with a **Node.js/Express REST API**, which stores and retrieves data from a **MariaDB relational database**.

---

## Project Overview

The **Theatre Reservation App** allows users to browse theatre performances, view available showtimes, select specific seats, and manage their reservations through a mobile application.

The system is designed around a realistic theatre booking workflow:

- users register and log in securely,
- users browse theatres and performances,
- users search by show title, theatre name or location,
- users view available showtimes,
- users select specific seats,
- users create reservations,
- users view their reservation history,
- users edit or cancel future reservations.

The main technical focus is not only basic reservation creation, but also **seat availability management**, **reservation consistency**, and **double-booking prevention**.

---

## Coursework Alignment

The project is aligned with the CN6035 coursework requirements and assessment criteria.

| Assessment Area | Weight | Project Evidence |
|---|---:|---|
| Frontend | 30% | React Native / Expo mobile application with clear UI, backend communication, feedback states and reservation flow |
| Backend | 20% | Node.js / Express REST API with routes, controllers, services, middleware, JWT authentication and MariaDB integration |
| Database | 20% | MariaDB schema with normalized tables, primary keys, foreign keys, indexes and reservation constraints |
| Presentation | 30% | README, architecture evidence, screenshots, PowerPoint and live demo flow |

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

### Planned for Day 2

- User registration
- User login
- JWT authentication middleware
- Theatre, show, showtime and seat endpoints
- Reservation creation
- User reservation history
- Future reservation editing
- Future reservation cancellation
- Backend transaction logic
- Double-booking rejection test

### Planned for Day 3

- React Native / Expo frontend
- Authentication flow
- Secure token storage
- Show listing and search
- Show details
- Showtime selection
- Seat selection
- Reservation confirmation
- My Reservations screen

### Planned for Day 4

- Final README polish
- Architecture diagram
- ERD
- Backend screenshots
- Frontend screenshots
- PowerPoint presentation
- Demo script
- Final testing and submission preparation

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
- user reservation history.

### Backend Layer

The backend exposes REST API endpoints and handles:

- request validation,
- authentication,
- JWT verification,
- business logic,
- reservation rules,
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
- reserved seats.

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
| `seat_categories` | Stores Standard, Premium and VIP categories |
| `seats` | Stores physical seats per hall |
| `reservations` | Stores reservation records |
| `reservation_seats` | Stores the selected seats for each reservation |

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

This gives the project enough realistic demo data for backend testing, frontend development and presentation screenshots.

---

## Seat Availability and Double-Booking Prevention

A key design decision is the use of a dedicated `reservation_seats` table.

This table links a reservation with the selected seats and includes a database-level unique constraint:

```sql
UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
```

This means that the same physical seat cannot be reserved twice for the same showtime.

The backend will also validate seat availability in the service layer before inserting a reservation. This gives the system two levels of protection:

1. **Application-level validation** in the backend service logic.
2. **Database-level protection** through the unique constraint.

This is important for a distributed reservation system because two users may attempt to reserve the same seat at nearly the same time. The database constraint acts as the final consistency safeguard.

---

## Current API Endpoints

The Day 1 backend scaffold currently supports:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Confirms that the API server is running |
| GET | `/db-test` | Confirms database connectivity |

### Health Check Example

```text
GET http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Theatre Reservation API is running"
}
```

### Database Test Example

```text
GET http://localhost:5000/db-test
```

Expected response:

```json
{
  "status": "ok",
  "database": {
    "db_status": 1
  }
}
```

---

## Planned API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Creates a new user account |
| POST | `/login` | Authenticates a user and returns a JWT token |

### Theatres, Shows and Seats

| Method | Endpoint | Description |
|---|---|---|
| GET | `/theatres` | Returns available theatres |
| GET | `/shows` | Returns theatre shows, with optional filters |
| GET | `/showtimes` | Returns showtimes for a selected show |
| GET | `/seats` | Returns seat availability for a selected showtime |

### Reservations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/reservations` | Creates a new reservation |
| GET | `/user/reservations` | Returns reservations for the logged-in user |
| PUT | `/reservations/:id` | Updates a future reservation |
| DELETE | `/reservations/:id` | Cancels a future reservation |

---

## Authentication and Security

The backend will use JWT authentication.

Protected requests must include:

```text
Authorization: Bearer <token>
```

Protected endpoints will include:

```text
POST /reservations
GET /user/reservations
PUT /reservations/:id
DELETE /reservations/:id
```

Passwords will be stored using bcrypt hashing. The frontend will store the JWT token securely using Expo SecureStore.

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

The frontend will provide loading states, success messages, error messages and empty states to improve the user experience.

---

## Testing Strategy

The backend will be tested using Postman.

Important Day 2 backend test cases:

- API health check
- Database connection check
- Register user
- Reject duplicate email
- Login user
- Reject invalid credentials
- Fetch theatres
- Fetch shows
- Search shows by title/location/theatre
- Fetch showtimes
- Fetch available seats
- Create reservation
- Reject double booking
- Fetch user reservations
- Edit future reservation
- Cancel future reservation
- Reject protected requests without token

The most important evidence screenshot will be the double-booking rejection, because it demonstrates correct reservation consistency.

---

## Screenshots and Evidence

Screenshots are stored under:

```text
docs/screenshots/backend/
docs/screenshots/frontend/
```

### Day 1 Evidence

Current Day 1 evidence screenshots:

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

### Planned Backend Screenshots

```text
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

### Planned Frontend Screenshots

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

### Day 1 — Analysis, Architecture, Database and Scaffold

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

- [ ] Register endpoint
- [ ] Login endpoint
- [ ] JWT middleware
- [ ] Theatres endpoint
- [ ] Shows endpoint with filters
- [ ] Showtimes endpoint
- [ ] Seats availability endpoint
- [ ] Create reservation endpoint
- [ ] User reservations endpoint
- [ ] Edit future reservation endpoint
- [ ] Cancel future reservation endpoint
- [ ] Transaction-based reservation logic
- [ ] Double-booking rejection test

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
- [ ] Backend screenshots
- [ ] Frontend screenshots
- [ ] PowerPoint presentation
- [ ] Demo script
- [ ] Final testing
- [ ] Final GitHub push

---

## Suggested Git Commit for README Polish

```bash
git add README.md
git commit -m "Polish README after Day 1 setup verification"
git push
```

---

## One-Sentence Project Pitch

The Theatre Reservation App is a three-tier mobile distributed system that allows users to securely browse theatre performances, select available showtimes and seats, and manage their reservations through a React Native frontend, a Node.js/Express REST API, and a MariaDB database.
