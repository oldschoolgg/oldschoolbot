import { schedule } from 'node-cron';

import { prisma } from './settings/prisma';
import { OldSchoolBotClient } from './structures/OldSchoolBotClient';

export function initCrons(client: OldSchoolBotClient) {
	/**
	 * Reset weekly buy banks
	 */
	schedule('0 0 * * 0', async () => {
		await prisma.$queryRawUnsafe(`UPDATE users
SET weekly_buy_bank = '{}'::json
WHERE weekly_buy_bank::text <> '{}'::text;`);
	});
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
}
