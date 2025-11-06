# 🔧 Hybrid Scraping - Praktická implementace

## Přehled

**Hybrid Scraping** = Manuální login (1x týdně) + Automatický scraping (každé 2 hodiny)

## 📦 Potřebné balíčky

```bash
npm install puppeteer
npm install @types/puppeteer --save-dev
```

## 📁 Struktura souborů

```
nutrend-challenge/
├── scripts/
│   ├── manual-login.js          # Manuální login (spustit 1x týdně)
│   └── scrape-leaderboard.js    # Scraping script
├── app/api/
│   └── scrape-weekly/
│       └── route.ts             # API endpoint pro scraping
├── strava-cookies.json          # Uložené cookies (gitignore!)
└── .env.local
```

## 🔐 Krok 1: Manuální login script

**scripts/manual-login.js:**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function manualLogin() {
  console.log('🚀 Spouštím browser pro manuální přihlášení...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Viditelný browser
    defaultViewport: { width: 1280, height: 800 },
  });
  
  const page = await browser.newPage();
  
  console.log('📱 Navigace na Strava login...');
  await page.goto('https://www.strava.com/login');
  
  console.log('\n⚠️  DŮLEŽITÉ:');
  console.log('1. Přihlaste se do Strava (email + heslo)');
  console.log('2. Pokud je 2FA, zadejte kód');
  console.log('3. Počkejte, až se dostanete na dashboard');
  console.log('4. Stiskněte Enter v tomto terminálu\n');
  
  // Čekat na Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('\n💾 Ukládám cookies...');
  
  // Uložit cookies
  const cookies = await page.cookies();
  const cookiesPath = path.join(__dirname, '..', 'strava-cookies.json');
  fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  
  console.log(`✅ Cookies uloženy do: ${cookiesPath}`);
  console.log(`📊 Počet cookies: ${cookies.length}`);
  
  // Test - zkusit načíst leaderboard
  console.log('\n🧪 Testuji přístup k leaderboard...');
  await page.goto('https://www.strava.com/clubs/1469610/leaderboard');
  
  await page.waitForTimeout(2000);
  
  const isLoggedIn = await page.evaluate(() => {
    return !document.querySelector('.login-form');
  });
  
  if (isLoggedIn) {
    console.log('✅ Test úspěšný! Cookies fungují.');
  } else {
    console.log('❌ Test selhal! Zkuste to znovu.');
  }
  
  await browser.close();
  console.log('\n✅ Hotovo! Můžete nyní spustit automatický scraping.');
}

