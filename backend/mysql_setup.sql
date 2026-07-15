CREATE DATABASE IF NOT EXISTS kalashala
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'kalashala_user'@'localhost'
  IDENTIFIED BY 'change-this-password';

CREATE USER IF NOT EXISTS 'kalashala_user'@'127.0.0.1'
  IDENTIFIED BY 'change-this-password';

GRANT ALL PRIVILEGES ON kalashala.* TO 'kalashala_user'@'localhost';
GRANT ALL PRIVILEGES ON kalashala.* TO 'kalashala_user'@'127.0.0.1';

FLUSH PRIVILEGES;
