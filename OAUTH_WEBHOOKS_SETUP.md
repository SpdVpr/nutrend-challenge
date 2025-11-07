# 🚀 OAuth + Webhooks Setup - Kompletní průvodce

## 📋 Přehled

Tento systém umožňuje **automatické sledování aktivit členů týmu** přes Strava OAuth a Webhooks.

### **Výhody oproti současnému řešení:**
- ✅ **Real-time aktualizace** - aktivity se počítají okamžitě po nahrání
- ✅ **Týdenní statistiky** - máme přístup k `start_date` každé aktivity
- ✅ **Oficiální API** - dodržuje Strava Terms of Service
- ✅ **Automatizované** - žádné manuální syncy
- ✅ **Funguje na Vercel** ($0 hosting)

### **Nevýhody:**
- ⚠️ **Každý člen musí autorizovat** (533 členů celkem)
- ⚠️ **Historická data** - pouze od data autorizace (ne zpětně)
- ⚠️ Složitější implementace

---

## 🛠️ Krok 1: Nastavení Strava API

### 1.1 Aktualizovat Strava aplikaci

Jděte na: **https://www.strava.com/settings/api**

**Nastavte:**
- **Authorization Callback Domain**: `nutrend-challenge.vercel.app`
  - Pro lokální testování přidejte: `localhost`
- **Webhook Event Subscription**: Vyplníte po nasazení (viz Krok 4)

### 1.2 Poznamenat credentials

Vaše credentials (již máte):
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`

---

## 🔧 Krok 2: Konfigurace prostředí

### 2.1 Aktualizovat `.env.local`

```bash
# Existující konfigurace
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=your_secret_here
STRAVA_REFRESH_TOKEN=your_refresh_token

# NOVÉ proměnné pro OAuth + Webhooks
NEXT_PUBLIC_STRAVA_CLIENT_ID=12345
STRAVA_WEBHOOK_VERIFY_TOKEN=random_strong_password_xyz123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Pro produkci (Vercel):**
```bash
NEXT_PUBLIC_APP_URL=https://nutrend-challenge.vercel.app
```

### 2.2 Vygenerovat verify token

Verify token může být jakýkoliv náhodný string:
```bash
# Příklad generování náhodného tokenu (Windows PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 🚀 Krok 3: Nasazení na Vercel

### 3.1 Deploy aplikace

```bash
git add .
git commit -m "Add OAuth + Webhooks support"
git push origin main
```

### 3.2 Nastavit environment variables ve Vercel

V Vercel Dashboard -> Settings -> Environment Variables:

```
NEXT_PUBLIC_STRAVA_CLIENT_ID=12345
STRAVA_WEBHOOK_VERIFY_TOKEN=random_strong_password_xyz123
NEXT_PUBLIC_APP_URL=https://nutrend-challenge.vercel.app
```

### 3.3 Redeploy

Po nastavení proměnných klikněte na "Redeploy" ve Vercel.

---

## 🔗 Krok 4: Vytvořit Webhook Subscription

### 4.1 Otestovat webhook endpoint

**Testovat validaci:**
```bash
curl -X GET "https://nutrend-challenge.vercel.app/api/strava/webhook?hub.verify_token=random_strong_password_xyz123&hub.challenge=test123&hub.mode=subscribe"
```

**Očekávaný výstup:**
```json
{"hub.challenge":"test123"}
```

### 4.2 Vytvořit subscription

**Pomocí API endpointu:**
```bash
curl -X POST https://nutrend-challenge.vercel.app/api/strava/subscription \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

**Nebo pomocí Strava API přímo:**
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=12345 \
  -F client_secret=your_secret \
  -F callback_url=https://nutrend-challenge.vercel.app/api/strava/webhook \
  -F verify_token=random_strong_password_xyz123
```

**Očekávaný výstup:**
```json
{"id":123456}
```

**Poznamenejte si `subscription_id`!**

### 4.3 Ověřit subscription

```bash
curl -X GET "https://www.strava.com/api/v3/push_subscriptions?client_id=12345&client_secret=your_secret"
```

---

## 👥 Krok 5: Propagace mezi členy

### 5.1 Autorizační stránka

Členové přejdou na:
```
https://nutrend-challenge.vercel.app/authorize
```

### 5.2 Proces autorizace

1. Člen klikne na "Připojit Strava účet"
2. Přesměruje se na Strava OAuth
3. Potvrdí přístup k aktivitám
4. Systém automaticky:
   - Uloží access token
   - Zjistí členství v klubech
   - Přiřadí člena k týmu
   - Zobrazí potvrzení

### 5.3 Propagační strategie

**Doporučení:**

1. **Discord/Sociální sítě:**
   ```
   🏃 DŮLEŽITÉ pro všechny účastníky! 🏃
   
   Pro účast v Nutrend Challenge musíte propojit váš Strava účet:
   👉 https://nutrend-challenge.vercel.app/authorize
   
   Trvá to jen 30 sekund a vaše aktivity se budou automaticky 
   počítat do týmových statistik! 📊
   ```

2. **Email kampaň** členům klubů

3. **Pin v Discord** s odkazem

4. **Banner na hlavní stránce**

---

## 📊 Krok 6: Jak systém funguje

### 6.1 Flow aktivit

```
1. Člen nahraje aktivitu na Stravu
   ↓
