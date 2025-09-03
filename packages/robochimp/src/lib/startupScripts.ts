export const startupScripts: { sql: string; ignoreErrors?: true }[] = [];

interface CheckConstraint {
	table: string;
	column: string;
	name: string;
	body: string;
}
const checkConstraints: CheckConstraint[] = [
	{
		table: 'user',
		column: 'testing_points',
		name: 'users_testing_points_min',
		body: 'testing_points >= 0'
	},
	{
		table: 'user',
		column: 'testing_points_balance',
		name: 'users_testing_points_balance_min',
		body: 'testing_points_balance >= 0'
	}
];

for (const { table, name, body } of checkConstraints) {
	startupScripts.push({
		sql: `ALTER TABLE "public"."${table}" ADD CONSTRAINT ${name} CHECK (${body});`,
		ignoreErrors: true
	});
}

export async function runStartupScripts() {
	for (const query of startupScripts) {
		await roboChimpClient
			.$queryRawUnsafe(query.sql)
			.catch(err =>
				query.ignoreErrors ? null : console.error(`Startup script failed: ${err.message} ${query.sql}`)
			);
	}
}
