# Building Doom of Mokhaiotl

This is the living specification for the OSB Doom of Mokhaiotl implementation. Read this file before changing Doom code. Update it whenever discussion, database evidence, the OSRS Wiki, or implementation work changes our understanding.

## Goal

Model Doom of Mokhaiotl as one normal OSB minion task containing one or more independent delve journeys. Preserve the boss's risk/reward loop, conceal pre-rolled outcomes until completion, charge enough supplies up front, and refund supplies that the simulated outcomes did not consume.

The implementation should be understandable from its data: everything needed to complete the activity, including loot, outcomes, and refunds, must already be stored in the Activity row when the task starts. Activity completion applies stored results; it must not generate new Doom outcomes.

## Terminology

- **Trip** or **task** means the entire ActivityManager activity from command start to activity completion.
- **Delve** means one individual Doom journey that begins at level 1 and attempts to reach `targetDelve`.
- Never call an individual Doom journey a trip in Doom-specific code, data fields, comments, or user messages.
- `maxTripLength` and `calcMaxTripLength()` refer to the maximum duration of the entire task, never one delve.
- `duration` on the Activity row is the simulated duration of the entire task: the sum of retained delve durations.
- `fakeDuration` is the outward-facing duration used to avoid exposing pre-rolled deaths, early unique stops, and supply-limited trimming.

## Task planning

- `target_delve` is optional. When omitted, use `MAX_DELVE` as the internal ceiling so each delve continues until it receives a unique, dies, or reaches the supported maximum.
- If the user supplies `quantity`, attempt that many delves unless the requested number exceeds the full task-length allowance or the user lacks supplies. Only reveal a maximum delve count when the user explicitly requested too many.
- If `quantity` is omitted, keep generating delves until the total simulated duration passes `maxTripLength`:

  ```ts
  const delvesToAttempt = quantity ?? Number.POSITIVE_INFINITY;

  while (delves.length < delvesToAttempt) {
    // Generate and append exactly one delve.
    if (totalDuration > maxTripLength) break;
  }
  ```

- Automatic mode is duration-driven. Do not replace the infinity-and-break behavior with a precomputed delve count.
- Always attempt at least one delve when the user meets the requirements and has enough supplies. A nominal delve being longer than `maxTripLength` must not prevent that first delve.
- The break check occurs after appending a delve. It is acceptable for the simulated task duration to cross `maxTripLength` by the final delve.
- A waystone affects an individual delve. Owned waystones can boost only the corresponding number of delves; later delves must use the unboosted duration.

## Boss and loot model

The OSRS behavior being modeled is:

- Each cleared delve level rolls the regular loot table once.
- Eligible uniques roll independently for each cleared level.
- Unique eligibility begins at different levels:
  - Mokhaiotl cloth: level 2+
  - Eye of ayak: level 3+
  - Avernic treads: level 4+
  - Dom: level 6+
- Drop-rate scaling caps at level 9, while deeper levels can continue increasing risk.
- Guaranteed Demon tears begin at level 3 and scale to 100 per level from level 8 onward.
- Continuing deeper risks all loot accumulated in that one delve journey. If the minion dies, that delve contributes no loot to the task.
- A successful delve must have its regular and tertiary loot stored, but success does not guarantee a unique.
- Mokhaiotl waystones are normal loot, not uniques.
- Multiple copies of the same unique can legitimately occur across separate delves in one task. With `stopOnUnique` enabled, one delve stops after the first cleared level that rolls any unique, but the other planned delves still proceed.

## Outcome generation and Activity TaskData

All random Doom outcomes are generated before `ActivityManager.startTrip()` writes the Activity row.

Each delve record should contain:

```ts
interface DoomActivityDelveData {
  dur: number;
  dead: boolean;
  lastWave: number;
  diedAt?: number;
  ayak?: number;
  loot?: ItemBank;
}
```

The Doom task data should contain at least:

```ts
{
  targetDelve: number;
  delves: DoomActivityDelveData[];
  loot: ItemBank;
  refund?: ItemBank;
  refundAmmo?: ItemBank;
  fakeDuration: number;
  stopOnUnique: boolean;
}
```

Data invariants:

- A successful delve stores all loot accumulated through its cleared levels in `delve.loot`.
- A dead delve has no retained loot.
- Top-level `loot` is the aggregate of all successful `delve.loot` banks. This is the authoritative bank awarded at completion.
- The per-delve loot is retained for auditing, summaries, unique-stop detection, and diagnosing task generation.
- The completion activity reads and awards top-level `loot`. It must never roll regular loot, uniques, deaths, durations, or any other Doom outcome.
- Do not treat the existence of `delve.loot` as proof of a unique. Successful delves normally contain regular loot. Check the actual unique item IDs.
- Do not regenerate missing loot for legacy rows during completion. A newly generated random result would not be the outcome stored when the task began.

## Stop on unique

