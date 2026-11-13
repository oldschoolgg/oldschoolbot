# Seasonal community bingo

Seasonal bingo shares the existing `/bingo` command with team bingo. It uses the existing Skia canvas, item sprites and OSRS fonts. Backgrounds remain unchanged; their filenames are case-sensitive (`Winter.png`, etc.).

## Commands

- `/bingo board`: active community board; optional `season` selects a historical board.
- `/bingo progress`: completion totals and an attachment containing every challenge's ID, description and quantity.
- `/bingo leaderboard`: community contributors. Supplying the existing `bingo` option continues to show a team leaderboard.
- `/bingo history`: the ten most recent finished seasons; select a `season` to render its board.
- `/bingo seasonal_admin action:template`: download the starter configuration.
- `/bingo seasonal_admin action:create`: create and schedule a season with `theme`, optional `name`, `year`, UTC ISO `start`/`end`, and optional JSON `configuration` attachment. Defaults to starting immediately for 30 days. Upcoming seasons activate automatically. Seasons cannot overlap, including historical dates.
- `/bingo seasonal_admin action:end`: end the active or selected season early.
- `/bingo seasonal_admin action:complete|reverse`: select a challenge ID and supply an audit reason. Reversal resets its progress and removes its contributor scores. Previous events remain recorded and cannot be replayed; pending events earned before the reset cannot restore it.
- `/bingo seasonal_admin action:inspect`: download the configuration, progress and up to 20 recent credited/manual events for a challenge.

Administrative actions require the existing bot administrator check and, in production, the support server. They do not use guild administrator permissions. Manual completions do not award contributor points.

## Persistence and deployment

The three new models are `BingoSeason`, `SeasonalBingoProgress` and `SeasonalBingoEvent`. The OSB Robochimp schema mirror contains the same additions. Existing team bingo models are unchanged.

This repository deploys schema changes without a checked-in Prisma migration history. `prisma/sql/seasonal_bingo.sql` is the generated, additive SQL diff for this change; apply it once to an existing production database before starting the updated bot, or use the existing schema deployment procedure. Do not run both against the same database. Regenerate the Prisma clients afterwards. Local PGlite databases are created from the Prisma schema as usual. No database migration has been applied by this implementation.

Each season stores its own immutable 28-challenge JSON configuration. Progress has a compound primary key `(season_id, challenge_id)`, with completion attribution, time and reward event ID. Reward events form both a durable outbox and an audit ledger; their primary keys prevent duplicate delivery. Do not prune processed event IDs while replay of their activities is possible.

The ten-second ticker processes up to 100 events per tick, in timestamp order, and updates season statuses. It retries unprocessed events after restarts. Each event transaction locks the season row before reading/updating progress, credits and the image version. Administrative corrections use that same lock. Item grants and outbox insertion share the existing `rawUpdate` database transaction. A later Discord or progress-processing failure cannot undo granted loot; the outbox survives for retry.

Image caching holds up to eight render promises keyed by season ID and database progress version. Changed versions make stale images inaccessible, concurrent requests share a render, and failed renders are evicted. Database progress remains authoritative. Persistent Discord board messages are not included in this version.

## Reward provenance and coverage

`ActivityManager.completeActivity` creates an async context containing the stored activity and active season. `transactItemsFromBank` explicitly binds that context across the per-user queue, then adds an outbox write alongside the final bank update. Only participants listed on that activity can contribute. Only the explicit earned-activity allowlist in `bingoEvents.ts` and collection-log-enabled bank writes qualify. Only rewards matching configured challenge items, or an explicitly supported activity completion, create events.

The event uses the actually awarded, filtered bank loot, without inspecting existing bank contents. Buying, trades, transfers, gifts, giveaways, admin grants and crafting from banked ingredients do not qualify. Trips must **start on or after the season start**, and rewards must be granted before the exclusive season end. A trip that starts before the season or grants its rewards after the deadline does not qualify, even if its scheduled finish is earlier. Events committed before an early/manual end can still be processed afterwards.

This covers resource gathering, normal/group PvM, raids, the Gauntlet, clue-completion trips, supported minigames and glory charging when run through `ActivityManager` and the shared item helper. A task that grants loot and subsequently fails to send its message still contributes its committed rewards. Failed or cancelled trips without an actual eligible reward write do not contribute. There is one season lookup per allowlisted activity, rather than one lookup per item.

If season lookup or configuration loading fails, it is logged and the ordinary activity still runs. That activity cannot contribute automatically without a valid season context; administrators can inspect the logs and correct the board. Once captured, outbox insertion is atomic with the reward write rather than silently losing progress.

Not covered automatically:

- Command-only rewards such as `/open`, seed packs, shops, creation and manual farming harvests outside an activity.
- Reward paths that write banks directly, without `transactItemsFromBank`.
- Detached work after the activity runner returns, including unawaited trip-finish effects. The context closes when the task returns.
- Tasks invoked directly outside `ActivityManager` (including existing direct task test helpers).

Reward IDs are `season:activity:user:reward-write-ordinal`, with independent sequences per participant. Replaying the same activity with the same reward-write order cannot count again, even if the loot rerolls. This does not change the existing activity scheduler's reward retry behaviour. Future paths that split or reorder a trip's reward writes must preserve stable ordinals or provide an explicit source-specific ID before they are eligible.

`activity_completion` currently supports successful Woodcutting trips, whose main reward transaction emits an explicit success signal. Empty/powerchopping trips can count for that challenge. Other activities must emit their own success signal and be added to `bingoCompletionActivities` before they can be configured; simply returning from an activity is insufficient, because many death/failure paths also return normally.

## Challenge configuration and scoring

Configurations are validated with Zod, including exactly 28 unique IDs and real item IDs. Names are short tile labels; descriptions provide the full rules in `/bingo progress`. The starter list is an editable example, not an automatically launched event. It uses OSB-supported reward equivalents where the supplied visual example differs: damaged Torva drops, Kodai insignia, tomes, uncharged raid weapons and Voidwaker components.

- `item_drop`: any item in `targetItemIDs` completes the tile once.
- `item_quantity`: eligible quantities accumulate community-wide up to `requiredQuantity`.
- `activity_completion`: explicit successful trip signals accumulate to `requiredQuantity`.
- `custom`, `evaluator: "item_sets"`: complete any set in `itemSets`. Each set contains groups of alternative item IDs; every group needs a newly earned item. This supports full Barrows sets and multi-component drops without counting traded or previously owned components. Components can come from different players.

Each tile contributes at most one leaderboard point. Quantities award the fraction of the target newly contributed, capped at completion. Sets award increases in the completion fraction of the most advanced alternative set. Duplicate components or progress on a less advanced set retain evidence but award no immediate points. Drop challenges award one point to their first qualifying contributor. This keeps the total available score bounded by the board's challenge count. The leaderboard shows the top 20 contributors.

For a new custom rule, add a discriminated configuration/evaluator branch in `bingoTypes.ts` and `bingoProgress.ts`, and update the event item prefilter where necessary. The renderer and database do not depend on individual challenge names or item lists.

Regression tests are provided in `tests/unit/bingo.test.ts`, `tests/unit/canvas/bingo.test.ts` and `tests/integration/bingo.test.ts`. They have not been executed, following the repository instruction to run only the type check unless tests are explicitly requested.
