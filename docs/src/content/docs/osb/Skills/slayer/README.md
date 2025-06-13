---
title: "Slayer"
---

Slayer is a skill where you're assigned to kill a certain amount of a certain monster—called a _task_. You keep completing tasks to unlock more knowledge on slaying monsters and gain points that can be used to unlock rewards.

So, in very simple terms to train Slayer, all you need to do is: **Get a task** [[/slayer new_task]], then **Kill that monster** [[/k name\:monster]]

If you are a Tier 1 patron or higher, you will see an **Auto Slay** button at the end of your trips. Clicking this will assign you a new task from your saved Slayer master or send a trip of your current task (based on your settings). This cannot be disabled.

## Commands

- **Get a new Slayer task or check your current task:**

  - [[/slayer new_task]] or [[/slayer new_task master\:Duradel]]
  - You can set a Slayer master as your default using the save option so that you don't have to specify the name every time.  
    e.g. [[/slayer new_task master\:Duradel save\:True]]

- **Automatically slay your task with guided settings:**

  - [[/slayer autoslay mode\:default]] / [[/slayer autoslay mode\:ehp]] / [[/slayer autoslay mode\:boss]] / [[/slayer autoslay mode\:low]]
  - Optionally add **save:True** to set your default mode  
    Using [[/slayer autoslay]] will automatically use your default mode.
  - **Default**: Kills the monster you're assigned
  - **Lowest**: Kills the lowest combat level monster
  - **Efficient**: Use with "always cannon" for the most efficient tasks for Slayer XP
  - **Boss**: Kills the boss variant or similar (e.g. Demonic gorillas for Black demons)

- **Skip your current task:**

  - [[/slayer manage command\:skip]] — Costs 30 Slayer points
  - Use [[/slayer new_task master\:Turael]] to cancel your task and reset your streak

- **Buy rewards/unlocks from the Slayer shop:**

  - [[/slayer rewards unlock unlockable\:Malevolent Masquerade]]
  - [[/slayer rewards unlock unlockable\:Unholy Helmet]]

- **List Slayer shop unlocks:**

  - [[/slayer rewards show_all_rewards]]

- **Blocking tasks:**

  - Block current task: [[/slayer manage command\:block]]
  - See block list: [[/slayer manage command\:list_blocks]]
  - Unblock a task: [[/slayer rewards unblock assignment\:Blue Dragon]]

- **Getting a Slayer Helmet:**

  - First, unlock the Slayer helmet using [[/slayer rewards unlock unlockable\:Malevolent Masquerade]]
  - With a black mask and [[crafting:55]], buy the required items from the bot, then [[/create item\:slayer helmet]]

- **Use a Cannon in your task:**

  - If you own a cannon and cannonballs, the cannon can be used at some Slayer tasks to speed them up at the cost of cannonballs. You can do this with the method option on the kill command:  
    e.g. [[/k name\:Dagannoth method\:cannon]]
  - You can buy a cannon using [[/buy name\:Dwarf multicannon]]
  - In single combat: 16 cannonballs/min  
    In multi combat: 50 cannonballs/min

- **Barrage your task:**

  - If you have sufficient runes and the required [[magic:94]], you can barrage tasks to speed them up at the cost of runes:  
    e.g. [[/k name\:Warped jelly method\:barrage]]
  - Both barrage and burst use 16 casts/min. Rune costs are the same as in-game. Any item that provides unlimited water runes works, but must be equipped.

- **Default to always barraging/bursting/cannoning:**

  - [[/config user combat_options]]

  Note: There is no way to override "always on" settings. If you want to do certain tasks in the Catacombs, for example, disable "always cannon" and specify [[/slayer autoslay mode\:ehp]]. If you've saved EHP mode as your default, override it with [[/slayer autoslay mode\:default]].

- **Use the Ash sanctifier on your task:**

  - If you’ve completed the Hard or Elite Kebos & Kourend diary, you can use the Ash sanctifier to gain passive prayer XP when killing monsters that drop demonic ashes.
  - Toggle it on or off: [[/config user toggle name\:Disable Ash Sanctifier]]
  - Gain half XP with hard diary, full XP with elite diary
  - Must be charged with death runes: [[/minion charge item\:Ash sanctifier]]

---

## Recommended block/skip list

This table is based on XP gains and efficient blocks/skips at post-99 Slayer, but can be used at all levels to optimize Slayer XP/hour.

**Duradel Block/Skip and Efficient Slayer XP/Hour Table**

This is based on using Konar at post-99 Slayer, providing slightly faster overall XP/hour with average points (excluding skips) if you have the Zeah Elite Diary.

_(Notes: Recommended to do Dark Beasts, re-lock Mithril Dragons, skip Adamant Dragons, and barrage Smoke Devils instead of cannoning)_
