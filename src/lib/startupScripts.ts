export const startupScripts: string[] = [];

const arrayColumns = [
	['clientStorage', 'userBlacklist'],
	['clientStorage', 'guildBlacklist'],
	['clientStorage', 'locked_skills'],
	['guilds', 'disabledCommands'],
	['guilds', 'staffOnlyChannels'],
	['guilds', 'tags'],
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
	['users', 'monkeys_fought']
];

for (const [table, column] of arrayColumns) {
	startupScripts.push(`ALTER TABLE "${table}"
                             ALTER COLUMN "${column}" SET DEFAULT '{}',
                             ALTER COLUMN "${column}" SET NOT NULL;`);
}
