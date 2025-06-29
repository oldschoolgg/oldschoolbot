import type { ItemBank } from 'oldschooljs';

import { startBlacklistSyncing } from '../../lib/blacklists';
import { usernameWithBadgesCache } from '../../lib/cache';
import { Channel, META_CONSTANTS, badges, globalConfig } from '../../lib/constants';
import { initCrons } from '../../lib/crons';
import { initTickers } from '../../lib/tickers';
import { logWrapFn } from '../../lib/util';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
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

async function populateUsernameCache() {
	const users = await prisma.user.findMany({
		where: {
			username_with_badges: {
				not: null
			}
		},
		select: {
			id: true,
			username_with_badges: true
		}
	});
	for (const user of users) {
		if (!user.username_with_badges) continue;
		usernameWithBadgesCache.set(user.id, user.username_with_badges);
	}
}

export const onStartup = logWrapFn('onStartup', async () => {
	initCrons();
	initTickers();

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

	populateUsernameCache();
});
