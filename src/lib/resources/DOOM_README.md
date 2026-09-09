# Doom of Mokhaiotl implementation README

This is a deliberately wordy design document for Doom of Mokhaiotl, its individual **Delves**, and the complete **Delve Treks** that travel through them. It records the behavioral and accounting details that are easy to lose when changing the implementation; read the relevant section before editing Doom code.

This is the living specification for the OSB Doom of Mokhaiotl implementation. Read this file before changing Doom code. Update it whenever discussion, database evidence, the OSRS Wiki, or implementation work changes our understanding.

## Goal

Model Doom of Mokhaiotl as one normal OSB minion task containing one or more independent Delve Treks. Preserve the boss's risk/reward loop, conceal pre-rolled outcomes until completion, charge enough supplies up front, and refund supplies that the simulated outcomes did not consume.

The implementation should be understandable from its data: everything needed to complete the activity, including loot, outcomes, and refunds, must already be stored in the Activity row when the task starts. Activity completion applies stored results; it must not generate new Doom outcomes.

## Terminology

- **Trip** or **task** means the entire ActivityManager activity from command start to activity completion.
- **Delve** means one individual in-game Doom Delve.
- **Delve Trek** means one complete journey that begins at Delve 1 and continues until cash-out, a unique stop, death, or `targetDelve`.
- Never call a Delve Trek a trip or merely a Delve in Doom-specific code, data fields, comments, or user messages.
- `maxTripLength` and `calcMaxTripLength()` refer to the maximum duration of the entire task, never one Delve Trek.
- `duration` on the Activity row is the simulated duration of the entire task: the sum of retained Delve Trek durations.
- `fakeDuration` is the outward-facing duration used to avoid exposing pre-rolled deaths, early unique stops, and supply-limited trimming.

## Task planning

- `target_delve` is optional. When omitted, use `MAX_DELVE` as the internal ceiling so each Delve Trek continues until it receives a unique, dies, or reaches the supported maximum.
- If the user supplies `quantity`, attempt that many Delve Treks unless the requested number exceeds the full task-length allowance or the user lacks supplies. Only reveal a maximum Delve Trek count when the user explicitly requested too many.
- If `quantity` is omitted, keep generating Delve Treks until the total simulated duration passes `maxTripLength`:

  ```ts
  const treksToAttempt = quantity ?? Number.POSITIVE_INFINITY;

  while (treks.length < treksToAttempt) {
    // Generate and append exactly one complete Delve Trek.
    if (totalDuration > maxTripLength) break;
  }
  ```

- Automatic mode is duration-driven. Do not replace the infinity-and-break behavior with a precomputed Delve Trek count.
- Always attempt at least one Delve Trek when the user meets the requirements and has enough supplies. A nominal Delve Trek being longer than `maxTripLength` must not prevent that first Trek.
- The break check occurs after appending a Delve Trek. It is acceptable for the simulated task duration to cross `maxTripLength` with the final Trek.
- A waystone affects one Delve Trek. Owned waystones can boost only the corresponding number of Treks; later Treks must use the unboosted duration.

## Boss and loot model

The OSRS behavior being modeled is:

- Each cleared Delve rolls the regular loot table once.
- Eligible uniques roll independently for each cleared Delve.
- Unique eligibility begins at different Delves:
  - Mokhaiotl cloth: Delve 2+
  - Eye of ayak: Delve 3+
  - Avernic treads: Delve 4+
  - Dom: Delve 6+
- Drop-rate scaling caps at Delve 9, while deeper Delves can continue increasing risk.
- Guaranteed Demon tears begin at Delve 3 and scale to 100 per Delve from Delve 8 onward.
- Continuing deeper risks all loot accumulated in that Delve Trek. If the minion dies, that Trek contributes no loot to the task.
- A successful Delve Trek must have its regular and tertiary loot stored, but success does not guarantee a unique.
- Mokhaiotl waystones are normal loot, not uniques.
- Multiple copies of the same unique can legitimately occur across separate Delve Treks in one task. With `stopOnUnique` enabled, one Trek stops after the first cleared Delve that rolls any unique, but the other planned Treks still proceed.

## Outcome generation and Activity TaskData

All random Doom outcomes are generated before `ActivityManager.startTrip()` writes the Activity row.

Each Delve Trek record should contain:

```ts
interface DoomActivityTrekData {
  dur: number;
  dead: boolean;
  lastDelve: number;
  diedAt?: number;
  ayak?: number;
  loot?: ItemBank;
}
```

The Doom task data should contain at least:

```ts
{
  targetDelve: number;
  treks: DoomActivityTrekData[];
  refund?: ItemBank;
  refundAmmo?: ItemBank;
  fakeDuration: number;
  stopOnUnique: boolean;
}
```

Data invariants:

