---
title: "Bingo"
---

You can run community bingo's using the `/bingo` command, and the bot will automatically handle all of it for you.

## Notes

- Ironmen can join bingos for free. They cannot be given GP prizes, or create bingos.
- Upon the bingo finishing, the creator of the bingo needs to do `/bingo finalize` to receive the GP pool. The creator of the bingo is responsible for handing out the GP, based on whatever split you have decided. You do not need to finalize the bingo on time, the bingo will automatically finish at the exact second it needs to, the finalize command just does some final things, and hands out the gp.
- A person can participate in several bingos at once.
- Bingos are private to the server they were made in. In other words, you can only join it from that server. Global bingos are limited to the official bingos. However, for any bingo, the commands/trips the players do (to get loot) can be done anywhere.

## Creating a Bingo

To create a bingo, you need to input the following things:

- Title
- Duration in days(7 = 7 days)
- Start Date unix seconds. Use [https://hammertime.cyou/?tz=Etc%2FGMT](https://hammertime.cyou/?tz=Etc%2FGMT) to find this number. It's the last in the list, and is just a plain number that looks like this: `1695859800`. This indicates the exact time at which your bingo starts.
- Ticket price: The ticket price per person. Each person must pay this when making their team. If the team disbands, the GP is refunded.
- Team size: Size of the teams.
- Organizers: people who are allowed to manage the bingo (Add tiles, etc)

## Managing your Bingo

Commands for managing the bingo are in `/bingo manage`. You can add/remove tiles, add extra GP to the prize pool, and more.

### Adding Tiles

You can add tiles in 2 ways.

1. Add global tiles. You can select global tiles to add, which are tiles that are premade for you to use.
2. Add custom tiles. You can add 2 kinds of tiles. AND tiles, OR tiles. Example:
   1. `add_tile:coal+egg+trout` Adds a tile where you have to receive a coal, egg AND trout.
   2. `add_tile:coal|egg|trout` Adds a tile where you have to receive a coal, or egg, or a trout.
