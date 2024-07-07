import { Items } from 'oldschooljs';

import { logError } from './util/logError';

const startupScripts: { sql: string; ignoreErrors?: true }[] = [];

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
	['users', 'favorite_bh_seeds'],
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
	table: string;
	column: string;
	name: string;
	body: string;
}
const checkConstraints: CheckConstraint[] = [
	{
		table: 'users',
		column: 'lms_points',
		name: 'users_lms_points_min',
		body: 'lms_points >= 0'
	},
	{
		table: 'users',
		column: '"GP"',
		name: 'users_gp',
		body: '"GP" >= 0'
	},
	{
		table: 'users',
		column: '"QP"',
		name: 'users_qp',
		body: '"QP" >= 0'
	},
	{
		table: 'ge_listing',
		column: 'asking_price_per_item',
		name: 'asking_price_per_item_min',
		body: 'asking_price_per_item_min >= 1'
	},
	{
		table: 'ge_listing',
		column: 'total_quantity',
		name: 'total_quantity_min',
		body: 'total_quantity >= 1'
	},
	{
		table: 'ge_listing',
		column: 'quantity_remaining',
		name: 'quantity_remaining_min',
		body: 'quantity_remaining >= 0'
	},
	{
		table: 'ge_transaction',
		column: 'quantity_bought',
		name: 'quantity_bought_min',
		body: 'quantity_bought >= 0'
	},
	{
		table: 'ge_transaction',
		column: 'price_per_item_before_tax',
		name: 'price_per_item_before_tax_min',
		body: 'price_per_item_before_tax >= 1'
	},
	{
		table: 'ge_transaction',
		column: 'price_per_item_after_tax',
		name: 'price_per_item_after_tax_min',
		body: 'price_per_item_after_tax >= 1'
	},
	{
		table: 'ge_transaction',
		column: 'tax_rate_percent_min',
		name: 'tax_rate_percent_min',
		body: 'tax_rate_percent >= 1'
	},
	{
		table: 'ge_transaction',
		column: 'total_tax_paid',
		name: 'total_tax_paid_min',
		body: 'total_tax_paid >= 0'
	},
	{
		table: 'ge_bank',
		column: 'quantity',
		name: 'ge_bank_quantity_min',
		body: 'quantity >= 0'
	}
];
for (const { table, name, body } of checkConstraints) {
	startupScripts.push({ sql: `ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${body});`, ignoreErrors: true });
}
startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS activity_only_one_task ON activity (user_id, completed) WHERE NOT completed;'
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
	for (const query of startupScripts) {
		await prisma
			.$queryRawUnsafe(query.sql)
			.catch(err => (query.ignoreErrors ? null : logError(`Startup script failed: ${err.message} ${query.sql}`)));
	}
}
