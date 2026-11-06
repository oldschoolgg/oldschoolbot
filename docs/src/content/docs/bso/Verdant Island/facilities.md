---
title: "Island Facilities & Upgrades"
---

The Verdant Island features **seven core progression facilities** that provide island-wide and global bonuses. You contribute resources toward building each tier (T1 through T5).

---

## Progression Facilities

| Facility | Bonus per Tier | Max Bonus (T5) | Scope |
| :--- | :--- | :--- | :--- |
| **Warcamp Fortifications** | +5% faster boss kill speed | **+25%** speed | Verdant Island Bosses |
| **Archon Sanctum** | Unlocks Archon at T1; +10% regular loot & up to +40% unique chance / tier | **+50%** loot, **+100%** uniques | The Archon (Solo) |
| **Settlement Infrastructure** | +5% minigame speed & rewards | **+25%** boost | Brimstone Distillery & Contracts |
| **Expedition Outfitters** | +5% faster gathering speed | **+25%** speed | Mycology, Mining, Fishing |
| **Astral Observatory** | +0.5% global XP bonus | **+2.5%** XP | Global (All Skills) |
| **Grand Conduit** | Projects Warcamp, Settlement & Expedition globally | **100%** Projection | Global Bosses, Minigames & Gathering |
| **Supply Depot** | Reduces weekly maintenance demands by 3% / tier | **-15%** Demand | All Island Facilities & Camps |

---

## Grand Conduit & Global Projection

The **Grand Conduit** is a permanent sink that projects the bonuses of the **Warcamp**, **Settlement**, and **Expedition** facilities globally across the entire bot:

$$\text{Global Bonus} = \text{Facility Bonus} \times \left(\text{Conduit Tier} \times 20\%\right)$$

- **T1 Conduit (20% Projection):** Projects 20% of active facility bonuses globally (e.g. +5% global boss speed if Warcamp T5 is maintained).
- **T5 Conduit (100% Projection):** Projects 100% of active facility bonuses globally (e.g. +25% global boss speed, +25% global minigame speed/rewards, +25% global gathering speed).

> **Permanent Facility:** The Grand Conduit requires **no weekly maintenance**. Once built, it is permanent.
>
> **Completionist / Leagues Exemption:** The Grand Conduit is a very large sink, and as such is excluded from the Master Leagues task (*Max out all Verdant Island upgrades*).

---

## Supply Depot & Maintenance Reduction

The **Supply Depot** provides a reduction to the weekly maintenance requirements across all facilities and passive gathering camps:

- **T1:** 3% reduction
- **T2:** 6% reduction
- **T3:** 9% reduction
- **T4:** 12% reduction
- **T5:** 15% reduction

The reduction applies directly to base demands with rounding so that all tiers provide savings.

---

## Weekly Island Assignment

You can focus the island on a single category each week using [[/island assign]]:
- **Assigned Category:** Receives a **+30% bonus** to its effects (e.g., Warcamp T5 boosts boss speeds by **32.5%**).
- **Unassigned Categories:** Receive a **-20% penalty** to their active effects.
- Reset the focus anytime with [[/island unassign]].

---

## Weekly Maintenance Mechanics

Facilities (except the Grand Conduit) require weekly supply payments to remain active:
1. **Maintenance Cycle:** Maintenance lasts **7 days** (168 hours).
2. **Payment:** Run [[/island maintain]] to service facilities.
3. **Suspension:** If maintenance expires, all bonuses from that facility are suspended until serviced.
4. **Maintenance Scale:**
   - **T1:** 1.0x weekly demand
   - **T2:** 2.0x weekly demand
   - **T3:** 3.5x weekly demand
   - **T4:** 5.5x weekly demand
   - **T5:** 8.0x weekly demand

---

## Facility Construction Costs

### Warcamp Fortifications

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 1B | 2B | 3B | 4B | 5B | **15B** |
| **Colossal stem** | 1.8k | 5.2k | — | — | — | **7.0k** |
| **Crystalline ore** | 700 | 1.8k | 3.5k | 7k | 14k | **26.9k** |
| **Iron ore** | 7k | — | — | — | — | **7k** |
| **Coal** | 14k | — | — | — | — | **14k** |
| **Cannonball** | 8.8k | — | — | — | — | **8.8k** |
| **Dense crystal shard** | — | 1.8k | 5.2k | 10.5k | 21k | **38.5k** |
| **Adamantite ore** | — | 10.5k | — | — | — | **10.5k** |
| **Runite ore** | — | 14k | — | — | — | **14k** |
| **Battlestaff** | — | 5.2k | — | — | — | **5.2k** |
| **Ancient cap** | — | — | 700 | 1.4k | 2.8k | **4.9k** |
| **Runite bar** | — | — | 7k | 17.5k | 28k | **52.5k** |
| **Amethyst** | — | — | 8.8k | 17.5k | 35k | **61.2k** |
| **Blue dragon scale** | — | — | 7k | 10.5k | 10.5k | **28k** |
| **Blue dragonhide** | — | — | — | 1.8k | 5.2k | **7k** |
| **Sentinel core** | — | — | — | 1 | 2 | **3** |

