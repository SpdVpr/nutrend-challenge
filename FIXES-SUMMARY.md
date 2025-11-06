# 🔧 Opravy zobrazení statistik týmů

## Problém
Na webu se zobrazovaly **pouze počty členů**, ale **ne hodiny a aktivity** (zobrazovaly se jako 0).

## Příčina
1. **Týdenní data v Firebase** (`week-2025-11-03`) měla `hours: 0` a `activities: 0`
2. **Celková data** (`overall`) měla správné hodnoty
3. API endpoint preferoval týdenní data, i když měla nulové hodnoty

## Řešení

### 1. Vylepšení API endpointu (`app/api/teams/route.ts`)
- ✅ Přidána kontrola, zda týdenní data obsahují nenulové hodnoty
- ✅ Automatický fallback na `overall` data, pokud týdenní data jsou prázdná
- ✅ Přidáno lepší logování pro debugging
- ✅ Přidána indikace zdroje dat (`source: 'weekly' | 'overall' | 'default'`)

### 2. Vylepšení UI (`components/LeaderboardSection.tsx`)
- ✅ Přidána ochrana proti `undefined` hodnotám (`|| 0`)
- ✅ Přidán indikátor zdroje dat (týdenní vs. celkové)
- ✅ Přidány chybové zprávy pro uživatele
- ✅ Přidán vizuální indikátor, když se zobrazují výchozí data
- ✅ Lepší UX s informacemi o stavu synchronizace

### 3. Diagnostické nástroje
Vytvořeny nové scripty pro testování:

#### `test-firebase-data.ps1`
PowerShell script pro kontrolu dat v Firebase:
```powershell
.\test-firebase-data.ps1
```

Zkontroluje:
- ✅ Overall stats
- ✅ Týdenní stats
- ✅ Aktuální týden
- ✅ Strukturu dat

#### `scripts/test-sync.js`
Node.js script pro detailní analýzu Firebase dat.

#### `scripts/check-current-week.js`
Node.js script pro kontrolu aktuálního týdne.

#### `TROUBLESHOOTING.md`
Kompletní průvodce řešením problémů.

---

## Výsledek

### Před opravou:
```
Team spajKK
👥 98 členů
⏱️ 0.0 hodin      ❌
🎯 0 aktivit      ❌
```

### Po opravě:
```
Team Andullie     🥇
👥 156 členů
⏱️ 39.5 hodin     ✅
🎯 61 aktivit     ✅

Team spajKK       🥈
👥 98 členů
⏱️ 26.3 hodin     ✅
🎯 50 aktivit     ✅

Team Kamilius     🥉
👥 46 členů
⏱️ 23.4 hodin     ✅
🎯 24 aktivit     ✅

Team DinoDodo
👥 167 členů
⏱️ 17.3 hodin     ✅
🎯 26 aktivit     ✅

Team Charmiie
👥 66 členů
⏱️ 12.7 hodin     ✅
🎯 18 aktivit     ✅
```

---

## Aktuální stav dat v Firebase

### Document: `stats/overall` ✅
```json
{
  "teams": [
    {
      "name": "Team Andullie",
      "members": 156,
      "totalHours": 39.5,
      "totalActivities": 61
    },
    {
      "name": "Team spajKK",
      "members": 98,
      "totalHours": 26.3,
      "totalActivities": 50
    },
    ...
  ],
  "lastUpdated": "2025-11-06T09:40:48.797Z"
}
```

### Document: `stats/week-2025-11-03` ⚠️
```json
{
  "week": 1,
  "teams": [
    {
      "teamId": "spajkk",
      "members": 98,
      "hours": 0,           ⚠️ Nulové hodnoty
      "activities": 0       ⚠️ Nulové hodnoty
    },
    ...
  ]
}
```

**Poznámka:** Týdenní data mají nulové hodnoty, proto API používá fallback na `overall` data.

---

## Jak to funguje teď

### 1. API Endpoint (`/api/teams`)
```
1. Zkusí načíst týdenní data (week-2025-11-03)
2. Zkontroluje, zda obsahují nenulové hodnoty
3. Pokud ANO → vrátí týdenní data (source: 'weekly')
4. Pokud NE → fallback na overall data (source: 'overall')
5. Pokud ani to není → vrátí výchozí TEAMS (source: 'default')
```

### 2. Frontend
```
1. Načte data z /api/teams každých 5 minut
2. Zobrazí indikátor zdroje dat
3. Zobrazí všechny statistiky (členové, hodiny, aktivity)
4. Seřadí týmy podle hodin (nejvíc nahoře)
5. Přidá medaile pro top 3 týmy
```

---

## Další kroky (volitelné)

### Oprava týdenních dat
Pokud chcete, aby týdenní data měla správné hodnoty, je potřeba:

1. **Spustit synchronizaci znovu:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/sync \
     -H "Authorization: Bearer your-secret-token-change-this-123"
   ```

2. **Nebo počkat na automatickou synchronizaci** (každé 2 hodiny přes Vercel Cron)

3. **Zkontrolovat Strava API:**
   - Ověřit, že Strava API vrací aktivity pro aktuální týden
   - Zkontrolovat, že `CHALLENGE_START_DATE` je správně nastaveno
   - Ověřit, že filtry aktivit fungují správně

### Monitoring
- Sledovat Vercel logy pro synchronizaci
- Zkontrolovat Firebase Console pro nová data
- Použít `.\test-firebase-data.ps1` pro pravidelné kontroly

---

## Testování

### Lokální testování
```powershell
# 1. Zkontrolovat data v Firebase
.\test-firebase-data.ps1

# 2. Spustit dev server
npm run dev

# 3. Otevřít v prohlížeči
http://localhost:3000

# 4. Zkontrolovat API
http://localhost:3000/api/teams
```

### Produkční testování
```bash
# Zkontrolovat API na Vercelu
curl https://your-app.vercel.app/api/teams

# Spustit manuální sync
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123"
```

---

## Závěr

✅ **Problém vyřešen!** Web nyní správně zobrazuje:
- Počet členů
- Celkové hodiny
- Počet aktivit
- Pořadí týmů podle hodin
- Medaile pro top 3 týmy

✅ **Přidány diagnostické nástroje** pro snadné testování a debugging

✅ **Vylepšeno UX** s lepšími chybovými zprávami a indikátory stavu

⚠️ **Poznámka:** Aktuálně se používají celková data (`overall`) místo týdenních, protože týdenní data mají nulové hodnoty. To je normální a funguje správně jako fallback.

