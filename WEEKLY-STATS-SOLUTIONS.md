# 🎯 Řešení pro týdenní statistiky - Kompletní analýza

## Problém
Potřebujeme **týdenní statistiky** pro soutěž, ale Strava API je nevrací.

## 🔍 Možná řešení

### 1. ❌ Strava Embed / iFrame
**Status:** NENÍ MOŽNÉ

**Proč:**
- Strava **neposkytuje embed kód** pro Club Leaderboard
- Poskytují jen embed pro:
  - ✅ Jednotlivé aktivity
  - ✅ Activity feed (poslední aktivity)
  - ❌ **NE** Leaderboard

**iFrame problém:**
```html
<iframe src="https://www.strava.com/clubs/1469623/leaderboard"></iframe>
```
- ❌ Vyžaduje přihlášení (login wall)
- ❌ Strava blokuje embedding přes X-Frame-Options
- ❌ CORS policy blokuje přístup

---

### 2. ⚠️ Puppeteer/Playwright Scraping (Automatizovaný)
**Status:** MOŽNÉ, ale složité

**Jak to funguje:**
1. Headless browser (Puppeteer/Playwright)
2. Automatický login přes cookies/session
3. Navigace na leaderboard
4. Scraping HTML dat
5. Uložení do Firebase

**Výhody:**
- ✅ Plně automatizované (po prvním loginu)
- ✅ Týdenní statistiky
- ✅ Top 3 členové
- ✅ Všechna potřebná data

**Nevýhody:**
- ❌ Porušuje Strava ToS
- ❌ Složitá implementace
- ❌ Vyžaduje server (ne Vercel Edge Functions)
- ❌ Cookies expirují (nutný re-login)
- ❌ 2FA problém
- ❌ Riziko zablokování účtu
- ❌ Nestabilní (změny v HTML)

**Implementace:**
```javascript
// Příklad s Puppeteer
const puppeteer = require('puppeteer');

async function scrapeLeaderboard(clubId) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Načíst uložené cookies
  const cookies = JSON.parse(fs.readFileSync('strava-cookies.json'));
  await page.setCookie(...cookies);
  
  // Navigovat na leaderboard
  await page.goto(`https://www.strava.com/clubs/${clubId}/leaderboard`);
  
  // Scrape data
  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('.leaderboard-row');
    return Array.from(rows).map(row => ({
      name: row.querySelector('.athlete-name').textContent,
      hours: parseFloat(row.querySelector('.hours').textContent),
      activities: parseInt(row.querySelector('.activities').textContent),
    }));
  });
  
  await browser.close();
  return data;
}
```

**Hosting:**
- ❌ Vercel - nepodporuje Puppeteer
- ✅ Railway.app - podporuje Docker
- ✅ Render.com - podporuje Docker
- ✅ DigitalOcean - VPS

**Cena:**
- Railway: $5-10/měsíc
- Render: $7/měsíc
- DigitalOcean: $6/měsíc

---

### 3. ✅ Strava Webhooks + OAuth (DOPORUČENO)
**Status:** NEJLEPŠÍ ŘEŠENÍ (ale složité)

**Jak to funguje:**
1. Každý člen týmu autorizuje vaši aplikaci
2. Strava posílá webhooks o nových aktivitách
3. Webhook obsahuje `start_date` a všechna data
4. Ukládáte do Firebase a počítáte týdenní statistiky

**Výhody:**
- ✅ **Oficiální API** - dodržuje ToS
- ✅ Real-time aktualizace
- ✅ Obsahuje `start_date` a všechna data
- ✅ Týdenní statistiky možné
- ✅ Spolehlivé a stabilní
- ✅ Funguje na Vercel

**Nevýhody:**
- ❌ Složitá implementace
- ❌ **Každý člen musí autorizovat aplikaci**
- ❌ OAuth flow pro každého uživatele
- ❌ Nemůžeme získat historická data (jen od autorizace)

**Implementace:**

#### Krok 1: Registrace aplikace
1. Jít na https://www.strava.com/settings/api
2. Vytvořit novou aplikaci
3. Získat Client ID a Client Secret
4. Nastavit Authorization Callback Domain

#### Krok 2: OAuth flow
```typescript
// app/api/strava/auth/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Exchange code for access token
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  
  const data = await response.json();
  
  // Uložit athlete_id a access_token do Firebase
  await saveAthleteToken(data.athlete.id, data.access_token, data.refresh_token);
  
  return NextResponse.redirect('/success');
}
```

#### Krok 3: Webhook subscription
```typescript
// app/api/strava/webhook/route.ts
export async function POST(request: Request) {
  const event = await request.json();
  
  if (event.aspect_type === 'create' && event.object_type === 'activity') {
    // Načíst detaily aktivity
    const activity = await getActivityDetails(event.object_id);
    
    // Zkontrolovat, zda je člen některého z našich klubů
    const athlete = await getAthlete(event.owner_id);
    const teamId = getTeamByClubMembership(athlete);
    
    if (teamId) {
      // Uložit aktivitu do Firebase
      await saveActivity({
        teamId,
        athleteId: event.owner_id,
        activityId: event.object_id,
        type: activity.type,
        startDate: activity.start_date,
        movingTime: activity.moving_time,
        distance: activity.distance,
      });
      
      // Aktualizovat týdenní statistiky
      await updateWeeklyStats(teamId);
    }
  }
  
  return NextResponse.json({ success: true });
}
```

#### Krok 4: Autorizační stránka pro členy
```tsx
// app/authorize/page.tsx
export default function AuthorizePage() {
  const authorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent('https://yoursite.com/api/strava/auth')}&approval_prompt=force&scope=activity:read_all`;
  
  return (
    <div>
      <h1>Autorizujte přístup ke Strava</h1>
      <p>Pro účast v soutěži musíte autorizovat naši aplikaci.</p>
      <a href={authorizeUrl}>
        <button>Autorizovat Strava</button>
      </a>
    </div>
  );
}
```

