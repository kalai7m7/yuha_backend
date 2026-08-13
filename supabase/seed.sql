-- ============================================================
-- Yuha Exclusives — Seed data
-- Lookup tables + delivery pincodes + admins + dummy products
-- ============================================================

-- ── Lookup tables ─────────────────────────────────────────────

INSERT INTO categories (name) VALUES
  ('Necklaces'), ('Chains'), ('Chainsets'),
  ('Pendants'), ('Bracelets'), ('Earrings'), ('Bangles');

INSERT INTO finish_types (name) VALUES
  ('Antique'), ('Adstone'), ('Gold'), ('Rosegold');

INSERT INTO occasion_types (name) VALUES
  ('Festive'), ('Casual');

-- ── Delivery pincodes ─────────────────────────────────────────

INSERT INTO delivery_pincodes (pincode, city, state) VALUES
  ('110001', 'New Delhi',  'Delhi'),
  ('110002', 'New Delhi',  'Delhi'),
  ('110003', 'New Delhi',  'Delhi'),
  ('400001', 'Mumbai',     'Maharashtra'),
  ('400002', 'Mumbai',     'Maharashtra'),
  ('400003', 'Mumbai',     'Maharashtra'),
  ('560001', 'Bengaluru',  'Karnataka'),
  ('560002', 'Bengaluru',  'Karnataka'),
  ('560003', 'Bengaluru',  'Karnataka'),
  ('600001', 'Chennai',    'Tamil Nadu'),
  ('600002', 'Chennai',    'Tamil Nadu'),
  ('600003', 'Chennai',    'Tamil Nadu'),
  ('700001', 'Kolkata',    'West Bengal'),
  ('700002', 'Kolkata',    'West Bengal'),
  ('700003', 'Kolkata',    'West Bengal'),
  ('500001', 'Hyderabad',  'Telangana'),
  ('500002', 'Hyderabad',  'Telangana'),
  ('500003', 'Hyderabad',  'Telangana');

-- ── Admin users ───────────────────────────────────────────────

INSERT INTO admins (email, password, role) VALUES
  ('kalai7mdhoni@gmail.com', '', 'admin'),
  ('kalai7@gmail.com',       '', 'admin');

-- ── Dummy products ────────────────────────────────────────────
-- category_id:       1=Necklaces 2=Chains 3=Chainsets 4=Pendants 5=Bracelets 6=Earrings 7=Bangles
-- finish_type_id:    1=Antique   2=Adstone 3=Gold     4=Rosegold
-- occasion_type_id:  1=Festive   2=Casual

INSERT INTO products
  (p_name, description, short_description, price, offer_price, offer_label,
   finish_type_id, delivery_time, count, category_id, occasion_type_id, is_available)
VALUES
  (
    'Classic Gold Necklace',
    'Elegant 22kt gold necklace with intricate floral design, perfect for weddings and festive occasions.',
    'Festive floral gold necklace',
    4999.00, 3999.00, '20% OFF',
    3, '5-7 business days', 15, 1, 1, TRUE
  ),
  (
    'Rosegold Chain Set',
    'Delicate rosegold chain set with matching earrings. Ideal for casual daily wear.',
    'Rosegold chain set',
    2499.00, 1999.00, 'Best Seller',
    4, '3-5 business days', 30, 3, 2, TRUE
  ),
  (
    'Antique Pendant',
    'Handcrafted antique finish pendant with traditional temple design.',
    'Antique temple pendant',
    1299.00, NULL, NULL,
    1, '4-6 business days', 20, 4, 1, TRUE
  ),
  (
    'AD Stone Bangles Set',
    'Set of 6 American diamond stone bangles with gold plating. Perfect for festive gatherings.',
    'AD stone bangle set of 6',
    3499.00, 2799.00, 'Festive Deal',
    2, '5-7 business days', 10, 7, 1, TRUE
  ),
  (
    'Rosegold Bracelet',
    'Slim rosegold bracelet with heart charm. A perfect everyday accessory.',
    'Slim heart charm bracelet',
    899.00, 749.00, 'New Arrival',
    4, '2-4 business days', 50, 5, 2, TRUE
  ),
  (
    'Gold Drop Earrings',
    'Lightweight gold drop earrings with pearl detail. Suitable for all occasions.',
    'Gold pearl drop earrings',
    1599.00, 1299.00, '18% OFF',
    3, '3-5 business days', 25, 6, 2, TRUE
  ),
  (
    'Antique Choker Necklace',
    'Statement antique choker with oxidised finish and red stone accents.',
    'Antique choker with red stones',
    2999.00, 2499.00, 'Limited Stock',
    1, '5-7 business days', 8, 1, 1, TRUE
  ),
  (
    'Gold Chain 22kt',
    'Classic 22kt gold chain, 18 inches. Daily wear essential.',
    '22kt gold chain 18 inch',
    5999.00, NULL, NULL,
    3, '5-7 business days', 12, 2, 2, TRUE
  ),
  (
    'Casual Rosegold Earrings',
    'Small round rosegold stud earrings. Minimalist design for everyday use.',
    'Rosegold studs',
    599.00, 499.00, 'Under ₹500',
    4, '2-4 business days', 60, 6, 2, TRUE
  ),
  (
    'Adstone Necklace Set',
    'Full bridal American diamond necklace set with earrings and maang tikka.',
    'Bridal AD stone full set',
    8999.00, 7499.00, 'Bridal Special',
    2, '7-10 business days', 5, 1, 1, TRUE
  );

-- ── Dummy product images ──────────────────────────────────────
-- Using placeholder image service URLs until real uploads are done.
-- Replace with actual Supabase Storage URLs after uploading real images.

INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES
  (1, 'https://placehold.co/600x600/gold/white?text=Gold+Necklace',       'Classic Gold Necklace front view',   1),
  (1, 'https://placehold.co/600x600/gold/white?text=Gold+Necklace+2',     'Classic Gold Necklace side view',    2),
  (2, 'https://placehold.co/600x600/pink/white?text=Rosegold+Chain',      'Rosegold Chain Set',                 1),
  (3, 'https://placehold.co/600x600/brown/white?text=Antique+Pendant',    'Antique Pendant',                    1),
  (4, 'https://placehold.co/600x600/gold/white?text=AD+Bangles',          'AD Stone Bangles Set',               1),
  (4, 'https://placehold.co/600x600/gold/white?text=AD+Bangles+2',        'AD Stone Bangles close up',          2),
  (5, 'https://placehold.co/600x600/pink/white?text=Rosegold+Bracelet',   'Rosegold Bracelet',                  1),
  (6, 'https://placehold.co/600x600/gold/white?text=Gold+Earrings',       'Gold Drop Earrings',                 1),
  (7, 'https://placehold.co/600x600/brown/white?text=Antique+Choker',     'Antique Choker Necklace',            1),
  (7, 'https://placehold.co/600x600/brown/white?text=Antique+Choker+2',   'Antique Choker back',                2),
  (8, 'https://placehold.co/600x600/gold/white?text=Gold+Chain',          'Gold Chain 22kt',                    1),
  (9, 'https://placehold.co/600x600/pink/white?text=Rosegold+Studs',      'Rosegold Stud Earrings',             1),
  (10,'https://placehold.co/600x600/silver/white?text=AD+Necklace+Set',   'Adstone Necklace Set full',          1),
  (10,'https://placehold.co/600x600/silver/white?text=AD+Necklace+Set+2', 'Adstone Necklace Set detail',        2);
