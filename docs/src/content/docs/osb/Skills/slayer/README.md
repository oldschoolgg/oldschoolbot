---
title: "Slayer"
---

Slayer is a skill where you're assigned to kill a certain amount of a certain monster - called a 'task', you keep completing lots of tasks to unlock more knowledge on slaying monsters, and gain points which can be used to unlock rewards.

So, in very simple terms to train slayer, all you need to do is: **Get a task** `/slayer new_task` then **Kill that monster** `/kname:monster`

If you are tier 1 patron or higher, you will see an **'Auto Slay'** button at the end of your trips. Clicking this will assign you a new task from your saved slayer master, or will send a trip of your current task (based on your settings). This cannot be disabled.

## Commands

- **Get a new slayer task, or check your current task:**

  - `/slayer new_task` or `slayer new_taskmaster:Duradel`
  - You can set a Slayer master as your default using the save option, so that you don't have to specify the name every time. E.g. `/slayer new_taskmaster:Duradelsave:True`

- **Automatically slay your task with guided settings:**

  - `/slayer autoslaymode:default/ehp/boss/low`
  - Optionally add \*\*`save:True` to set your default mode
    - Using `/slayer autoslay` will automatically use your default mode
  - **Default**: kills the monster you're assigned
  - **Lowest**: kills the lowest combat level monster
  - **Efficient**: Use with `always cannon` for the most efficient tasks for Slayer XP.
  - **Boss**: Kills the boss variant or similar, (e.g. Demonic gorillas for Black demon

- **Skip your current task:**

  - `/slayer managecommand:skip` - Costs 30 slayer points
  - Use `/slayer new_taskmaster:Turael` to cancel your task and reset your streak

- **Buy rewards/unlocks from the Slayer shop:**

  - [[/slayer rewards unlock unlockable\:Malevolent Masquerade]]
  - [[/slayer rewards unlock unlockable\:Unholy Helmet]]

- **List Slayer shop unlocks:**

  - `/slayer rewards show_all_rewards`

- **Blocking tasks:**

  - Block current task: `/slayer managecommand:block`
  - See block list: `/slayer managecommand:list_blocks`
  - Unblock a task: `/slayer rewards unblockassignment:Blue Dragon`

- **Getting a Slayer Helmet:**

  - Firstly, unlock the Slayer helmet using `/slayer rewards unlockunlockable:Malevolent Masquerade`
  - With a black mask and 55 Crafting, buy the required items from the bot, and then `/createitem: ``slayer helmet`

- **Use a Cannon in your task**

  - If you own a cannon and cannonballs, the cannon can be used at some slayer tasks to speed it up, at the cost of cannonballs. You can do this with the method option on the kill command, for example `/kname:Dagannothmethod:cannon`
  - You can buy a cannon using `/buyname: ``Dwarf multicannon`.
  - In single combat, 16 cannonballs are used per minute of task. In multi combat, 50 cannonballs are used per minute of task.\

- **Barrage your task:**

  - If you have sufficient Runes and the Magic level, you can barrage your tasks, to speed it up at the cost of runes. You can do this with the method option on the kill command, for example `/kname:Warped jellymethod:barrage`
  - Both barrage and burst uses 16 casts per minute of task. The rune costs are the same as in game. Any item that provides unlimited water runes works, but needs to be equipped.

- **Default to always barraging/bursting/cannoning**

  - `/config user combat_options`

  Note that there is no way to override the always on settings. If you want to do certain tasks in the catacombs for example you should disable always cannon and specify `/slayer autoslaymode:ehp` when wanting to use a cannon. If you've saved ehp mode as your default, you can override this by using `/slayer autoslaymode:default`.\

- **Use the Ash sanctifier on your task**
  - If you have completed the Hard or Elite Kebos & Kourend diary, you can use the ash sanctifier to gain passive prayer xp when killing monsters that drop demonic ashes.
  - This can be toggled on or off using `/config user togglename: ``Disable Ash Sanctifier`
  - You will gain half xp for hard diary completion, or full xp for elite diary completion.
  - It must be charged with death runes: `/minion chargeitem: ``Ash sanctifier`

---

## Recommended block/skip list

This table is based off the XP Gains/efficient Blocks/Skips at Post 99 Slayer but can be used at all levels of Slayer to provide you with the best XP Gain per hr.

<figure><figcaption>Duradel Block/Skip and Efficient Slayer XP/Hour Table</figcaption></figure>

This is based on using Konar at post 99 Slayer providing slightly faster overall XP/hour with average points, excluding skips and provided you have Zeah Elite Diary.

(Notes: Reccomended to do Dark Beasts, re-lock Mithril Dragons, skip Adamant Dragons and barrage Smoke Devils as opposed to cannoning)

<figure><figcaption>Konar efficiency Slayer Skip/Block list.</figcaption></figure>