- A successful Delve Trek stores all loot accumulated through its cleared Delves in `trek.loot`.
- A dead Delve Trek has no retained loot.
- The completion activity aggregates all successful `trek.loot` banks and awards that combined loot.
- The per-Trek loot is retained for auditing, summaries, unique-stop detection, and diagnosing task generation.
- The completion activity must never roll regular loot, uniques, deaths, durations, or any other Doom outcome.
- Do not treat the existence of `trek.loot` as proof of a unique. Successful Delve Treks normally contain regular loot. Check the actual unique item IDs.

## Stop on unique

- `stopOnUnique` applies independently to every Delve Trek, not to the whole task.
- When a cleared Delve rolls a unique, that Trek may cash out early and keeps everything accumulated in that Trek.
- A unique in one Delve Trek does not cancel the remaining Treks in the task.
- Automatic mode should retain the intended default of stopping each Delve Trek on a unique.
- User-visible summaries should distinguish how many Delve Treks were attempted, which died, and which stopped on a unique.

## Supply accounting

Keep these concepts separate:

1. **Estimated cost:** outcome-independent supplies charged when the task starts.
2. **Physical removal:** what `specialRemoveItems()` actually removes, including ammunition-saving effects and potion container/dose representation.
3. **Actual simulated use:** supplies required by the pre-rolled Delve Trek outcomes and durations.
4. **Refund:** physical leftovers stored in TaskData and returned exactly once at activity completion.
5. **Effective cost:** the normalized cost recorded in Doom cost tracking after dose/container handling.

Rules:

- Estimate enough supplies for the planned full task without revealing deaths or early unique stops.
- Brew and restore use has a steep learning premium. Count cleared Delves as experience, give deep Delves extra weight, and reach the experienced per-minute rates at roughly 20 experience points. Both costs must fall with experience.
- Secretly calculate actual use from the stored Delve Trek outcomes.
- Store all refunds in the Activity TaskData and return them only at completion.
- Never rely on `Bank.remove()` underflow behavior as validation that accounting is correct. Explicitly verify the estimate covers simulated use.
- When insufficient supplies reduce an automatic task, remove Delve Treks from the end and keep the data, duration, loot aggregate, cost, and refunds consistent with the retained list.

### Venom protection

- Calculate venom protection per Delve Trek using that Trek's duration and death waste.
- Different Delve Treks may use different potion types depending on availability and efficiency.
- Carry partial-potion remainders forward so later Treks can consume them.
- Preserve the distinction between full physical potion items removed, doses actually consumed, and remaining lower-dose potion items refunded.
- Never assign a fixed one-hour, ninety-minute, or two-hour venom duration to every Delve Trek.

### Arrows and other ammunition

- Arrow estimation is task-level, based once on the full planned task duration.
- Actual arrow use is task-level, based once on the sum of retained Delve Trek durations.
- Do not apply a one-hour or multi-hour arrow allowance to every Delve Trek.
- Respect Ava-style physical ammunition savings when converting requested arrow use into physical loss and refunds.
- Return unused equipped ammunition through `refundAmmo` so completion restores it to the appropriate place.
- ZCB bolts, runes, crystal shards, waystones, food, restores, ranging potions, and death-charge costs still depend on the relevant Delve Trek outcomes or individual Delves and must remain part of the same estimate/use/refund accounting model.

## Duration and outcome concealment

- The task's actual stored `duration` is the sum of simulated Delve Trek durations and controls when the activity completes.
- `fakeDuration` may represent the requested/planned task duration for display and status purposes.
- Costs shown at task start should be estimates. Outcome-dependent leftovers should remain hidden in the stored refund until completion.
- Do not use pre-rolled deaths or uniques to tell the user exactly how many Delve Treks automatic mode will complete.

## Testing database observations

Use `DATABASE_URL` from the project `.env` for the testing database. A useful inspection query is:

```sql
SELECT * FROM activity ORDER BY id DESC;
```

Observed on 2026-09-08:

- Successful Delve Trek records contain their complete `loot`; dead Trek records do not.
- Recent target-17 tasks contain several roughly 8-to-19-minute Delve Treks inside one roughly 46-to-66-minute full task, confirming why per-Trek multi-hour supply estimates are incorrect.

Do not put database credentials in this document, logs, source code, or responses.

## Main source locations

- `src/lib/doomOfMokhaiotl.ts`: command validation, Delve Trek simulation, individual Delve loot generation, task planning, cost/use/refund calculation, and Activity start.
- `src/lib/doomOfMokhaiotlHelpers.ts`: duration, death chance, venom, ammunition, XP, and related calculations.
- `src/lib/types/minions.ts`: persisted Doom Activity TaskData types.
- `src/tasks/minions/doomOfMokhaiotlActivity.ts`: applies the already-stored outcome at completion.
- `src/mahoji/lib/abstracted_commands/delveCommand.ts`: command options and user-facing option descriptions.
- Doom combat-achievement definitions consume the stored Delve Trek results and must use the same terminology and semantics.

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
