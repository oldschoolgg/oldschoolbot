---
title: "Bank Filters"
---

There are a multitude of bank filters you can use to easily identify or search for items in your bank. You can start by typing the [[/bank]] command to display your bank. It is also possible to view different pages of your bank with [[/bank page:2]].

### Searching Your Bank

There are two ways to search your bank for items:

- [[/bank item\:item name]] – Only returns results when the full item name is entered.
- [[/bank search\:text]] – Returns anything that contains the text entered.

### Bank Sorting

When searching your bank, you can use multiple options to find exactly what you're looking for.

#### Sorts

- `value` – This is the default sort, by Grand Exchange value (then item ID for untradeables).
- `alch` – Sorts by alch value rather than Grand Exchange value.
- `name` – Sorts your bank alphabetically.
- `quantity` – Sorts your bank by item stack size.

#### Flags

- `show_X` – Shows whatever option is chosen (ID, alch price, names, etc.) below the item.
- `wide` – Makes the image wider (useful for viewing a lot of items at once).
- `show_all` – Includes all items rather than a single page (this can result in very large images).

#### Formats

- `text_paged` – Returns a click-through box similar to leaderboards for your bank.
- `text_full` – Returns a notepad document of all items (very useful for viewing a large bank).
- `json` – Returns a JSON file of your bank.

The following command is an example of a bank search for the term "rune" with many filters: [[/bank search\:rune flag\:show_names flag_extra\:wide]].

### Category Filters

The following bank filters can be used with either of the bank search commands to display items of a specific category. Some examples include:

- `food` – Displays your food that can be used during PvM.
- `potions` – Displays your potions.
- `herbs` – Displays your clean and grimy herbs.
- `compost` – Displays your compost and compostable items.
- `secondaries` – Displays your [[herblore]] secondaries.
- `diaries` – Displays your achievement diary rewards and lamps.
- `clues and caskets` – Displays your clue scrolls and reward caskets.
- `herblore` – Displays herbs, secondaries, and potions.
- `farming` – Displays seeds and compost.
- `smithing` – Displays any items related to [[smithing]].
- `crafting` – Displays any items related to [[crafting]].
- `fletching` – Displays any items related to [[fletching]].
- `agility` – Displays any items related to [[agility]].
- `prayer` – Displays any items related to [[prayer]].
- `diango` – Displays items from the daily rewards.

### Collection Log Filters

The collection log filters can be used with either of the bank search commands to display the items from specific collection logs, for example [[/bank filter\:cerberus]]. Not all collection logs are available for bank searching.

Some other collection logs that can be searched include:
  - `god wars` – Displays all unique items from the God Wars bosses.
  - `dagannoth kings` – Displays all unique items from the Dagannoth Kings.
  - `skilling` – Displays any items that can be used to gain non-combat XP.
  - `slayer` – Displays all unique Slayer items.
  - `all pets` – Displays any pets you own.
  - `capes` – Displays any capes (including skillhoods).
  - `quest` – Displays any quest-based items.
  - `random events` – Displays any items you received from random events.
  - `implings` – Displays any impling jars you've caught.
  - `tzhaar` – Displays any TzHaar items.
  - `revenants` – Displays any revenant-based items.
  - `cyclopes` – Displays all obtained defenders.
  - `miscellaneous` – Displays any miscellaneous items.
  - `clue [tier]` – Displays all items of the respective clue tier.
