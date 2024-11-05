import { schedule } from 'node-cron';

import { analyticsTick } from './analytics';
import { cacheGEPrices } from './marketPrices';
import { cacheCleanup } from './util/cachedUserIDs';

export function initCrons() {
	/**
	 * Capture economy item data
	 */
	schedule('0 */6 * * *', async () => {
		await prisma.$queryRawUnsafe(`INSERT INTO economy_item
SELECT item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users) AS banks
)
AS DATA
GROUP BY item_id;`);
	});

	/**
	 * Analytics
	 */
	schedule('*/5 * * * *', () => {
		return analyticsTick();
	});

	/**
	 * prescence
	 */
	schedule('0 * * * *', () => {
		globalClient.user?.setActivity('/help');
	});

	/**
	 * Delete all voice channels
	 */
	schedule('0 0 */1 * *', async () => {
		cacheCleanup();
	});

	schedule('35 */48 * * *', async () => {
		await cacheGEPrices();
	});
}
