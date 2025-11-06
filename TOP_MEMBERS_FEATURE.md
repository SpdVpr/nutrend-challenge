# ✨ Nová funkce: Top 3 Nejaktivnější Členové Týmů

## 📋 Přehled

Synchronizace ze Strava API nyní automaticky získává a ukládá **top 3 nejaktivnější členy** pro každý tým:
- ✅ Pro celkové statistiky (od začátku výzvy)
- ✅ Pro každý týden samostatně

## 🔄 Co se změnilo

### 1. Rozšířená synchronizace dat

Synchronizační skript (`lib/sync-strava.ts`) nyní:
- Analyzuje všechny aktivity a seskupuje je podle atletů
- Počítá celkové hodiny a počet aktivit pro každého člena
- Seřadí členy podle hodin a vybere top 3
- Ukládá tyto informace do Firebase pro každý tým

### 2. Nová datová struktura

#### Celkové statistiky (`stats/overall`):
```typescript
{
  id: "spajkk",
  name: "Team spajKK",
  totalHours: 140.8,
  totalActivities: 158,
  topMembers: [
    {
      name: "Jan Novák",
      hours: 25.5,
      activities: 12,
      avatarUrl: "https://..." // (volitelné)
    },
    // ... top 2 a 3
  ]
}
```

#### Týdenní statistiky (`stats/week-{YYYY-MM-DD}`):
```typescript
{
  teamId: "spajkk",
  week: 1,
  hours: 45.2,
  activities: 50,
  points: 50,
  topMembers: [
    {
      name: "Jan Novák",
      hours: 8.5,
      activities: 4
    },
    // ... top 2 a 3
  ]
}
```

### 3. Aktualizované TypeScript typy

```typescript
// types/index.ts
export interface Team {
  // ... existing fields
  topMembers?: TeamMember[];
}

export interface WeeklyStats {
  // ... existing fields
  topMembers?: TeamMember[];
}

export interface TeamMember {
  name: string;
  hours: number;
  activities: number;
  avatarUrl?: string;
}
```

### 4. Přechod na Firebase Admin SDK

Synchronizace nyní používá **Firebase Admin SDK** místo client SDK, což:
- ✅ Umožňuje zápis dat obcházející security rules
- ✅ Je správný způsob pro server-side operace
- ✅ Funguje na Vercelu bez dalšího nastavení

## 🛠️ Jak to nastavit

### Krok 1: Získání Firebase Service Account

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Otevřete váš projekt
3. **Settings** (⚙️) → **Project Settings** → **Service Accounts**
4. Klikněte na **"Generate new private key"**
5. Stáhne se vám JSON soubor

⚠️ **DŮLEŽITÉ:** Tento soubor nikdy necommitujte do Gitu!

### Krok 2: Extrakce credentials

Použijte náš helper skript:

**Windows:**
```powershell
.\scripts\extract-service-account.ps1 C:\Downloads\nutrend-challenge-firebase-xxxxx.json
```

**Mac/Linux:**
```bash
node scripts/extract-service-account.js ~/Downloads/nutrend-challenge-firebase-xxxxx.json
```

### Krok 3: Aktualizace .env.local

Přidejte tyto řádky do `.env.local`:

```env
# Firebase Admin SDK credentials
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Krok 4: Restart a test

```bash
# Restart dev serveru (pokud běží)
# Ctrl+C a pak:
npm run dev

# Test Firebase Admin připojení
curl http://localhost:3000/api/test-firebase

# Spuštění synchronizace
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer your-secret-token-change-this-123"
```

**PowerShell:**
```powershell
# Test Firebase Admin
Invoke-WebRequest -Uri "http://localhost:3000/api/test-firebase"

# Synchronizace
$headers = @{ "Authorization" = "Bearer your-secret-token-change-this-123" }
Invoke-WebRequest -Uri "http://localhost:3000/api/sync" -Method POST -Headers $headers
```

### Krok 5: Ověření dat

Po synchronizaci zkontrolujte data:

```bash
curl http://localhost:3000/api/teams
```

Měli byste vidět `topMembers` u každého týmu.

## 📊 Použití dat ve frontendu

### Získání celkových top členů

```typescript
const response = await fetch('/api/teams');
const { teams } = await response.json();

