import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { startBlacklistSyncing } from '../../lib/blacklists';
import { Channel, META_CONSTANTS, badges, globalConfig } from '../../lib/constants';
import { initCrons } from '../../lib/crons';
import { syncDoubleLoot } from '../../lib/doubleLoot';

import { initTickers } from '../../lib/tickers';
import { logWrapFn } from '../../lib/util';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { syncSlayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { sendToChannelID } from '../../lib/util/webhook';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

async function updateBadgeTable() {
	const badgesInDb = await prisma.badges.findMany();
	for (const [_id, emojiString] of Object.entries(badges)) {
		const id = Number(_id);
		if (!badgesInDb.find(b => b.id === id)) {
			await prisma.badges.create({
				data: {
					id,
					text: emojiString
				}
			});
		}
	}
}

export const onStartup = logWrapFn('onStartup', async () => {
	await syncDoubleLoot();
	initCrons();
	initTickers();
	syncSlayerMaskLeaderboardCache();

	if (globalConfig.isProduction) {
		sendToChannelID(Channel.GeneralChannel, {
			content: `I have just turned on!\n\n${META_CONSTANTS.RENDERED_STR}`
		}).catch(console.error);
	}

	globalClient.application.commands.fetch({
		guildId: globalConfig.isProduction ? undefined : globalConfig.supportServerID
	});
	updateBadgeTable();
	startBlacklistSyncing();
});
