# 🔧 Troubleshooting Guide - Strava Data Sync

## Problém: Zobrazují se jen počty členů, ne hodiny a aktivity

### Příčina
Data z Firebase nejsou načtena nebo synchronizace ještě neproběhla.

### Řešení

#### 1. Zkontrolujte, jestli jsou data v Firebase

```powershell
.\test-firebase-data.ps1
```

Tento script zkontroluje:
- ✅ Jestli existují celkové statistiky (`overall`)
- ✅ Jestli existují týdenní statistiky (`week-*`)
- ✅ Jestli existuje aktuální týden
- ✅ Jaká data jsou uložena

#### 2. Pokud data NEJSOU v Firebase, spusťte synchronizaci

**Lokálně (pro testování):**
```powershell
.\sync-local.ps1
```

**Na Vercelu (produkce):**
Synchronizace běží automaticky každé 2 hodiny přes Vercel Cron Jobs.

Můžete ji spustit manuálně:
```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123"
```

#### 3. Zkontrolujte konzoli prohlížeče

Otevřete DevTools (F12) a podívejte se do Console:
- Měli byste vidět: `📊 Received data: {...}`
- Zkontrolujte, jestli `data.source` je:
  - ✅ `"weekly"` - data z aktuálního týdne (ideální)
  - ⚠️ `"overall"` - celková data (fallback)
  - ❌ `"default"` - žádná data v Firebase

#### 4. Zkontrolujte API endpoint

Otevřete v prohlížeči:
```
http://localhost:3000/api/teams
```

Měli byste vidět JSON s:
```json
{
  "teams": [...],
  "lastUpdated": "2025-11-06T...",
  "source": "weekly",
  "weekId": "2025-11-03"
}
```

---

## Co se zobrazuje na webu

### Když synchronizace FUNGUJE:
```
Aktuální pořadí týmů
📊 Statistiky za aktuální týden (Po - Ne)
Poslední aktualizace: před 5 minutami

Team spajKK
👥 65 členů
⏱️ 140.8 hodin
🎯 158 aktivit
```

### Když synchronizace NEFUNGUJE:
```
Aktuální pořadí týmů
📊 Statistiky týmů
Poslední aktualizace: právě teď
ℹ️ Zobrazují se výchozí data. Synchronizace ještě neproběhla.

Team spajKK
👥 0 členů
⏱️ 0.0 hodin
🎯 0 aktivit
```

---

## Časté problémy

### 1. "No synced data available"
**Příčina:** Synchronizace ještě neproběhla nebo selhala.

**Řešení:**
1. Spusťte `.\sync-local.ps1`
2. Zkontrolujte logy v konzoli
3. Ověřte Strava API credentials v `.env.local`

### 2. Data jsou stará
**Příčina:** Vercel Cron Job neběží nebo selhal.

**Řešení:**
1. Zkontrolujte Vercel Dashboard → Cron Jobs
2. Zkontrolujte logy v Vercel
3. Spusťte manuální sync přes API

### 3. "Failed to fetch teams data"
**Příčina:** Chyba v API endpointu nebo Firebase.

**Řešení:**
1. Zkontrolujte Vercel logy
2. Ověřte Firebase credentials
3. Zkontrolujte Firestore pravidla

---

## Struktura dat v Firebase

### Document: `stats/overall`
```json
{
  "teams": [
    {
      "id": "spajkk",
      "name": "Team spajKK",
      "members": 65,
      "totalHours": 140.8,
      "totalActivities": 158
    }
  ],
  "lastUpdated": "2025-11-06T..."
}
```

### Document: `stats/week-2025-11-03`
```json
{
  "week": 1,
  "weekId": "2025-11-03",
  "weekStart": "2025-11-03T00:00:00.000Z",
  "weekEnd": "2025-11-09T23:59:59.999Z",
  "teams": [
    {
      "teamId": "spajkk",
      "teamName": "Team spajKK",
      "week": 1,
      "activities": 158,
      "hours": 140.8,
      "members": 65,
      "points": 50
    }
  ],
  "lastUpdated": "2025-11-06T..."
}
```

---

## Užitečné příkazy

### Testování
```powershell
# Zkontrolovat data v Firebase
.\test-firebase-data.ps1

# Spustit lokální sync
.\sync-local.ps1

# Spustit dev server
npm run dev
```

### Debugging
```powershell
# Zobrazit logy z Vercelu
vercel logs

# Zkontrolovat Firebase data
# Otevřete Firebase Console → Firestore Database
```

---

## Kontakt

Pokud problém přetrvává:
1. Zkontrolujte všechny kroky výše
2. Podívejte se do logů (Vercel, Firebase, Browser Console)
3. Zkontrolujte, že všechny environment variables jsou správně nastavené