---

### Archon Sanctum

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 1B | 2B | 3B | 4B | 5B | **15B** |
| **Brimstone spore** | 1.8k | 1.8k | — | — | — | **3.5k** |
| **Ignilace** | 175 | 52 | 3.5k | 10.5k | 21k | **35.2k** |
| **Pure essence** | 87.5k | — | — | 87.5k | 175k | **350k** |
| **Air rune** | 35k | — | — | — | — | **35k** |
| **Mind rune** | 35k | — | — | — | — | **35k** |
| **Crystalline ore** | — | 700 | — | — | — | **700** |
| **Nature rune** | — | 21k | — | — | — | **21k** |
| **Law rune** | — | 14k | — | — | — | **14k** |
| **Death rune** | — | 35k | 70k | — | — | **105k** |
| **Ancient cap** | — | — | 17 | 87 | 262 | **366** |
| **Dense crystal shard** | — | — | 1.8k | 4.2k | 8.8k | **14.7k** |
| **Blood rune** | — | — | 10.5k | 28k | 52.5k | **91k** |
| **Soul rune** | — | — | 10.5k | 14k | 26.2k | **50.8k** |
| **Sentinel core** | — | — | — | 1 | 2 | **3** |
| **Verdant heart** | — | — | — | — | 1 | **1** |

---

### Settlement Infrastructure

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 1B | 2B | 3B | 4B | 5B | **15B** |
| **Myconid plank** | 1.1k | 2.5k | — | — | — | **3.5k** |
| **Diluted brimstone** | 87 | 525 | 1.8k | 4.2k | 8.8k | **15.3k** |
| **Yew logs** | 10.5k | — | — | — | — | **10.5k** |
| **Flax** | 14k | — | — | — | — | **14k** |
| **Swamp paste** | 7k | — | — | — | — | **7k** |
| **Brimstone spore** | — | 700 | — | — | — | **700** |
| **Magic logs** | — | 5.2k | — | — | — | **5.2k** |
| **Grapes** | — | 14k | — | — | — | **14k** |
| **Snape grass** | — | 3.5k | — | — | — | **3.5k** |
| **Crystalline plank** | — | — | 3.5k | 8.8k | 17.5k | **29.8k** |
| **Dense crystal shard** | — | — | 1.8k | 4.2k | 8.8k | **14.7k** |
| **Mort myre fungus** | — | — | 7k | — | — | **7k** |
| **Raw rocktail** | — | — | 5.2k | 12.2k | 24.5k | **42k** |
| **Feather** | — | — | 35k | 70k | 157.5k | **262.5k** |
| **Battlestaff** | — | — | — | 10.5k | 26.2k | **36.8k** |
| **Sentinel core** | — | — | — | 1 | — | **1** |
| **Dragonstone** | — | — | — | — | 7k | **7k** |
| **Verdant heart** | — | — | — | — | 1 | **1** |

---

### Expedition Outfitters

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 1B | 2B | 3B | 4B | 5B | **15B** |
| **Verdant logs** | 1.8k | 3.5k | — | — | — | **5.2k** |
| **Living bark** | 350 | 875 | 1.4k | 2.8k | 5.2k | **10.7k** |
| **Elder logs** | 21k | 42k | 42k | 70k | 105k | **280k** |
| **Iron ore** | 7k | — | — | — | — | **7k** |
| **Coal** | 14k | — | — | — | — | **14k** |
| **Ancient verdant logs** | — | 1.8k | 525 | 1.4k | 2.8k | **6.5k** |
| **Adamantite ore** | — | 21k | — | — | — | **21k** |
| **Runite ore** | — | 28k | — | — | — | **28k** |
| **Verdant plank** | — | — | 700 | 1.8k | 3.5k | **6.0k** |
| **Runite bar** | — | — | 21k | 42k | 52.5k | **115.5k** |
| **Dragonstone** | — | — | 5.2k | 10.5k | 17.5k | **33.2k** |
| **Amethyst** | — | — | — | 8.8k | 17.5k | **26.2k** |
| **Sentinel core** | — | — | — | 1 | 2 | **3** |
| **Verdant heart** | — | — | — | — | 1 | **1** |

---