2. Strava pošle webhook na váš server
   ↓
3. Server načte detail aktivity (včetně start_date)
   ↓
4. Ověří typ aktivity (Run/Walk/Hike/Workout)
   ↓
5. Určí týden a přiřadí k týmu
   ↓
6. Aktualizuje Firebase statistiky:
   - Overall stats
   - Weekly stats (s body)
   ↓
7. Frontend zobrazí aktualizované statistiky
```

### 6.2 Struktura dat v Firebase

**Collection: `athletes`**
```json
{
  "123456": {
    "athleteId": 123456,
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": 1699999999,
    "firstname": "Jan",
    "lastname": "Novák",
    "teamId": "andullie",
    "stravaClubId": 1469623,
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z"
  }
}
```

**Collection: `activities`**
```json
{
  "987654321": {
    "activityId": 987654321,
    "athleteId": 123456,
    "teamId": "andullie",
    "type": "Run",
    "startDate": "2025-11-07T08:30:00Z",
    "movingTime": 3600,
    "distance": 10000,
    "name": "Morning Run",
    "createdAt": "2025-11-07T10:00:00Z"
  }
}
```

**Document: `stats/overall`** (stejný formát jako nyní)

**Document: `stats/week-2025-11-04`**
```json
{
  "week": 1,
  "weekId": "2025-11-04",
  "weekStart": "2025-11-04T00:00:00Z",
  "weekEnd": "2025-11-10T23:59:59Z",
  "teams": [
    {
      "teamId": "andullie",
      "teamName": "Team Andullie",
      "week": 1,
      "activities": 45,
      "hours": 67.5,
      "members": 156,
      "points": 50
    }
  ],
  "lastUpdated": "timestamp"
}
```

---

## 🔍 Krok 7: Testování

### 7.1 Testovat OAuth flow

1. Přejít na `/authorize`
2. Kliknout na "Připojit Strava účet"
3. Autorizovat aplikaci
4. Ověřit, že athlete byl uložen do Firebase

**Zkontrolovat v Firebase Console:**
```
athletes/[athlete_id]
```

### 7.2 Testovat webhook

**Simulovat webhook událost:**
```bash
curl -X POST https://nutrend-challenge.vercel.app/api/strava/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "aspect_type": "create",
    "event_time": 1699999999,
    "object_id": 123456789,
    "object_type": "activity",
    "owner_id": 123456,
    "subscription_id": 999999
  }'
