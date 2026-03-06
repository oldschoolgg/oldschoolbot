---
title: "Blackjack"
---

Blackjack is available in the gamble command set and lets you play against the dealer using GP.

See also: [Gambling hub](/osb/miscellaneous/gambling/).

Start a game with:
[[/gamble blackjack amount\:100m]]

## Bet Limits

- Minimum bet: 1m GP
- Maximum bet: 5b GP

## Table Rules

- 4-deck shoe, shuffled every game
- Dealer stands on soft 17 (S17)
- Dealer peeks for blackjack when upcard is Ace or any 10-value card
- Blackjack pays 3:2
- Insurance is offered only when dealer upcard is Ace
- Insurance bet is 50% of main bet and pays 2:1
- Splitting is supported (up to 4 hands total)
- Double is supported, including after split (except split aces)
- Split aces receive one card each and auto-stand
- Split hands do not receive natural blackjack payout
- During split play, the active hand is marked as `ACTIVE` in the table view and shown in the embed

## Flow And Safety

- You must confirm your bet before the game starts.
- Bet deductions and extra wagers (double/split/insurance) are handled atomically.
- One active blackjack game is allowed per user.
- Action buttons are nonce-validated.
- If you do not act in time, the game auto-stands safely and settles.

## Useful Commands

- Start game: [[/gamble blackjack amount\:100m]]
- Other gamble modes: [[/gamble dice]], [[/gamble slots]], [[/gamble lucky_pick]]
