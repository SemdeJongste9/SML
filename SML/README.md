# SML Menswear

Een statische fashion storefront met serverless API op Vercel. De catalogus, voorraad en bestellingen komen uit Supabase. Afrekenen gaat via handmatige bankoverschrijving; er is geen externe betaalprovider aangesloten.

## 1. Supabase-database aanmaken

1. Maak een Supabase-project aan. Kies bij voorkeur een regio in de EU.
2. Open **SQL Editor** en voer eerst `sql/schema.sql` uit.
3. Voer daarna `sql/seed.sql` uit om de voorbeeldcatalogus en startvoorraad toe te voegen.
4. Bewaar de project-URL en de `service_role`-key uit **Project Settings → API**. Gebruik de service role alleen op de server, nooit in `js/`-bestanden.
5. Pas voorbeeldprijzen en voorraad aan in Supabase voordat je de winkel openzet.

De database reserveert voorraad 48 uur na het plaatsen van een bestelling. Niet-betaalde reserveringen verlopen automatisch zodra de catalogus wordt opgevraagd.

## 2. Vercel instellen

In de GitHub-repository staat het project in de map `SML`. Stel daarom in Vercel **Root Directory** in op `SML`, met **Framework Preset: Other**. Laat **Build Command** en **Output Directory** leeg.

Voeg in **Settings → Environment Variables** deze waarden toe voor Production en Preview:

| Naam | Waarde |
| --- | --- |
| `SUPABASE_URL` | Project URL uit Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Geheime service role key uit Supabase |
| `BANK_ACCOUNT_NAME` | Naam van de rekeninghouder |
| `BANK_IBAN` | IBAN waarop klanten moeten overmaken |
| `BANK_BIC` | Optioneel; alleen invullen als je bank dit nodig heeft |

Gebruik nooit echte sleutels in GitHub. `.env.example` bevat alleen de variabelenamen. Na het instellen van variabelen moet je opnieuw deployen.

## 3. Bestellingen verwerken

Klanten kiezen artikelen en maten, vullen hun bezorggegevens in en krijgen een ordernummer, totaalbedrag en jouw bankgegevens te zien. Het ordernummer is het verplichte betalingskenmerk.

Na ontvangst van het geld markeer je de bestelling in **Supabase → SQL Editor** als betaald:

```sql
select public.mark_order_paid('SML-ORDERNUMMER');
```

Gebruik het volledige ordernummer van de bestelling. Een niet-betaalde bestelling kan zo worden geannuleerd:

```sql
select public.cancel_unpaid_order('SML-ORDERNUMMER');
```

Bankoverschrijvingen worden niet automatisch herkend. Controleer de bijschrijving in je bank voordat je een bestelling als betaald markeert.

## Bestandsstructuur

- `index.html`, `css/`, `js/` — storefront en winkelmand
- `bedankt.html` — betaalinstructies en bestelstatus
- `api/` — Vercel Functions voor catalogus, bestelling en status
- `lib/server.js` — serverconfiguratie en Supabase REST-helper
- `sql/schema.sql` — tabellen, voorraadreservering en beveiligde databasefuncties
- `sql/seed.sql` — voorbeeldproducten en startvoorraad
- `vercel.json` — deploy- en browserbeveiligingsinstellingen

## Lokaal voorvertonen

Open `index.html` direct om het ontwerp te bekijken; de voorbeeldcatalogus verschijnt in demomodus. De API, database en checkout werken pas na een Vercel-deploy met de omgevingsvariabelen hierboven.

```sh
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`.
