# SML Menswear

Een statische Nederlandstalige webshop voor SML Menswear. De site gebruikt gewone HTML, CSS en JavaScript; er is geen buildstap of framework nodig.

## Lokaal bekijken

Open `index.html` in een browser, of start een lokale webserver vanuit deze map:

```sh
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`.

## Publiceren via GitHub en Vercel

1. Zet de inhoud van deze map in de root van een GitHub-repository en push de wijzigingen.
2. Importeer die repository in Vercel via **Add New → Project** en geef Vercel toegang tot de repository.
3. Stel **Framework Preset** in op `Other`, **Root Directory** op `./` en laat **Build Command** en **Output Directory** leeg.
4. Klik op **Deploy**. Nieuwe pushes naar de gekoppelde branch worden daarna automatisch gepubliceerd.

`vercel.json` bevat alleen statische-site instellingen en enkele browserbeveiligingsheaders. De site heeft op dit moment geen buildcommando of omgevingsvariabelen nodig.

## Bestanden

- `index.html` — pagina-opbouw en metadata
- `css/styles.css` — vormgeving en responsive layout
- `js/products.js` — voorbeeldcatalogus
- `js/app.js` — productfilters, winkelmand, checkout en lokaal beheer
- `sql/schema.sql` en `sql/seed.sql` — startpunt voor een latere PostgreSQL-database
- `vercel.json` — configuratie voor de statische Vercel-deploy

## Huidige beperkingen

De catalogus staat in JavaScript en de winkelmand en zelf toegevoegde artikelen staan in de browser (`localStorage`). Het beheer is dus geen beveiligd gedeeld dashboard. Afrekenen verstuurt een e-mail via de mailapp van de klant; er wordt geen bestelling opgeslagen of online betaald. De e-mailontvanger staat momenteel in `js/app.js`.

## Voorbereiding voor Supabase en Mollie

De SQL-bestanden zijn een startpunt, geen aangesloten database. Wanneer je Supabase toevoegt, laat de browser alleen publieke configuratie en de anon key gebruiken, met passende Row Level Security. Bewaar de `service_role` key uitsluitend in Vercel Environment Variables en gebruik die vanuit server-side code.

Mollie hoort later achter server-side endpoints: maak de betaling aan op de server, laat Mollie de klant terugsturen naar de site en bevestig de definitieve status via een webhook voordat je een bestelling als betaald markeert. Zet nooit Mollie API keys of Supabase service keys in `js/`-bestanden of in GitHub. Voeg die variabelen pas toe als de backend wordt gebouwd.

Voor een echte checkout moeten ook voorraad, verzendkosten, orderbevestigingen, privacy/retourinformatie en de zakelijke betaalgegevens worden ingericht. De huidige demo doet dat nog niet.
