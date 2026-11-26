-- Startproducten van SML. Voer uit na schema.sql.
insert into categories (name) values
  ('T-shirts'),('Truien'),('Broeken'),('Jassen'),('Accessoires');

insert into products (category_id, name, description, price_cents, color, badge) values
  ((select id from categories where name='T-shirts'),'Heavy Tee','300 g/m² katoen, boxy fit',3900,'#101319','Bestseller'),
  ((select id from categories where name='T-shirts'),'Heavy Tee Kobalt','300 g/m² katoen, boxy fit, kobalt',3900,'#2a45ff',null),
  ((select id from categories where name='Truien'),'Studio Hoodie','450 g/m² fleece, dubbele capuchon',8900,'#4a5058','Nieuw'),
  ((select id from categories where name='Broeken'),'Tapered Pants','Stretch twill, tapered pasvorm',9900,'#1c2430',null),
  ((select id from categories where name='Broeken'),'Cargo Pants','Ripstop katoen, zes zakken',11900,'#7a7f6e',null),
  ((select id from categories where name='Jassen'),'Coach Jacket','Waterafstotende nylon, drukknopen',13900,'#101319','Nieuw'),
  ((select id from categories where name='Broeken'),'Court Shorts','Gewassen katoen, boven de knie',5900,'#c9ccd0',null),
  ((select id from categories where name='Accessoires'),'Logo Cap','Gewassen katoen, verstelbaar',2900,'#101319',null);

-- 20 stuks per maat als startvoorraad
insert into product_variants (product_id, size, stock)
select p.id, s.size, 20 from products p cross join (values ('S'),('M'),('L'),('XL')) as s(size);
