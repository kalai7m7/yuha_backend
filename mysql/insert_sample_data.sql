USE yuhadb;

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Necklaces'), 
('Chains'), 
('Chainsets'),
('Pendants'),
('Bracelets'),
('Earrings'),
('Bangles');

-- Insert sample finish types
INSERT INTO finish_types (name) VALUES 
('Antique'), 
('Adstone'), 
('Gold'), 
('Rosegold');

-- Insert sample occasion types
INSERT INTO occasion_types (name) VALUES 
('Festive'), 
('Casual');

-- -- Insert sample products
-- INSERT INTO products (
--   p_name, description, short_description, price, offer_price, offer_label,
--   finish_type_id, delivery_time, count, category_id, occasion_type_id
-- ) VALUES
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Casual Rosegold Chain',
--   'Simple and elegant rosegold chain for daily wear.',
--   'Daily use rosegold chain',
--   899.00, 799.00, 'Best Seller',
--   4, '3-4 business days', 25, 2, 2
-- ),
-- (
--   'Antique Pendant Set',
--   'Antique style pendant perfect for traditional attire.',
--   'Antique pendant',
--   1299.00, 999.00, 'Limited Offer',
--   1, '4-6 business days', 15, 3, 1
-- ),
-- (
--   'Good Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Festive necklace',
--   3500, 2500, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   1000, 799, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   2999.99, 2499.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   1100.99, 1000, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   1000.99, 100.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- ),
-- (
--   'Elegant Gold Necklace',
--   'A premium quality gold necklace suitable for festive occasions.',
--   'Premium festive necklace',
--   400.99, 200.99, 'Festive Offer',
--   3, '5-7 business days', 10, 1, 1
-- );

-- -- Insert sample product images
-- INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES 
-- (1, 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1451/1717163853_65d5da3f0c4c7f40e2a5.png', 'Elegant Gold Necklace', 1),
-- (1, 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/149/01_17.jpg', 'Elegant Gold Necklace', 2),
-- (2, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (4, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (5, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (6, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (7, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (8, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (9, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (10, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (11, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (12, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (13, 'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fejxgk4e5jjx3hyzv6oe83j62yu2q&w=640&q=75', 'Casual Rosegold Chain', 1),
-- (3, 'https://example.com/images/antique_pendant.jpg', 'Antique Pendant Set', 1);

-- -- Insert sample customers
-- INSERT INTO customers (
--   name, phone_number, email, address_line, city, state, pincode
-- ) VALUES
-- (
--   'Asha Mehta', '9876543210', 'asha@example.com',
--   '123 MG Road', 'Bangalore', 'Karnataka', '560001'
-- ),
-- (
--   'Ravi Kumar', '9123456780', 'ravi@example.com',
--   '45 Nehru Street', 'Chennai', 'Tamil Nadu', '600002'
-- );

-- -- Insert sample orders
-- INSERT INTO orders (customer_id, total_amount, status) VALUES
-- (1, 2499.99, 'confirmed'),
-- (2, 1798.00, 'pending');

-- -- Insert sample order items
-- INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- (1, 1, 1, 2499.99),
-- (2, 2, 1, 799.00),
-- (2, 3, 1, 999.00);

-- -- Check tables
-- SHOW TABLES;

-- -- View sample data
-- SELECT * FROM categories;
-- SELECT * FROM finish_types;
-- SELECT * FROM occasion_types;
-- SELECT * FROM products;
-- SELECT * FROM product_images;
-- SELECT * FROM customers;
-- SELECT * FROM orders;
-- SELECT * FROM order_items;
SELECT * FROM product_images;
