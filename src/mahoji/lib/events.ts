import { syncDoubleLoot } from '@/lib/bso/doubleLoot.js';
import { syncSlayerMaskLeaderboardCache } from '@/lib/bso/skills/slayer/slayerMaskLeaderboard.js';

import type { ItemBank } from 'oldschooljs';

import { startBlacklistSyncing } from '@/lib/blacklists.js';
import { usernameWithBadgesCache } from '@/lib/cache.js';
import { badges, Channel, globalConfig, META_CONSTANTS } from '@/lib/constants.js';
import { initCrons } from '@/lib/crons.js';
import { bulkUpdateCommands } from '@/lib/discord/utils.js';
import { initTickers } from '@/lib/tickers.js';
import { sendToChannelID } from '@/lib/util/webhook.js';
import { logWrapFn } from '@/lib/util.js';
import { CUSTOM_PRICE_CACHE } from '@/mahoji/commands/sell.js';

export async function syncCustomPrices() {
	const clientData = await ClientSettings.fetch({ custom_prices: true });
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
	await syncDoubleLoot();
	initCrons();
	initTickers();
	syncSlayerMaskLeaderboardCache();

	if (globalConfig.isProduction) {
		sendToChannelID(Channel.GeneralChannel, {
			content: `I have just turned on!\n\n${META_CONSTANTS.RENDERED_STR}`
		}).catch(console.error);
	} else {
		// In development, always sync commands on startup.
		await bulkUpdateCommands();
	}

	globalClient.application.commands.fetch({
		guildId: globalConfig.isProduction ? undefined : globalConfig.supportServerID
	});
	updateBadgeTable();
	startBlacklistSyncing();

	populateUsernameCache();
});
