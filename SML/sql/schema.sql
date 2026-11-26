-- SML webshop: databaseschema (PostgreSQL, bijvoorbeeld Supabase of Neon)
-- Bedragen staan in eurocenten (integer) om afrondingsfouten te voorkomen.

create table categories (
  id    serial primary key,
  name  text not null unique
);

create table products (
  id           serial primary key,
  category_id  integer not null references categories(id),
  name         text not null,
  description  text,
  price_cents  integer not null check (price_cents >= 0),
  image_url    text,
  color        text,
  badge        text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table product_variants (
  id          serial primary key,
  product_id  integer not null references products(id) on delete cascade,
  size        text not null check (size in ('S','M','L','XL')),
  stock       integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create table orders (
  id              serial primary key,
  order_number    text not null unique,
  customer_name   text not null,
  customer_email  text not null,
  street          text not null,
  postal_code     text not null,
  city            text not null,
  shipping_cents  integer not null default 0,
  total_cents     integer not null,
  payment_method  text not null default 'bankoverschrijving',
  status          text not null default 'nieuw'
                  check (status in ('nieuw','betaald','verzonden','geannuleerd')),
  created_at      timestamptz not null default now()
);

create table order_items (
  id                  serial primary key,
  order_id            integer not null references orders(id) on delete cascade,
  product_id          integer not null references products(id),
  size                text not null,
  quantity            integer not null check (quantity > 0),
  unit_price_cents    integer not null
);

create index on products (category_id);
create index on orders (status, created_at desc);
create index on order_items (order_id);
