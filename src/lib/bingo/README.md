# Seasonal team bingo

A seasonal board is an optional appearance and 28-challenge configuration for an ordinary bingo. It uses the existing `Bingo`, `BingoTeam` and `BingoParticipant` records, team sizes, registration, fees, prize pool, organisers and leaderboard. There is no community board or separate seasonal command flow.

## Set up and play

1. Use `/bingo create_bingo` with the usual title, start date, duration, team size (1–5), ticket price, notifications channel and organisers. Add `theme` (`winter`, `spring`, `summer`, `autumn`) and optionally upload a `configuration` JSON file. A theme without a file uses the built-in 28 challenges.
2. Players register using `/bingo make_team` with the required number of teammates. Everyone confirms and the existing entry rules apply. `/bingo leave_team` works before the start. Team membership remains fixed once the bingo starts, including after it ends.
3. `/bingo view` shows the caller's team board, completed tiles and quantity progress. Non-members see a blank preview. This command attaches only the board image; organisers can export the challenge JSON through `/bingo manage_bingo template:true`.
4. `/bingo leaderboard` ranks teams by completed tiles. With no `bingo` argument, it prefers the caller's current joined bingo, then one they organise, then an available event in the server or a global event. Pass an explicit ID to choose another event. An empty event returns a clear message instead of an empty paginator.
5. Completed events and their boards remain accessible through the same `/bingo view bingo:...` command and autocomplete. `/bingo items` continues to show eligible items earned by the team.

Existing bingos without a theme retain their usual tile definitions and behaviour.

## Manage a board

Use `/bingo manage_bingo` with the existing bingo ID. Its normal creator/organiser permission check applies to all seasonal settings and corrections.

- `theme` and `configuration`: set or replace the seasonal board before the event starts. A replacement file must contain exactly 28 challenges. `theme` alone preserves an existing seasonal configuration, or creates the default board for a normal event.
- `template:true`: download this seasonal board's current configuration, or the default starter configuration for a bingo without a seasonal board.
- `team` and `complete_tile` or `reverse_tile`, plus `reason`: correct one team's challenge. Team IDs are displayed in the normal leaderboard. Challenge IDs are in the JSON exported with `template:true`. Reversal clears that team's progress and score for the tile, keeps the event audit trail, and excludes older pending events from restoring it.
- `team` and `inspect_tile`: download the team's challenge state and up to 20 credited/manual events.
- `finalize`: use the normal event finalisation and prize-pool flow. It also closes the seasonal reward window. Historical team boards remain available.

`/bingo view` uses the normal team bingo data. There are no separate community `/bingo progress`, `/bingo history` or `/bingo seasonal_admin` subcommands.

After deploying/restarting the updated bot, run `/admin sync_commands` with the existing bot administrator permissions in the support server (or the configured test server during development). This publishes the current command definitions. `theme` and `configuration` are **optional** creation arguments, so the required argument list alone does not include them; select them from the optional arguments in Discord. The creation command's registered payload includes both fields. The generated `data/osb/commands.json` is not the source used for Discord command registration and must not be edited manually.

## Persistence and deployment

`BingoSeason.bingo_id` links the seasonal settings to one normal bingo. Its dates come from the normal event and different events may overlap. Progress is keyed by `(season_id, team_id, challenge_id)`. Every reward event stores its team ID at capture time. The processor verifies the user's membership in that event and only updates that team's state. It also maintains the existing participant `cl` from eligible events, without counting rewards a second time through the old item hook.

Apply `prisma/sql/bingo_teams.sql` once to an existing database that already has the earlier seasonal tables, before starting this version. For a fresh database use the current Prisma schema; if applying the checked-in SQL manually, apply `seasonal_bingo.sql` first and then `bingo_teams.sql`. Use the repository's normal schema deployment procedure instead if appropriate, without applying the same changes twice. Regenerate Prisma clients. The OSB Robochimp schema mirror contains the same model changes. No database migration is applied automatically by these code changes.

The follow-up SQL preserves previous rows. Earlier standalone community seasons remain unlinked and are not used by normal team bingo. Their existing progress has team ID `0` and is never assigned to a player's team. Reuse their configuration file on a normal bingo with the intended team size and registration window; progress cannot fairly be split into teams retrospectively.

## Reward processing

The existing activity runner opens an async context for eligible activities. It loads only linked, open bingo events containing participants in that activity. The item helper binds that context across the user queue and inserts qualifying reward events in the same transaction as the bank write. Buying, transfers, gifts, admin grants and existing bank contents do not qualify.

Trips must start on or after the event start and actually grant rewards before its exclusive end. A failed/cancelled trip without an eligible reward write does not contribute. Committed rewards still contribute if a later message fails. Non-members never contribute. Someone joined to several overlapping bingo events can contribute to each of their own teams independently.

Event IDs are `season:activity:user:reward-write-ordinal`. Duplicate delivery does not count twice. The ten-second ticker processes up to 100 pending events per tick; board and leaderboard requests also process a batch for the selected event. A season-row lock serialises progress changes and manual corrections. The original reward data and processed IDs survive restarts. Do not prune IDs while their activities could be replayed.

The renderer uses the unchanged seasonal PNGs, OSRS fonts and item sprites. Render promises are cached by season ID, **team ID** and database progress version, preventing one team's image from being served to another. Failed renders are evicted. Database progress is authoritative.

Command-only rewards such as `/open`, seed packs, shops and manual harvests outside an activity remain excluded, as do direct bank writes bypassing the item helper and detached work after the activity runner returns. Explicit `activity_completion` challenges currently support successful Woodcutting trips only. A season lookup/configuration failure is logged while the ordinary activity still runs; it cannot automatically contribute without a valid context. Persistent Discord board messages are not included.

## Challenge JSON

Upload an array of exactly 28 objects with unique IDs, short tile names, descriptions and valid icon item IDs. Existing configuration files continue to work unchanged; quantities and component sets now accumulate within each team.

- `item_drop`: any one `targetItemIDs` item completes the tile.
- `item_quantity`: the sum of eligible item quantities reaches `requiredQuantity`.
- `activity_completion`: explicit success signals for `activityID` reach `requiredQuantity`.
- `custom` with `evaluator: "item_sets"`: finish any set in `itemSets`; each set contains groups of alternative item IDs and every group requires a newly earned item. Teammates may supply different components.

Each tile counts once towards the normal team leaderboard. Internal contributor credits are bounded to one point per tile **per team**, split proportionally for quantity/component progress. Manual completions award no contributor credit. Duplicate drops on a completed team tile do not earn more credit.

Regression coverage is in `tests/unit/bingo.test.ts`, `tests/unit/canvas/bingo.test.ts` and `tests/integration/bingo.test.ts`, including team isolation, normal command routing, concurrent teammates, retries, eligibility and team-specific corrections. Tests are not run without an explicit request, following `AGENTS.md`.
