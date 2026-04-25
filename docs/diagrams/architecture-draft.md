# Theatre Reservation App — Architecture Draft

## Three-Tier Architecture

The application follows a three-tier distributed architecture:

```text
React Native Mobile Client
        |
        | HTTP/REST requests with JWT authentication
        v
Node.js / Express REST API
        |
        | SQL queries via mysql2
        v
MariaDB Database
```


## Frontend Layer

The frontend will be implemented using React Native and Expo. It will provide screens for:

- user registration,
- user login,
- theatre and show browsing,
- search,
- showtime selection,
- seat selection,
- reservation management,
- user profile and reservation history.

## Backend Layer

The backend will be implemented using Node.js and Express. It will expose REST API endpoints for:

- authentication,
- theatres,
- shows,
- showtimes,
- seats,
- reservations,
- user reservations.

The backend code will be separated into:

- routes,
- controllers,
- services,
- middleware,
- database access,
- utility functions.

## Database Layer

The database will be implemented using MariaDB. It stores:

- users,
- theatres,
- halls,
- shows,
- showtimes,
- seat categories,
- seats,
- reservations,
- reservation seats.

## Key Design Decision

The system prevents double booking using a database-level unique constraint:

```text
UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
```

This ensures that the same physical seat cannot be reserved twice for the same showtime.


---