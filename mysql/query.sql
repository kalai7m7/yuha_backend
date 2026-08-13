-- SELECT 
--       p.product_id,
--       p.p_name,
--       p.description,
--       p.short_description,
--       p.price,
--       p.offer_price,
--       p.offer_label,
--       f.name AS finish_type,
--       p.delivery_time,
--       p.count,
--       c.name AS category,
--       o.name AS occasion_type,
--       pi.image_url,
--       pi.alt_text,
--       p.created_at
--     FROM products p
--     JOIN categories c ON p.category_id = c.category_id
--     JOIN finish_types f ON p.finish_type_id = f.finish_type_id
--     JOIN occasion_types o ON p.occasion_type_id = o.occasion_type_id
--     LEFT JOIN product_images pi ON p.product_id = pi.product_id
--     ORDER BY p.product_id;
    
SELECT 
  p.product_id,
  p.p_name,
  p.description,
  p.short_description,
  p.price,
  p.offer_price,
  p.offer_label,
  f.name AS finish_type,
  p.delivery_time,
  p.count,
  c.name AS category,
  o.name AS occasion_type,
  GROUP_CONCAT(pi.image_url) AS image_urls,
  GROUP_CONCAT(pi.alt_text) AS alt_texts,
  p.created_at
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN finish_types f ON p.finish_type_id = f.finish_type_id
JOIN occasion_types o ON p.occasion_type_id = o.occasion_type_id
LEFT JOIN product_images pi ON p.product_id = pi.product_id
GROUP BY p.product_id
ORDER BY p.product_id;
