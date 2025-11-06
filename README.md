# GAMECHANGER Challenge

Webová aplikace pro fitness výzvu GAMECHANGER Challenge, kde 5 týmů vedených známými streamery soutěží v pohybových aktivitách.

## 🚀 Technologie

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS 4
- **Animace:** Framer Motion
- **Database:** Firebase Firestore
- **API:** Strava API
- **Hosting:** Vercel
- **Language:** TypeScript

## 📋 Předpoklady

- Node.js 18+ 
- npm nebo yarn
- Firebase účet a projekt
- Strava API credentials
- Twitch API credentials (pro live streams)

## 🛠️ Instalace

1. **Klonování repozitáře**
```bash
git clone <repository-url>
cd nutrend-challenge
```

2. **Instalace závislostí**
```bash
npm install
```

3. **Konfigurace proměnných prostředí**

Vytvořte soubor `.env.local` v kořenovém adresáři a vyplňte následující proměnné:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Strava API Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token

# Challenge Dates
NEXT_PUBLIC_CHALLENGE_START_DATE=2025-01-15T00:00:00Z
NEXT_PUBLIC_CHALLENGE_END_DATE=2025-02-19T23:59:59Z

# Twitch API Configuration
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

4. **Získání Strava API credentials**

- Navštivte [Strava Settings](https://www.strava.com/settings/api)
- Vytvořte novou aplikaci
- Zkopírujte Client ID a Client Secret
- Pro získání refresh tokenu použijte OAuth flow

5. **Firebase nastavení**

- Vytvořte projekt na [Firebase Console](https://console.firebase.google.com/)
- Aktivujte Firestore Database
- Zkopírujte konfiguraci do `.env.local`

6. **Twitch API nastavení** (volitelné, pro live streams)

- Navštivte [Twitch Developer Console](https://dev.twitch.tv/console)
- Vytvořte novou aplikaci
- Zkopírujte Client ID a Client Secret
- Pro detailní instrukce viz [TWITCH_SETUP.md](./TWITCH_SETUP.md)

## 🚀 Spuštění

**Development server:**
```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

**Production build:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

## 📁 Struktura projektu

```
nutrend-challenge/
├── app/
│   ├── api/
│   │   ├── teams/
│   │   │   └── route.ts          # API endpoint pro data týmů
│   │   └── twitch/
│   │       └── streams/
│   │           └── route.ts      # API endpoint pro Twitch streamy
│   ├── globals.css               # Globální styly a CSS proměnné
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Hlavní stránka
├── components/
│   ├── AboutSection.tsx          # Sekce O výzvě
│   ├── Footer.tsx                # Footer
│   ├── HeroSection.tsx           # Hero sekce s countdown
│   ├── HowToJoinSection.tsx      # Sekce Jak se zapojit
│   ├── LeaderboardSection.tsx    # Žebříček týmů
│   ├── LiveStreamsSection.tsx    # Live Twitch streamy 🆕
│   ├── PrizesSection.tsx         # Sekce Ceny
│   ├── RulesSection.tsx          # Sekce Pravidla
│   ├── TeamDetailModal.tsx       # Modal s detaily týmu
│   └── WeeklyOverviewSection.tsx # Týdenní přehled
├── lib/
│   ├── constants.ts              # Konstanty (týmy, nastavení)
│   ├── firebase.ts               # Firebase konfigurace
│   ├── strava.ts                 # Strava API helper funkce
│   └── twitch.ts                 # Twitch API helper funkce 🆕
├── types/
│   └── index.ts                  # TypeScript typy
└── .env.local                    # Proměnné prostředí (vytvořte lokálně)
```

## ⚠️ Omezení Strava API

**Důležité:** Strava Club Activities API **nevrací datum aktivit** (`start_date`), což znemožňuje vytváření týdenních statistik.

### Co funguje:
- ✅ **Celkové statistiky** od začátku výzvy
- ✅ Počet členů, celkové hodiny, celkový počet aktivit
- ✅ Automatická synchronizace každé 2 hodiny

### Co nefunguje:
- ❌ **Týdenní statistiky** (Po-Ne) - API nevrací datum aktivit
- ❌ **Top 3 členové týmu** - API nevrací individuální statistiky

### Řešení:
Aplikace zobrazuje **celkové statistiky od začátku výzvy** (3. listopadu 2025).

Pro více informací viz [STRAVA-API-LIMITATIONS.md](./STRAVA-API-LIMITATIONS.md)

## 🎨 Design

Aplikace používá designový systém inspirovaný Nutrend.cz:

**Barvy:**
- Primary (Červená): `#E30613`
- Accent (Oranžová): `#FF6B35`
- Secondary (Tmavá): `#1A1A1A`
- Success (Zelená): `#00B894`

**Typografie:**
- Headings: Montserrat (Bold/ExtraBold)
- Body: Inter (Regular/Medium)

## 🏆 Funkce

- ✅ Live countdown do konce výzvy
- ✅ Real-time žebříček týmů
- ✅ **🆕 Live Twitch Streams Carousel** - Zobrazení streamerů, kteří právě vysílají
- ✅ Týdenní statistiky s reálnými kalendářními týdny
- ✅ Detail týmu s top členy
- ✅ **🆕 Top 3 Nejaktivnější Členové** - Automatické sledování a zobrazení nejaktivnějších členů každého týmu
- ✅ Automatická synchronizace dat ze Stravy (každé 2 hodiny)
- ✅ Integrace se Strava API
- ✅ **🆕 Integrace s Twitch API** - Live stream status a informace
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animace (Framer Motion)
- ✅ Firebase Firestore pro persistentní data

## 🔄 Strava API Integration

Aplikace automaticky získává data ze Stravy:
- Počet členů každého klubu
- Celkový počet aktivit
- Celkový počet hodin
- **🆕 Top 3 nejaktivnější členové** (celkově i týdenně)
- Povolené aktivity: Běh, Chůze, Turistika, Workout

### Automatická synchronizace
- **Interval:** Každé 2 hodiny (pomocí Vercel Cron Jobs)
- **Týdenní data:** Posledních 5 reálných kalendářních týdnů (pondělí - neděle)
- **Reset dat:** Každý týden začíná od nuly
- **Top členové:** Top 3 nejaktivnější členové pro každý tým (celkově i týdenně)
- **Uložení:** Data se ukládají do Firebase Firestore pomocí Admin SDK

Pro více informací viz:
- [SYNC_DOCUMENTATION.md](./SYNC_DOCUMENTATION.md) - Dokumentace synchronizace
- [TOP_MEMBERS_FEATURE.md](./TOP_MEMBERS_FEATURE.md) - Top 3 členové funkce
- [QUICK_START_TOP_MEMBERS.md](./QUICK_START_TOP_MEMBERS.md) - Rychlý start guide

## 🎮 Twitch Integration

Aplikace zobrazuje live streamy od streamerů výzvy:
- **Real-time status:** Automatická kontrola každé 2 minuty
- **Stream info:** Název, kategorie, počet diváků
- **Interaktivní karty:** Hover efekty, pulzující LIVE badge
- **Auto-hide:** Sekce se automaticky skryje, pokud nikdo nestreamuje

### Podporovaní streameři
- spajKK
- Andullie
- DinoDodo (dino_dodo_)
- Charmiie
- Kamilius (kamilius1)

Pro detailní nastavení viz [TWITCH_SETUP.md](./TWITCH_SETUP.md)

## 📊 Firebase Firestore

Struktura dat v Firestore:

```
stats/
  - overall
    - teams: array (celkové statistiky všech týmů)
      - topMembers: array (top 3 nejaktivnější členové) 🆕
    - lastUpdated: timestamp
  
  - week-{YYYY-MM-DD} (např. week-2025-01-06)
    - week: number (pořadové číslo týdne 1-5)
    - weekId: string (identifikátor týdne)
    - teams: array (týmové statistiky za daný týden)
      - topMembers: array (top 3 nejaktivnější členové tohoto týdne) 🆕
    - weekStart: string (ISO datum začátku týdne)
    - weekEnd: string (ISO datum konce týdne)
    - lastUpdated: timestamp
```

### Týdenní data
- Zobrazují se **posledních 5 kalendářních týdnů**
- Týden začíná v **pondělí 00:00** a končí v **neděli 23:59**
- Data se **resetují každý týden** (nejsou kumulativní)
- Automatická synchronizace probíhá **každé 2 hodiny**

## 🚀 Deployment na Vercel

1. **Připojte repository na Vercel**
2. **Nastavte environment variables** v Vercel dashboard
3. **Deploy!**

Vercel automaticky detekuje Next.js a nakonfiguruje build.

## 🤝 Přispívání

1. Fork repository
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add some AmazingFeature'`)
4. Push do branche (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## 📝 License

Tento projekt je vytvořen pro GAMECHANGER Challenge od Nutrend.

## 🐛 Známé problémy

- Strava API má rate limit 600 requestů za 15 minut
- Některé aktivity mohou být privátní a nezobrazí se
- Firebase free tier má limity na čtení/zápis

## 📞 Podpora

Pro otázky a problémy:
- Discord komunita
- Email: support@nutrend.cz
