---
title: "Wilderness"
---

## Things To Know Before Starting

With the release of the updated wildy bosses, it is more dangerous than ever to hunt uniques in the wilderness! You are now risking more for more reward! This page details the info regarding mechanics and items unique to the wilderness. For info on boosts and requirements on wildy bosses, please visit the [respective page](../boosts-and-requirements.md#callisto-vetion-venenatis-inc.-singles-versions).

Killing Callisto, Vet'ion, or Venenatis (and their weaker variants) can risk some of your gear in the wildy setup. Do NOT equip items you're not willing to lose. See [Wildy Gear](./#wildy-gear). When doing these wildy bosses, you will never be skulled. This means you will always keep your best 4 items, unless you are smited, in which case you will still keep 3 items.

### PK & Death Chance

Your death chance is based on a number of factors. Firstly, you need to encounter a PKer for a death to be possible. There are 3 time periods when doing wildy bosses that will influence the chances of you running into a PKer. The below percentages represent how likely you will encounter a PKer _**for every minute of your trip**_. These time periods are random and change every ~2 hours.

| PK Peak Times | Chance of PKer at Callisto, Vet'ion, Venenatis | Chance of PKer at Artio, Calvarion, Spindel |
| ------------- | ---------------------------------------------- | ------------------------------------------- |
| Low period    | 1.52%                                          | 2.85%                                       |
| Medium period | 7.59%                                          | 14.29%                                      |
| High period   | 18.98%                                         | 35.71%                                      |

You will be asked for confirmation when attempting to send a trip during a high PK period. This can be enabled/disabled using:  
[[/config user toggle name\:Disable wilderness high peak time warning]]

If you happen to encounter a PKer, you will then "fight" your opponent. When this happens, you will lose some kc during your trip and therefore, lose some potential loot also. There are a few things that will affect whether you get PKed or survive. There is a 10% base chance of your minion getting PKed, however, the following things will affect this percentage:

- Your gear (specifically, your defensive stats; all 3 combat styles play a part)
- Anti-PK supplies (read [Smite chance](./#smite-chance) below)
- Having [[prayer:43]] for overheads (higher Prayer levels will NOT grant a better percentage)
- Your experience in killing wilderness bosses
- Whether the boss is located in a multi-combat area

### Smite Chance

These supplies are different from [revenants](revenants.md). Please check there for more info.

These supplies will heavily influence your chances of being smited or not. You also need [[prayer:25]] for Protect Item. With supplies, the base chance of being smited when you are PKed is 1/300. However, without them, it's a 1/20 chance. These supplies consist of:

- Saradomin brew(4) - 1 for every 4 minutes of your trip
- Super restore(4) - 1 for every 8 minutes of your trip
- Karambwan - 1 for every 4 minutes of your trip

### Wildy Gear

While killing wilderness bosses, your wildy gear setup is at risk. However, because you are **NOT** skulled when killing them, you will almost always keep your best 4 items. The only time you lose your +1, is if you get [smited](./#smite-chance).

You can see what items you will keep/lose through the following command:  
[[/gear view setup\:Lost On Wildy Death]]

In the image, you can ignore the items listed in the red box because you are not skulled. The green box notifies you of the items kept and lost upon death. The 3 items kept on death in this image are: Webweaver bow, Masori body (f), and Masori chaps (f). The +1 item is the Necklace of Anguish (or). Everything else will be lost when PKed. This means you can comfortably equip your 3 best boosting items without the worry of losing them.

However, untradeable items or items with 0 value will usually not be kept as one of your 3-4 protected items. For example, DT2 rings currently use incorrect item IDs and have 0 value, so lower-value items might be kept instead.

## Voidwaker

All 3 pieces can be obtained from their respective bosses and combined to create the voidwaker. Each piece is dropped by the stronger variants at 1/360, or 1/912 from the weaker variants. The voidwaker currently gives no boosts to any bosses.

- [[/create item\:voidwaker]]

## Upgraded Rev Weapons

The upgrades to rev weapons can be obtained and attached to create the stronger variant of each. The upgraded rev weapons provide a slightly better boost over their regular counterparts. It costs 7000 ether to charge a wildy weapon, which can also be reverted to receive the base weapon and ether back. Each piece is dropped by the stronger variants at 1/196, or 1/618 from the weaker variants.

- [[/create item\:Webweaver bow]]
- [[/create item\:Accursed sceptre]]
- [[/create item\:Ursine chainmace]]

## Revenants

Revenants are high-risk, high-reward content that allow you to collect wildy weapons and many high-tier resources. Revs use the gear in your wildy setup, meaning you CAN lose pieces of gear from this setup. Please read this entire page before embarking.

To start a trip:  
[[/k name\:Revenant imp method\:none]]  
[[/k name\:Revenant dragon method\:none]]

**Note:** If you try to use a method other than `none`, it will default to using the range method. You cannot barrage, burst, or cannon revs.

---

## Things To Know Before Starting

The following info is specific to revenants. Other [wilderness bosses](./) have different death and PKer mechanics. Please read that page for more info. You are always skulled while doing Revenants. This cannot be changed.

### Smite Chance

**If you get smited, you will lose your entire wildy setup regardless of value/items.**

You have a 1/300 chance to be smited. Without 5x prayer potion(4) (you will be warned), the chance is 1/20.

### Death Chance

Your total death chance is calculated based on your **magic defence stat** and **defence level**.  
You always have a minimum base 5% death chance. The lowest total death chance possible is 10%.

- **Defence Level:** If your [[defence:99]], your death chance from defence level is 0%.  
  Formula: _(100 - defence level) / 4_

- **Magic Defence Stat:** Max magic defence is 238. You only need 190+ to reduce the magic-based death chance to 5%. Higher doesn't reduce it further.

**Example:**  
You have [[defence:99]] and 200 magic defence stat:  
0% from defence + 5% from magic defence + 5% base = **10% total death chance**

### Attack Style Bonus

You get faster kill times based on your attack style bonus (range, magic, or crush).  
Formula: _(current style bonus / max style bonus) \* 100 / 4_  
Max attack boost is 25%.

- Max range attack: 246
- Max magic attack: 177
- Max crush attack: 214

**Example:**  
Using range with 94 bonus → (94 / 246 \* 100) / 4 = **9.55% boost**

---

## Boosts

- 35% boost for equipping a charged wildy weapon (must be equipped in wildy setup)

---

## Uniques

### Bracelets

Bracelets of ethereum can be charged (2000 ether) but currently have no bot benefit. You can dismantle for 250 ether each.

- [[/create item\:bracelet of ethereum]]
- [[/create item\:revenant ether]]

### Wildy Weapons

Charged wildy weapons give boosts at revs and other wildy bosses. Charging costs 7000 ether.  
For upgraded versions, see [Wilderness page](./#upgraded-rev-weapons).  
For boosts, see [Boosts & Requirements](https://wiki.oldschool.gg/bosses/boosts-and-requirements)

- [[/create item\:viggora's chainmace]]
- [[/create item\:craw's bow]]
- [[/create item\:thammaron's sceptre]]

### Ancient Items

You can sell ancient items for their OSRS values using [[/sell items\:1 Ancient totem]]

| Name | GP Value |
|
