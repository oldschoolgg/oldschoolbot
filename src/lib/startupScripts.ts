import { Items } from 'oldschooljs';

const startupScripts: { sql: string; ignoreErrors?: true }[] = [];

const arrayColumns = [
	['guilds', 'disabledCommands'],
	['users', 'badges'],
	['users', 'bitfield'],
	['users', 'favoriteItems'],
	['users', 'favorite_alchables'],
	['users', 'favorite_food'],
	['users', 'favorite_bh_seeds'],
	['users', 'attack_style'],
	['users', 'combat_options'],
	['users', 'slayer.unlocks'],
	['users', 'slayer.blocked_ids'],
	['users', 'slayer.autoslay_options'],
	['users', 'monkeys_fought'],
	['users', 'unlocked_blueprints'],
	['users', 'disabled_inventions']
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

startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS activity_only_one_task ON activity (user_id, completed) WHERE NOT completed;'
});
startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS tame_only_one_task ON tame_activity (user_id, completed) WHERE NOT completed;'
});

const itemMetaDataNames = Items.map(item => `(${item.id}, '${item.name.replace(/'/g, "''")}')`).join(', ');
const itemMetaDataQuery = `
INSERT INTO item_metadata (id, name)
VALUES ${itemMetaDataNames}
ON CONFLICT (id) 
DO 
  UPDATE SET name = EXCLUDED.name
WHERE item_metadata.name IS DISTINCT FROM EXCLUDED.name;
`;

startupScripts.push({ sql: itemMetaDataQuery });

export async function runStartupScripts() {
	await prisma.$transaction(startupScripts.map(query => prisma.$queryRawUnsafe(query.sql)));
}