**Problémy:**
- ❌ **Každý člen musí kliknout na "Autorizovat"** (156 + 98 + 167 + 66 + 46 = 533 lidí!)
- ❌ Nemůžeme získat historická data (jen od autorizace)
- ❌ Pokud někdo neautorizuje, jeho aktivity se nepočítají

---

### 4. ⚠️ Hybrid: Scraping + Manuální login
**Status:** KOMPROMIS

**Jak to funguje:**
1. Jednou týdně se administrátor přihlásí
2. Uloží session cookies
3. Automatický scraping používá tyto cookies
4. Když cookies expirují, administrátor se znovu přihlásí

**Výhody:**
- ✅ Týdenní statistiky
- ✅ Top 3 členové
- ✅ Relativně jednoduché
- ✅ Funguje pro všechny členy (bez autorizace)

**Nevýhody:**
- ❌ Porušuje Strava ToS
- ❌ Vyžaduje manuální zásah (1x týdně)
- ❌ Není plně automatizované
- ❌ Riziko zablokování účtu

**Implementace:**
```javascript
// scripts/manual-login.js
const puppeteer = require('puppeteer');

async function manualLogin() {
  const browser = await puppeteer.launch({ headless: false }); // Viditelný browser
  const page = await browser.newPage();
  
  await page.goto('https://www.strava.com/login');
  
  console.log('Přihlaste se ručně...');
  console.log('Po přihlášení stiskněte Enter...');
  
  // Čekat na Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Uložit cookies
  const cookies = await page.cookies();
  fs.writeFileSync('strava-cookies.json', JSON.stringify(cookies, null, 2));
  
  console.log('Cookies uloženy!');
  await browser.close();
}

manualLogin();
```

