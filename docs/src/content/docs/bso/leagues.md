---
title: "Leagues"
sidebar:
  order: 2
---

Leagues is the name for the feature where you can complete tasks in BSO for points, which can be spent on rewards. Leagues is _not_ the same as Leagues in OSRS, nor is it meant to be.

- Leagues is done on the BSO bot
- Leagues is permanent
- Leagues is optional and not required for anything
- Leagues is just a fun extra thing you can do if you want to

## Commands

- [[/leagues check]] — see your current overall Leagues progress
- [[/leagues claim]] — claim all available/pointed tasks
- [[/leagues view_task]] — view a specific task and how many have completed it
- [[/leagues view_all_tasks]] — view all Leagues tasks
- [[/leagues view_all_tasks exclude_finished\:True]] — view all tasks, excluding ones you have finished
- [[/lb leagues]] — see the Leagues leaderboards

## How it works

1. You complete tasks in BSO.
2. You use [[/leagues claim]] to claim points.
3. You spend those points on rewards.

### Notes

- You have two separate point balances, one for OSB and one for BSO. If you claim a task and get 100 points, you can spend 100 points in OSB and 100 points in BSO — they are separate.
- You _have_ to claim (using [[/leagues claim]]) in order to mark the tasks as finished and get points.

## Rewards

### Rewards in OSB

All Leagues rewards that you can get in OSRS are available to buy with points in OSB.

You can see all of them here: [https://oldschool.runescape.wiki/w/Leagues_Reward_Shop](https://oldschool.runescape.wiki/w/Leagues_Reward_Shop)

You buy them using [[/buy]]. For ornament kit items or similar, such as Trailblazer Graceful, you can use [[/create]] to make the resulting items.

### Rewards in BSO

- [Brain lee](custom-items/pets.md#no-perks), the Leagues pet, can be claimed at 40k points. The pet is untradeable and has no perk. It cannot be regained if you drop it or lose it.
- +1 minute max trip length can be claimed at 50k points. It's a permanent, global +1 minute max trip length extension to all trips.

Neither of the above rewards deduct points from your point balance; they are simply unlocked for free. You'll automatically get them the next time you use [[/leagues claim]] if you have enough total points.

We plan to add more BSO rewards in the future.
