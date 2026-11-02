BEGIN;

ALTER TYPE command_name_enum RENAME VALUE 'islandupgrade' TO 'island';

COMMIT;
