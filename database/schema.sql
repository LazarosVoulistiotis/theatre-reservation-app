DROP DATABASE IF EXISTS theatre_reservation_db;
CREATE DATABASE theatre_reservation_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE theatre_reservation_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE theatres (
  theatre_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE halls (
  hall_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  CONSTRAINT fk_halls_theatre
    FOREIGN KEY (theatre_id)
    REFERENCES theatres(theatre_id)
    ON DELETE CASCADE
);

CREATE TABLE shows (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  age_rating VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shows_theatre
    FOREIGN KEY (theatre_id)
    REFERENCES theatres(theatre_id)
    ON DELETE CASCADE
);

CREATE TABLE showtimes (
  showtime_id INT AUTO_INCREMENT PRIMARY KEY,
  show_id INT NOT NULL,
  hall_id INT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  base_price DECIMAL(8,2) NOT NULL,
  CONSTRAINT fk_showtimes_show
    FOREIGN KEY (show_id)
    REFERENCES shows(show_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_showtimes_hall
    FOREIGN KEY (hall_id)
    REFERENCES halls(hall_id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_showtime_hall_datetime (hall_id, show_date, show_time)
);

CREATE TABLE seat_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00
);

CREATE TABLE seats (
  seat_id INT AUTO_INCREMENT PRIMARY KEY,
  hall_id INT NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL,
  category_id INT NOT NULL,
  CONSTRAINT fk_seats_hall
    FOREIGN KEY (hall_id)
    REFERENCES halls(hall_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_seats_category
    FOREIGN KEY (category_id)
    REFERENCES seat_categories(category_id),
  UNIQUE KEY uq_seat_per_hall (hall_id, row_label, seat_number)
);

CREATE TABLE reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  showtime_id INT NOT NULL,
  status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservations_showtime
    FOREIGN KEY (showtime_id)
    REFERENCES showtimes(showtime_id)
    ON DELETE CASCADE
);

CREATE TABLE reservation_seats (
  reservation_seat_id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  showtime_id INT NOT NULL,
  seat_id INT NOT NULL,
  CONSTRAINT fk_reservation_seats_reservation
    FOREIGN KEY (reservation_id)
    REFERENCES reservations(reservation_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservation_seats_showtime
    FOREIGN KEY (showtime_id)
    REFERENCES showtimes(showtime_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reservation_seats_seat
    FOREIGN KEY (seat_id)
    REFERENCES seats(seat_id)
    ON DELETE CASCADE,

  -- Prevents the same reservation from storing the same seat twice.
  UNIQUE KEY uq_reservation_seat (reservation_id, seat_id),

  -- Critical rule: prevents the same seat from being booked twice for the same showtime.
  UNIQUE KEY uq_showtime_seat (showtime_id, seat_id)
);

CREATE INDEX idx_theatres_location ON theatres(location);
CREATE INDEX idx_shows_title ON shows(title);
CREATE INDEX idx_shows_theatre ON shows(theatre_id);
CREATE INDEX idx_showtimes_show_date ON showtimes(show_id, show_date);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_showtime ON reservations(showtime_id);