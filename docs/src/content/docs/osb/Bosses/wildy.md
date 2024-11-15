---
title: "Wilderness"
---

With the release of the updated wildy bosses, it is more dangerous than ever to hunt uniques in the wilderness! You are now risking more for more reward! This page details the info regarding mechanics and items unique to the wilderness. For info on boosts and requirements on wildy bosses, please visit the [respective page](../boosts-and-requirements.md#callisto-vetion-venenatis-inc.-singles-versions).

## Things To Know Before Starting

Killing Callisto, Vet'ion or Venenatis (and their weaker variants) can risk some of your gear in the wildy setup. Do NOT equip items you're not willing to lose. See [Wildy Gear](./#wildy-gear). When doing these wildy bosses, you will never be skulled. This means, you will always keep your best 4 items, unless you are smited, in which case you will still keep 3 items.

### PK & Death Chance

Your death chance is based on a number of factors. Firstly, you need to encounter a PKer for a death to be possible. There are 3 time periods when doing wildy bosses that will influence the chances of you running into a PKer. The below percentages represent how likely you will encounter a PKer _**for every minute of your trip**_. These time periods are random and change every \~2 hours.

<table data-full-width="false"><thead><tr><th></th><th align="center"></th><th align="center"></th></tr></thead><tbody><tr><td><strong>PK Peak Times</strong></td><td align="center"><strong>Chance of PKer at</strong> <strong>Callisto, Vet'ion, Venenatis</strong></td><td align="center"><strong>Chance of PKer at</strong> <strong>Artio, Calvarion, Spindel</strong></td></tr><tr><td>Low period</td><td align="center">1.52%</td><td align="center">2.85%</td></tr><tr><td>Medium period</td><td align="center">7.59%</td><td align="center">14.29%</td></tr><tr><td>High period</td><td align="center">18.98%%</td><td align="center">35.71%</td></tr></tbody></table>

You will be asked for confirmation when attempting to send a trip during a high PK period. This can be enabled/disabled using:

[[/config user toggle name\:Disable wilderness high peak time warning]]

If you happen to encounter a PKer, you will then "fight" your opponent. When this happens, you will lose some kc during your trip and therefore, lose some potential loot also. There are a few things that will affect whether you get PKed or survive. There is a 10% base chance of your minion getting PKed, however, the following things will affect this percentage:

- Your gear (specifically, your defensive stats. All 3 combat styles play a part)
- Anti-PK supplies (read [Smite chance](./#smite-chance) below)
- Having 43 Prayer for overheads (higher Prayer levels will NOT grant better percentage)
- Your experience in killing wilderness bosses
- Whether the boss is located in a multi-combat area

### Smite Chance

These supplies are different from [revenants](revenants.md). Please check there for more info.

These supplies will heavily influence your chances of being smited or not. You also need 25 Prayer for Protect item. With supplies, the base chance of being smited when you are PKed is 1/300. However, without them, it's a 1/20 chance. These supplies consist of:

Saradomin brew(4) - 1 for every 4 minutes of your trip
Super restore(4) - 1 for every 8 minutes of your trip

Karambwan - 1 for every 4 minutes of your trip

### Wildy Gear

While killing wilderness bosses, your wildy gear setup is at risk. However, because you are **NOT** skulled when killing them, you will almost always keep your best 4 items. The only time you lose your +1, is if you get [smited](./#smite-chance).

You can see what items you will keep/lose through the following command:

- `/gear viewsetup: ``Lost On Wildy Death`

<figure><figcaption></figcaption></figure>

In the above image, you can ignore the things listed in the red box because you are not skulled when doing wilderness bosses. The green box notifies you of the items kept and lost upon a death. The 3 items kept on death in this image are: Webweaver bow, Masori body (f), and Masori chaps (f). The +1 item is the Necklace of Anguish (or). Everything else will always be lost when Pked. This means you can comfortably equip your 3 best boosting items for wildy bosses without the worry of losing them.

However, untradeable items or items that have a 0 value will usually not be kept as one of your 3-4 items kept on death. For example, the DT2 rings in their current state are using the incorrect item ID, and therefore giving the rings a 0 value. This means that something with a low value but still a higher value than the ring, may be kept over the ring upon a death.

## Voidwaker

All 3 pieces can be obtained from their respective bosses and combined to create the voidwaker. Each piece is dropped by the stronger variants at 1/360, or 1/912 from the weaker variants. The voidwaker currently gives no boosts to any bosses.

- `/createitem:voidwaker`

## Upgraded Rev Weapons

The upgrades to rev weapons can be obtained and attached to create the stronger variant of each. The upgraded rev weapons provide a slightly better boost over their regular counterparts. It costs 7000 ether to charge a wildy weapon, which can also be reverted to receive the base weapon and ether back. Each piece is dropped by the stronger variants at 1/196, or 1/618 from the weaker variants.

- `/createitem:Webweaver bow`
- `/createitem:Accursed sceptre`
- `/createitem:Ursine chainmace`

# Revenants

Revenants are some high risk, high reward content that allows you to collect some handy wildy weapons and many high tier resources. Revs uses the gear in your wildy setup, which means, you CAN lose pieces of gear from this setup. Please read this entire page before embarking.

To start a trip, use the `/kname`\*\*`: (name)method: ``none` command.

- E.g. `/kname`\*\*`: Revenant imp method: none`
- E.g. `/kname`\*\*`: Revenant dragon method: none`

**Note:** If you try to put any other method outside of none it will auto default you to using the range method as you can not barrage/burst or cannon revs.

---

## Things To Know Before Starting

The following info is specific to revenants. Other** [**wilderness bosses\*\*](./) have different death and PKer mechanics. Please read that page for more info. You are defaulted to being skulled while doing Revenants. This cannot be changed.

### **Smite Chance**

**If you get smited, you will lose your entire wildy setup regardless of value/items.**

You have a 1/300 chance to be smited while on a trip. However, if you do not have 5x prayer potion(4), which _you will warned about before embarking_, you have a 1/20 chance to be smited.

### **Death Chance** icon

Your total death chance is calculated on your **magic defence stat** and your **defence level**. _You always have a minimum base 5% chance to die._ The lowest you can get your total death chance to is 10%.

**Defence Level:** If your defence level is 99, the death chance from your defence level is 0%. If your defence level is not 99, use the following formula to work out the extra death chance %.

- Death chance = _(100 - defence level) / 4_

**Magic Defence Stat:** The lowest death chance you can achieve through this is 5%. The maximum magic defence stat is 238, however, you only need to reach 190 magic defence for this to be lowered to 5%. Anything higher than 190 will not get you any lower death chance.

**Death % Example:** You have 99 Defence + 200 magic defence stat. This means:

- You will get 0% extra death chance because you are 99 defence.
- \+ You will get the minimum extra 5% death chance from your magic defence stat.
- \+ You will get the default 5% death chance.
- \= Total 10% death chance.

### Attack Style Bonus

You will receive a boost to revenant kill times based on which attack style you use and it's respective stat. The 3 styles the bot will utilise are crush attack, range attack, or magic attack. You can work out your attack boost with the following formula:

- Attack boost = _(current style bonus / maximum style bonus \* 100) / 4_

The highest attack boost you can obtain is 25%. The maximum style bonuses are listed below:

- Range attack bonus - 246
- Magic attack bonus - 177
- Melee crush bonus - 214

**Attack Style % Example:** You are using the range style with 94 range attack bonus:

- Attack boost = (94/246 \* 100) / 4 = 9.55% bonus

---

## Boosts

- 35% boost for equipping a charged wildy weapon (**must be equipped in wildy setup**)

---

## Uniques

#### Bracelets

Bracelets of ethereum can be charged (requires 2000 ether) but offers no benefit in the bot at this stage. You can also turn bracelets into ether which yields 250 ether per bracelet.

- `/createitem:bracelet of ethereum`
- `/createitem:revenant ether`

#### **Wildy Weapons**

These weapons can be charged which will provide boosts at revs themselves and other wildy bosses. It costs 7000 ether to charge a wildy weapon. To create the upgraded version of these weapons, please visit the [Wilderness page](./#upgraded-rev-weapons). To check the boosts which these items give, please visit the [Boosts & Requirements page.](https://wiki.oldschool.gg/bosses/boosts-and-requirements)

- `/createitem:viggora's chainmace`
- `/createitem:craw's bow`
- `/createitem:thammaron's sceptre`

#### **Ancient Items**

You can sell the ancient items for the same value as in OSRS. Use the `/sell` command.

- `/sellitems: ``1 Ancient totem`

|                   |              |
| ----------------- | :----------: |
| **Name**          | **GP Value** |
| Ancient emblem    |   500,000    |
| Ancient totem     |  1,000,000   |
| Ancient statuette |  2,000,000   |
| Ancient medallion |  4,000,000   |
| Ancient effigy    |  8,000,000   |
| Ancient relic     |  16,000,000  |

#### Other Uniques

The Amulet of avarice currently has no use within the bot.

Ancient crystals are currently only used to create the Obelisk in a minion's PoH (4 required).
