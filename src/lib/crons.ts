import { schedule } from 'node-cron';

import { prisma } from './settings/prisma';

export function initCrons() {
	schedule('0 0 * * 0', async () => {
		await prisma.$queryRawUnsafe(`UPDATE users
SET weekly_buy_bank = '{}'::json
WHERE weekly_buy_bank::text <> '{}'::text;`);
	});
}
