# Theatre Reservation App

A three-tier mobile distributed system for booking specific seats in theatre performances.

This project is developed for **CN6035 — Mobile & Distributed Systems**. It demonstrates a distributed architecture where a **React Native / Expo mobile client** communicates with a **Node.js / Express REST API**, which stores and retrieves data from a **MariaDB relational database**.

---

## Project Overview

The **Theatre Reservation App** allows users to browse theatre performances, view available showtimes, select specific seats, and manage their reservations through a mobile-first application.

The system implements a realistic theatre booking workflow:

- users register and log in securely,
- users browse available theatres and performances,
- users search by show title, theatre name, location, and show date,
- users view show details and available showtimes,
- users view seat availability for a selected showtime,
- users select one or more specific seats,
- users create reservations,
- users view their own reservation history,
- users edit future reservations,
- users cancel future reservations.

The main technical focus is not only basic CRUD functionality, but also **JWT-protected access**, **secure token handling**, **seat availability management**, **reservation consistency**, and **double-booking prevention**.

---

## Coursework Alignment

The project is aligned with the CN6035 coursework requirements and assessment criteria.

| Assessment Area | Weight | Project Evidence |
|---|---:|---|
| Frontend | 30% | React Native / Expo mobile client with consistent UI, authentication flow, protected navigation, backend communication, search, show details, showtime preview, seat selection, reservation creation, edit/cancel reservation flow, and user feedback states |
| Backend | 20% | Node.js / Express REST API with routes, controllers, services, middleware, JWT authentication, validation, transaction-based reservation logic, and MariaDB integration |
| Database | 20% | MariaDB schema with normalized tables, primary keys, foreign keys, indexes, constraints, seed data, and reservation-seat relationship for consistency |
| Presentation | 30% | README, architecture evidence, backend/frontend screenshots, Postman evidence, PowerPoint, and live demo flow |

The project follows the required distributed system model:

```text
React Native / Expo Mobile Client
        ↓
Node.js / Express REST API
        ↓
MariaDB Database
```

---

## Key Features

### Authentication and User Access

- User registration with name, email, and password
- User login with email and password
- Password hashing with bcrypt on the backend
- JWT-based authentication for protected routes
- Protected frontend navigation after login
- Secure frontend token handling through the authentication context
- Logout functionality
- User feedback for validation, success, and error cases

### Theatre Catalogue and Search

- List of available theatre performances loaded from the backend
- Search by show title, theatre name, location, and show date
- Empty-state UI when no results are found
- Loading and error states during backend communication
- Consistent show cards with title, theatre, location, duration, age rating, and description

### Show Details and Availability

- Dedicated show details screen
- Display of title, theatre, location, description, duration, and age rating
- Preview of available showtimes before seat selection
- Display of showtime date/time, hall name, and starting price
- Direct navigation to the complete seat selection flow

### Seat Selection and Reservation Creation

- Showtimes loaded from the backend
- Seats loaded per selected showtime
- Seat availability displayed visually
- Unavailable seats disabled
- Selected seats highlighted
- Live total price calculation
- Create reservation request sent to the backend
- Success feedback after booking
- Seat availability refreshed after reservation creation

### User Reservation Management

- My Reservations screen for the authenticated user
- Upcoming reservations section
- Past / cancelled reservations section
- Reservation details: title, theatre, location, date/time, seats, total price, status, and type
- Edit future reservation flow
- Cancel future reservation flow
- Confirmation dialog before cancellation
- Cancelled reservations retained in history

### Consistency and Double-Booking Protection

- Seat availability checked before reservation creation and editing
- Backend transaction logic protects reservation operations
- Database-level unique constraint prevents the same seat from being confirmed twice for the same showtime
- Cancelled reservations release seats because availability checks only consider confirmed reservations

---

## Tech Stack

### Frontend

- React Native
- Expo
- JavaScript
- Axios
- React Navigation
- Expo SecureStore / frontend authentication context for token persistence
- Reusable UI components: `AppButton`, `AppInput`, `FeedbackMessage`, `LoadingView`

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
- SQL schema with primary keys, foreign keys, indexes, unique constraints, and normalized reservation structure

### Development Tools

- WebStorm / Visual Studio Code
- HeidiSQL / MariaDB client
- Postman
- Git
- GitHub

---

## System Architecture

The application follows a three-tier distributed architecture.

