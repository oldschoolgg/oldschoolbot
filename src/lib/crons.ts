import { schedule } from 'node-cron';

import { analyticsTick } from './analytics';
import { cacheGEPrices } from './marketPrices';
import { cacheCleanup } from './util/cachedUserIDs';

export const crons = new Set<ReturnType<typeof schedule>>();

export function initCrons() {
	/**
	 * Capture economy item data
	 */
	crons.add(
		schedule('0 */6 * * *', async () => {
			await prisma.$queryRawUnsafe(`INSERT INTO economy_item
SELECT item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users) AS banks
)
AS DATA
GROUP BY item_id;`);
		})
	);

	/**
	 * Analytics
	 */
	crons.add(
		schedule('*/5 * * * *', () => {
			return analyticsTick();
		})
	);

	/**
	 * prescence
	 */
	crons.add(
		schedule('0 * * * *', () => {
			globalClient.user?.setActivity('/help');
		})
	);

	/**
	 * Delete all voice channels
	 */
	crons.add(
		schedule('0 0 */1 * *', async () => {
			cacheCleanup();
		})
	);

	crons.add(
		schedule('35 */48 * * *', async () => {
			await cacheGEPrices();
		})
	);
}
