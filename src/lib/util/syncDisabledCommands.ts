import { Stopwatch } from '@oldschoolgg/toolkit';
import { DISABLED_COMMANDS, globalConfig } from '../constants';

export async function syncDisabledCommands() {
	const stopwathm = new Stopwatch();
	await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE WITH upsert AS (
    UPDATE "clientStorage"
    SET id = id
    WHERE id = '829398443821891634'
    RETURNING id, disabled_commands
)
INSERT INTO "clientStorage" (id)
SELECT '829398443821891634'
WHERE NOT EXISTS (SELECT 1 FROM upsert)
RETURNING disabled_commands;`);
	stopwathm.stop();
	console.log(stopwathm.toString());

	const stopwath = new Stopwatch();
	const disabledCommands = await prisma.clientStorage.upsert({
		where: {
			id: globalConfig.clientID
		},
		select: { disabled_commands: true },
		create: {
			id: globalConfig.clientID
		},
		update: {}
	});
	stopwath.check('--------- FETCHED COMMANDS');

	if (disabledCommands.disabled_commands) {
		for (const command of disabledCommands.disabled_commands) {
			DISABLED_COMMANDS.add(command);
		}
	}
	stopwath.check('--------- DISABLED COMMANDS');
}
