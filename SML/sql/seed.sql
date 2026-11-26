-- Startcatalogus voor SML. Voer uit na schema.sql. Pas voorraad en prijzen aan vóór live verkoop.
insert into public.categories (name) values
  ('T-shirts'),('Truien'),('Broeken'),('Jassen'),('Accessoires')
on conflict (name) do nothing;

insert into public.products (category_id,name,description,price_cents,product_type,color,badge) values
  ((select id from public.categories where name='T-shirts'),'Heavy Tee','300 g/m² katoen · Boxy fit met brede schouder · Gemaakt voor dagelijks gebruik',3900,'tee','#252525','Bestseller'),
  ((select id from public.categories where name='T-shirts'),'Heavy Tee Kobalt','300 g/m² katoen · Boxy fit · Kobaltblauw',3900,'tee','#34383d',null),
  ((select id from public.categories where name='Truien'),'Studio Hoodie','450 g/m² fleece · Dubbele capuchon · Zachte binnenkant',8900,'hoodie','#555552','Nieuw'),
  ((select id from public.categories where name='Broeken'),'Tapered Pants','Stretch twill · Tapered pasvorm · Elastische tailleband',9900,'pants','#292929',null),
  ((select id from public.categories where name='Broeken'),'Cargo Pants','Ripstop katoen · Ruime cargozakken · Verstelbare enkelband',11900,'pants','#444440',null),
  ((select id from public.categories where name='Jassen'),'Coach Jacket','Lichtgewicht buitenlaag · Drukknopen · Relaxed fit',13900,'jacket','#202020','Nieuw'),
  ((select id from public.categories where name='Broeken'),'Court Shorts','Gewassen katoen · Lengte boven de knie · Twee steekzakken',5900,'shorts','#666560',null),
  ((select id from public.categories where name='Accessoires'),'Logo Cap','Gewassen katoen · Verstelbare sluiting · Subtiel SML-logo',2900,'cap','#252525',null)
on conflict (name) do update set category_id=excluded.category_id,description=excluded.description,
  price_cents=excluded.price_cents,product_type=excluded.product_type,color=excluded.color,badge=excluded.badge;

-- Startvoorraad voor demonstratie. Controleer en wijzig deze aantallen vóór je de winkel opent.
insert into public.product_variants (product_id,size,stock)
select p.id,s.size,20 from public.products p
cross join lateral unnest(case when p.product_type='cap' then array['One size'] else array['S','M','L','XL'] end) as s(size)
where p.active
on conflict (product_id,size) do nothing;