manualLogin().catch(console.error);
```

**Spuštění:**
```bash
node scripts/manual-login.js
```

## 🤖 Krok 2: Scraping script

**scripts/scrape-leaderboard.js:**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEAMS = [
  { id: 'spajkk', name: 'Team spajKK', stravaClubId: 1469610 },
  { id: 'andullie', name: 'Team Andullie', stravaClubId: 1469617 },
  { id: 'dinododo', name: 'Team DinoDodo', stravaClubId: 1469620 },
  { id: 'charmiie', name: 'Team Charmiie', stravaClubId: 1469625 },
  { id: 'kamilius', name: 'Team Kamilius', stravaClubId: 1469623 },
];

async function scrapeLeaderboard() {
  console.log('🚀 Spouštím scraping...\n');
  
  // Načíst cookies
  const cookiesPath = path.join(__dirname, '..', 'strava-cookies.json');
  
  if (!fs.existsSync(cookiesPath)) {
    console.error('❌ Cookies nenalezeny! Spusťte nejprve: node scripts/manual-login.js');
    process.exit(1);
  }
  
  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
  console.log(`📂 Načteno ${cookies.length} cookies\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  // Nastavit cookies
  await page.setCookie(...cookies);
  
  const results = [];
  
  for (const team of TEAMS) {
    console.log(`📊 Scraping ${team.name}...`);
    
    try {
      await page.goto(`https://www.strava.com/clubs/${team.stravaClubId}/leaderboard`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Počkat na načtení leaderboardu
      await page.waitForSelector('.leaderboard', { timeout: 10000 });
      
      // Scrape data
      const data = await page.evaluate(() => {
        // Najít "This Week" sekci
        const thisWeekSection = document.querySelector('.leaderboard');
        if (!thisWeekSection) return null;
        
        // Celkové statistiky týmu
        const totalMembers = document.querySelector('.club-member-count')?.textContent?.match(/\d+/)?.[0] || '0';
        
        // Top členové
        const rows = thisWeekSection.querySelectorAll('tbody tr');
        const topMembers = Array.from(rows).slice(0, 3).map(row => {
          const nameEl = row.querySelector('.athlete-name, .text-title1');
          const hoursEl = row.querySelector('.hours, [data-testid="hours"]');
          const activitiesEl = row.querySelector('.activities, [data-testid="activities"]');
          
          return {
            name: nameEl?.textContent?.trim() || 'Unknown',
            hours: parseFloat(hoursEl?.textContent?.replace(/[^\d.]/g, '') || '0'),
            activities: parseInt(activitiesEl?.textContent?.replace(/\D/g, '') || '0'),
          };
        });
        
        // Celkové hodiny a aktivity (součet všech členů)
        const allRows = Array.from(rows);
        const totalHours = allRows.reduce((sum, row) => {
          const hours = parseFloat(row.querySelector('.hours, [data-testid="hours"]')?.textContent?.replace(/[^\d.]/g, '') || '0');
          return sum + hours;
        }, 0);
        
        const totalActivities = allRows.reduce((sum, row) => {
          const activities = parseInt(row.querySelector('.activities, [data-testid="activities"]')?.textContent?.replace(/\D/g, '') || '0');
          return sum + activities;
        }, 0);
        
        return {
          members: parseInt(totalMembers),
          totalHours: Math.round(totalHours * 10) / 10,
          totalActivities,
          topMembers,
        };
      });
      
      if (data) {
        results.push({
          teamId: team.id,
          teamName: team.name,
          ...data,
        });
        
        console.log(`  ✅ ${data.members} členů, ${data.totalHours} hodin, ${data.totalActivities} aktivit`);
        console.log(`  🏆 Top 3: ${data.topMembers.map(m => m.name).join(', ')}\n`);
      } else {
        console.log(`  ⚠️  Nepodařilo se načíst data\n`);
      }
      
    } catch (error) {
      console.error(`  ❌ Chyba: ${error.message}\n`);
    }
    
    // Pauza mezi requesty
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  console.log('\n📊 Výsledky:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Pokud je spuštěno přímo
if (require.main === module) {
  scrapeLeaderboard()
    .then(() => {
      console.log('\n✅ Scraping dokončen!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Chyba:', error);
      process.exit(1);
    });
}

module.exports = { scrapeLeaderboard };
```

**Spuštění:**
```bash
node scripts/scrape-leaderboard.js
```

## 🌐 Krok 3: API Endpoint

**app/api/scrape-weekly/route.ts:**
```typescript
import { NextResponse } from 'next/server';
import { scrapeLeaderboard } from '@/scripts/scrape-leaderboard';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    // Ověřit secret token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.SYNC_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🚀 Starting weekly scraping...');
    
    // Scrape data
    const results = await scrapeLeaderboard();
    
    // Získat aktuální týden
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Pondělí
    weekStart.setHours(0, 0, 0, 0);
    
    const weekId = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    
    // Uložit do Firebase
    const weekDocRef = doc(db, 'stats', `week-${weekId}`);
    await setDoc(weekDocRef, {
      weekId,
      weekStart: weekStart.toISOString(),
      teams: results,
      lastUpdated: new Date().toISOString(),
      source: 'scraping',
    });
    
    console.log(`✅ Data saved to Firebase: week-${weekId}`);
    
    return NextResponse.json({
      success: true,
      weekId,
      teams: results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('❌ Scraping error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## ⏰ Krok 4: Automatizace (Vercel Cron)

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/scrape-weekly",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

**PROBLÉM:** Vercel Edge Functions **nepodporují Puppeteer**!

**Řešení:** Použít externí hosting (Railway/Render)

## 🚂 Krok 5: Hosting na Railway.app

### 5.1 Vytvořit Dockerfile

**Dockerfile:**
```dockerfile
FROM node:18-slim

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app files
COPY . .

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3001

CMD ["node", "server.js"]
```

### 5.2 Vytvořit Express server

**server.js:**
```javascript
const express = require('express');
const { scrapeLeaderboard } = require('./scripts/scrape-leaderboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.SYNC_SECRET_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const results = await scrapeLeaderboard();
    
    // TODO: Uložit do Firebase
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5.3 Deploy na Railway

1. Jít na https://railway.app
2. Vytvořit nový projekt
3. Connect GitHub repo
4. Nastavit environment variables:
   - `SYNC_SECRET_TOKEN`
   - Firebase credentials
5. Deploy!

### 5.4 Nastavit Cron (z Vercel)

**app/api/trigger-scrape/route.ts:**
```typescript
export async function POST(request: Request) {
  // Zavolat Railway endpoint
  const response = await fetch('https://your-railway-app.railway.app/api/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SYNC_SECRET_TOKEN}`,
    },
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/trigger-scrape",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

## 📝 Workflow

1. **Jednou týdně (5 minut):**
   ```bash
   node scripts/manual-login.js
   ```
   - Přihlásit se do Strava
   - Cookies se uloží

2. **Automaticky (každé 2 hodiny):**
   - Vercel Cron zavolá `/api/trigger-scrape`
   - Ten zavolá Railway endpoint
   - Railway spustí Puppeteer scraping
   - Data se uloží do Firebase
   - Web zobrazí aktuální týdenní statistiky

3. **Když cookies expirují:**
   - Scraping selže
   - Administrátor dostane notifikaci
   - Spustí znovu `manual-login.js`

## 💰 Náklady

- **Railway.app:** $5/měsíc (Hobby plan)
- **Vercel:** $0 (zdarma)
- **Firebase:** $0 (zdarma do limitu)

**Celkem: $5/měsíc**

## ⚠️ Rizika

1. **Porušení Strava ToS** - možné zablokování účtu
2. **Cookies expirují** - nutný re-login
3. **Změny v HTML** - scraping přestane fungovat
4. **Rate limiting** - Strava může blokovat requesty

## ✅ Výhody

1. ✅ Týdenní statistiky
2. ✅ Top 3 členové
3. ✅ Funguje pro všechny členy (bez autorizace)
4. ✅ Relativně rychlá implementace (1-2 dny)

## 🎯 Závěr

**Hybrid Scraping je kompromis:**
- ⚠️ Rychlé řešení pro aktuální výzvu
- ⚠️ Vyžaduje manuální zásah 1x týdně
- ⚠️ Porušuje ToS (riziko)
- ✅ Poskytuje všechna potřebná data

**Pro dlouhodobé řešení doporučuji Strava Webhooks!**