```text
┌──────────────────────────────────────┐
│ React Native / Expo Mobile Client    │
│ - UI screens                         │
│ - Auth context                       │
│ - Axios API service                  │
│ - Secure token handling              │
└───────────────────┬──────────────────┘
                    │ HTTP/REST + JWT
                    v
┌──────────────────────────────────────┐
│ Node.js / Express REST API           │
│ - Routes                             │
│ - Controllers                        │
│ - Services                           │
│ - JWT middleware                     │
│ - Error handling                     │
└───────────────────┬──────────────────┘
                    │ SQL queries via mysql2
                    v
┌──────────────────────────────────────┐
│ MariaDB Database                     │
│ - Users                              │
│ - Theatres                           │
│ - Shows / showtimes                  │
│ - Seats / categories                 │
│ - Reservations / reservation seats   │
└──────────────────────────────────────┘
```

### Frontend Layer

The frontend provides the mobile user interface for registration, login, protected navigation, theatre browsing, search, show details, showtime preview, seat selection, reservation confirmation, user reservation history, future reservation editing, and future reservation cancellation.

The UI is mobile-first. When tested through Expo web, the main content is constrained with a clean card layout so the app still looks professional on a desktop screen while preserving the mobile application design.

### Backend Layer

The backend exposes REST API endpoints and handles request validation, user authentication, JWT verification, business logic, ownership checks, transaction-based booking, seat availability checks, database queries, and consistent JSON error handling.

The backend is organised into:

```text
routes/
controllers/
services/
middleware/
db/
utils/
```

### Database Layer

The MariaDB database stores all core entities: users, theatres, halls, shows, showtimes, seat categories, seats, reservations, and reservation seats.

---

## Project Structure

```text
theatre-reservation-app/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ db/
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
│  │  │  ├─ AppButton.js
│  │  │  ├─ AppInput.js
│  │  │  ├─ FeedbackMessage.js
│  │  │  └─ LoadingView.js
│  │  ├─ context/
│  │  │  └─ AuthContext.js
│  │  ├─ navigation/
│  │  │  └─ RootNavigator.js
│  │  ├─ screens/
│  │  │  ├─ WelcomeScreen.js
│  │  │  ├─ RegisterScreen.js
│  │  │  ├─ LoginScreen.js
│  │  │  ├─ ShowsScreen.js
│  │  │  ├─ ShowDetailsScreen.js
│  │  │  ├─ SeatSelectionScreen.js
│  │  │  └─ MyReservationsScreen.js
│  │  ├─ services/
│  │  │  └─ api.js
│  │  └─ utils/
│  │     └─ showFormatters.js
│  ├─ App.js
│  ├─ app.json
│  ├─ package.json
│  └─ package-lock.json
│
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
│
├─ docs/
│  ├─ diagrams/
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

The database schema is designed around realistic theatre seat reservations.

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

The seed data creates realistic demo content for backend testing, frontend development, screenshots, and live presentation.

| Entity | Count |
|---|---:|
| Theatres | 3 |
| Halls | 6 |
| Shows | 6 |
| Showtimes | Multiple future demo showtimes |
| Seat categories | 3 |
| Seats | 105 |

---

## Seat Availability and Double-Booking Prevention

A key design decision is the use of a dedicated `reservation_seats` table.

This table links a reservation with the selected seats and includes a database-level unique constraint:

```sql
UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
```

This means that the same physical seat cannot be reserved twice for the same showtime.

The backend also validates seat availability in the service layer before inserting or updating a reservation. This gives the system two levels of protection:

1. **Application-level validation** in the backend service logic.
2. **Database-level protection** through the unique constraint.

This is important for a distributed reservation system because two users may attempt to reserve the same seat at nearly the same time. The database constraint acts as the final consistency safeguard.

### Backend Transaction Logic

Reservation creation and editing are handled using database transactions.

```text
START TRANSACTION
1. Validate that the selected showtime exists.
2. Check that the showtime is not in the past.
3. Validate that all selected seats belong to the correct hall.
4. Check that the selected seats are still available.
5. Insert or update the reservation record.
6. Insert the selected seats into reservation_seats.
7. COMMIT
```

If any validation fails, the transaction is rolled back:

```text
ROLLBACK
```

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

### Search Shows

```http
GET http://localhost:5000/shows?title=Hamlet
GET http://localhost:5000/shows?location=Athens
GET http://localhost:5000/shows?theatreName=National&date=2026-05-10
```

### Get Showtimes

```http
GET http://localhost:5000/showtimes?showId=1
```

### Get Seats

```http
GET http://localhost:5000/seats?showtimeId=1
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

### Cancel Future Reservation

