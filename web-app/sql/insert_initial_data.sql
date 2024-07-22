USE cinephoria_db;

-- Insert initial users (super admin, admin, employee, customer)
INSERT INTO User (userFirstName, userLastName, userUserName, userPassword, userEmail, userRole, isVerified, agreedPolicy, agreedCgvCgu) VALUES
('Jeremy', 'Dan', 'jeremy', 'hashed_password_here', 'dev.jeremylhomme@gmail.com', 'admin', TRUE, TRUE, TRUE),
('Admin', 'User', 'admin_user', 'hashed_password_here', 'admin@cinephoria.com', 'admin', TRUE, TRUE, TRUE),
('Employee', 'User', 'employee_user', 'hashed_password_here', 'employee@cinephoria.com', 'employee', TRUE, TRUE, TRUE),
('Customer', 'User', 'customer_user', 'hashed_password_here', 'customer@example.com', 'customer', TRUE, TRUE, TRUE);

-- Set mustChangePassword for admin and employee
UPDATE User SET mustChangePassword = TRUE WHERE userRole IN ('admin', 'employee');

-- Insert initial categories
INSERT INTO Category (categoryName) VALUES
('Aventure'),
('Action'),
('Comédie'),
('Drame'),
('Fantastique'),
('Horreur'),
('Science-fiction'),
('Thriller');

-- Insert initial cinemas
INSERT INTO Cinema (cinemaName, cinemaEmail, cinemaAddress, cinemaPostalCode, cinemaCity, cinemaCountry, cinemaTelNumber, cinemaStartTimeOpening, cinemaEndTimeOpening) VALUES
('Cinéphoria Nantes', 'nantes@cinephoria.jeremylhomme.fr', '1 Rue de Nantes', '44000', 'Nantes', 'France', '+33 2 40 00 00 01', '09:00', '23:00'),
('Cinéphoria Paris', 'paris@cinephoria.jeremylhomme.fr', '2 Avenue des Champs-Élysées', '75008', 'Paris', 'France', '+33 1 40 00 00 02', '10:00', '22:00'),
('Cinéphoria Bordeaux', 'bordeaux@cinephoria.jeremylhomme.fr', '3 Place de la Bourse', '33000', 'Bordeaux', 'France', '+33 5 40 00 00 03', '11:00', '23:00'),
('Cinéphoria Lille', 'lille@cinephoria.jeremylhomme.fr', '4 Grand Place', '59000', 'Lille', 'France', '+33 3 20 00 00 04', '09:00', '21:00'),
('Cinéphoria Toulouse', 'toulouse@cinephoria.jeremylhomme.fr', '5 Place du Capitole', '31000', 'Toulouse', 'France', '+33 5 34 00 00 05', '08:00', '20:00'),
('Cinéphoria Charleroi', 'charleroi@cinephoria.jeremylhomme.fr', '6 Rue de la Montagne', '6000', 'Charleroi', 'Belgium', '+32 71 00 00 06', '10:00', '22:00'),
('Cinéphoria Liège', 'liege@cinephoria.jeremylhomme.fr', '7 Place Saint-Lambert', '4000', 'Liège', 'Belgium', '+32 4 00 00 07', '09:00', '21:00');

