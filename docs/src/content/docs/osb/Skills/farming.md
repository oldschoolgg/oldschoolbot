---
title: "Commands"
---

Farming works like ingame, you do a _farm run_ to plant stuff (you send your minion out to do it), then you wait some time for it to grow, and in this time, you are free to do any other activity. Then, when they're ready to be harvested, you send your minion out to harvest and replant. Your minion is only busy for when its doing a farm run to plant/harvest.

You can get seeds from seed packs, pickpocketing master farmers, wintertodt, and nests. You can also buy seeds (and any other tradeable items) from the Grand-Exchange channel in our discord server: http://discord.gg/ob

To get started, the first thing you should do is `+farm potato`.

# Commands

## +farm

+farm [quantity] <plant>

e.g +farm potato, +farm 5 potato

- Amount of patches to plant in increases with your farming level and amount of Quest Points.
- +farm --plants shows the available plants that are able to be farmed, and farming level / QP needed for more patches.
- Doing +farm ranarr for the first time plants ranarr seeds and again would harvest the previous herb and plant more ranarr seeds.
- Automatically applies regular compost if you have it in your bank. (+buy compost).
- Can use supercompost and ultracompost with +farm <plant> --supercompost or +farm <plant> --ultracompost.
- Can choose to pay to protect a plant using +farm <plant> --pay. Some plants allow for use of both compost and payment: +farm <plant> --supercompost --pay.
- To harvest a tree, you need the woodcutting level or 200gp per patch (you will not get logs in this case).
- Wearing full graceful boosts trips by 10%.
- Owning Farmer's equipment (not needing to be worn) gives xp boost.
- Having magic secateurs or farming cape in bank or equipped boosts your yield by 10% and 5% respectively.

## +harvest

- +harvest <patch-name> harvests the specific patch desired and leaves it empty (no seeds planted).

## +tithefarm

- You need 34 Farming to start Tithe Farm.
- Your minion begins inefficient and learns to be better. End efficiency is all 100 fruits harvested and optimal time (20 mins, 30 secs).
- Graceful is needed for optimal time (10% boost).
- Owning Farmer's equipment (not needing to be worn) gives xp boost.
- `+tithefarm --points` shows you how many tithe farm points you have.
- You can use tithe farm points to buy farmer's outfit through the shop. `+tithefarmshop Farmer's jacket` or `+tfs farmers hat` for example.

## +farmingcontract OR +fc

- You need 45 Farming to start farming contracts.
- Can specify +fc easy, +fc medium, +fc hard for contract level. If current contract is med/hard, can do +fc easier to be assigned an easy contract instead.
- +fc current shows current contract.
- +fc completed shows # of completed contracts.
- When you complete a contract, you are awarded a seed pack. You must `+seedpack` to open it before requesting a new contract.

## +checkpatch

- Tells you the status of your patches: whether patch is empty, whether patch has something growing, or whether patch is fully grown.

# Other info

Ultracompost and volcanic ash and baskets of crops

- Can mine volcanic ash.
- Can +create ultracompost if you have 1x supercompost and 2x volcanic ash.
- Can +create potatoes(10) for a sack of potatoes and +create potato to remove from sack. (Works with common crops such as onions, tomatoes, strawberries, bananas, etc)