- `stopOnUnique` applies independently to every delve, not to the whole task.
- When a cleared level rolls a unique, that delve may cash out early and keeps everything accumulated in that delve.
- A unique in one delve does not cancel the remaining delves in the task.
- Automatic mode should retain the intended default of stopping each delve on a unique.
- User-visible summaries should distinguish how many delves were attempted, which died, and which stopped on a unique.

## Supply accounting

Keep these concepts separate:

1. **Estimated cost:** outcome-independent supplies charged when the task starts.
2. **Physical removal:** what `specialRemoveItems()` actually removes, including ammunition-saving effects and potion container/dose representation.
3. **Actual simulated use:** supplies required by the pre-rolled delve outcomes and durations.
4. **Refund:** physical leftovers stored in TaskData and returned exactly once at activity completion.
5. **Effective cost:** the normalized cost recorded in Doom cost tracking after dose/container handling.

Rules:

- Estimate enough supplies for the planned full task without revealing deaths or early unique stops.
- Brew and restore use has a steep learning premium. Count cleared levels as experience, give deep levels extra weight, and reach the experienced per-minute rates at roughly 20 experience points. Both costs must fall with experience.
- Secretly calculate actual use from the stored delve outcomes.
- Store all refunds in the Activity TaskData and return them only at completion.
- Never rely on `Bank.remove()` underflow behavior as validation that accounting is correct. Explicitly verify the estimate covers simulated use.
- When insufficient supplies reduce an automatic task, remove delves from the end and keep the data, duration, loot aggregate, cost, and refunds consistent with the retained list.

### Venom protection

- Calculate venom protection per delve using that delve's duration and death waste.
- Different delves may use different potion types depending on availability and efficiency.
- Carry partial-potion remainders forward so later delves can consume them.
- Preserve the distinction between full physical potion items removed, doses actually consumed, and remaining lower-dose potion items refunded.
- Never assign a fixed one-hour, ninety-minute, or two-hour venom duration to every delve.

### Arrows and other ammunition

- Arrow estimation is task-level, based once on the full planned task duration.
- Actual arrow use is task-level, based once on the sum of retained delve durations.
- Do not apply a one-hour or multi-hour arrow allowance to every delve.
- Respect Ava-style physical ammunition savings when converting requested arrow use into physical loss and refunds.
- Return unused equipped ammunition through `refundAmmo` so completion restores it to the appropriate place.
- ZCB bolts, runes, crystal shards, waystones, food, restores, ranging potions, and death-charge costs still depend on the relevant delve outcomes or levels and must remain part of the same estimate/use/refund accounting model.

## Duration and outcome concealment

- The task's actual stored `duration` is the sum of simulated delve durations and controls when the activity completes.
- `fakeDuration` may represent the requested/planned task duration for display and status purposes.
- Costs shown at task start should be estimates. Outcome-dependent leftovers should remain hidden in the stored refund until completion.
- Do not use pre-rolled deaths or uniques to tell the user exactly how many delves automatic mode will complete.

## Testing database observations

Use `DATABASE_URL` from the project `.env` for the testing database. A useful inspection query is:

```sql
SELECT * FROM activity ORDER BY id DESC;
```

Observed on 2026-09-08:

- Activities `28278` through `28280` use the intended `delves` field.
- Those rows have top-level aggregate `data.loot`.
- Successful delve records contain their complete `loot`; dead delve records do not.
- The top-level loot equals the aggregate of successful delve loot in the inspected rows.
- Older activities such as `28277` use the legacy `trips` field and contain no stored loot. That historical shape demonstrates the broken completion-time-loot design and should not be copied.
- Recent target-17 tasks contain several roughly 8-to-19-minute delves inside one roughly 46-to-66-minute full task, confirming why per-delve multi-hour supply estimates are incorrect.

Do not put database credentials in this document, logs, source code, or responses.

## Main source locations

- `src/lib/doomOfMokhaiotl.ts`: command validation, delve simulation, loot generation, task planning, cost/use/refund calculation, and Activity start.
- `src/lib/doomOfMokhaiotlHelpers.ts`: duration, death chance, venom, ammunition, XP, and related calculations.
- `src/lib/types/minions.ts`: persisted Doom Activity TaskData types.
- `src/tasks/minions/doomOfMokhaiotlActivity.ts`: applies the already-stored outcome at completion.
- `src/mahoji/lib/abstracted_commands/delveCommand.ts`: command options and user-facing option descriptions.
- Doom combat-achievement definitions consume the stored delve results and must use the same terminology and semantics.

## Working agreement for future changes

Before modifying Doom:

1. Read this entire file.
2. Inspect the current diff so unfinished human work is preserved.
3. Inspect relevant Git history before reversing or replacing established behavior.
4. Query recent testing Activity rows when persisted TaskData or accounting is involved.
5. Ask a focused clarifying question when a requested behavior conflicts with this document or remains ambiguous.
6. Make the narrowest coherent change that maintains all invariants above.
7. Update this document when our understanding changes.

The user's corrections and the latest explicit discussion override stale notes, old commits, and assumptions in this document. When that happens, update this file as part of the same work.
