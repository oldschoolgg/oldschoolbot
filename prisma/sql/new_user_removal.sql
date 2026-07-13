BEGIN;

delete from slayer_tasks stt where stt.user_id in (
    SELECT st.user_id
    FROM "slayer_tasks" st
             LEFT JOIN "users" u ON u.id = st.user_id
    WHERE u.id IS null
);

delete from new_users nuu where nuu.id in (
    SELECT nu.id
    FROM "new_users" nu
             LEFT JOIN "users" u ON u.id = nu.id
    WHERE u.id IS null
);
delete from minigames mm where mm.user_id in (
    select m.user_id
    FROM "minigames" m
             LEFT JOIN "users" u ON u.id = m.user_id
    WHERE u.id IS null
);
ALTER TABLE "minigames"
	ADD COLUMN IF NOT EXISTS "pizazz_points" integer NOT NULL DEFAULT 0;

DO $$
DECLARE
	missing_count integer;
BEGIN
	SELECT COUNT(*)
	INTO missing_count
	FROM "slayer_tasks" st
	LEFT JOIN "users" u ON u.id = st.user_id
	WHERE u.id IS NULL;

	IF missing_count > 0 THEN
		RAISE EXCEPTION 'Cannot migrate slayer_tasks: % rows do not have matching users rows.', missing_count;
	END IF;
END $$;

DO $$
DECLARE
	missing_count integer;
BEGIN
	SELECT COUNT(*)
	INTO missing_count
	FROM "minigames" m
	LEFT JOIN "users" u ON u.id = m.user_id
	WHERE u.id IS NULL;

	IF missing_count > 0 THEN
		RAISE EXCEPTION 'Cannot migrate minigames: % rows do not have matching users rows.', missing_count;
	END IF;
END $$;

ALTER TABLE "slayer_tasks"
	DROP CONSTRAINT IF EXISTS "FK_43bf436cc70acda1752fb6e6006";

ALTER TABLE "slayer_tasks"
	ADD CONSTRAINT "FK_43bf436cc70acda1752fb6e6006"
	FOREIGN KEY ("user_id")
	REFERENCES "users" ("id")
	ON DELETE NO ACTION
	ON UPDATE CASCADE;

ALTER TABLE "minigames"
	DROP CONSTRAINT IF EXISTS "FK_minigames_user_id_users_id";

ALTER TABLE "minigames"
	ADD CONSTRAINT "FK_minigames_user_id_users_id"
	FOREIGN KEY ("user_id")
	REFERENCES "users" ("id")
	ON DELETE NO ACTION
	ON UPDATE CASCADE;

DO $$
DECLARE
	new_user_count integer;
BEGIN
	IF to_regclass('public.new_users') IS NULL THEN
		RETURN;
	END IF;

	SELECT COUNT(*)
	INTO new_user_count
	FROM "new_users" nu
	LEFT JOIN "users" u ON u.id = nu.id
	WHERE u.id IS NULL;

	IF new_user_count > 0 THEN
		RAISE EXCEPTION 'Cannot migrate new_users: % rows do not have matching users rows.', new_user_count;
	END IF;

	INSERT INTO "minigames" ("user_id", "pizazz_points")
	SELECT nu.id, nu.pizazz_points
	FROM "new_users" nu
	ON CONFLICT ("user_id") DO UPDATE
		SET "pizazz_points" = EXCLUDED."pizazz_points";

	DROP TABLE "new_users";
END $$;

COMMIT;
