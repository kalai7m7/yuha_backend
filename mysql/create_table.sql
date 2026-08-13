USE yuhadb;
-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS finish_types;
DROP TABLE IF EXISTS occasion_types;

-- Categories Table
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Finish Types Table
CREATE TABLE finish_types (
  finish_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Occasion Types Table
CREATE TABLE occasion_types (
  occasion_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Products Table
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  p_name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  offer_price DECIMAL(10,2),
  offer_label VARCHAR(100),
  finish_type_id INT,
  delivery_time VARCHAR(100),
  count INT DEFAULT 0,
  category_id INT,
  occasion_type_id INT,
  is_available BOOLEAN DEFAULT TRUE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (finish_type_id) REFERENCES finish_types(finish_type_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (occasion_type_id) REFERENCES occasion_types(occasion_type_id)
);

-- Product Images Table
-- CREATE TABLE product_images (
--   image_id INT AUTO_INCREMENT PRIMARY KEY,
--   product_id INT,
--   image_url VARCHAR(500),
--   alt_text VARCHAR(255),
--   FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
-- );

CREATE TABLE product_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT NULL,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);


-- Customers Table
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  phone_number VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  address_line TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Items Table
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);


SHOW tables;

SELECT * FROM categories;
