---
title: "Bank Filters"
---

There are a multitude of bank filters you can use to easily identify or search items in your bank. You can start by typing the [[/bank]] command to display your bank. It is also possible to view the different pages of your bank with [[/bank page:2]]

### Searching Your Bank

There are 2 ways to search your bank for items.

- `/bank item:[item name]`
  - This command only returns results when the full item name is entered.
- `/bank search:[text]`
  - This command will return anything that contains the text entered.

### Bank Sorting

When searching your bank you can use multiple options to find exactly what you're looking for.

#### Sorts:

- `value` - this is the default sort by grand exchange value (then item ID for untradeables)
- `alch` - sorts by alch value rather than grand exchange value
- `name` - sorts your bank alphabetically
- `quantity` - sorts your bank by item stack size

#### Flags:

- `show_X` - this will show whatever option is chosen (id, alch price, names, etc) below the item
- `wide`- makes the image wider (useful for viewing a lot of items at once)
- `show_all` - includes all items rather than a single page (this can result in very large images)

#### Formats:

- `text_paged` - returns a click-through box similar to leaderboards for your bank
- `text_full`- returns a notepad document of all items (very useful for viewing a large bank)
- `json` - returns a json file of your bank

The following command is an example of a bank search for the term "rune" with many filters.

- E.g. `/banksearch:runeflag:show_namesflag_extra:wide`

### Category Filters

The following bank filters can be used with either of the bank search commands to display items of a specific category. Some examples include:

- `food` - displays your food that can be used during PvM
- `potions` - displays your potions
- `herbs` - displays your clean and grimy herbs
- `compost` - displays your compost and compostable items
- `secondaries` - displays your herblore secondaries
- `diaries` - displays your achievement diary rewards and lamps
- `clues and caskets` - displays your clue scrolls and reward caskets
- `herblore` - displays herbs, secondaries and potions
- `farming` - displays seeds and compost
- `smithing` - displays any items related to the smithing skill
- `crafting` - displays any items related to the crafting skill
- `fletching` - displays any items related to the fletching skill
- `agility` - displays any items related to the agility skill
- `prayer` - displays any items related to the prayer skill
- `diango` - displays items from the daily rewards

### Collection Log Filters

The collection log filters can be used with either of the bank search commands to display the items from specific collection logs. Not all collection logs are available for bank searching.

- E.g. `/bank filter:cerberus`

- Some other collection logs that can be search include:
  - `god wars` - displays all unique items from the 4 godwars bosses
  - `dagannoth kings` - displays all unique items from the 3 dagannoth kings
  - `skilling` - displays any items that can be used to gain non-combat xp
  - `slayer` - displays all unique slayer items
  - `all pets` - displays any pets you own
  - `capes` - displays any capes (including skillhoods)
  - `quest` - displays any quest based items
  - `random events` - displays any items you received from random events
  - `implings` - displays any impling jars you've caught
  - `tzhaar` - displays any tzhaar items
  - `revenants` - displays any revenant based items
  - `cyclopes` - displays all obtained defenders
  - `miscellaneous` - displays any miscellaneous items
  - `clue [tier]` - displays all items of the respective clue tier
