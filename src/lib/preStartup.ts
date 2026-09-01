import { cleanString, replaceWhitespaceAndUppercase } from '@oldschoolgg/toolkit';
import { type ItemBank, Items } from 'oldschooljs';

import { CUSTOM_PRICE_CACHE } from '@/lib/cache.js';
import { syncCollectionLogSlotTable } from '@/lib/collection-log/databaseCl.js';
import { badges, globalConfig } from '@/lib/constants.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';

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

export async function syncCustomPrices() {
	const clientData = await ClientSettings.fetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
		try {
			const item = Items.getOrThrow(Number(key));
			item.price = Number(value);
			Items.set(Number(key), item);
			Items.itemNameMap.set(cleanString(item.name), item.id);
			Items.itemNameMap.set(replaceWhitespaceAndUppercase(item.name), item.id);
			Items.itemNameMap.set(item.name, item.id);
		} catch (err) {
			Logging.logError(err as Error, { msg: `Failed to get item for price for ${key}` });
		}
	}
}

export const preStartup = async () => {
	await prisma.clientStorage.upsert({
		where: { id: globalConfig.clientID },
		create: { id: globalConfig.clientID },
		update: { shutdown: false },
		select: { id: true }
	});

	await Promise.all([
		syncCustomPrices(),
		GrandExchange.init(),
		cacheGEPrices(),
		syncCollectionLogSlotTable(),
		updateBadgeTable()
	]);
};
