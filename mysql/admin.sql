use yuhadb;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (email, password)
VALUES (
  'kalai7mdhoni@gmail.com',
  '$2b$10$EWRdJ3slXFtJelBh6Tgf5OIW8PlJ4yCsgW1kHbEy3Nrq6Z5.HzfsC'
);



SELECT * FROM admins;