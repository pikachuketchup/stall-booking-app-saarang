-- MySQL Database Schema for Box Booking Application

CREATE DATABASE IF NOT EXISTS box_booking_db;
USE box_booking_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boxes Table
CREATE TABLE IF NOT EXISTS boxes (
  id INT PRIMARY KEY,
  box_number INT NOT NULL,
  booked_by VARCHAR(100) NULL,
  booked_at TIMESTAMP NULL,
  FOREIGN KEY (booked_by) REFERENCES users(username) ON DELETE SET NULL
);

-- Initialize 36 Boxes (if table is empty)
INSERT IGNORE INTO boxes (id, box_number, booked_by, booked_at)
VALUES
(1, 1, NULL, NULL), (2, 2, NULL, NULL), (3, 3, NULL, NULL), (4, 4, NULL, NULL), (5, 5, NULL, NULL), (6, 6, NULL, NULL),
(7, 7, NULL, NULL), (8, 8, NULL, NULL), (9, 9, NULL, NULL), (10, 10, NULL, NULL), (11, 11, NULL, NULL), (12, 12, NULL, NULL),
(13, 13, NULL, NULL), (14, 14, NULL, NULL), (15, 15, NULL, NULL), (16, 16, NULL, NULL), (17, 17, NULL, NULL), (18, 18, NULL, NULL),
(19, 19, NULL, NULL), (20, 20, NULL, NULL), (21, 21, NULL, NULL), (22, 22, NULL, NULL), (23, 23, NULL, NULL), (24, 24, NULL, NULL),
(25, 25, NULL, NULL), (26, 26, NULL, NULL), (27, 27, NULL, NULL), (28, 28, NULL, NULL), (29, 29, NULL, NULL), (30, 30, NULL, NULL),
(31, 31, NULL, NULL), (32, 32, NULL, NULL), (33, 33, NULL, NULL), (34, 34, NULL, NULL), (35, 35, NULL, NULL), (36, 36, NULL, NULL);
