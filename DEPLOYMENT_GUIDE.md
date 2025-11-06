# Průvodce nasazením na Vercel

## 📋 Předpoklady
- GitHub/GitLab/Bitbucket účet s tímto repository
- Vercel účet (zdarma na [vercel.com](https://vercel.com))
- Firebase projekt (vytvořený a nakonfigurovaný)
- Strava API credentials

## 🚀 Krok za krokem

### 1. Příprava repository
```bash
git add .
git commit -m "Add automatic sync and weekly stats"
git push origin main
```

### 2. Import projektu na Vercel

1. Přejděte na [vercel.com](https://vercel.com) a přihlaste se
2. Klikněte na **"Add New Project"**
3. Importujte vaše repository
4. Vercel automaticky detekuje Next.js projekt

### 3. Nastavení Environment Variables

V Vercel dashboard nastavte následující proměnné:

#### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutrend-challenge.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutrend-challenge
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutrend-challenge.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=614286441263
NEXT_PUBLIC_FIREBASE_APP_ID=1:614286441263:web:...
```

#### Strava API Configuration
```
STRAVA_CLIENT_ID=183985
STRAVA_CLIENT_SECRET=6b5fa55c0cbdb3679ccd665a377739a9cb39cec4
STRAVA_REFRESH_TOKEN=c021e483650edc20a88195b32a9fe9e9cbed5606
```

#### Sync Configuration
```
SYNC_SECRET_TOKEN=zmenit-na-silne-heslo-123456
```

#### Challenge Dates
```
NEXT_PUBLIC_CHALLENGE_START_DATE=2025-01-15T00:00:00Z
NEXT_PUBLIC_CHALLENGE_END_DATE=2025-02-19T23:59:59Z
```

### 4. Deploy

1. Klikněte na **"Deploy"**
2. Počkejte, až se build dokončí
3. Po dokončení se automaticky aktivuje Vercel Cron Job

### 5. Ověření Cron Jobu

1. V Vercel dashboard přejděte do sekce **"Cron"**
2. Měli byste vidět:
   ```
   Path: /api/sync
   Schedule: 0 */2 * * *
   Next run: [čas dalšího spuštění]
   ```

### 6. První synchronizace (manuální)

Po nasazení spusťte první synchronizaci manuálně:

```bash
curl -X POST https://your-domain.vercel.app/api/sync \
  -H "Authorization: Bearer zmenit-na-silne-heslo-123456"
```

Nebo použijte PowerShell:
```powershell
Invoke-WebRequest -Uri "https://your-domain.vercel.app/api/sync" -Method POST -Headers @{"Authorization"="Bearer zmenit-na-silne-heslo-123456"}
```

## 🔍 Ověření funkcí

### 1. Kontrola synchronizace
```bash
curl https://your-domain.vercel.app/api/weekly
```

Mělo by vrátit JSON s týdenními daty.

### 2. Kontrola Vercel logs
```bash
vercel logs
```

Nebo v Vercel dashboard → Deployments → [latest] → Logs

### 3. Kontrola Firebase

Přejděte do Firebase Console:
1. Firestore Database
2. Collection `stats`
3. Měli byste vidět dokumenty:
   - `overall`
   - `week-2025-10-06`
   - `week-2025-10-13`
   - atd.

## ⚙️ Konfigurace Cron Jobu

Cron job je nakonfigurován v `vercel.json`:

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

### Změna intervalu

Upravte `schedule` podle potřeby:

| Interval | Cron pattern | Popis |
|----------|--------------|-------|
| Každou hodinu | `0 * * * *` | Na začátku každé hodiny |
| Každé 2 hodiny | `0 */2 * * *` | 0:00, 2:00, 4:00, ... |
| Každé 4 hodiny | `0 */4 * * *` | 0:00, 4:00, 8:00, ... |
| Každých 30 minut | `*/30 * * * *` | :00 a :30 každé hodiny |
| Jednou denně | `0 0 * * *` | Půlnoc každý den |
| Dvakrát denně | `0 0,12 * * *` | Půlnoc a poledne |

Po změně:
```bash
git add vercel.json
git commit -m "Update cron schedule"
git push origin main
```

Vercel automaticky aktualizuje cron job při dalším deployi.

## 🐛 Řešení problémů

### Cron job se nespouští

**Kontrola:**
1. V Vercel dashboard → Settings → Cron
2. Zkontrolujte "Last run" a "Next run"
3. Podívejte se do logs

**Řešení:**
- Cron job funguje pouze na **production** prostředí
- Ujistěte se, že `vercel.json` je v root adresáři
- Zkuste re-deploy: `vercel --prod`

### Synchronizace selže (500 error)

**Možné příčiny:**
1. Špatné Strava API credentials
2. Vypršelý refresh token
3. Firebase není správně nakonfigurován
4. Rate limit od Stravy (600 req/15min)

**Řešení:**
1. Zkontrolujte environment variables
2. Obnovte Strava refresh token
3. Zkontrolujte Firebase rules
4. Snižte frekvenci synchronizace

### Data se nezobrazují na webu

**Kontrola:**
1. Otevřete DevTools → Network
2. Zkontrolujte request na `/api/weekly`
3. Podívejte se do Firebase Console

**Řešení:**
1. Spusťte manuální sync: `POST /api/sync`
2. Vyčistěte cache prohlížeče
3. Zkontrolujte Firebase Firestore rules

### 401 Unauthorized při manuálním volání

**Řešení:**
- Použijte správný `SYNC_SECRET_TOKEN`
- Header: `Authorization: Bearer your-token`

## 📊 Monitoring

### Vercel Dashboard
- **Deployments:** Historie všech deployů
- **Analytics:** Návštěvnost a výkon
- **Logs:** Real-time logy aplikace
- **Cron:** Status a historie cron jobů

### Doporučené monitoring
1. **Vercel Logs** - sledujte chyby synchronizace
2. **Firebase Console** - kontrolujte data v Firestore
3. **Strava API Dashboard** - sledujte rate limits
4. **Uptime monitoring** - např. UptimeRobot pro kontrolu dostupnosti

## 🔐 Bezpečnost

### Doporučení:
1. **Změňte `SYNC_SECRET_TOKEN`** na silné heslo
2. **Necommitujte `.env.local`** do Git (je v `.gitignore`)
3. **Rotujte Strava tokens** pravidelně
4. **Nastavte Firebase Security Rules** správně
5. **Sledujte Vercel logs** pro podezřelou aktivitu

### Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stats/{document=**} {
      allow read: if true;
      allow write: if false; // Pouze přes API
    }
  }
}
```

## 🎉 Hotovo!

Po dokončení všech kroků:
- ✅ Aplikace běží na Vercelu
- ✅ Automatická synchronizace každé 2 hodiny
- ✅ Týdenní data se zobrazují správně
- ✅ Data se ukládají do Firebase

Vaše aplikace je připravena k použití! 🚀

## 📞 Podpora

Pokud narazíte na problémy:
1. Zkontrolujte [SYNC_DOCUMENTATION.md](./SYNC_DOCUMENTATION.md)
2. Podívejte se do Vercel logs
3. Zkontrolujte Firebase Console
4. Otevřete issue na GitHubu