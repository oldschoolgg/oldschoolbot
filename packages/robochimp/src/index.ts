import { syncBlacklists } from '@/lib/syncBlacklists.js';
import './discord/client.js';

import { globalConfig } from '@/constants.js';
import { startServer } from './http/server.js';
import { initPrismaClients } from './lib/prisma.js';

process.on('uncaughtException', err => {
	console.error(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
});

async function main() {
	await initPrismaClients();
	if (globalConfig.isProduction) {
		await globalClient.login();
	}

	setInterval(async () => {
		try {
			const usersToFetch: any = await roboChimpClient.$queryRaw`SELECT
  u.id
FROM "user" u
LEFT JOIN "discord_user" du
  ON du.id = u.id::text
WHERE du.id IS NULL
AND (u.osb_total_xp > 50000000 OR u.bso_total_xp > 100000000)
ORDER BY
  (COALESCE(u.osb_total_xp, 0) + COALESCE(u.bso_total_xp, 0)) DESC
LIMIT 20;
`;
			const userId = usersToFetch[0]?.id;
			if (userId) {
				const u = await globalClient.fetchUser(String(userId));
				await globalClient.upsertDiscordUser(u);
			}
		} catch (err) {
			console.error('Error fetching discord user for robochimp:', err);
		}
	}, 1000 * 15);

	await startServer(globalConfig.httpPort);
	await syncBlacklists();
}

main();