```http
DELETE http://localhost:5000/reservations/1
Authorization: Bearer <token>
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

Security-related decisions:

- Passwords are hashed using bcrypt before being stored.
- Duplicate email registration is rejected.
- Protected routes require a valid JWT token.
- Users can only view and modify their own reservations.
- Past showtimes cannot be reserved.
- Past reservations cannot be edited or cancelled.
- Seat double-booking is prevented at both application and database level.
- The frontend authentication context attaches the JWT token automatically to protected API requests.

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

## Backend Environment Variables

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

## How to Run the Frontend

From the project root:

```bash
cd frontend
npm install
npx expo start
```

For web testing:

```bash
npx expo start --web
```

The Expo web preview may run on:

```text
http://localhost:8081
```

The frontend API base URL should point to the backend:

```text
http://localhost:5000
```

For Android emulator development, the backend URL may need to be:

```text
http://10.0.2.2:5000
```

For Expo Go on a physical device, use the computer's local network IP address:

```text
http://<PC-IP>:5000
```

---

## Frontend Screens

| Screen | Purpose |
|---|---|
| `WelcomeScreen` | Public landing page with app overview and navigation to register/login |
| `RegisterScreen` | Account creation form with validation and feedback |
| `LoginScreen` | Login form with JWT authentication flow |
| `ShowsScreen` | Protected catalogue page with search filters and show cards |
| `ShowDetailsScreen` | Show information and available showtimes preview |
| `SeatSelectionScreen` | Showtime and seat selection for creating or editing reservations |
| `MyReservationsScreen` | User reservation history with edit/cancel actions |

The frontend provides loading states, success messages, error messages, empty states, confirmation dialogs, disabled buttons during invalid actions, and visual seat availability states.

---

## Testing Strategy

### Backend Testing

The backend has been tested using Postman.

Important backend test cases:

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

### Frontend Testing

The frontend has been tested through the full mobile booking workflow:

```text
1. Open Welcome screen
2. Register validation
3. Login
4. Browse shows
5. Search by show title
6. Search with no results
7. View show details
8. Preview available showtimes
9. Continue to seat selection
10. Select showtime
11. Select available seats
12. Create reservation
13. View reservation in My Reservations
14. Edit future reservation
15. Update selected seats
16. Cancel future reservation
17. Confirm that cancelled reservation remains in history
18. Return to Theatre Shows
19. Logout
```

This verifies frontend UI/UX, backend communication, user feedback states, and the complete reservation flow.

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

### Day 3 Frontend Evidence

```text
01_day3_welcome_screen.png
02_day3_register_screen.png
03_day3_login_screen.png
04_day3_authenticated_shows_screen.png
05_day3_shows_search_result.png
06_day3_search_empty_state.png
07_day3_show_details_showtimes_preview.png
08_day3_seat_selection_multiple_showtimes.png
09_day3_reservation_success_updated_availability.png
10_day3_my_reservations_upcoming.png
11_day3_edit_reservation_preselected_seats.png
12_day3_edit_reservation_success.png
13_day3_cancel_confirmation_dialog.png
14_day3_cancelled_reservation_history.png
```

These screenshots show the complete frontend flow required by the assignment.

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

### Day 3 — React Native Frontend and Backend Integration

- [x] Expo frontend running
- [x] React Navigation configured
- [x] Authentication flow implemented
- [x] Register connected to backend
- [x] Login connected to backend
- [x] JWT-based protected frontend flow
- [x] Logout implemented
- [x] Shows list loaded from backend
- [x] Search by title, theatre, location, and date
- [x] Show details screen implemented
- [x] Showtimes preview displayed
- [x] Seat selection screen implemented
- [x] Seat availability displayed
- [x] Selected seats highlighted
- [x] Unavailable seats disabled
- [x] Live total price calculation
- [x] Reservation creation from mobile UI
- [x] My Reservations screen implemented
- [x] Edit future reservation flow implemented
- [x] Cancel future reservation flow implemented
- [x] Loading, success, error, empty, and confirmation states implemented
- [x] Frontend screenshots captured
- [x] README frontend section updated

### Day 4 — Final Submission Preparation

- [ ] Final architecture diagram
- [ ] Final ERD
- [ ] Backend screenshots review
- [ ] Frontend screenshots review
- [ ] PowerPoint presentation
- [ ] Demo script
- [ ] Final regression testing
- [ ] Final GitHub push before submission

---

## Suggested Demo Flow

A strong live demo can follow this order:

```text
1. Open the Welcome screen.
2. Register or log in.
3. Show the theatre catalogue.
4. Search for a show by title.
5. Open Show Details.
6. Point out available showtimes, halls, and starting prices.
7. Continue to Seat Selection.
8. Select a showtime and available seats.
9. Create a reservation.
10. Open My Reservations.
11. Edit the future reservation.
12. Cancel the reservation.
13. Show that the cancelled reservation remains in history.
14. Logout.
```

This demo covers the most important assessment areas: frontend UI/UX, backend communication, JWT authentication, database-backed reservations, and reservation management.

---

## One-Sentence Project Pitch

The Theatre Reservation App is a three-tier mobile distributed system that allows users to securely browse theatre performances, select available showtimes and seats, and manage their reservations through a React Native frontend, a Node.js / Express REST API, and a MariaDB database.
