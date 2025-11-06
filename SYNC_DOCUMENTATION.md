# Dokumentace automatické synchronizace

## 🎯 Co bylo změněno

### 1. Automatická synchronizace (vercel.json)
- Vytvořen `vercel.json` s cron jobem
- Synchronizace probíhá **každé 2 hodiny**
- Cron pattern: `0 */2 * * *` (na začátku každé sudé hodiny)

### 2. Logika týdenních dat
#### Předtím:
- Týdny se počítaly od začátku challenge (15.1.2025)
- Data byla kumulativní
- Nefungovalo správně, protože challenge ještě nezačala

#### Nyní:
- **Reálné kalendářní týdny** s pondělím jako prvním dnem
- **Posledních 5 týdnů** od aktuálního data
- Každý týden se **resetuje** a zobrazuje pouze data za daný týden
- Příklad týdnů:
  - Týden 1: 6.10 - 12.10
  - Týden 2: 13.10 - 19.10
  - Týden 3: 20.10 - 26.10
  - Týden 4: 27.10 - 2.11
  - Týden 5: 3.11 - 9.11

### 3. Upravené soubory
- ✅ `vercel.json` - nově vytvořen pro automatickou synchronizaci
- ✅ `lib/sync-strava.ts` - nová logika pro reálné týdny
- ✅ `app/api/weekly/route.ts` - API vrací všechny týdny najednou
- ✅ `app/api/sync/route.ts` - přidána podpora pro Vercel cron jobs
- ✅ `components/WeeklyOverviewSection.tsx` - zobrazení s reálnými daty týdnů

## 🚀 Jak to funguje

### Automatická synchronizace na Vercelu
Po nasazení na Vercel se cron job **automaticky aktivuje** a bude volat:
```
POST /api/sync
```
Každé 2 hodiny (v 0:00, 2:00, 4:00, 6:00, atd.)

### Lokální testování
Pro manuální spuštění synchronizace lokálně:

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/sync" -Method POST -Headers @{"Authorization"="Bearer your-secret-token-change-this-123"}
```

**Bash/Terminal:**
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123"
```

### Zobrazení týdenních dat
```
GET /api/weekly
```
Vrací všechny týdny (posledních 5) s následující strukturou:
```json
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

## 🔧 Konfigurace

### Environment variables (.env.local)
```env
# Strava API
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token

# Sync secret pro manuální volání
SYNC_SECRET_TOKEN=your-secret-token-change-this-123

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... další Firebase konfigurace
```

### Změna intervalu synchronizace
Upravte `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */2 * * *"  // Změňte tento pattern
    }
  ]
}
```

**Příklady cron patternů:**
- `0 * * * *` - každou hodinu
- `0 */4 * * *` - každé 4 hodiny
- `0 0 * * *` - jednou denně v půlnoci
- `*/30 * * * *` - každých 30 minut

## 📊 Firebase struktura

### Collection: `stats`
```
stats/
  - overall (celkové statistiky)
  - week-2025-10-06 (týden 6.10 - 12.10)
  - week-2025-10-13 (týden 13.10 - 19.10)
  - week-2025-10-20 (týden 20.10 - 26.10)
  - week-2025-10-27 (týden 27.10 - 2.11)
  - week-2025-11-03 (týden 3.11 - 9.11)
```

Každý týdenní dokument obsahuje:
```json
{
  "week": 1,
  "weekId": "2025-10-06",
  "teams": [
    {
      "teamId": "spajkk",
      "teamName": "Team spajKK",
      "week": 1,
      "activities": 150,
      "hours": 120.5,
      "points": 50
    },
    ...
  ],
  "weekStart": "2025-10-06T00:00:00.000Z",
  "weekEnd": "2025-10-12T23:59:59.999Z",
  "lastUpdated": "timestamp"
}
```

## ⚠️ Důležité poznámky

1. **Vercel Cron funguje pouze na produkci**, ne na `localhost`
2. Pro lokální vývoj použijte manuální volání API
3. Strava API má limit **600 requestů za 15 minut**
4. Při každé synchronizaci se načítají data pro všech 5 týmů × 6 volání (5 týdnů + 1 celkové) = ~30 API volání
5. Data se **ukládají do Firebase** a pak se čtou odtud (ne přímo ze Stravy)

## 🐛 Řešení problémů

### Synchronizace nefunguje
1. Zkontrolujte Vercel logs: `vercel logs`
2. Ověřte, že máte správné environment variables na Vercelu
3. Zkuste manuální synchronizaci

### Chybějící data v týdnech
1. Spusťte manuální sync: `POST /api/sync`
2. Zkontrolujte Firebase console, jestli se data uložila
3. Ověřte Strava API credentials

### 401 Unauthorized při manuálním volání
- Ujistěte se, že používáte správný `SYNC_SECRET_TOKEN`
- Header musí být: `Authorization: Bearer your-secret-token-change-this-123`

## 📝 Další vylepšení

Možná budoucí rozšíření:
- [ ] Email notifikace při selhání synchronizace
- [ ] Dashboard pro monitoring synchronizace
- [ ] Webhook od Stravy pro real-time updates
- [ ] Caching layer pro rychlejší načítání dat
- [ ] Admin panel pro manuální spuštění syncu z UI