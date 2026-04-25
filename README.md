# Theatre Reservation App

A three-tier mobile distributed system for booking seats in theatre performances.

This project is developed for **CN6035 — Mobile & Distributed Systems**. It demonstrates a distributed architecture where a React Native mobile client communicates with a Node.js/Express REST API, which stores and retrieves data from a MariaDB database.

---

## Project Overview

The **Theatre Reservation App** allows users to:

- register and log in securely,
- browse theatres and theatre performances,
- search by show title, theatre name or location,
- view available showtimes,
- select specific seats,
- create reservations,
- view their reservation history,
- edit or cancel future reservations.

The main technical focus of the project is not only basic reservation creation, but also **seat availability management** and **double-booking prevention**.

---

## Coursework Alignment

The system is designed to meet the main coursework requirements:

| Requirement Area | Implementation Direction |
|---|---|
| Mobile Frontend | React Native / Expo application |
| Backend API | Node.js and Express REST API |
| Database | MariaDB relational database |
| Authentication | JWT-based authentication |
| Distributed System | Mobile client → REST API → Database |
| Reservation Management | Create, view, edit and cancel reservations |
| Data Consistency | Seat availability checks and double-booking prevention |
| Documentation | README, diagrams, screenshots and presentation material |

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
- Postman
- Git
- GitHub
- MariaDB client / terminal

---

## System Architecture

The application follows a three-tier architecture:

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
- show browsing,
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

This separation supports clean architecture and aligns with the backend architecture requirement of the coursework.

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
- One reservation belongs to one user and one showtime.
- One reservation can contain one or more selected seats.

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

This is important for a distributed reservation system because two users may attempt to reserve the same seat at nearly the same time.

---

## Planned API Endpoints

### Health and Database

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks if the API is running |
| GET | `/db-test` | Checks database connectivity |

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

Protected endpoints include:

```text
POST /reservations
GET /user/reservations
PUT /reservations/:id
DELETE /reservations/:id
```

Passwords are stored using bcrypt hashing. The frontend will store the JWT token securely using Expo SecureStore.

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

Expected response:

```json
{
  "status": "ok",
  "message": "Theatre Reservation API is running"
}
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

Important test cases:

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

Screenshots will be stored under:

```text
docs/screenshots/backend/
docs/screenshots/frontend/
```

Planned backend screenshots:

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

Planned frontend screenshots:

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

- [x] Repository structure planned
- [x] Backend scaffold planned
- [x] Database schema designed
- [x] Seed data planned
- [x] Architecture draft planned
- [x] Initial README created

### Day 2 — Backend API and Reservation Logic

- [ ] Register endpoint
- [ ] Login endpoint
- [ ] JWT middleware
- [ ] Theatres endpoint
- [ ] Shows endpoint
- [ ] Showtimes endpoint
- [ ] Seats availability endpoint
- [ ] Create reservation endpoint
- [ ] User reservations endpoint
- [ ] Edit reservation endpoint
- [ ] Cancel reservation endpoint
- [ ] Double-booking prevention logic

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

## Suggested Git Commit for Day 1

```bash
git add .
git commit -m "Initialize theatre reservation architecture and database schema"
git push
```

---

## One-Sentence Project Pitch

The Theatre Reservation App is a three-tier mobile distributed system that allows users to securely browse theatre performances, select available showtimes and seats, and manage their reservations through a React Native frontend, a Node.js/Express REST API, and a MariaDB database.
