# Lokální testování synchronizace

## 🏠 Spuštění aplikace lokálně

### 1. Instalace závislostí
```bash
npm install
```

### 2. Nastavení .env.local
Zkopírujte `.env.local.example` jako `.env.local` a vyplňte hodnoty:
```bash
cp .env.local.example .env.local
```

### 3. Spuštění dev serveru
```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`

## 🔄 Testování synchronizace

### ⚠️ Důležité poznámky
- **Vercel Cron Job nefunguje lokálně** - funguje pouze na produkci
- Pro lokální testování musíte volat API **manuálně**
- Data se ukládají do Firebase, takže je uvidíte i v produkci

### Manuální spuštění synchronizace

#### PowerShell (Windows)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/sync" -Method POST -Headers @{"Authorization"="Bearer your-secret-token-change-this-123"}
```

#### Bash/Terminal (Mac/Linux)
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123" \
  -H "Content-Type: application/json"
```

#### Odpověď při úspěchu:
```json
{
  "success": true,
  "message": "Data synced successfully",
  "timestamp": "2025-11-05T07:26:33.719Z"
}
```

### Zobrazení týdenních dat

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/weekly" -Method GET

# Bash
curl http://localhost:3000/api/weekly
```

Vrátí JSON s daty posledních 5 týdnů.

## 🧪 Testování ve Visual Studio Code

### Rest Client Extension

1. Nainstalujte **REST Client** extension
2. Vytvořte soubor `test-api.http`:

```http
### Test sync endpoint
POST http://localhost:3000/api/sync
Authorization: Bearer your-secret-token-change-this-123
Content-Type: application/json

### Get weekly data
GET http://localhost:3000/api/weekly

### Get overall stats (pokud máte takový endpoint)
GET http://localhost:3000/api/teams
```

3. Klikněte na "Send Request" nad každým requestem

### Thunder Client Extension

1. Nainstalujte **Thunder Client** extension
2. Vytvořte nový request:
   - Method: `POST`
   - URL: `http://localhost:3000/api/sync`
   - Headers:
     - `Authorization`: `Bearer your-secret-token-change-this-123`
     - `Content-Type`: `application/json`
3. Klikněte na "Send"

## 🐛 Debugging

### Zobrazení console logů

Při spuštění `npm run dev` uvidíte v terminálu:
```
Starting Strava data sync...
Syncing data from 2025-01-15T00:00:00.000Z to 2025-02-19T23:59:59.999Z
Overall stats synced successfully
Syncing week 1: 6.10.2025 - 12.10.2025
Week 1 (2025-10-06) stats synced successfully
...
Strava data sync completed successfully
```

### Kontrola Firebase dat

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Přejděte do Firestore Database
3. Zkontrolujte collection `stats`:
   - Měli byste vidět dokumenty `overall`, `week-2025-10-06`, atd.

### Browser DevTools

1. Otevřete aplikaci na `http://localhost:3000`
2. Otevřete DevTools (F12)
3. Přejděte na tab "Network"
4. Načtěte stránku
5. Zkontrolujte requesty:
   - `/api/weekly` - měl by vrátit 200 OK s daty
   - `/api/teams` - pokud existuje

## 📊 Testování výstupu

### Test 1: Kontrola struktury dat
```bash
# Uložit výstup do souboru
curl http://localhost:3000/api/weekly > weekly-data.json

# Nebo PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/weekly" -OutFile "weekly-data.json"
```

### Test 2: Kontrola konkrétního týdne
```bash
curl http://localhost:3000/api/weekly?week=1
```

### Test 3: Parsování JSON (pomocí jq)
```bash
# Na Mac/Linux s nainstalovaným jq
curl http://localhost:3000/api/weekly | jq '.weeks[0]'
```

## ⏱️ Automatizace lokálního testování

### Pomocí PowerShell skriptu

Vytvořte `sync-local.ps1`:
```powershell
# sync-local.ps1
param(
    [int]$IntervalMinutes = 5
)

$token = "your-secret-token-change-this-123"
$url = "http://localhost:3000/api/sync"

Write-Host "Starting local sync scheduler (every $IntervalMinutes minutes)..."
Write-Host "Press Ctrl+C to stop"

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Triggering sync..."
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{"Authorization"="Bearer $token"}
        $content = $response.Content | ConvertFrom-Json
        
        if ($content.success) {
            Write-Host "[$timestamp] ✓ Sync successful" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] ✗ Sync failed: $($content.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "[$timestamp] ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "Waiting $IntervalMinutes minutes until next sync..."
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
```

Spuštění:
```powershell
# Sync každých 5 minut
.\sync-local.ps1

# Sync každých 10 minut
.\sync-local.ps1 -IntervalMinutes 10
```

### Pomocí Node.js skriptu

Vytvořte `scripts/sync-local.js`:
```javascript
const SYNC_URL = 'http://localhost:3000/api/sync';
const SYNC_TOKEN = 'your-secret-token-change-this-123';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minut

async function triggerSync() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Triggering sync...`);
  
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNC_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`[${timestamp}] ✓ Sync successful`);
    } else {
      console.error(`[${timestamp}] ✗ Sync failed:`, data.error);
    }
  } catch (error) {
    console.error(`[${timestamp}] ✗ Error:`, error.message);
  }
}

console.log(`Starting local sync scheduler (every ${INTERVAL_MS / 60000} minutes)...`);
console.log('Press Ctrl+C to stop\n');

// První sync okamžitě
triggerSync();

// Pak každých N minut
setInterval(triggerSync, INTERVAL_MS);
```

Spuštění:
```bash
node scripts/sync-local.js
```

## 🔍 Monitoring lokálního testování

### Sledování Firebase změn

Otevřete Firebase Console a nechte otevřenou Firestore databázi - uvidíte změny v reálném čase.

### Sledování logs

V terminálu kde běží `npm run dev` uvidíte všechny logs z API volání.

### Sledování network requests

V DevTools → Network sledujte:
- Requesty na `/api/sync`
- Requesty na `/api/weekly`
- Odpovědi a jejich čas

## 📝 Checklist pro testování

Před nasazením na produkci zkontrolujte:

- [ ] Sync API funguje lokálně (`POST /api/sync`)
- [ ] Weekly API vrací data (`GET /api/weekly`)
- [ ] Data se ukládají do Firebase
- [ ] Web zobrazuje týdenní statistiky správně
- [ ] Týdny mají správná data (pondělí - neděle)
- [ ] Body se přiřazují správně (50, 40, 30, 20, 10)
- [ ] Týmové statistiky jsou správné
- [ ] Žádné chyby v console logu
- [ ] Environment variables jsou správně nastavené
- [ ] `.env.local` není commitnutý do Gitu

## 🚀 Další kroky

Po úspěšném lokálním testování:
1. Commitněte změny do Gitu
2. Pushněte na GitHub/GitLab
3. Nasaďte na Vercel (viz [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
4. Vercel Cron Job se automaticky aktivuje