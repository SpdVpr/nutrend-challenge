# Changelog

## 🎮 Verze 2.1 - Live Twitch Streams Integration

### ✨ Nové funkce

#### 1. Live Twitch Streams Carousel
- ✅ Real-time zobrazení live streamů od streamerů výzvy
- ✅ Automatický refresh každé 2 minuty
- ✅ Interaktivní karty s hover efekty
- ✅ Pulzující LIVE badge a viewer count
- ✅ Auto-hide když nikdo nestreamuje
- ✅ Zobrazení názvu hry/kategorie
- ✅ Thumbnail náhledy streamů
- ✅ Přímé odkazy na Twitch kanály

#### 2. Twitch API Integration
- ✅ Automatické získávání access tokenu
- ✅ Token caching pro efektivitu
- ✅ Support pro všech 5 streamerů
- ✅ Error handling a fallback stavy
- ✅ Rate limit friendly implementace

### 🔧 Nové soubory

- `lib/twitch.ts` - Twitch API helper funkce
- `app/api/twitch/streams/route.ts` - API endpoint pro live streams
- `components/LiveStreamsSection.tsx` - Hlavní komponenta pro zobrazení streamů
- `TWITCH_SETUP.md` - Podrobná dokumentace pro nastavení

### 📝 Upravené soubory

- `lib/constants.ts` - Přidány `twitchUsername` a `twitchUrl` pro každý tým
- `types/index.ts` - Nový interface `TwitchStream`
- `app/page.tsx` - Přidána `LiveStreamsSection` mezi Hero a About
- `.env.local.example` - Přidány Twitch credentials
- `README.md` - Aktualizována dokumentace o Twitch integraci

### 🎨 Design Features

- **Responsive Grid:** 1/2/3 columns podle velikosti obrazovky
- **Hover Effects:** Scale, overlay, shine efekty
- **Animations:** Framer Motion pro smooth přechody
- **Loading States:** Spinner při načítání dat
- **Empty State:** Message když nikdo nestreamuje
- **Live Badge:** Pulzující červený indikátor

### 🔐 Security

- ✅ Client Secret pouze na serveru (server-side only)
- ✅ Access token caching a automatický refresh
- ✅ Environment variables pro credentials
- ✅ No sensitive data v client bundle

### 📊 Supported Streamers

| Tým | Streamer | Twitch URL |
|-----|----------|------------|
| Team spajKK | spajKK | https://www.twitch.tv/spajkk |
| Team Andullie | Andullie | https://www.twitch.tv/andullie |
| Team DinoDodo | DinoDodo | https://www.twitch.tv/dino_dodo_ |
| Team Charmiie | Charmiie | https://www.twitch.tv/charmiie |
| Team Kamilius | Kamilius | https://www.twitch.tv/kamilius1 |

### ⚙️ Configuration

#### Environment Variables
```env
# Twitch API Configuration
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

#### API Endpoint
```
GET /api/twitch/streams
Response: { streams: TwitchStream[], timestamp: string }
```

### 🚀 Deployment

1. Získejte Twitch API credentials z [Twitch Developer Console](https://dev.twitch.tv/console)
2. Přidejte credentials do `.env.local` (local) nebo Vercel Environment Variables (production)
3. Restartujte server
4. Hotovo! Sekce se zobrazí automaticky když někdo streamuje

### 📖 Dokumentace

- **[TWITCH_SETUP.md](./TWITCH_SETUP.md)** - Podrobné instrukce pro nastavení
- **[README.md](./README.md)** - Aktualizovaný s Twitch sekcí

---

## 🎯 Verze 2.0 - 5. listopadu 2025

### ✨ Nové funkce

#### 1. Automatická synchronizace dat ze Stravy
- ✅ Implementován Vercel Cron Job pro automatickou synchronizaci každé 2 hodiny
- ✅ Konfigurace v `vercel.json`
- ✅ Podpora pro manuální spuštění přes API endpoint `/api/sync`
- ✅ Autentizace pomocí bearer tokenu nebo Vercel cron secret

#### 2. Reálné kalendářní týdny
- ✅ Zobrazení posledních 5 reálných kalendářních týdnů
- ✅ Týden začíná v pondělí 00:00 a končí v neděli 23:59
- ✅ Každý týden se resetuje (data nejsou kumulativní)
- ✅ Příklad: 3.11-9.11, 10.11-16.11, 17.11-23.11, atd.

#### 3. Vylepšené zobrazení týdenních statistik
- ✅ Zobrazení datumu každého týdne na tlačítcích
- ✅ Načítání všech týdnů najednou (jedna API request)
- ✅ Lepší UX při přepínání mezi týdny

### 🔧 Upravené soubory

#### Nově vytvořené
- `vercel.json` - Konfigurace Vercel Cron Jobs
- `SYNC_DOCUMENTATION.md` - Podrobná dokumentace synchronizace
- `DEPLOYMENT_GUIDE.md` - Průvodce nasazením na Vercel
- `LOCAL_TESTING.md` - Návod pro lokální testování
- `CHANGELOG.md` - Tento soubor
- `sync-local.ps1` - PowerShell skript pro lokální sync
- `scripts/sync-local.js` - Node.js skript pro lokální sync

#### Upravené
- `lib/sync-strava.ts`
  - Nová funkce `getMondayOfWeek()` pro výpočet pondělí
  - Nová funkce `getLastNWeeks()` pro reálné kalendářní týdny
  - Ukládání týdenních dat s unikátním ID podle data
  - Lepší logování s českým formátem data

- `app/api/sync/route.ts`
  - Podpora pro Vercel cron secret header
  - Lepší error handling

- `app/api/weekly/route.ts`
  - Kompletně přepsáno
  - Vrací všechny týdny najednou
  - Výpočet reálných kalendářních týdnů
  - Přidání `weekLabel` pro zobrazení

- `components/WeeklyOverviewSection.tsx`
  - Načítání všech týdnů najednou
  - Zobrazení datumů na tlačítkách týdnů
  - Lepší state management

- `README.md`
  - Aktualizace sekcí o synchronizaci
  - Nová struktura Firebase dat
  - Odkazy na novou dokumentaci

- `.env.local.example`
  - Přidán `SYNC_SECRET_TOKEN`
  - Opraveny názvy proměnných (přidán prefix `NEXT_PUBLIC_`)

### 📊 Změny v Firebase struktuře

#### Předtím:
```
stats/
  - week-1
  - week-2
  - week-3
  - week-4
  - week-5
