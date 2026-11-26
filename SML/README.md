# SML Menswear webshop

## Starten
Open `index.html` in je browser. Er is niets te installeren.

## Bestanden
- `index.html` pagina-opbouw
- `css/styles.css` vormgeving (kleuren staan bovenaan als variabelen)
- `js/products.js` productcatalogus
- `js/app.js` winkelmand, productpagina, afrekenen en beheer
- `sql/schema.sql` databaseschema voor een latere echte shop (PostgreSQL)
- `sql/seed.sql` de huidige producten als startdata

## Eigen artikelen toevoegen
Open `js/products.js` en kopieer een regel. Pas `id` (uniek), `n` (naam), `c` (categorie), `p` (prijs in euro), `t` (tee, hoodie, pants, shorts, jacket of cap) en `col` (kleur) aan.
Voor een echte foto zet je in `t` een `data:`-afbeelding. Wil je bestanden uit een map `img/` gebruiken, dan is een kleine aanpassing in de functie `svg` in `app.js` nodig.

## Bestellen
De klant plaatst een bestelling en verstuurt die per e-mail naar semdj2009@gmail.com. Pas dit adres aan in `js/app.js` (zoek op `mailto:`).
Betaling gaat via bankoverschrijving. De bestellingen komen niet automatisch in een database.

## Echte webshop later
De SQL-bestanden zijn bedoeld voor een backend met database. De huidige pagina gebruikt ze nog niet.
Voor automatische orders en iDEAL heb je een backend en een betaalprovider zoals Mollie nodig, en dus een KvK-nummer.

## Online zetten
Upload de hele map naar Netlify, Vercel of GitHub Pages.
