import { prisma } from './settings/prisma';
import { logError } from './util/logError';

export const startupScripts: { sql: string; ignoreErrors?: true }[] = [];

const arrayColumns = [
	['clientStorage', 'userBlacklist'],
	['clientStorage', 'guildBlacklist'],
	['guilds', 'disabledCommands'],
	['guilds', 'staffOnlyChannels'],
	['users', 'badges'],
	['users', 'bitfield'],
	['users', 'favoriteItems'],
	['users', 'favorite_alchables'],
	['users', 'favorite_food'],
	['users', 'attack_style'],
	['users', 'combat_options'],
	['users', 'ironman_alts'],
	['users', 'slayer.unlocks'],
	['users', 'slayer.blocked_ids'],
	['users', 'slayer.autoslay_options'],
	['users', 'monkeys_fought'],
	['users', 'unlocked_blueprints'],
	['users', 'disabled_inventions'],
	['users', 'unlocked_gear_templates']
];

for (const [table, column] of arrayColumns) {
	startupScripts.push({
		sql: `UPDATE "${table}" SET "${column}" = '{}' WHERE "${column}" IS NULL;`
	});
	startupScripts.push({
		sql: `
ALTER TABLE "${table}"
	ALTER COLUMN "${column}" SET DEFAULT '{}',
	ALTER COLUMN "${column}" SET NOT NULL;`
	});
}

interface CheckConstraint {
	table: 'users';
	column: 'lms_points';
	name: `${CheckConstraint['table']}_${CheckConstraint['column']}_${string}`;
	body: string;
}
const checkConstraints: CheckConstraint[] = [
	{
		table: 'users',
		column: 'lms_points',
		name: 'users_lms_points_min',
		body: 'lms_points >= 0'
	}
];
for (const { table, name, body } of checkConstraints) {
	startupScripts.push({ sql: `ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${body});`, ignoreErrors: true });
}
startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS activity_only_one_task ON activity (user_id, completed) WHERE NOT completed;'
});
startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS tame_only_one_task ON tame_activity (user_id, completed) WHERE NOT completed;'
});

startupScripts.push({
	sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS bitfield_gin_index ON users USING GIN (bitfield gin__int_ops) WHERE farming_patch_reminders = true;'
});

export async function runStartupScripts() {
	for (const query of startupScripts) {
		await prisma
			.$queryRawUnsafe(query.sql)
			.catch(err => (query.ignoreErrors ? null : logError(`Startup script failed: ${err.message} ${query.sql}`)));
	}
}