```

#### Nyní:
```
stats/
  - overall (celkové statistiky)
  - week-2025-10-06 (týden 6.10 - 12.10)
  - week-2025-10-13 (týden 13.10 - 19.10)
  - week-2025-10-20 (týden 20.10 - 26.10)
  - week-2025-10-27 (týden 27.10 - 2.11)
  - week-2025-11-03 (týden 3.11 - 9.11)
```

### 🔄 API Changes

#### POST /api/sync
**Předtím:**
- Vyžadovalo vždy Authorization header

**Nyní:**
- Podporuje Vercel cron secret (`x-vercel-cron-secret` header)
- Authorization header je nepovinný pro Vercel cron jobs
- Lepší error messages

#### GET /api/weekly
**Předtím:**
```json
GET /api/weekly?week=1
{
  "teams": [...],
  "week": 1
}
```

**Nyní:**
```json
GET /api/weekly
{
  "weeks": [
    {
      "week": 1,
      "weekId": "2025-10-06",
      "teams": [...],
      "weekStart": "2025-10-06T00:00:00.000Z",
      "weekEnd": "2025-10-12T23:59:59.999Z",
      "weekLabel": "6.10 - 12.10",
      "lastUpdated": "2025-11-05T07:26:33.719Z"
    },
    ...
  ]
}
```

### 🐛 Opravené chyby

1. **Týdny se počítaly od začátku challenge (15.1.2025)** → Nyní se počítají od aktuálního data
2. **Challenge ještě nezačala, ale logika předpokládala, že ano** → Nyní funguje kdykoliv
3. **Data nebyla automaticky synchronizována** → Automatická sync každé 2 hodiny
4. **Týdenní data byla kumulativní** → Nyní se resetují každý týden

### 🚀 Nasazení

#### Pro nasazení na Vercel:
1. Commitněte všechny změny
2. Pushněte na GitHub/GitLab
3. Vercel automaticky detekuje `vercel.json` a nastaví cron job
4. Nastavte environment variables na Vercelu
5. Hotovo! Sync bude probíhat automaticky každé 2 hodiny

#### Pro lokální testování:
```powershell
# PowerShell
.\sync-local.ps1

# Nebo pro automatický režim
.\sync-local.ps1 -Auto -IntervalMinutes 5
```

```bash
# Node.js
node scripts/sync-local.js
```

### 📖 Dokumentace

- **[SYNC_DOCUMENTATION.md](./SYNC_DOCUMENTATION.md)** - Vše o synchronizaci
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Jak nasadit na Vercel
- **[LOCAL_TESTING.md](./LOCAL_TESTING.md)** - Jak testovat lokálně
- **[README.md](./README.md)** - Aktualizovaný README s novými funkcemi

### ⚙️ Konfigurace

#### Environment Variables
```env
# Nová proměnná
SYNC_SECRET_TOKEN=change-this-to-strong-random-password-123
```

#### Vercel Cron
```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

### 🔐 Bezpečnost

- ✅ Přidán `SYNC_SECRET_TOKEN` pro autentizaci
- ✅ Podpora pro Vercel cron secret
- ✅ Validace authorization headeru
- ✅ Rate limiting (pomocí Strava API limitů)

### 📝 Breaking Changes

#### API Response změny
- `GET /api/weekly` nyní vrací objekt `{ weeks: [...] }` místo `{ teams: [...] }`
- Weekly ID změněno z `week-1` na `week-2025-10-06` (podle data)

#### Component Props
- `WeeklyOverviewSection` nyní načítá všechny týdny najednou
- Nový interface `WeekData` pro týdenní data

### 🎉 Co je hotovo

- ✅ Automatická synchronizace každé 2 hodiny
- ✅ Reálné kalendářní týdny s pondělím jako prvním dnem
- ✅ Posledních 5 týdnů od aktuálního data
- ✅ Data se resetují každý týden
- ✅ Zobrazení datumů na tlačítkách týdnů
- ✅ Lokální testovací skripty
- ✅ Kompletní dokumentace
- ✅ Deployment guide

### 📞 Podpora

Pokud narazíte na problémy:
1. Zkontrolujte dokumentaci výše
2. Podívejte se do Vercel logs
3. Zkontrolujte Firebase Console
4. Ověřte environment variables

---

**Autor:** AI Assistant  
**Datum:** 5. listopadu 2025  
**Verze:** 2.0