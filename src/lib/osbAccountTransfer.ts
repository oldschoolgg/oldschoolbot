import { prisma } from './settings/prisma';

export async function OSBTransferAccount({ newAccount, oldAccount }: { newAccount: string; oldAccount: string }) {
	const res = await prisma.$queryRawUnsafe(`BEGIN;
DELETE FROM activity WHERE user_id = ${newAccount};
DELETE FROM gear_presets WHERE user_id = '${newAccount}';
DELETE FROM giveaway WHERE user_id = '${newAccount}';
DELETE FROM slayer_tasks WHERE user_id = '${newAccount}';
DELETE FROM users WHERE id = '${newAccount}';
DELETE FROM minigames WHERE user_id = '${newAccount}';
DELETE FROM xp_gains WHERE user_id = ${newAccount};
DELETE FROM new_users WHERE id = '${newAccount}';
DELETE FROM poh WHERE user_id = '${newAccount}';
DELETE FROM lms_games WHERE user_id = ${newAccount};
DELETE FROM user_stats WHERE user_id = ${newAccount};
DELETE FROM farmed_crop WHERE user_id = ${newAccount};
DELETE FROM stash_unit WHERE user_id = ${newAccount};
DELETE FROM loot_track WHERE user_id = ${newAccount};

UPDATE loot_track
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE stash_unit
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE farmed_crop
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE user_stats
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE activity
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE gear_presets
SET user_id = '${newAccount}' WHERE user_id = '${oldAccount}';

UPDATE giveaway
SET user_id = '${newAccount}' WHERE user_id = '${oldAccount}';

UPDATE minigames
SET user_id = '${newAccount}' WHERE user_id = '${oldAccount}';

UPDATE xp_gains
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE new_users
SET id = '${newAccount}' WHERE id = '${oldAccount}';

UPDATE users
SET id = '${newAccount}' WHERE id = '${oldAccount}';

UPDATE poh
SET user_id = '${newAccount}' WHERE user_id = '${oldAccount}';

UPDATE slayer_tasks
SET user_id = '${newAccount}' WHERE user_id = '${oldAccount}';

UPDATE command_usage
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE lms_games
SET user_id = ${newAccount} WHERE user_id = ${oldAccount};

UPDATE economy_transaction
SET sender = ${newAccount} WHERE sender = ${oldAccount};

UPDATE economy_transaction
SET recipient = ${newAccount} WHERE recipient = ${oldAccount};

COMMIT;`);
	console.log(res);
}
