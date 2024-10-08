---
title: "Wiki"
sidebar:
  order: 9999
lastUpdated: 2024-10-01T03:41:00.552Z
---

Currently, the only way to contribute to the new wiki is by editing files in [this folder on github](https://github.com/oldschoolgg/oldschoolbot/tree/master/docs/src/content/docs). You can make most simple edits by simply just editing the file directly on the Github website, and submitting it as a pull request. Bigger changes may require you install and run the wiki locally.

## Style

1. Succint/terse information
2. Don't repeat information that is better seen just on the OSRS wiki (e.g. a list of all potions)
3. Never manually write out long lists or data that the bot can automatically generate (e.g. combat achievements)

## Running the wiki locally

1. Clone the repo
2. `cd docs`
3. `yarn dev`

For running the scripts which build data in certain pages, do `yarn wiki` at the root.

## Formatting

### Items

`[[Twisted bow]]`
[[Twisted bow]]

`[[Remy]]`
[[Remy]]

### Discord Commands

`[[/minion]]`
[[/minion]]

`[[/minion kill name\:Corp]]`
[[/minion kill name\:Corp]]

### Spoilers

```<details>
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

# GFM

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a   | b   |   c |  d  |
| --- | :-- | --: | :-: |

## Tasklist

- [ ] to do
- [x] done
