# Firebase Setup pro GAMECHANGER Challenge

## 1. Vytvoření Firebase projektu

1. Jděte na https://console.firebase.google.com/
2. Klikněte na "Add project" nebo "Přidat projekt"
3. Zadejte název projektu (např. "nutrend-challenge")
4. Pokračujte podle průvodce (Google Analytics můžete vypnout)

## 2. Vytvoření Firestore databáze

1. V levém menu klikněte na "Firestore Database"
2. Klikněte na "Create database"
3. Vyberte "Start in production mode"
4. Vyberte region (např. `europe-west3` pro Frankfurt)
5. Klikněte na "Enable"

## 3. Nastavení pravidel Firestore

V záložce "Rules" nastavte tato pravidla:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to stats for everyone
    match /stats/{document=**} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
  }
}
```

Klikněte na "Publish"

## 4. Získání Firebase credentials

1. Klikněte na ikonu ozubeného kola (⚙️) vedle "Project Overview"
2. Vyberte "Project settings"
3. Scrollujte dolů na "Your apps"
4. Klikněte na ikonu `</>` (Web)
5. Zadejte název aplikace (např. "nutrend-challenge-web")
6. Klikněte na "Register app"
7. Zkopírujte hodnoty z `firebaseConfig` objektu

## 5. Získání Service Account Key (pro Admin SDK)

Pro synchronizaci dat na serveru potřebujeme Service Account:

1. V levém menu klikněte na ikonu ozubeného kola (⚙️) vedle "Project Overview"
2. Vyberte "Project settings"
3. Přejděte na záložku "Service accounts"
4. Klikněte na "Generate new private key"
5. Potvrďte a stáhne se vám JSON soubor (např. `nutrend-challenge-firebase-adminsdk-xxxxx.json`)

**⚠️ DŮLEŽITÉ:** Tento soubor obsahuje citlivé údaje! Nikdy ho nenahrávejte do Gitu!

### Extrakce credentials pomocí helper skriptu

Pro snadné získání credentials použijte náš helper skript:

**Windows PowerShell:**
```powershell
.\scripts\extract-service-account.ps1 C:\Downloads\nutrend-challenge-firebase-adminsdk-xxxxx.json
```

**Mac/Linux:**
```bash
node scripts/extract-service-account.js ~/Downloads/nutrend-challenge-firebase-adminsdk-xxxxx.json
```

Skript automaticky extrahuje potřebné hodnoty a zobrazí je ve formátu pro `.env.local`.

## 6. Vyplnění .env.local

Vyplňte tyto hodnoty do `.env.local`:

```env
# Firebase Configuration (Client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (pro server-side operace)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Poznámka:** Private key musí být v uvozovkách a obsahovat `\n` pro nové řádky.

## 7. První synchronizace dat

Po vyplnění Firebase credentials:

1. Restartujte dev server (`Ctrl+C` a pak `npm run dev`)
2. Spusťte první sync pomocí:

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123"
```

Nebo v PowerShellu:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/sync" -Method Post -Headers @{"Authorization"="Bearer your-secret-token-change-this-123"}
```

## 8. Nastavení automatické synchronizace

### Možnost A: Vercel Cron Jobs (doporučeno pro produkci)

1. Vytvořte soubor `vercel.json` v root složce:

```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "0 * * * *"
  }]
}
```

2. Přidejte `SYNC_SECRET_TOKEN` do Vercel environment variables

### Možnost B: Externí cron služba (např. cron-job.org)

1. Zaregistrujte se na https://cron-job.org/
2. Vytvořte nový cron job:
   - URL: `https://your-domain.com/api/sync`
   - Schedule: Každou hodinu (`0 * * * *`)
   - Headers: `Authorization: Bearer your-secret-token`

### Možnost C: GitHub Actions (pro testování)

Vytvořte `.github/workflows/sync.yml`:

```yaml
name: Sync Strava Data
on:
  schedule:
    - cron: '0 * * * *'  # Každou hodinu
  workflow_dispatch:  # Manuální spuštění

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          curl -X POST ${{ secrets.SYNC_URL }} \
            -H "Authorization: Bearer ${{ secrets.SYNC_TOKEN }}"
```

## 9. Ověření

Po první synchronizaci:

1. Otevřete Firebase Console
2. Jděte do Firestore Database
3. Měli byste vidět kolekci `stats` s dokumenty:
   - `overall` - celkové statistiky týmů
   - `week-1`, `week-2`, ... - týdenní statistiky

## Struktura dat v Firestore

### Document: `stats/overall`
```json
{
  "teams": [
    {
      "id": "spajkk",
      "name": "Team Spajkk",
      "members": 65,
      "totalHours": 140.8,
      "totalActivities": 158,
      "topMembers": [
        {
          "name": "Jan Novák",
          "hours": 25.5,
          "activities": 12,
          "avatarUrl": "https://..."
        },
        {
          "name": "Petra Svobodová",
          "hours": 22.3,
          "activities": 15
        },
        {
          "name": "Martin Dvořák",
          "hours": 18.7,
          "activities": 8
        }
      ]
    }
  ],
  "lastUpdated": "2025-01-04T..."
}
```

### Document: `stats/week-{YYYY-MM-DD}`
```json
{
  "week": 1,
  "weekId": "2025-01-06",
  "teams": [
    {
      "teamId": "spajkk",
      "teamName": "Team Spajkk",
      "activities": 50,
      "hours": 45.2,
      "points": 50,
      "topMembers": [
        {
          "name": "Jan Novák",
          "hours": 8.5,
          "activities": 4
        },
        {
          "name": "Petra Svobodová",
          "hours": 7.2,
          "activities": 5
        },
        {
          "name": "Martin Dvořák",
          "hours": 6.1,
          "activities": 3
        }
      ]
    }
  ],
  "weekStart": "2025-01-06T00:00:00.000Z",
  "weekEnd": "2025-01-12T23:59:59.999Z",
  "lastUpdated": "2025-01-04T..."
}
```

## Rate Limits

S touto architekturou:
- **Sync každou hodinu**: ~30 requestů (5 týmů × 6 týdnů)
- **Za den**: ~720 requestů (30 × 24)
- **Strava limit**: 2,000 denně ✅
- **Uživatelé**: Neomezené načítání z Firebase ✅

