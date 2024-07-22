-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS cinephoria_db;
USE cinephoria_db;

-- Create User table
CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userFirstName VARCHAR(255) NOT NULL,
  userLastName VARCHAR(255) NOT NULL,
  userUserName VARCHAR(255) UNIQUE,
  userPassword VARCHAR(255) NOT NULL,
  userEmail VARCHAR(255) UNIQUE NOT NULL,
  userRole ENUM('admin', 'employee', 'customer') DEFAULT 'customer',
  userCreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userUpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  mustChangePassword BOOLEAN DEFAULT FALSE,
  isVerified BOOLEAN DEFAULT FALSE,
  verificationCode VARCHAR(255) UNIQUE,
  verificationCodeExpires DATETIME,
  resetToken VARCHAR(255),
  resetTokenExpires DATETIME,
  agreedPolicy BOOLEAN DEFAULT FALSE,
  agreedCgvCgu BOOLEAN DEFAULT FALSE
);

-- Create Category table
CREATE TABLE Category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryName VARCHAR(255) UNIQUE NOT NULL
);

-- Create Movie table
CREATE TABLE Movie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movieDescription TEXT NOT NULL,
  movieReleaseDate DATETIME NOT NULL,
  movieTrailerUrl VARCHAR(255) NOT NULL,
  movieTitle VARCHAR(255) UNIQUE NOT NULL,
  movieLength INT NOT NULL,
  movieImg VARCHAR(255) NOT NULL,
  moviePublishingState ENUM('premiere', 'active', 'inactive') DEFAULT 'active',
  movieFavorite BOOLEAN DEFAULT FALSE,
  movieMinimumAge INT DEFAULT 0,
  movieCreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  movieUpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  movieScheduleDate DATETIME,
  moviePremiereDate DATETIME,
  movieAverageRating FLOAT DEFAULT 0
);

-- Create MovieCategory junction table
CREATE TABLE MovieCategory (
  movieId INT,
  categoryId INT,
  PRIMARY KEY (movieId, categoryId),
  FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
);

-- Create Cinema table
CREATE TABLE Cinema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cinemaName VARCHAR(255) UNIQUE NOT NULL,
  cinemaEmail VARCHAR(255) UNIQUE NOT NULL,
  cinemaAddress VARCHAR(255) NOT NULL,
  cinemaPostalCode VARCHAR(255) NOT NULL,
  cinemaCity VARCHAR(255) NOT NULL,
  cinemaCountry VARCHAR(255) NOT NULL,
  cinemaTelNumber VARCHAR(255) NOT NULL,
  cinemaStartTimeOpening VARCHAR(255) NOT NULL,
  cinemaEndTimeOpening VARCHAR(255) NOT NULL
);

-- Create Room table
CREATE TABLE Room (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cinemaId INT NOT NULL,
  roomNumber INT NOT NULL,
  roomCapacity INT NOT NULL,
  roomQuality VARCHAR(255) NOT NULL,
  deleted_at DATETIME,
  seatMapId VARCHAR(255) DEFAULT (UUID()),
  FOREIGN KEY (cinemaId) REFERENCES Cinema(id)
);

-- Create Seat table
CREATE TABLE Seat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seatNumber VARCHAR(255) NOT NULL,
  pmrSeat BOOLEAN DEFAULT FALSE,
  roomId INT NOT NULL,
  FOREIGN KEY (roomId) REFERENCES Room(id)
);

-- Create Session table
CREATE TABLE Session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movieId INT NOT NULL,
  cinemaId INT NOT NULL,
  roomId INT NOT NULL,
  sessionDate DATETIME NOT NULL,
  sessionPrice FLOAT NOT NULL,
  sessionStatus ENUM('active', 'ended', 'deleted') DEFAULT 'active',
  deletedAt DATETIME,
  FOREIGN KEY (movieId) REFERENCES Movie(id),
  FOREIGN KEY (cinemaId) REFERENCES Cinema(id),
  FOREIGN KEY (roomId) REFERENCES Room(id)
);

-- Create TimeRange table
CREATE TABLE TimeRange (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timeRangeStartTime DATETIME NOT NULL,
  timeRangeEndTime DATETIME NOT NULL,
  sessionId INT NOT NULL,
  timeRangeStatus ENUM('available', 'booking', 'booked') DEFAULT 'available',
  FOREIGN KEY (sessionId) REFERENCES Session(id) ON DELETE CASCADE,
  UNIQUE KEY (timeRangeStartTime, timeRangeEndTime, sessionId)
);

-- Create SeatStatus table
CREATE TABLE SeatStatus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seatId INT NOT NULL,
  timeRangeId INT NOT NULL,
  status ENUM('available', 'pending', 'booked') NOT NULL,
  FOREIGN KEY (seatId) REFERENCES Seat(id),
  FOREIGN KEY (timeRangeId) REFERENCES TimeRange(id) ON DELETE CASCADE,
  UNIQUE KEY (seatId, timeRangeId)
);