-- TajMart schema. Run this in the Supabase SQL editor.
-- The browser uses the anon key and can only read products.
-- Users, orders, and cart_items are written by Edge Functions with the service role.

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  category text not null,
  image_url text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  google_id text not null unique,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id),
  items jsonb not null,
  total integer not null check (total >= 0),
  delivery_address text not null,
  phone text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

comment on column orders.items is 'Array of {id, name, price, quantity}. Price is in naira.';
comment on column orders.total is 'Grand total in naira, including delivery.';

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

comment on table cart_items is 'Shared basket for one Google user. Written only by the cart Edge Function.';

create index if not exists products_category_idx on products (category);
create index if not exists orders_user_id_idx on orders (user_id);
create index if not exists cart_items_user_id_idx on cart_items (user_id);

alter table products enable row level security;
alter table users enable row level security;
alter table orders enable row level security;
alter table cart_items enable row level security;

drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products
  for select
  to anon, authenticated
  using (true);

insert into products (id, name, description, price, category, image_url, stock_quantity) values
  ('00000000-0000-4000-8000-000000000001', 'Garri Ijebu 5kg', 'Fine, slightly sour Ijebu garri for eba that holds. Washed, toasted, and packed as a 5kg sack.', 4500, 'Nigerian Staples', '/products/garri.jpg', 36),
  ('00000000-0000-4000-8000-000000000002', 'Semovita 2kg', 'Golden Penny Semovita for a smooth swallow. 2kg bag, the midweek size.', 3200, 'Nigerian Staples', '/products/semovita.jpg', 28),
  ('00000000-0000-4000-8000-000000000003', 'Golden Penny Rice 5kg', 'Long-grain parboiled rice that cooks separate. A 5kg bag for the household pot.', 9200, 'Nigerian Staples', '/products/rice.jpg', 22),
  ('00000000-0000-4000-8000-000000000004', 'Honey Beans 2kg', 'Honey beans, cleaned and ready to soak. 2kg, enough for a pot of stew beans.', 3800, 'Nigerian Staples', '/products/beans.jpg', 30),
  ('00000000-0000-4000-8000-000000000005', 'Palm Oil 75cl', 'Red palm oil with a deep colour for banga, stew, and fried plantain. 75cl bottle.', 2600, 'Nigerian Staples', '/products/palm.jpg', 34),
  ('00000000-0000-4000-8000-000000000006', 'Groundnut Oil 1L', 'Neutral groundnut oil for frying and everyday cooking. 1 litre.', 3400, 'Nigerian Staples', '/products/groundnut.jpg', 26),
  ('00000000-0000-4000-8000-000000000007', 'Maggi Star Cubes', 'The yellow cube that seasons the pot. A pack for the week of soups and rice.', 1250, 'Nigerian Staples', '/products/maggi.jpg', 48),
  ('00000000-0000-4000-8000-000000000008', 'Dangote Sugar 1kg', 'Granulated sugar in a 1kg pack for tea, pap, and baking.', 1650, 'Nigerian Staples', '/products/sugar.jpg', 40),
  ('00000000-0000-4000-8000-000000000009', 'Tomato Paste 400g', 'Concentrated tomato paste, 400g tin. Stretch it with fresh pepper and onion.', 900, 'Nigerian Staples', '/products/tomato.jpg', 50),
  ('00000000-0000-4000-8000-000000000010', 'Indomie Chicken 70g', 'Chicken flavour Indomie, the 70g pack. Boil, stir, and eat.', 300, 'Nigerian Staples', '/products/indomie.jpg', 80),
  ('00000000-0000-4000-8000-000000000011', 'Coca-Cola 50cl', 'Chilled-when-you-want-it Coca-Cola in the 50cl bottle.', 400, 'Drinks & Beverages', '/products/coke.jpg', 60),
  ('00000000-0000-4000-8000-000000000012', 'Fanta Orange 50cl', 'Fanta orange, 50cl. The bright one that goes with meat pie.', 400, 'Drinks & Beverages', '/products/fanta.jpg', 60),
  ('00000000-0000-4000-8000-000000000013', 'Sprite 50cl', 'Sprite lemon-lime, 50cl bottle.', 400, 'Drinks & Beverages', '/products/sprite.jpg', 55),
  ('00000000-0000-4000-8000-000000000014', 'Peak Milk 400g', 'Peak full cream milk powder, 400g tin. For tea, custard, and pap.', 2800, 'Drinks & Beverages', '/products/peak.jpg', 32),
  ('00000000-0000-4000-8000-000000000015', 'Milo 400g', 'Nestlé Milo, 400g tin. Chocolate malt for morning and after school.', 2950, 'Drinks & Beverages', '/products/milo.jpg', 30),
  ('00000000-0000-4000-8000-000000000016', 'Eva Water 75cl', 'Eva table water, 75cl bottle.', 200, 'Drinks & Beverages', '/products/water.jpg', 90),
  ('00000000-0000-4000-8000-000000000017', 'Five Alive Pulpy', 'Five Alive pulpy juice drink. Fruit, chill, and a straw if you have one.', 650, 'Drinks & Beverages', '/products/fivealive.jpg', 24),
  ('00000000-0000-4000-8000-000000000018', 'Hollandia Yoghurt 1L', 'Hollandia yoghurt, 1 litre. Drink it cold or pour it over cereal.', 1800, 'Drinks & Beverages', '/products/hollandia.jpg', 18),
  ('00000000-0000-4000-8000-000000000019', 'Agege Bread', 'A sliced Agege loaf, soft in the middle with a little pull on the crust.', 1300, 'Bread & Bakery', '/products/agege.jpg', 20),
  ('00000000-0000-4000-8000-000000000020', 'Butter Bread', 'Butter bread, lightly sweet. Toast it or eat it with eggs.', 950, 'Bread & Bakery', '/products/butterbread.jpg', 16),
  ('00000000-0000-4000-8000-000000000021', 'Meat Pie', 'A single meat pie, peppered filling, flaky enough for the afternoon.', 600, 'Bread & Bakery', '/products/meatpie.jpg', 14),
  ('00000000-0000-4000-8000-000000000022', 'Chin Chin 250g', 'Crunchy chin chin, 250g pack. Sweet, salty, and gone quickly.', 850, 'Bread & Bakery', '/products/chinchin.jpg', 22),
  ('00000000-0000-4000-8000-000000000023', 'Morning Fresh 400ml', 'Morning Fresh dishwashing liquid, 400ml. Cuts stew pots and oil.', 1450, 'Household Essentials', '/products/morningfresh.jpg', 27),
  ('00000000-0000-4000-8000-000000000024', 'Omo Detergent 900g', 'Omo washing powder, 900g. For the weekly load.', 2300, 'Household Essentials', 'glyph://omo', 25),
  ('00000000-0000-4000-8000-000000000025', 'Tissue 4 Rolls', 'Soft tissue, a pack of four rolls for kitchen and bathroom.', 1600, 'Household Essentials', '/products/tissue.jpg', 33),
  ('00000000-0000-4000-8000-000000000026', 'Dettol Bar Soap', 'Dettol anti-bacterial bar. One bar for the sink.', 750, 'Household Essentials', '/products/dettol.jpg', 44)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url,
  stock_quantity = excluded.stock_quantity;
