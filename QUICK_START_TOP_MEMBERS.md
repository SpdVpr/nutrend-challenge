# 🚀 Rychlý Start: Top 3 Nejaktivnější Členové

## ✅ Co je hotovo

Synchronizace nyní automaticky stahuje a ukládá **top 3 nejaktivnější členy** pro každý tým!

Změny zahrnují:
- ✅ Rozšířené Strava API volání (získávání dat atletů)
- ✅ Výpočet top 3 členů podle hodin
- ✅ Ukládání do Firebase (celkové + týdenní statistiky)
- ✅ Přechod na Firebase Admin SDK
- ✅ Aktualizované TypeScript typy
- ✅ Helper skripty pro setup
- ✅ Test endpoint
- ✅ Kompletní dokumentace

## ⚡ Co musíte udělat (5 minut)

### 1️⃣ Stáhněte Service Account Key

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt **"nutrend-challenge"**
3. Klikněte na ⚙️ → **Project Settings**
4. Přejděte na záložku **"Service Accounts"**
5. Klikněte **"Generate new private key"** → **"Generate key"**
6. Stáhne se JSON soubor (např. `nutrend-challenge-firebase-adminsdk-xxxxx.json`)

### 2️⃣ Použijte helper skript

Otevřete PowerShell v root složce projektu:

```powershell
# Nahraďte cestu k vašemu staženému souboru
.\scripts\extract-service-account.ps1 C:\Users\YourName\Downloads\nutrend-challenge-firebase-adminsdk-xxxxx.json
```

Skript vypíše něco jako:
```
✅ Service Account credentials extracted successfully!

📋 Copy these lines to your .env.local file:

────────────────────────────────────────────────────────────────────────────────
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutrend-challenge.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
────────────────────────────────────────────────────────────────────────────────
```

### 3️⃣ Zkopírujte do .env.local

Otevřete soubor `.env.local` a **přidejte** tyto dva řádky na konec souboru:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutrend-challenge.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

⚠️ **DŮLEŽITÉ:** 
- Private key musí být v uvozovkách `"..."`
- Obsahuje `\n` (zpětné lomítko a n), ne skutečné nové řádky
- Helper skript to formátuje správně, jen zkopírujte

### 4️⃣ Restart serveru

Pokud běží dev server:
1. Stiskněte `Ctrl+C` v terminálu
2. Počkejte na ukončení (několik sekund)
3. Spusťte znovu:
```powershell
npm run dev
```

### 5️⃣ Test Firebase Admin

V novém PowerShell okně:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/test-firebase" | Select-Object -ExpandProperty Content
```

Měli byste vidět:
```json
{
  "success": true,
  "message": "Firebase Admin SDK is working correctly",
  ...
}
```

❌ Pokud vidíte error, zkontrolujte:
- Credentials jsou správně zkopírované v .env.local
- Private key je v uvozovkách
- Server byl restartovaný

### 6️⃣ Spusťte synchronizaci

```powershell
$headers = @{ "Authorization" = "Bearer your-secret-token-change-this-123" }
Invoke-WebRequest -Uri "http://localhost:3000/api/sync" -Method POST -ContentType "application/json" -Headers $headers | Select-Object -ExpandProperty Content
```

Synchronizace potrvá cca **30-60 sekund** (stahuje data pro 5 týmů × 5 týdnů).

Uvidíte:
```json
{
  "success": true,
  "message": "Data synced successfully",
  "timestamp": "2025-11-05T..."
}
```

### 7️⃣ Ověření dat

Zkontrolujte, že data obsahují top members:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/teams" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

Měli byste vidět v každém týmu:
```json
{
  "id": "spajkk",
  "name": "Team spajKK",
  "totalHours": 140.8,
  "topMembers": [
    {
      "name": "Jan Novák",
      "hours": 25.5,
      "activities": 12
    },
    ...
  ]
}
```

## ✨ Hotovo!

Data jsou nyní synchronizovaná a obsahují top 3 nejaktivnější členy!

### Co dál?

1. **Zobrazení v UI:** Upravte komponenty (např. `TeamDetailModal.tsx`) pro zobrazení top členů
2. **Automatická sync:** Data se aktualizují každé 2 hodiny na Vercelu
3. **Týdenní data:** API endpoint `/api/weekly` také obsahuje top 3 členy pro každý týden

### 📚 Dokumentace

- **TOP_MEMBERS_FEATURE.md** - Kompletní dokumentace nové funkce
- **FIREBASE_SETUP.md** - Detailní Firebase setup
- **SYNC_DOCUMENTATION.md** - Jak funguje synchronizace

### 🐛 Problémy?

#### Server nejde spustit / Port 3000 obsazený
```powershell
# Najděte proces na portu 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Ukončete ho
Stop-Process -Id <process-id>

# Nebo použijte port 3001
npm run dev
# A změňte URL na http://localhost:3001
```

#### Firebase Admin error
- Zkontrolujte .env.local formatting
- Private key musí být celý na jednom řádku (s `\n`)
- Zkuste smazat a znovu zkopírovat credentials

#### Synchronizace selhala
- Zkontrolujte Strava credentials v .env.local
- Zkontrolujte Firebase credentials
- Podívejte se do console.log v terminálu na chybové hlášky

#### Top members jsou prázdní
- Možná kluby ještě nemají žádné aktivity v daném období
- Zkontrolujte období výzvy v .env.local:
  ```
  NEXT_PUBLIC_CHALLENGE_START_DATE=2025-01-15T00:00:00Z
  NEXT_PUBLIC_CHALLENGE_END_DATE=2025-02-19T23:59:59Z
  ```

## 🎯 Příklad použití v komponentě

```tsx
// components/TeamDetailModal.tsx
{team.topMembers && team.topMembers.length > 0 && (
  <div className="mt-6">
    <h3 className="text-xl font-bold mb-4">🏆 Top 3 Nejaktivnější</h3>
    {team.topMembers.map((member, index) => (
      <div key={index} className="flex justify-between p-2">
        <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {member.name}</span>
        <span className="font-bold">{member.hours}h</span>
      </div>
    ))}
  </div>
)}
```

---

**Máte otázky?** Podívejte se do `TOP_MEMBERS_FEATURE.md` pro detaily! 🚀