-- Insert initial movies
INSERT INTO Movie (movieTitle, movieDescription, movieReleaseDate, movieTrailerUrl, movieLength, movieImg, moviePublishingState, movieFavorite, movieMinimumAge, movieScheduleDate, moviePremiereDate) VALUES
('La Règle du jeu', 'Une vie bourgeoise en France à la veille de la Seconde Guerre mondiale, où les riches et leurs pauvres serviteurs se rencontrent dans un château français.', '1939-07-07', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/la-regle-du-jeu.mp4', 106, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/la-regle-du-jeu.webp', 'active', TRUE, 12, '2024-11-15', NULL),
('Astérix et Obélix : Mission Cléopâtre', 'Astérix, Obélix et Panoramix aident un architecte à construire un palais pour Cléopâtre en trois mois, afin de prouver que les Gaulois sont les plus forts.', '2002-01-30', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/asterix-obelix-mission-cleopatre.mp4', 107, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/asterix-obelix-mission-cleopatre.webp', 'active', TRUE, 10, '2024-09-04', NULL),
('Les Enfants du Paradis', 'La vie théâtrale d''une belle courtisane et des quatre hommes qui l''aiment.', '1945-03-09', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/les-enfants-du-paradis.mp4', 190, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/les-enfants-du-paradis.webp', 'inactive', TRUE, 12, NULL, NULL),
('Le Salaire de la peur', 'Dans un village décrépit d''Amérique du Sud, quatre hommes sont embauchés pour transporter une cargaison urgente de nitroglycérine sans l''équipement qui la rendrait sûre.', '1953-04-16', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/le-salaire-de-la-peur.mp4', 156, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-salaire-de-la-peur.webp', 'inactive', TRUE, 12, NULL, NULL),
('Le Fabuleux Destin d''Amélie Poulain', 'Amélie est une fille innocente et naïve à Paris avec son propre sens de la justice.', '2001-04-25', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/le-fabuleux-destin-d-amelie-poulain.mp4', 122, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-fabuleux-destin-d-amelie-poulain.webp', 'active', TRUE, 12, '2024-10-05', NULL),
('Le Samouraï', 'Après que le tueur à gages professionnel Jef Costello soit vu par des témoins, ses efforts pour se fournir un alibi le poussent encore plus loin dans un coin.', '1967-10-25', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/le-samourai.mp4', 105, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-samourai.webp', 'inactive', FALSE, 12, NULL, NULL),
('La Haine', 'Une journée dans la vie de trois jeunes hommes dans les banlieues françaises le lendemain d''une émeute violente.', '1995-05-31', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/la-haine.mp4', 97, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/la-haine.jpg', 'active', TRUE, 16, '2025-03-10', NULL),
('Léon', 'Mathilda, une fille de 12 ans, est recueillie à contrecœur par Léon, un tueur à gages professionnel, après que sa famille a été assassinée.', '1994-09-14', 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Videos/leon.mp4', 110, 'https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/leon.jpg', 'premiere', FALSE, 16, NULL, '2025-04-01');

-- Insert movie categories
INSERT INTO _CategoryToMovie (A, B) VALUES
(3, 1), (4, 1), (1, 2), (3, 2), (4, 3), (1, 4), (4, 4), (8, 4), (3, 5), (4, 6), (8, 6), (4, 7), (2, 8), (4, 8);

-- Insert initial rooms
INSERT INTO Room (cinemaId, roomCapacity, roomNumber, roomQuality) VALUES
(3, 100, 1, 'Standard'),
(3, 130, 2, 'Dolby Cinema'),
(3, 90, 3, 'ScreenX'),
(3, 180, 4, 'IMAX'),
(3, 140, 5, 'RealD 3D'),
(3, 110, 6, '4DX'),
(2, 120, 1, 'Standard'),
(2, 150, 2, 'Dolby Cinema'),
(2, 110, 3, 'ScreenX'),
(2, 200, 4, 'IMAX'),
(2, 160, 5, 'RealD 3D'),
(2, 130, 6, '4DX'),
(1, 110, 1, 'Standard'),
(1, 140, 2, 'Dolby Cinema'),
(1, 100, 3, 'ScreenX'),
(1, 190, 4, 'IMAX'),
(1, 150, 5, 'RealD 3D'),
(1, 120, 6, '4DX'),
(4, 90, 1, 'Standard'),
(4, 120, 2, 'Dolby Cinema'),
(4, 90, 3, 'ScreenX'),
(4, 170, 4, 'IMAX'),
(4, 130, 5, 'RealD 3D'),
(4, 100, 6, '4DX'),
(5, 110, 1, 'Standard'),
(5, 140, 2, 'Dolby Cinema'),
(5, 100, 3, 'ScreenX'),
(5, 190, 4, 'IMAX'),
(5, 150, 5, 'RealD 3D'),
(5, 120, 6, '4DX'),
(6, 90, 1, 'Standard'),
(6, 120, 2, 'Dolby Cinema'),
(6, 90, 3, 'ScreenX'),
(6, 170, 4, 'IMAX'),
(6, 130, 5, 'RealD 3D'),
(6, 100, 6, '4DX'),
(7, 120, 1, 'Standard'),
(7, 150, 2, 'Dolby Cinema'),
(7, 100, 3, 'ScreenX'),
(7, 180, 4, 'IMAX'),
(7, 160, 5, 'RealD 3D'),
(7, 120, 6, '4DX');

-- Generate seats for each room
INSERT INTO Seat (seatNumber, roomId)
SELECT 
    CONCAT(LPAD(seq.seq, 3, '0')) as seatNumber,
    r.id as roomId
FROM 
    Room r
    CROSS JOIN (
        SELECT a.N + b.N * 10 + 1 as seq
        FROM 
            (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
            (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
        ORDER BY seq
    ) seq
WHERE 
    seq.seq <= r.roomCapacity;

-- Insert sample sessions
INSERT INTO Session (movieId, cinemaId, roomId, sessionDate, sessionPrice, sessionStatus) VALUES
(1, 1, 1, '2024-07-23 14:00:00', 10.50, 'active'),
(2, 2, 2, '2024-07-23 16:30:00', 12.00, 'active'),
(3, 3, 3, '2024-07-23 19:00:00', 11.50, 'active'),
(4, 4, 4, '2024-07-23 21:30:00', 13.00, 'active'),
(5, 5, 5, '2024-07-24 15:00:00', 10.00, 'active');

-- Insert sample time ranges for each session
INSERT INTO TimeRange (timeRangeStartTime, timeRangeEndTime, sessionId, timeRangeStatus) VALUES
('2024-07-23 14:00:00', '2024-07-23 15:46:00', 1, 'available'),
('2024-07-23 16:30:00', '2024-07-23 18:17:00', 2, 'available'),
('2024-07-23 19:00:00', '2024-07-23 22:10:00', 3, 'available'),
('2024-07-23 21:30:00', '2024-07-24 00:06:00', 4, 'available'),
('2024-07-24 15:00:00', '2024-07-24 17:02:00', 5, 'available');

-- Insert sample seat statuses for the first time range
INSERT INTO SeatStatus (seatId, timeRangeId, status)
SELECT s.id, 1, 'available'
FROM Seat s
WHERE s.roomId = 1
LIMIT 10;  -- Just adding status for the first 10 seats as an example