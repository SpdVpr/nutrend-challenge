# 🎮 Twitch Live Streams Integration

Tato příručka vás provede nastavením Twitch API pro zobrazování live streamů na webu.

## 📋 Přehled

Live Streams Carousel automaticky zobrazuje, který streamer právě streamuje na Twitchi. Sekce se objevuje pouze když alespoň jeden streamer vysílá.

### ✨ Funkce
- ✅ Real-time zobrazení live streamů
- ✅ Počet diváků pro každý stream
- ✅ Název hry/kategorie
- ✅ Thumbnail náhled
- ✅ Hover efekty a animace
- ✅ Automatický refresh každé 2 minuty
- ✅ Přímé odkazy na Twitch kanály

## 🔧 Nastavení Twitch API

### Krok 1: Vytvoření Twitch aplikace

1. Přejděte na [Twitch Developer Console](https://dev.twitch.tv/console)
2. Přihlaste se svým Twitch účtem
3. Klikněte na **"Register Your Application"**
4. Vyplňte formulář:
   - **Name**: `Nutrend Challenge` (nebo jakýkoliv název)
   - **OAuth Redirect URLs**: `http://localhost:3000` (pro development)
   - **Category**: `Website Integration`
5. Klikněte na **"Create"**

### Krok 2: Získání credentials

Po vytvoření aplikace:

1. Klikněte na aplikaci v dashboardu
2. Zkopírujte **Client ID**
3. Klikněte na **"New Secret"** a zkopírujte **Client Secret**
4. ⚠️ **DŮLEŽITÉ**: Client Secret se zobrazí pouze jednou, uložte si ho!

### Krok 3: Nastavení environment variables

Otevřete soubor `.env.local` (nebo vytvořte z `.env.local.example`) a přidejte:

```bash
# Twitch API Configuration
TWITCH_CLIENT_ID=your_actual_client_id_here
TWITCH_CLIENT_SECRET=your_actual_client_secret_here
```

**Příklad:**
```bash
TWITCH_CLIENT_ID=abc123def456ghi789jkl012mno345pq
TWITCH_CLIENT_SECRET=xyz987wvu654tsr321qpo098nml876kj
```

### Krok 4: Restart serveru

Po přidání credentials restartujte development server:

```bash
npm run dev
```

## 🎯 Jak to funguje

### API Endpoints

**GET /api/twitch/streams**
- Vrací seznam všech aktivních streamů
- Automaticky filtruje pouze streamery z výzvy
- Cachuje access token pro efektivitu

**Response format:**
```json
{
  "streams": [
    {
      "id": "123456789",
      "userName": "spajKK",
      "title": "Ranní běh + AMA",
      "gameName": "Just Chatting",
      "viewerCount": 2345,
      "thumbnailUrl": "https://...",
      "teamName": "Team spajKK",
      "twitchUrl": "https://www.twitch.tv/spajkk"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Komponenta LiveStreamsSection

Komponenta automaticky:
- Načte live streams při načtení stránky
- Refreshuje data každé 2 minuty
- Skryje se, pokud nikdo nestreamuje
- Zobrazí loading state při načítání
- Animuje přechody pomocí Framer Motion

### Streamers v databázi

Streameři jsou definováni v `lib/constants.ts`:

```typescript
{
  id: 'spajkk',
  name: 'Team spajKK',
  streamer: 'spajKK',
  twitchUsername: 'spajkk',  // ← Twitch login name
  twitchUrl: 'https://www.twitch.tv/spajkk',
  // ...
}
```

## 🎨 Vzhled a UX

### Desktop
- 3 sloupce (na velkých obrazovkách)
- Hover efekt: scale + overlay s tlačítkem "Sledovat"
- Pulzující LIVE badge
- Smooth animace při načítání

### Tablet
- 2 sloupce

### Mobile
- 1 sloupec
- Touch-friendly velikost karet

### Animace
- Fade-in při načtení
- Scale efekt na hover
- Pulzující LIVE indikátor
- Shine efekt na hover

## 🐛 Debugging

### Stream se nezobrazuje?

**Kontrolní checklist:**
1. ✅ Je streamer LIVE na Twitchi?
2. ✅ Je správně nastavený `twitchUsername` v `lib/constants.ts`?
3. ✅ Jsou správně vyplněné `TWITCH_CLIENT_ID` a `TWITCH_CLIENT_SECRET`?
4. ✅ Je development server restartovaný?

**Zkontrolovat v konzoli:**
```javascript
// Browser console
fetch('/api/twitch/streams').then(r => r.json()).then(console.log)
```

**Server logs:**
```bash
# Měly by být vidět v terminálu kde běží `npm run dev`
Error fetching Twitch streams: ...
```

### Časté problémy

**"Failed to get Twitch access token"**
- ❌ Nesprávné credentials
- ✅ Zkontrolujte Client ID a Secret

**"Twitch API credentials are not configured"**
- ❌ Chybí environment variables
- ✅ Přidejte do `.env.local` a restartujte server

**Stream se nezobrazuje i když streamer vysílá**
- ❌ Špatný `twitchUsername`
- ✅ Zkontrolujte přesné jméno na Twitchi (case-insensitive)

**Sekce se nezobrazuje vůbec**
- ✅ To je správné! Sekce se automaticky skryje, pokud nikdo nestreamuje
- ✅ Test: Zkuste když někdo z týmu vysílá

## 📊 Rate Limits

Twitch API limity:
- **800 requests/minute** (per Client ID)
- Naše implementace: ~30 requests/hour (při 5 streamerech, refresh každé 2 min)
- **Bezpečná rezerva**: 🟢 Velmi dobrá

## 🔒 Bezpečnost

- ✅ Client Secret je pouze na serveru (nikdy v browseru)
- ✅ Access token je cachován a automaticky refreshován
- ✅ API endpoint je rate-limited Vercelem
- ⚠️ Nikdy necommitujte `.env.local` do Gitu!

## 🚀 Produkční nasazení

Na Vercelu přidejte environment variables:

1. Otevřete Vercel Dashboard
2. Vyberte projekt
3. Settings → Environment Variables
4. Přidejte:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
5. Redeploy aplikaci

## 📝 Poznámky

- Komponenta používá **Client Component** (`'use client'`) kvůli state managementu
- Twitch thumbnails jsou v rozlišení 440x248px
- Stream data se cachují pouze po dobu requestu (dynamic route)
- Access token se cachuje in-memory až do expirace

## 🎉 Hotovo!

Pokud vše funguje správně, měli byste vidět:
- 🔴 Sekci "PRÁVĚ STREAMUJÍ" když někdo vysílá
- 👤 Stream cards s náhledy a informacemi
- 🎮 Kategorii/hru co streamují
- 👁️ Počet diváků
- ✨ Krásné animace a hover efekty

---

**Vytvořeno pro Nutrend Challenge 2025** 🏃‍♂️💪