```javascript
// app/api/scrape/route.ts
import puppeteer from 'puppeteer';
import fs from 'fs';

export async function POST(request: Request) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Načíst uložené cookies
  const cookies = JSON.parse(fs.readFileSync('strava-cookies.json'));
  await page.setCookie(...cookies);
  
  // Scrape všechny týmy
  const teams = [1469610, 1469617, 1469620, 1469625, 1469623];
  const results = [];
  
  for (const clubId of teams) {
    await page.goto(`https://www.strava.com/clubs/${clubId}/leaderboard`);
    
    const data = await page.evaluate(() => {
      // Scrape leaderboard data
      const thisWeek = document.querySelector('.this-week');
      const rows = thisWeek.querySelectorAll('tr');
      
      return Array.from(rows).slice(0, 3).map(row => ({
        name: row.querySelector('.athlete-name')?.textContent,
        hours: parseFloat(row.querySelector('.hours')?.textContent || '0'),
        activities: parseInt(row.querySelector('.activities')?.textContent || '0'),
      }));
    });
    
    results.push({ clubId, leaderboard: data });
  }
  
  // Uložit do Firebase
  await saveToFirebase(results);
  
  await browser.close();
  return NextResponse.json({ success: true, data: results });
}
```

**Hosting:**
- Railway.app nebo Render.com (podporují Puppeteer)

**Workflow:**
1. Administrátor spustí `node scripts/manual-login.js` (1x týdně)
2. Přihlásí se ručně
3. Cookies se uloží
4. Cron job spouští scraping každé 2 hodiny
5. Když cookies expirují, administrátor se znovu přihlásí

---

### 5. ❌ Manuální zadávání
**Status:** NEPRAKTICKÉ

Administrátor ručně zadává statistiky každý den.

---

## 📊 Srovnání řešení

| Řešení | Automatizace | Týdenní stats | Top 3 | ToS | Složitost | Cena | Doporučení |
|--------|--------------|---------------|-------|-----|-----------|------|------------|
| **Strava Embed** | ✅ | ❌ | ❌ | ✅ | ⭐ | $0 | ❌ Není možné |
| **Puppeteer Scraping** | ✅ | ✅ | ✅ | ❌ | ⭐⭐⭐⭐ | $5-10/měsíc | ⚠️ Rizikové |
| **Strava Webhooks** | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | $0 | ✅ **NEJLEPŠÍ** |
| **Hybrid Scraping** | ⚠️ | ✅ | ✅ | ❌ | ⭐⭐⭐ | $5-10/měsíc | ⚠️ Kompromis |
| **Manuální** | ❌ | ✅ | ✅ | ✅ | ⭐ | $0 | ❌ Nepraktické |

---

## 🎯 Doporučení

### Pro aktuální výzvu (krátký čas):
**Hybrid Scraping** (Řešení 4)
- ⚠️ Rychlé nasazení (1-2 dny)
- ⚠️ Funguje pro všechny členy
- ⚠️ Vyžaduje manuální login 1x týdně
- ⚠️ Porušuje ToS (riziko)

### Pro budoucí výzvy (dlouhodobé):
**Strava Webhooks** (Řešení 3)
- ✅ Oficiální API
- ✅ Spolehlivé
- ✅ Dodržuje ToS
- ❌ Vyžaduje čas na implementaci (1-2 týdny)
- ❌ Každý člen musí autorizovat

### Alternativa:
**Změnit formát soutěže:**
- Místo týdenních výzev → **celková výzva**
- Vyhodnotit vítěze na konci (např. po 4 týdnech)
- Zobrazovat průběžné pořadí (celkové statistiky)
- Funguje s aktuálním řešením (Strava API)

---

## 🚀 Implementační plán

### Varianta A: Hybrid Scraping (rychlé)
1. **Den 1:**
   - Nastavit Railway.app nebo Render.com
   - Implementovat Puppeteer scraping
   - Vytvořit manual login script

2. **Den 2:**
   - Testovat scraping
   - Nastavit cron job (každé 2 hodiny)
   - Aktualizovat frontend pro zobrazení týdenních dat

3. **Údržba:**
   - Manuální login 1x týdně (5 minut)

### Varianta B: Strava Webhooks (dlouhodobé)
1. **Týden 1:**
   - Registrovat Strava aplikaci
   - Implementovat OAuth flow
   - Vytvořit autorizační stránku

2. **Týden 2:**
   - Implementovat webhook endpoint
   - Testovat s několika uživateli
   - Aktualizovat frontend

3. **Týden 3:**
   - Propagovat autorizaci mezi členy
   - Monitorovat a opravovat chyby

4. **Údržba:**
   - Žádná (plně automatizované)

---

## 💰 Náklady

### Hybrid Scraping:
- **Hosting:** $5-10/měsíc (Railway/Render)
- **Čas:** 5 minut/týden (manuální login)
- **Riziko:** Možné zablokování Strava účtu

### Strava Webhooks:
- **Hosting:** $0 (Vercel zdarma)
- **Čas:** 0 (plně automatizované)
- **Riziko:** Žádné

---

## ❓ Otázky k rozhodnutí

1. **Jak dlouho bude soutěž trvat?**
   - Krátká (1-2 týdny) → Hybrid Scraping
   - Dlouhá (měsíce) → Strava Webhooks

2. **Kolik času máte na implementaci?**
   - Málo (1-2 dny) → Hybrid Scraping
   - Více (1-2 týdny) → Strava Webhooks

3. **Jste ochotni riskovat zablokování Strava účtu?**
   - Ano → Hybrid Scraping
   - Ne → Strava Webhooks

4. **Můžete požádat členy o autorizaci?**
   - Ano → Strava Webhooks
   - Ne → Hybrid Scraping

5. **Máte rozpočet na hosting?**
   - Ano ($5-10/měsíc) → Hybrid Scraping možné
   - Ne → Strava Webhooks (Vercel zdarma)

