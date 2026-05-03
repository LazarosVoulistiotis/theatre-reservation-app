USE theatre_reservation_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reservation_seats;
TRUNCATE TABLE reservations;
TRUNCATE TABLE seats;
TRUNCATE TABLE showtimes;
TRUNCATE TABLE shows;
TRUNCATE TABLE halls;
TRUNCATE TABLE theatres;
TRUNCATE TABLE seat_categories;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO theatres (name, location, description) VALUES
                                                       ('National Theatre of Greece', 'Athens', 'Historic theatre venue hosting classical and modern performances.'),
                                                       ('Piraeus Municipal Theatre', 'Piraeus', 'Landmark theatre with a rich cultural programme.'),
                                                       ('Thessaloniki Royal Theatre', 'Thessaloniki', 'Major theatre venue for drama, opera and cultural events.');

INSERT INTO halls (theatre_id, name, capacity) VALUES
                                                   (1, 'Main Hall', 20),
                                                   (1, 'Studio Stage', 15),
                                                   (2, 'Grand Hall', 20),
                                                   (2, 'Experimental Stage', 15),
                                                   (3, 'Royal Hall', 20),
                                                   (3, 'Black Box', 15);

INSERT INTO shows (theatre_id, title, description, duration_minutes, age_rating) VALUES
                                                                                     (1, 'Oedipus Rex', 'A classic ancient Greek tragedy by Sophocles.', 120, '12+'),
                                                                                     (1, 'Medea', 'A powerful tragedy exploring revenge, betrayal and justice.', 110, '15+'),
                                                                                     (2, 'Hamlet', 'Shakespeare’s tragedy of power, doubt and revenge.', 150, '12+'),
                                                                                     (2, 'Romeo and Juliet', 'A timeless story of love and conflict.', 130, '12+'),
                                                                                     (3, 'The Phantom of the Opera', 'A dramatic musical performance with mystery and romance.', 140, '12+'),
                                                                                     (3, 'Antigone', 'A classical tragedy about law, duty and conscience.', 100, '12+');

INSERT INTO seat_categories (name, price_multiplier) VALUES
                                                         ('Standard', 1.00),
                                                         ('Premium', 1.25),
                                                         ('VIP', 1.50);

-- Multiple showtimes are included so the frontend can demonstrate
-- date/time selection before seat selection.
INSERT INTO showtimes (show_id, hall_id, show_date, show_time, base_price) VALUES
-- Oedipus Rex
(1, 1, '2026-05-10', '19:30:00', 18.00),
(1, 1, '2026-05-11', '20:00:00', 18.00),
(1, 2, '2026-05-24', '18:30:00', 16.00),

-- Medea
(2, 2, '2026-05-12', '19:00:00', 16.00),
(2, 1, '2026-05-25', '20:00:00', 18.00),
(2, 2, '2026-05-29', '21:00:00', 16.00),

-- Hamlet
(3, 3, '2026-05-13', '20:30:00', 20.00),
(3, 3, '2026-05-26', '19:30:00', 20.00),
(3, 4, '2026-05-28', '21:00:00', 17.00),

-- Romeo and Juliet
(4, 4, '2026-05-14', '18:30:00', 17.00),
(4, 3, '2026-05-22', '20:00:00', 20.00),
(4, 4, '2026-05-30', '19:00:00', 17.00),

-- The Phantom of the Opera
(5, 5, '2026-05-15', '21:00:00', 25.00),
(5, 5, '2026-05-26', '19:00:00', 25.00),
(5, 5, '2026-05-27', '20:30:00', 25.00),

-- Antigone
(6, 6, '2026-05-16', '19:30:00', 15.00),
(6, 6, '2026-05-23', '20:00:00', 15.00),
(6, 5, '2026-05-31', '18:30:00', 18.00);

-- Hall 1: Main Hall, 20 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id) VALUES
                                                                     (1, 'A', 1, 3), (1, 'A', 2, 3), (1, 'A', 3, 3), (1, 'A', 4, 3), (1, 'A', 5, 3),
                                                                     (1, 'B', 1, 2), (1, 'B', 2, 2), (1, 'B', 3, 2), (1, 'B', 4, 2), (1, 'B', 5, 2),
                                                                     (1, 'C', 1, 1), (1, 'C', 2, 1), (1, 'C', 3, 1), (1, 'C', 4, 1), (1, 'C', 5, 1),
                                                                     (1, 'D', 1, 1), (1, 'D', 2, 1), (1, 'D', 3, 1), (1, 'D', 4, 1), (1, 'D', 5, 1);

-- Hall 2: Studio Stage, 15 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id) VALUES
                                                                     (2, 'A', 1, 3), (2, 'A', 2, 3), (2, 'A', 3, 3), (2, 'A', 4, 3), (2, 'A', 5, 3),
                                                                     (2, 'B', 1, 2), (2, 'B', 2, 2), (2, 'B', 3, 2), (2, 'B', 4, 2), (2, 'B', 5, 2),
                                                                     (2, 'C', 1, 1), (2, 'C', 2, 1), (2, 'C', 3, 1), (2, 'C', 4, 1), (2, 'C', 5, 1);

-- Hall 3: Grand Hall, 20 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id)
SELECT 3, row_label, seat_number, category_id
FROM seats
WHERE hall_id = 1;

-- Hall 4: Experimental Stage, 15 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id)
SELECT 4, row_label, seat_number, category_id
FROM seats
WHERE hall_id = 2;

-- Hall 5: Royal Hall, 20 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id)
SELECT 5, row_label, seat_number, category_id
FROM seats
WHERE hall_id = 1;

-- Hall 6: Black Box, 15 seats
INSERT INTO seats (hall_id, row_label, seat_number, category_id)
SELECT 6, row_label, seat_number, category_id
FROM seats
WHERE hall_id = 2;