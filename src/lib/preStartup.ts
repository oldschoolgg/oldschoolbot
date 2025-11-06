import type { ItemBank } from 'oldschooljs';
import PQueue from 'p-queue';

import { syncBlacklists } from '@/lib/blacklists.js';
import { syncCollectionLogSlotTable } from '@/lib/collection-log/databaseCl.js';
import { badges, globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';
import { populateRoboChimpCache } from '@/lib/perkTier.js';
import { logWrapFn } from '@/lib/util.js';
import { CUSTOM_PRICE_CACHE } from '@/mahoji/commands/sell.js';

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
	console.log(`Populating username cache with ${users.length}x... (this should be removed soon`);

	const queue = new PQueue({ concurrency: 10 });
	for (const user of users) {
		if (!user.username_with_badges) return;
		queue.add(async () => Cache.setBadgedUsername(user.id, user.username_with_badges!));
	}
}

export async function syncCustomPrices() {
	const clientData = await ClientSettings.fetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export const preStartup = logWrapFn('PreStartup', async () => {
	await prisma.clientStorage.upsert({
		where: { id: globalConfig.clientID },
		create: { id: globalConfig.clientID },
		update: {},
		select: { id: true }
	});

	await Promise.all([
		ActivityManager.syncActivityCache(),
		syncBlacklists(),
		syncCustomPrices(),
		GrandExchange.init(),
		populateRoboChimpCache(),
		cacheGEPrices(),
		syncCollectionLogSlotTable(),
		updateBadgeTable(),
		populateUsernameCache()
	]);
});
