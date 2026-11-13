# Seasonal artwork for normal bingo

Seasonal boards use the existing `Bingo`, `BingoTeam`, `BingoParticipant.cl` and `BingoManager` implementation. Registration, ticket fees, prizes, trophies, earned-item tracking and team leaderboard scoring follow the normal bingo flow. There is no separate seasonal progress store, event processor, ticker or activity hook.

## Commands

- `/bingo create_bingo`: use the normal settings, including team size. Optional `theme` selects winter, spring, summer or autumn artwork. Optional `configuration` imports a JSON file directly into `bingo_tiles`. A theme without a file uses the starter 28-tile board. JSON can also be imported without a theme.
- `/bingo make_team`, `/bingo leave_team`, `/bingo leaderboard`, `/bingo items`: use the existing commands and rules.
- `/bingo view`: shows the normal event information and the caller's team progress. With a theme it attaches the rendered board image. Non-members see an empty preview. It never attaches challenge JSON.
- `/bingo manage_bingo`: organisers can set `theme` or upload `configuration` before the start. A themed board needs exactly 28 tiles; the JSON file replaces its complete tile list. `template:true` explicitly downloads the current 28 native tiles, or a starter configuration. Normal finalisation, prize handling and CSV export remain available.

The optional board settings appear after the normal required creation arguments. Restart the updated bot and run `/admin sync_commands` to publish command definition changes. Do not edit generated files under `data/`.

## JSON and existing tiles

The earlier 28-challenge JSON files remain supported for item-based challenges:

- `item_drop` becomes the existing `oneOf` tile.
- A single-item `item_quantity` becomes the existing `bank` requirement.
- A single set of individual components becomes an existing `allOf` tile.
- Alternative sets and quantities shared across alternative item IDs become serialisable custom requirements, resolved into the existing `customReq`/`allItems` tile interface when loading the bingo.

Names, descriptions, icon IDs and configuration keys are stored alongside those native tile definitions. Native JSON exports (`global`, `oneOf`, `allOf`, `bank` or the serialisable custom requirements) can be imported again. Every import must contain exactly 28 valid tiles. Activity-only challenges are rejected because the established bingo system tracks earned items.

Progress is evaluated directly from the same combined participant item bank used by the normal leaderboard. The existing bank reward hook updates it, including command rewards that already qualified for ordinary bingo. The artwork adds no new eligibility, replay protection or reward rules.

The renderer uses the existing canvas utilities, fonts, item sprites and supplied seasonal PNGs. Its bounded cache includes the bingo ID, team ID and a hash of the displayed title, artwork, tiles, completion flags and quantities. Changed display state produces a new image; repeated requests share a render. Nothing in the cache determines authoritative progress.

## Existing deployments

The only new live field is nullable `Bingo.theme`. `prisma/sql/bingo_board_artwork.sql` adds it and converts previously linked seasonal configurations into normal `bingo_tiles`. Run that SQL with the bot stopped before starting the simplified version, or use the usual schema deployment procedure for a fresh database. Regenerate Prisma clients. The OSB Robochimp mirror has the same schema changes.

The migration preserves existing team membership and participant CLs and adds valid pending legacy reward events once. Old seasonal tables are retained and ignored by Prisma clients; their historical records are not deleted or consulted by the bot. Standalone community seasons cannot be assigned to teams retrospectively. Configurations containing activity-only challenges require an item-based replacement. Old manual seasonal completion overrides are retained as history; normal item-based team scoring uses participant CLs.

No database migration is applied automatically by this code change. No existing bingo or bank data is cleared.