teams.forEach(team => {
  console.log(`Top members of ${team.name}:`);
  team.topMembers?.forEach((member, index) => {
    console.log(`${index + 1}. ${member.name}: ${member.hours}h (${member.activities} activities)`);
  });
});
```

### Získání týdenních top členů

```typescript
const response = await fetch('/api/weekly');
const weeklyData = await response.json();

weeklyData.forEach(weekData => {
  weekData.teams.forEach(teamStats => {
    console.log(`Week ${weekData.week} - ${teamStats.teamName}:`);
    teamStats.topMembers?.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name}: ${member.hours}h`);
    });
  });
});
```

## 🎨 Příklad zobrazení v UI

```tsx
// V TeamDetailModal.tsx nebo podobné komponentě
{team.topMembers && team.topMembers.length > 0 && (
  <div className="mt-6">
    <h3 className="text-xl font-bold mb-4">🏆 Top 3 Nejaktivnější Členové</h3>
    <div className="space-y-3">
      {team.topMembers.map((member, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </span>
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-gray-600">
                {member.activities} aktivit
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{member.hours}h</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

## 📝 Poznámky

### Ochrana soukromí
- Strava API vrací pouze veřejné profily
- Jména jsou přesně tak, jak si je atleti nastavili ve Stravě
- Avatar URL je k dispozici pouze pokud je profil veřejný

### Performance
- Data se počítají jednou během synchronizace (každé 2 hodiny)
- Uživatelé načítají pre-computed data z Firebase
- Žádný dopad na Strava API rate limits

### Týdenní statistiky
- Top 3 členové se počítají **samostatně pro každý týden**
- Nejsou kumulativní - každý týden začíná od nuly
- Umožňuje vidět, kdo byl nejaktivnější v konkrétním týdnu

## 🚀 Deployment na Vercel

Pro produkční deployment:

1. Přidejte environment variables do Vercel:
   ```
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

2. Firebase Admin SDK na Vercelu automaticky funguje s těmito credentials

3. Žádná další konfigurace není potřeba!

## 📚 Související soubory

- `lib/strava.ts` - Strava API interface (přidán `StravaAthlete`)
- `lib/sync-strava.ts` - Synchronizační logika (přidána funkce `getTopMembers`)
- `lib/firebase-admin.ts` - Firebase Admin SDK konfigurace
- `types/index.ts` - TypeScript typy (přidány `topMembers` fieldy)
- `scripts/extract-service-account.ps1` - Helper pro Windows
- `scripts/extract-service-account.js` - Helper pro Mac/Linux
- `app/api/test-firebase/route.ts` - Test endpoint pro Firebase Admin

## ❓ Troubleshooting

### "Firebase Admin is not initialized"
- Ujistěte se, že máte `FIREBASE_CLIENT_EMAIL` a `FIREBASE_PRIVATE_KEY` v `.env.local`
- Restartujte dev server

### "Permission denied" při synchronizaci
- Firebase Admin SDK obchází security rules
- Pokud používáte client SDK, změňte na admin SDK

### Top members jsou prázdní
- Ujistěte se, že Strava aktivity obsahují informace o atletech
- Zkontrolujte, že klub má veřejné aktivity
- Některé kluby mohou mít privátní aktivity

### Private key format error
- Private key musí být v uvozovkách
- Musí obsahovat `\n` pro nové řádky (ne skutečné nové řádky v .env)
- Použijte náš helper skript pro správný formát

## 🎯 Další kroky

1. **Zobrazení v UI:** Vytvořte komponenty pro zobrazení top členů
2. **Animace:** Přidejte smooth transitions při načítání dat
3. **Avatars:** Využijte `avatarUrl` pro zobrazení profilových fotek
4. **Weekly view:** Umožněte uživatelům vidět top členy po týdnech

Pokud máte dotazy nebo problémy, podívejte se do:
- `FIREBASE_SETUP.md` - Kompletní Firebase setup
- `SYNC_DOCUMENTATION.md` - Dokumentace synchronizace
- `README.md` - Obecný přehled projektu