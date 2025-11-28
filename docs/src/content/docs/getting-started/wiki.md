---
title: "Wiki"
sidebar:
  order: 9999
lastUpdated: 2024-10-01T03:41:00.552Z
---

Currently, the only way to contribute to the new wiki is by editing files in [this folder on github](https://github.com/oldschoolgg/oldschoolbot/tree/master/docs/src/content/docs). You can make most simple edits by simply just editing the file directly on the Github website, and submitting it as a pull request. Bigger changes may require you install and run the wiki locally.

Contributors are allowed to merge PRs/changes to the wiki without approval.

## Style Guide

1. Be succint/terse, dont use filler or lots of line separations, etc. Just give people the information they need to know.
2. Don't repeat information that is better seen just on the OSRS wiki (e.g. a list of all potions). You can just link to the OSRS Wiki instead.
3. Never manually write out long lists/tables of data that the bot can automatically generate (e.g. combat achievements, lists of monsters, etc). This ideally also applies to things like, xp/hr tables.
4. Where possible, try to keep things in 1 page instead of making new categories.

## Running the wiki locally

1. Install the bot - see [setup guide](https://github.com/oldschoolgg/oldschoolbot/blob/master/SETUP.md)
2. `cd docs`
3. `pnpm dev`

For running the scripts which build data in certain pages, do `pnpm wiki` at the root. You can preview .md files in VSCode with `Ctrl-Shift-V`.

## Auto generation

Certain sections/pages are automatically generated, for example the [Combat Achievements: Task List](/osb/combat-achievements/#task-list) - which is a huge list of hundreds of tasks. It is entirely unfeasible to manually update this, and the bot can very easily just generate this section, so its always up to date with no work ever needed. Please don't attempt to write out a big list/table like this manually. It should always be automatically generated. Doing this requires coding skills.

## Formatting Guide

This section shows ways you can format things

### Items

[[Twisted bow?raw]]

[[28820]]

Raw Image [[Orange?raw]]

`[[Twisted bow]]`
[[Twisted bow]]

`[[Remy]]`
[[Remy]]

Items can appear in the middle of text [[Twisted bow]] Items can [[Coal]] appear in the middle of text Items can appear in the middle [[Dwarven warhammer]] of text

### Discord Commands

`[[/minion]]`
[[/minion]]

`[[/minion kill name\:Corp]]`
[[/minion kill name\:Corp]]

Any colon needs a backslash before it (I'm not sure yet how to make it so this isnt needed.) Commands can appear in the middle of text [[/sell]] Commands can [[/drop]] appear in the middle of text Commands can appear in the middle [[/minion]] of text

### Discord Channels

`[[# bingo-looking-4-team:1149907771937001522]]`
[[# bingo-looking-4-team:1149907771937001522]]

### Skills

`[[agility:55]] [[strength:44,000 XP]] [[divination:44,000 XP]] [[qp:5]]`

[[agility:55]] [[strength:44,000 XP]] [[divination:44,000 XP]] [[qp:5]]

### Spoilers

```
<details>
<summary>Title</summary>
Hidden Text
</details>
```

<details>
<summary>Title</summary>
Hidden Text
</details>

### Alerts/Quotes

`>Some message`

> Some message

### Internal Links

`[Quests](/osb/quests)`

[Quests](/osb/quests)

### External Links

Links are _automatically_ converted

`www.example.com, https://example.com`

www.example.com, https://example.com

### Text formatting

`You can ~not~ use this to *format* text in **different** __ways__.`

You can ~not~ use this to _format_ text in **different** _ways_.

### Table

Note: most tables should be automatically generated and not hand-written.

| Name      | Level |  XP |  X  |
| --------- | :---- | --: | :-: |
| something | x     |   g |  d  |

### Images

To upload an image to the wiki, follow these steps:

1. Check the filesize of the image, _if_ its something like over 100kb in size, upload the image to <https://squoosh.app/>, select the "WebP" image format, max effort, and quality of 90. You can pick other formats/options and make sure the quality is good. If the dimensions of the image are very large, it may be worth resizing it in squoosh too). The only purpose is to compress it to a smaller size to be faster to load on the wiki page.

2. Put the image in the `/docs/public/images` folder.

3. You can now use the image anywhere in the wiki, for example if you uploaded `monkey.jpg`:

`[[monkey.jpg]]`

[[monkey.jpg]]

## Debug

These are here for debugging/testing purposes.

A command mention [[/gear equip gear_setup\:Melee auto\:melee_strength]] in the middle of some text

This is [Testing](/) [links](/) in the [middle](/) of some [text](/) test


## Contributors

[[DayV-git#small]]

[[gc]]
