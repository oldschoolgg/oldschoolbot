import { noOp } from '@oldschoolgg/toolkit';
import type { ItemBank } from 'oldschooljs';

import { syncBlacklists } from '@/lib/blacklists.js';
import { usernameWithBadgesCache } from '@/lib/cache.js';
import { GeImageGenerator } from '@/lib/canvas/geImage.js';
import { syncCollectionLogSlotTable } from '@/lib/collection-log/databaseCl.js';
import { badges, globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';
import { populateRoboChimpCache } from '@/lib/perkTier.js';
import { RawSQL } from '@/lib/rawSql.js';
import { syncActiveUserIDs } from '@/lib/util/cachedUserIDs.js';
import { syncDisabledCommands } from '@/lib/util/syncDisabledCommands.js';
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
	for (const user of users) {
		if (!user.username_with_badges) continue;
		usernameWithBadgesCache.set(user.id, user.username_with_badges);
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
		update: {}
	});

	await Promise.all([
		GeImageGenerator.init(),
		syncActiveUserIDs(),
		ActivityManager.syncActivityCache(),
		syncDisabledCommands(),
		syncBlacklists(),
		syncCustomPrices(),
		GrandExchange.init(),
		populateRoboChimpCache(),
		cacheGEPrices(),
		prisma.$queryRawUnsafe(RawSQL.updateAllUsersCLArrays()).then(noOp),
		syncCollectionLogSlotTable(),
		updateBadgeTable(),
		populateUsernameCache()
	]);
});
