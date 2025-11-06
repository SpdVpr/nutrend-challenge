# ⚠️ Omezení Strava API - Týdenní statistiky

## Problém

**Strava Club Activities API nevrací datum aktivit (`start_date`)**, což znemožňuje filtrování aktivit podle týdnů.

## Technické detaily

### Co Strava API vrací:

```json
{
  "resource_state": 2,
  "athlete": {
    "firstname": "Michal",
    "lastname": "K."
  },
  "name": "Morning Weight Training",
  "distance": 0,
  "moving_time": 3812,
  "elapsed_time": 3812,
  "total_elevation_gain": 0,
  "type": "WeightTraining"
}
```

### Co CHYBÍ:
- ❌ `start_date` - datum a čas aktivity
- ❌ `start_date_local` - lokální datum a čas
- ❌ Jakékoliv časové razítko

### Co to znamená:
- ✅ Můžeme získat **celkový počet aktivit** klubu
- ✅ Můžeme získat **celkový čas** všech aktivit
- ✅ Můžeme získat **typy aktivit**
- ❌ **NEMŮŽEME** filtrovat aktivity podle data
- ❌ **NEMŮŽEME** vytvořit týdenní statistiky
- ❌ **NEMŮŽEME** zjistit, které aktivity jsou z aktuálního týdne

## Důsledky pro aplikaci

### Co FUNGUJE:
1. ✅ **Celkové statistiky** od začátku výzvy (3. listopadu 2025)
   - Počet členů
   - Celkové hodiny
   - Celkový počet aktivit
   - Pořadí týmů podle celkových hodin

2. ✅ **Automatická synchronizace** každé 2 hodiny
   - Data se aktualizují z Strava API
   - Ukládají se do Firebase
   - Zobrazují se na webu

### Co NEFUNGUJE:
1. ❌ **Týdenní statistiky** (Po-Ne)
   - Nemůžeme zjistit, které aktivity jsou z aktuálního týdne
   - Nemůžeme resetovat počítadlo každý týden
   - Nemůžeme vyhodnotit vítěze týdne

2. ❌ **Top 3 členové týmu**
   - API nevrací individuální statistiky členů
   - Pouze celkové statistiky klubu

## Možná řešení

### 1. Použít celkové statistiky (AKTUÁLNÍ ŘEŠENÍ) ✅

**Výhody:**
- ✅ Plně automatizované
- ✅ Funguje s oficiálním Strava API
- ✅ Žádné problémy s ToS
- ✅ Spolehlivé

**Nevýhody:**
- ❌ Pouze celkové statistiky, ne týdenní
- ❌ Nelze resetovat každý týden
- ❌ Nelze vyhodnotit vítěze týdne

### 2. Web Scraping (ODMÍTNUTO) ❌

**Výhody:**
- ✅ Týdenní statistiky
- ✅ Top 3 členové
- ✅ Všechna potřebná data

**Nevýhody:**
- ❌ Porušuje Strava Terms of Service
- ❌ Vyžaduje 2FA manuální login
- ❌ Není plně automatizované
- ❌ Riziko zablokování účtu
- ❌ Nestabilní (změny v HTML)

### 3. Strava Webhooks (MOŽNÉ, ALE SLOŽITÉ) ⚠️

**Popis:**
Strava nabízí Webhook API, které posílá notifikace o nových aktivitách.

**Výhody:**
- ✅ Real-time aktualizace
- ✅ Oficiální API
- ✅ Obsahuje `start_date`

**Nevýhody:**
- ❌ Vyžaduje registraci aplikace
- ❌ Vyžaduje OAuth flow pro každého uživatele
- ❌ Složitá implementace
- ❌ Uživatelé musí autorizovat aplikaci
- ❌ Nemůžeme získat historická data

### 4. Manuální zadávání (NEPRAKTICKÉ) ❌

**Popis:**
Administrátor ručně zadává týdenní statistiky.

**Výhody:**
- ✅ Plná kontrola
- ✅ Žádné API limity

**Nevýhody:**
- ❌ Časově náročné
- ❌ Náchylné k chybám
- ❌ Není automatizované

## Doporučení

### Pro aktuální výzvu:

**Použít celkové statistiky** (aktuální řešení):
- Zobrazovat celkové hodiny a aktivity od začátku výzvy
- Aktualizovat každé 2 hodiny přes Vercel Cron
- Jasně komunikovat uživatelům, že jde o celkové statistiky

**Komunikace s uživateli:**
```
📊 Celkové statistiky od začátku výzvy (3. listopadu 2025)

ℹ️ Zobrazují se celkové statistiky od začátku výzvy. 
   Týdenní statistiky nejsou dostupné přes Strava API.
```

### Pro budoucí výzvy:

**Zvážit Strava Webhooks:**
- Vyžaduje více práce na začátku
- Ale poskytuje real-time data s datumy
- Umožňuje týdenní statistiky

**Nebo změnit formát výzvy:**
- Místo týdenních výzev použít celkovou výzvu
- Vyhodnotit vítěze na konci celé výzvy
- Zobrazovat průběžné pořadí (celkové statistiky)

## Aktuální implementace

### Co zobrazujeme:
```
Aktuální pořadí týmů
📊 Celkové statistiky od začátku výzvy (3. listopadu 2025)

Team Andullie 🥇
👥 156 členů
⏱️ 39.5 hodin
🎯 61 aktivit
```

### Jak to funguje:
1. **Synchronizace** (každé 2 hodiny):
   - Načte aktivity z Strava API
   - Použije `after` parametr (od začátku výzvy)
   - Spočítá celkové hodiny a aktivity
   - Uloží do Firebase (`stats/overall`)

2. **API Endpoint** (`/api/teams`):
   - Načte data z Firebase
   - Vrátí celkové statistiky
   - Seřadí týmy podle hodin

3. **Frontend**:
   - Zobrazí pořadí týmů
   - Aktualizuje každých 5 minut
   - Zobrazí medaile pro top 3

## Závěr

**Strava Club Activities API je omezené** a neumožňuje týdenní statistiky bez web scrapingu.

**Aktuální řešení (celkové statistiky) je nejlepší kompromis:**
- ✅ Plně automatizované
- ✅ Spolehlivé
- ✅ Dodržuje Strava ToS
- ❌ Pouze celkové statistiky

**Pro týdenní statistiky by bylo potřeba:**
- Web scraping (porušuje ToS, není plně automatizované)
- Nebo Strava Webhooks (složité, vyžaduje OAuth)
- Nebo manuální zadávání (nepraktické)