### Astral Observatory

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 2B | 4B | 6B | 8B | 10B | **30B** |
| **Prismare** | 100 | 200 | 400 | 750 | 1.5k | **3.0k** |
| **Celestyte** | 500 | — | 1.5k | 3k | 7.5k | **12.5k** |
| **Firaxyte** | 500 | — | 1.5k | 3k | 7.5k | **12.5k** |
| **Air rune** | 1M | — | — | — | — | **1M** |
| **Mind rune** | 1M | — | — | — | — | **1M** |
| **Pure essence** | 1M | — | — | 2.5M | 5M | **8.5M** |
| **Empyrean shards** | 50 | 100 | 150 | 300 | 500 | **1.1k** |
| **Starfire agate** | — | 1k | — | 3k | 7.5k | **11.5k** |
| **Oneiryte** | — | 1k | — | 3k | 7.5k | **11.5k** |
| **Verdantyte** | — | 1k | — | — | 7.5k | **8.5k** |
| **Nature rune** | — | 600k | — | — | — | **600k** |
| **Law rune** | — | 450k | — | — | — | **450k** |
| **Death rune** | — | 1M | 2M | — | — | **3M** |
| **Blood rune** | — | — | 4M | 1M | 1.8M | **6.8M** |
| **Soul rune** | — | — | 4M | 600k | 1M | **5.6M** |
| **Sentinel core** | — | — | — | 2 | 3 | **5** |
| **Verdant heart** | — | — | — | — | 2 | **2** |
| **Dragonstone** | — | — | — | — | 25k | **25k** |

---

### Grand Conduit

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 50B | 100B | 150B | 200B | 250B | **750B** |
| **Celestial flame** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Elderflame catalyst** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Sacrilegious flask** | 1 | 1 | — | — | 2 | **4** |
| **Shattered pendant** | — | 1 | — | — | 2 | **3** |
| **Forsaken tear** | — | — | 1 | — | 2 | **3** |
| **Primordial spine** | — | — | — | 1 | — | **1** |
| **Primordial heartstring** | — | — | — | 1 | — | **1** |
| **Sentinel core** | 2 | 4 | 7 | 10 | 12 | **35** |
| **Verdant heart** | 1 | 2 | 4 | 6 | 7 | **20** |
| **Dense crystal shard** | 50k | 50k | 150k | 200k | 250k | **700k** |
| **Verdant logs** | 50k | — | — | — | — | **50k** |
| **Crystalline ore** | 25k | — | — | — | — | **25k** |
| **Juvenile gemscale** | 10k | — | — | — | — | **10k** |
| **Brimstone spore** | 10k | — | — | — | — | **10k** |
| **Ancient energy** | 10k | — | — | — | — | **10k** |
| **Myconid plank** | 5k | — | — | — | — | **5k** |
| **Ancient verdant logs** | — | 50k | 75k | 100k | 250k | **475k** |
| **Gem infused ore** | — | 50k | — | — | — | **50k** |
| **Adolescent gemscale** | — | 15k | — | — | — | **15k** |
| **Living bark** | — | 10k | — | 25k | 50k | **85k** |
| **Ancient cap** | — | 10k | — | — | 50k | **60k** |
| **Verdant plank** | — | 5k | — | 10k | 50k | **65k** |
| **Diluted brimstone** | — | 10k | — | — | — | **10k** |
| **Firaxyte** | — | 5k | — | — | — | **5k** |
| **Verdantyte** | — | 5k | — | — | — | **5k** |
| **Mature gemscale** | — | — | 20k | — | — | **20k** |
| **Colossal stem** | — | — | 20k | — | 50k | **70k** |
| **Crystalline plank** | — | — | 10k | 20k | 50k | **80k** |
| **Ignilace** | — | — | 7.5k | 5k | 20k | **32.5k** |
| **Elder rune** | — | — | 5k | — | 10k | **15k** |
| **Oneiryte** | — | — | 5k | — | — | **5k** |
| **Starfire agate** | — | — | 5k | — | — | **5k** |
| **Celestyte** | — | — | 5k | — | — | **5k** |
| **Prismare** | — | — | 250 | 500 | 1k | **1.75k** |
| **Elder gemscale** | — | — | — | 25k | — | **25k** |
| **Elder plank** | — | — | — | 2.5k | 10k | **12.5k** |
| **Ancient gemscale** | — | — | — | — | 50k | **50k** |
| **Empyrean shards** | 250 | 250 | 250 | 250 | 500 | **1.5k** |

---

### Supply Depot

| Material | T1 | T2 | T3 | T4 | T5 | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coins** | 2B | 4B | 6B | 8B | 10B | **30B** |
| **Runite bar** | 5k | 10k | 15k | 20k | 30k | **80k** |
| **Crystalline plank** | 2k | 5k | 10k | 15k | 25k | **57k** |
| **Verdant plank** | 1k | 2.5k | 5k | 10k | 15k | **33.5k** |
| **Dense crystal shard** | — | 1k | 2.5k | 5k | 10k | **18.5k** |
| **Sentinel core** | — | — | 1 | 2 | 3 | **6** |
| **Verdant heart** | — | — | — | — | 1 | **1** |
