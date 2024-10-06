---
title: "Grand Exchange"
---

# Grand Exchange

The bot has it's own GE system which functions almost identically to how it does in the real game. Only tradable items can be bought and sold. Ironmen cannot use this function. Others things to be aware of:

- The maximum price per item is 1000b. The maximum total price per listing is the same.
- The maximum quantity per item listing is 5m.
- When buying or selling, the price flag is per item, not total price.
- 1% of all sales are deducted automatically which acts as a gold sink.
- There are buy limits (which resets every 4 hours).
- Market prices are not available on all items. The average price is based on a weekly average.
- You currently cannot see other players active offers.
- You will be DM'ed by the bot when your item has bought/sold.
  - These DMs can be toggle off through `/config user toggle`

## Commands

**/ge buy**

- `/ge buy`` `**`item:`**` ``Rune scimitar`` `**`quantity:`**` ``250`` `**`price:`**` ``30k`

**/ge sell**

- `/ge sell`**`item:`**` ``Blue partyhat`` `**`quantity:`**` ``10`` `**`price:`**` ``1k`

**/ge cancel**

- This will cancel your listing. There is no confirmation for this command.

**/ge my_listings**

- This will show all active listings you have in an image format.

**/ge stats**

- Shows when your buy limit resets, the total number of GE slots available and total tax paid.

**/ge price**

- You can check the average weekly market prices of an item. Not available for all items.

**/ge view**

- You can check the price history of an item. Not available for all items.

## Number of GE Slots

Currently, all users will have 3 base slots for buying or selling items. More slots can be unlocked (up to a maximum of 14) by completing the following tasks:

- 1 for each of 100/250/1,000/2,000 total levels
- 1 for each of 30%/60%/90%/95% total CL completion
- 1 for each of 10k/20k/30k [BSO leagues points](https://bso-wiki.oldschool.gg/leagues)

In addition to this, players with T3 patron automatically have 10 extra GE slots (for a total of 24).
