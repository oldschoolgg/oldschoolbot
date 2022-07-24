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
	['users', 'slayer.autoslay_options']
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