```

**Očekávaný výstup:**
```json
{
  "success": true,
  "message": "Activity created and stats updated"
}
```

### 7.3 Zkontrolovat logy

Ve Vercel Dashboard -> Functions -> Logs

Hledejte:
- `✅ Athlete token saved`
- `📥 Webhook event received`
- `✅ Activity processed successfully`
- `✅ Weekly stats updated`

---

## 🐛 Troubleshooting

### Problém: Webhook subscription se nepodařilo vytvořit

**Řešení:**
1. Ověřte, že webhook endpoint odpovídá na GET request:
   ```bash
   curl -X GET "https://nutrend-challenge.vercel.app/api/strava/webhook?hub.verify_token=YOUR_TOKEN&hub.challenge=test&hub.mode=subscribe"
   ```
   Musí vrátit: `{"hub.challenge":"test"}`

2. Zkontrolujte, že callback URL je dostupný z internetu

3. Smažte existující subscription a vytvořte novou:
   ```bash
   curl -X DELETE "https://www.strava.com/api/v3/push_subscriptions/SUBSCRIPTION_ID?client_id=CLIENT_ID&client_secret=CLIENT_SECRET"
   ```

### Problém: Aktivity se nepočítají

**Kontrolní seznam:**
1. ✅ Je athlete autorizován? (zkontrolovat Firebase `athletes/`)
2. ✅ Je webhook subscription aktivní? (zavolat GET na subscription endpoint)
3. ✅ Je aktivita správného typu? (Run/Walk/Hike/Workout)
4. ✅ Je aktivita po datu challenge startu?
5. ✅ Je athlete přiřazen k týmu?

**Debug:**
```bash
# Zkontrolovat athlete v Firebase
# Zkontrolovat logy ve Vercel
# Simulovat webhook manuálně
```

### Problém: OAuth callback selhává

**Řešení:**
1. Ověřte Authorization Callback Domain v Strava Settings
2. Zkontrolujte `NEXT_PUBLIC_APP_URL` v `.env.local`
3. Ověřte, že všechny environment variables jsou nastaveny ve Vercel

---

## 📈 Monitoring

### Klíčové metriky

**Sledovat:**
- Počet autorizovaných athletes
- Počet přijatých webhooků
- Úspěšnost zpracování aktivit
- Chybové logy

**Firebase Console:**
```
athletes/ - kolik členů je autorizováno
activities/ - kolik aktivit bylo zpracováno
stats/overall - celkové statistiky
stats/week-* - týdenní statistiky
```

**Vercel Logs:**
```
Filtrovat podle:
- "Webhook event received"
- "Activity processed successfully"
- "Error"
```

---

## 🔄 Migrace ze starého systému

### Současný stav
- Synchronizace každé 2 hodiny
- Pouze celkové statistiky
- Club Activities API (bez datumů)

### Nový systém
- Real-time webhooks
- Týdenní statistiky
- Activity Details API (s datumy)

### Přechodové období

**Doporučení:**

1. **Spustit nový systém paralelně** se starým
2. **Propagovat autorizaci** mezi členy (1-2 týdny)
3. **Monitorovat pokrytí** (kolik % členů autorizovalo)
4. **Po 80%+ pokrytí** vypnout staré syncy
5. **Fallback** - pokud člen není autorizován, zobrazit upozornění

---

## 📚 API Endpoints Reference

### `/api/strava/auth` (GET)
OAuth callback endpoint

**Query params:**
- `code` - authorization code ze Stravy
- `error` - error code (pokud autorizace selhala)

**Redirect:**
- Success: `/authorize?success=true&athlete=Name&team=TeamName`
- Error: `/authorize?error=error_code`

### `/api/strava/webhook` (GET)
Webhook validation endpoint

**Query params:**
- `hub.mode` - "subscribe"
- `hub.verify_token` - verify token
- `hub.challenge` - challenge string

**Response:**
```json
{"hub.challenge": "challenge_string"}
```

### `/api/strava/webhook` (POST)
Webhook events endpoint

**Body:**
```json
{
  "aspect_type": "create",
  "event_time": 1699999999,
  "object_id": 123456789,
  "object_type": "activity",
  "owner_id": 123456,
  "subscription_id": 999999
}
```

**Response:**
```json
{"success": true, "message": "Activity created and stats updated"}
```

### `/api/strava/subscription` (GET)
View webhook subscription

**Headers:**
- `Authorization: Bearer YOUR_SYNC_SECRET_TOKEN`

**Response:**
```json
{
  "success": true,
  "subscriptions": [{"id": 123456, ...}]
}
```

### `/api/strava/subscription` (POST)
Create webhook subscription

**Headers:**
- `Authorization: Bearer YOUR_SYNC_SECRET_TOKEN`

**Response:**
```json
{
  "success": true,
  "subscription": {"id": 123456}
}
```

### `/api/strava/subscription` (DELETE)
Delete webhook subscription

**Query params:**
- `id` - subscription ID

**Headers:**
- `Authorization: Bearer YOUR_SYNC_SECRET_TOKEN`

**Response:**
```json
{"success": true, "message": "Subscription deleted"}
```

---

## ✅ Checklist

### Pre-deployment
- [ ] Aktualizovat Strava API settings (callback domain)
- [ ] Nastavit všechny environment variables
- [ ] Otestovat lokálně
- [ ] Vytvořit verify token

### Deployment
- [ ] Deploy na Vercel
- [ ] Nastavit environment variables ve Vercel
- [ ] Redeploy
- [ ] Otestovat webhook endpoint (GET)

### Post-deployment
- [ ] Vytvořit webhook subscription
- [ ] Ověřit subscription
- [ ] Otestovat OAuth flow
- [ ] Otestovat webhook (simulovaná událost)
- [ ] Propagovat autorizaci mezi členy

### Monitoring
- [ ] Sledovat počet autorizovaných členů
- [ ] Monitorovat Vercel logy
- [ ] Kontrolovat Firebase collections
- [ ] Ověřovat týdenní statistiky

---

## 🎯 Cíle

**Týden 1:**
- ✅ Implementace dokončena
- ✅ Deployment na Vercel
- ✅ Webhook subscription vytvořena
- 🎯 20% členů autorizováno

**Týden 2:**
- 🎯 50% členů autorizováno
- 🎯 První týdenní statistiky

**Týden 3:**
- 🎯 80% členů autorizováno
- 🎯 Vypnout staré syncy
- 🎯 Plně automatizovaný systém

---

## 📞 Podpora

**Problémy s autorizací:**
- Zkontrolovat callback domain
- Ověřit environment variables
- Zkontrolovat logy ve Vercel

**Problémy s webhooky:**
- Ověřit subscription je aktivní
- Zkontrolovat verify token
- Simulovat událost manuálně

**Firebase problémy:**
- Ověřit Firebase Admin credentials
- Zkontrolovat Firestore rules
- Ověřit collections existují
