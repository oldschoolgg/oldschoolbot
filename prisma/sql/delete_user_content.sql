BEGIN;

CREATE TEMP TABLE _delete_user_content_context (
	user_id text PRIMARY KEY,
	user_id_bigint bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO _delete_user_content_context (user_id, user_id_bigint)
SELECT target_user_id, target_user_id::bigint
FROM (VALUES ('REPLACE_WITH_USER_ID')) AS input(target_user_id)
WHERE target_user_id ~ '^[0-9]{1,19}$'
	AND target_user_id::numeric <= 9223372036854775807;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM _delete_user_content_context) THEN
		RAISE EXCEPTION 'Replace REPLACE_WITH_USER_ID with a signed-bigint-compatible numeric Discord user id before running this script.';
	END IF;
END $$;

CREATE TEMP TABLE _delete_user_content_counts (
	target text NOT NULL,
	affected_rows bigint NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE _delete_user_content_activity_ids ON COMMIT DROP AS
SELECT a.id
FROM activity a
JOIN _delete_user_content_context ctx ON
	a.user_id = ctx.user_id_bigint
	OR a.all_user_ids @> ARRAY[ctx.user_id_bigint]::bigint[]
	OR a.data @> jsonb_build_object('leader', ctx.user_id)
	OR (a.data->'users') ? ctx.user_id;

CREATE TEMP TABLE _delete_user_content_bingo_ids ON COMMIT DROP AS
SELECT b.id
FROM bingo b
JOIN _delete_user_content_context ctx ON b.creator_id = ctx.user_id;

CREATE TEMP TABLE _delete_user_content_ge_listing_ids ON COMMIT DROP AS
SELECT gl.id
FROM ge_listing gl
JOIN _delete_user_content_context ctx ON gl.user_id = ctx.user_id;

CREATE TEMP TABLE _delete_user_content_table_bank_ids ON COMMIT DROP AS
SELECT tb.id
FROM table_bank tb
JOIN _delete_user_content_context ctx ON tb.user_id = ctx.user_id;

CREATE TEMP TABLE _delete_user_content_tame_ids ON COMMIT DROP AS
SELECT t.id
FROM tames t
JOIN _delete_user_content_context ctx ON t.user_id = ctx.user_id;

WITH deleted AS (
	DELETE FROM bingo_participant bp
	USING _delete_user_content_context ctx
	WHERE bp.user_id = ctx.user_id
		OR bp.bingo_id IN (SELECT id FROM _delete_user_content_bingo_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'bingo_participant', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM bingo_team bt
	WHERE bt.bingo_id IN (SELECT id FROM _delete_user_content_bingo_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'bingo_team', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM bingo b
	WHERE b.id IN (SELECT id FROM _delete_user_content_bingo_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'bingo', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM ge_transaction gt
	WHERE gt.buy_listing_id IN (SELECT id FROM _delete_user_content_ge_listing_ids)
		OR gt.sell_listing_id IN (SELECT id FROM _delete_user_content_ge_listing_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'ge_transaction', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM ge_listing gl
	WHERE gl.id IN (SELECT id FROM _delete_user_content_ge_listing_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'ge_listing', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM table_bank_item tbi
	WHERE tbi.bank_id IN (SELECT id FROM _delete_user_content_table_bank_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'table_bank_item', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM table_bank tb
	WHERE tb.id IN (SELECT id FROM _delete_user_content_table_bank_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'table_bank', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM tame_activity ta
	USING _delete_user_content_context ctx
	WHERE ta.user_id = ctx.user_id
		OR ta.tame_id IN (SELECT id FROM _delete_user_content_tame_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'tame_activity', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM tames t
	WHERE t.id IN (SELECT id FROM _delete_user_content_tame_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'tames', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM pinned_trip pt
	USING _delete_user_content_context ctx
	WHERE pt.user_id = ctx.user_id
		OR pt.activity_id IN (SELECT id FROM _delete_user_content_activity_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'pinned_trip', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM activity a
	WHERE a.id IN (SELECT id FROM _delete_user_content_activity_ids)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'activity', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM mortimer_trick mt
	USING _delete_user_content_context ctx
	WHERE mt.trickster_id = ctx.user_id
		OR mt.target_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'mortimer_trick', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM gift_box gb
	USING _delete_user_content_context ctx
	WHERE gb.creator_id = ctx.user_id
		OR gb.owner_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'gift_box', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM giveaway g
	USING _delete_user_content_context ctx
	WHERE g.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'giveaway', count(*) FROM deleted;

WITH updated AS (
	UPDATE giveaway g
	SET users_entered = array_remove(g.users_entered, ctx.user_id)
	FROM _delete_user_content_context ctx
	WHERE ctx.user_id = ANY(g.users_entered)
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'giveaway.users_entered removed', count(*) FROM updated;

WITH deleted AS (
	DELETE FROM slayer_tasks st
	USING _delete_user_content_context ctx
	WHERE st.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'slayer_tasks', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM gear_presets gp
	USING _delete_user_content_context ctx
	WHERE gp.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'gear_presets', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM bot_item_sell bis
	USING _delete_user_content_context ctx
	WHERE bis.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'bot_item_sell', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM historical_data hd
	USING _delete_user_content_context ctx
	WHERE hd.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'historical_data', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM farmed_crop fc
	USING _delete_user_content_context ctx
	WHERE fc.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'farmed_crop', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM minigames m
	USING _delete_user_content_context ctx
	WHERE m.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'minigames', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM poh p
	USING _delete_user_content_context ctx
	WHERE p.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'poh', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM reclaimable_item ri
	USING _delete_user_content_context ctx
	WHERE ri.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'reclaimable_item', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM portent p
	USING _delete_user_content_context ctx
	WHERE p.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'portent', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM archon_event ae
	USING _delete_user_content_context ctx
	WHERE ae.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'archon_event', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM halloween_event he
	USING _delete_user_content_context ctx
	WHERE he.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'halloween_event', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM json_bank jb
	USING _delete_user_content_context ctx
	WHERE jb.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'json_bank', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM shooting_stars ss
	USING _delete_user_content_context ctx
	WHERE ss.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'shooting_stars', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM user_event ue
	USING _delete_user_content_context ctx
	WHERE ue.user_id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'user_event', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM xp_gains xg
	USING _delete_user_content_context ctx
	WHERE xg.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'xp_gains', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM command_usage cu
	USING _delete_user_content_context ctx
	WHERE cu.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'command_usage', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM fishing_contest_catch fcc
	USING _delete_user_content_context ctx
	WHERE fcc.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'fishing_contest_catch', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM loot_track lt
	USING _delete_user_content_context ctx
	WHERE lt.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'loot_track', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM lms_games lg
	USING _delete_user_content_context ctx
	WHERE lg.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'lms_games', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM stash_unit su
	USING _delete_user_content_context ctx
	WHERE su.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'stash_unit', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM user_counter uc
	USING _delete_user_content_context ctx
	WHERE uc.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'user_counter', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM user_logs ul
	USING _delete_user_content_context ctx
	WHERE ul.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'user_logs', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM user_stats us
	USING _delete_user_content_context ctx
	WHERE us.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'user_stats', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM buy_command_transaction bct
	USING _delete_user_content_context ctx
	WHERE bct.user_id = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'buy_command_transaction', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM economy_transaction et
	USING _delete_user_content_context ctx
	WHERE et.sender = ctx.user_id_bigint
		OR et.recipient = ctx.user_id_bigint
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'economy_transaction', count(*) FROM deleted;

WITH deleted AS (
	DELETE FROM users u
	USING _delete_user_content_context ctx
	WHERE u.id = ctx.user_id
	RETURNING 1
)
INSERT INTO _delete_user_content_counts SELECT 'users', count(*) FROM deleted;

DO $$
DECLARE
	row record;
BEGIN
	RAISE NOTICE 'Deleted content for user id %', (SELECT user_id FROM _delete_user_content_context);
	FOR row IN
		SELECT target, affected_rows
		FROM _delete_user_content_counts
		WHERE affected_rows > 0
		ORDER BY target
	LOOP
		RAISE NOTICE '%: %', row.target, row.affected_rows;
	END LOOP;
END $$;

COMMIT;
