import { Items } from 'oldschooljs';
import { globalConfig } from './constants';
import { sql } from './postgres';

const startupScripts: { sql: string; ignoreErrors?: true }[] = [];

startupScripts.push({
	sql: `CREATE OR REPLACE FUNCTION add_item_to_bank(
    bank JSONB,
    key TEXT,
    quantity INT
) RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
    RETURN (
        CASE
            WHEN bank ? key THEN
                jsonb_set(
                    bank,
                    ARRAY[key],
                    to_jsonb((bank->>key)::INT + quantity)
                )
            ELSE
                jsonb_set(
                    bank,
                    ARRAY[key],
                    to_jsonb(quantity)
                )
        END
    );
END;
$$;`
});

startupScripts.push({
	sql: `CREATE OR REPLACE FUNCTION remove_item_from_bank(
    bank JSONB,
    key TEXT,
    quantity INT
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    current_value INT;
BEGIN
    IF bank ? key THEN
        current_value := (bank->>key)::INT - quantity;
        IF current_value > 0 THEN
            RETURN jsonb_set(
                bank,
                ARRAY[key],
                to_jsonb(current_value)
            );
        ELSE
            RETURN bank - key;
        END IF;
    ELSE
        RETURN bank;
    END IF;
END;
$$;`
});

interface CheckConstraint {
	table: string;
	column: string;
	name: string;
	body: string;
}
const checkConstraints: CheckConstraint[] = [
	{
		table: 'users',
		column: '"GP"',
		name: 'users_gp',
		body: '"GP" >= 0'
	},
	{
		table: 'ge_listing',
		column: 'asking_price_per_item',
		name: 'asking_price_per_item_min',
		body: 'asking_price_per_item >= 1'
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
	startupScripts.push({
		sql: `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM   information_schema.check_constraints 
                   WHERE  constraint_name = '${name}' 
                   AND    constraint_schema = 'public')
    THEN
        ALTER TABLE "${table}" ADD CONSTRAINT "${name}" CHECK (${body});
    END IF;
END$$;`
	});
}

startupScripts.push({
	sql: 'CREATE UNIQUE INDEX IF NOT EXISTS activity_only_one_task ON activity (user_id, completed) WHERE NOT completed;'
});

startupScripts.push({
	sql: `CREATE INDEX IF NOT EXISTS idx_ge_listing_buy_filter_sort 
ON ge_listing (type, fulfilled_at, cancelled_at, user_id, asking_price_per_item DESC, created_at ASC);`
});
startupScripts.push({
	sql: `CREATE INDEX IF NOT EXISTS idx_ge_listing_sell_filter_sort 
ON ge_listing (type, fulfilled_at, cancelled_at, user_id, asking_price_per_item ASC, created_at ASC);`
});

startupScripts.push({
	sql: `CREATE INDEX IF NOT EXISTS ge_transaction_sell_listing_id_created_at_idx 
ON ge_transaction (sell_listing_id, created_at DESC);`
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
if (globalConfig.isProduction) {
	startupScripts.push({ sql: itemMetaDataQuery });
}

export async function runStartupScripts() {
	await sql.begin(sql => startupScripts.map(query => sql.unsafe(query.sql)));
}
