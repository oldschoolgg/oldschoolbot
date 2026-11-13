-- Run with the bot stopped. Adds artwork to normal bingo and preserves existing records.
BEGIN;

ALTER TABLE bingo ADD COLUMN IF NOT EXISTS theme VARCHAR(16);

DO $$
DECLARE
  reward RECORD;
  previous_cl JSONB;
  merged_cl JSONB;
BEGIN
  -- Earlier deployments may have standalone seasons without a bingo_id column.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'bingo_season' AND column_name = 'bingo_id') THEN
    UPDATE bingo b
    SET theme = s.theme,
        bingo_tiles = ARRAY(
          SELECT jsonb_strip_nulls(jsonb_build_object(
            'key', c->>'id', 'name', c->>'name', 'description', c->>'description', 'iconItemID', c->'iconItemID'
          )) || CASE c->>'type'
            WHEN 'item_drop' THEN jsonb_build_object('oneOf', c->'targetItemIDs')
            WHEN 'item_quantity' THEN CASE WHEN jsonb_array_length(c->'targetItemIDs') = 1
              THEN jsonb_build_object('bank', jsonb_build_object(c->'targetItemIDs'->>0, (c->>'requiredQuantity')::bigint))
              ELSE jsonb_build_object('custom', jsonb_build_object('type', 'item_quantity', 'itemIDs', c->'targetItemIDs', 'quantity', c->'requiredQuantity')) END
            WHEN 'custom' THEN jsonb_build_object('custom', jsonb_build_object('type', 'item_sets', 'sets', c->'itemSets'))
          END
          FROM jsonb_array_elements(s.challenges) WITH ORDINALITY AS tile(c, position)
          ORDER BY position
        )
    FROM bingo_season s
    WHERE s.bingo_id = b.id AND b.theme IS NULL
      AND jsonb_array_length(s.challenges) = 28
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(s.challenges) c
        WHERE c->>'type' NOT IN ('item_drop', 'item_quantity', 'custom')
          OR (c->>'type' = 'custom' AND c->>'evaluator' <> 'item_sets')
      );

    -- Carry over only pending, valid earned items not already present in participant CLs.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'seasonal_bingo_event' AND column_name = 'team_id') THEN
      FOR reward IN
        SELECT e.id, e.user_id, s.bingo_id, e.items
        FROM seasonal_bingo_event e
        JOIN bingo_season s ON s.id = e.season_id
        JOIN bingo_participant p ON p.bingo_id = s.bingo_id AND p.user_id = e.user_id AND p.bingo_team_id = e.team_id
        WHERE NOT e.processed AND e.started_at >= s.start_date
          AND e.occurred_at >= s.start_date AND e.occurred_at < s.end_date
        FOR UPDATE OF e
      LOOP
        SELECT cl::jsonb INTO previous_cl FROM bingo_participant
        WHERE bingo_id = reward.bingo_id AND user_id = reward.user_id FOR UPDATE;
        SELECT COALESCE(jsonb_object_agg(item_id, quantity), '{}'::jsonb) INTO merged_cl
        FROM (
          SELECT item_id, SUM(quantity::numeric) AS quantity FROM (
            SELECT key AS item_id, value AS quantity FROM jsonb_each_text(previous_cl)
            UNION ALL SELECT key, value FROM jsonb_each_text(reward.items)
          ) items GROUP BY item_id
        ) totals;
        UPDATE bingo_participant SET cl = merged_cl::json WHERE bingo_id = reward.bingo_id AND user_id = reward.user_id;
        UPDATE seasonal_bingo_event SET processed = true WHERE id = reward.id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Legacy seasonal progress and event tables are kept as history; the bot no longer reads them.
COMMIT;
