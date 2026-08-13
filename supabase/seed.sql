insert into public.categories (name)
values
  ('Necklaces'),
  ('Chains'),
  ('Chainsets'),
  ('Pendants'),
  ('Bracelets'),
  ('Earrings'),
  ('Bangles')
on conflict (name) do nothing;

insert into public.finish_types (name)
values
  ('Antique'),
  ('Adstone'),
  ('Gold'),
  ('Rosegold')
on conflict (name) do nothing;

insert into public.occasion_types (name)
values
  ('Festive'),
  ('Casual')
on conflict (name) do nothing;
