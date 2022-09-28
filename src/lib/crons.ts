import { ChannelType } from 'discord.js';
import { schedule } from 'node-cron';

import { analyticsTick } from './analytics';
import { syncPrescence } from './doubleLoot';
import { prisma } from './settings/prisma';
import { runTimedLoggedFn } from './util';

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
	schedule('*/5 * * * *', analyticsTick);

	/**
	 * prescence
	 */
	schedule('0 * * * *', () => {
		syncPrescence();
	});

	/**
	 * Delete all voice channels
	 */
	schedule('*/5 * * * *', async () => {
		await runTimedLoggedFn('Delete Voice Channels', async () => {
			for (const channel of globalClient.channels.cache.values()) {
				if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildCategory) {
					globalClient.channels.cache.delete(channel.id);
				}
			}
		});
	});
}
