---
title: "Leagues"
sidebar:
  order: 2
---

Leagues is the name for the feature where you can complete tasks in BSO for points, which can be spent on rewards. Leagues is \*not\* the same as leagues in OSRS, nor is it meant to be.

- Leagues is done on the BSO bot
- Leagues is permanent
- Leagues is optional and not required for anything
- Leagues is just a fun extra thing you can do if you want to

## Commands

- `/leagues check` : see your current overall leagues progress
- `/leagues claim` : claim all available/points tasks.
- `/leagues view_task`: view a specific task and how many have completed it
- `/leagues view_all_tasks` : view all leagues tasks
- `/leagues view_all_tasks exclude_finished:True` : view all tasks, excluding ones you have finished.
- `/lb leagues` : see the leagues leaderboards

## How it works

1. You complete tasks in BSO.
2. You use `/leagues claim` to claim points
3. You spend those points for rewards.

### Notes

- You have 2 separate point balances, one for OSB and one for BSO. So, if you claimed a task and got 100 points, you can spend 100 points in OSB and spend 100 points in BSO too, as they are separate.
- You _have_ to claim (using /leagues claim) in order to mark the tasks as finished and get points.

## Rewards

### Rewards in OSB

All Leagues rewards that you can get in OSRS, are available to buy with points in OSB.

You can see all of them here: [https://oldschool.runescape.wiki/w/Leagues_Reward_Shop](https://oldschool.runescape.wiki/w/Leagues_Reward_Shop)

You buy them using `/buy`. For any ornament kit items or similar, such as trailblazer graceful, you can use `/create` to make the resulting items.

### Rewards in BSO

- [Brain lee](custom-items/pets.md#no-perks), the leagues pet, can be claimed at 40k points, The pet is untradeable, and has no perk. It cannot be regained if you drop it or do something with it.
- \+1min max trip length can be claimed at 50k points. Its a permanent, global +1min max trip length extension to any/all trips.

Neither of the above rewards 'charge' or remove points from your point balance, they are just unlocked for free. You'll automatically get them next time you `/leagues claim` if you have enough total points.

We plan to add more BSO rewards in the future.
