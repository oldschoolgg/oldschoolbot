import { Bank, LootTable } from 'oldschooljs';
import type { ManagingMiscellaniaActivityTaskOptions } from '../lib/types/minions';
import { handleTripFinish } from '../lib/util/handleTripFinish';
import { makeBankImage } from '../lib/util/makeBankImage';
import { updateBankSetting } from '../lib/util/updateBankSetting';
import { userStatsUpdate } from '../mahoji/mahojiSettings';

const nests = new LootTable()
	.add('Bird nest (seed)', 1, 65)
	.add('Bird nest (ring)', 1, 32)
	.add('Bird nest (green egg)', 1, 1)
	.add('Bird nest (blue egg)', 1, 1)
	.add('Bird nest (red egg)', 1, 1);

const miningGems = new LootTable()
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Uncut ruby', 1, 8)
	.add('Uncut diamond', 1, 2);

const fishingLoot = new LootTable()
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Uncut ruby', 1, 8)
	.add('Uncut diamond', 1, 2)
	.add('Casket', 1, 32)
	.add('Fremennik boots', 1, 4)
	.add('Fremennik gloves', 1, 4)
	.add('Loop half of key', 1, 1)
	.add('Tooth half of key', 1, 1)
	.add('Clue scroll (easy)', 1, 4);

const herbsLoot = new LootTable()
	.add('Grimy tarromin', 1, 10)
	.add('Grimy harralander', 1, 9)
	.add('Grimy irit leaf', 1, 6)
	.add('Grimy avantoe', 1, 6)
	.add('Grimy ranarr weed', 1, 3)
	.add('Grimy kwuarm', 1, 3)
	.add('Grimy cadantine', 1, 3)
	.add('Grimy dwarf weed', 1, 3)
	.add('Grimy lantadyme', 1, 3);

const herbSeedsLoot = new LootTable()
	.add('Guam seed', 1, 320)
	.add('Marrentill seed', 1, 218)
	.add('Tarromin seed', 1, 149)
	.add('Harralander seed', 1, 101)
	.add('Ranarr seed', 2, 69) // Max of 2
	.add('Toadflax seed', 1, 47)
	.add('Irit seed', 1, 32)
	.add('Avantoe seed', 1, 22)
	.add('Kwuarm seed', 1, 15)
	.add('Snapdragon seed', 1, 10)
	.add('Cadantine seed', 1, 7)
	.add('Lantadyme seed', 1, 5)
	.add('Dwarf weed seed', 1, 3)
	.add('Torstol seed', 1, 2);

const flaxSeedsLoot = new LootTable()
	.add('Guam seed', 1, 320)
	.add('Marrentill seed', 1, 218)
	.add('Tarromin seed', 1, 149)
	.add('Harralander seed', 1, 101)
	.add('Ranarr seed', 1, 69)
	.add('Toadflax seed', 1, 47)
	.add('Irit seed', 1, 32)
	.add('Avantoe seed', 1, 22)
	.add('Kwuarm seed', 1, 15)
	.add('Snapdragon seed', 1, 10)
	.add('Cadantine seed', 1, 7)
	.add('Lantadyme seed', 1, 5)
	.add('Dwarf weed seed', 1, 3)
	.add('Torstol seed', 1, 2);

const treeSeedsLoot = new LootTable()
	.add('Acorn', 1, 214) // Max 4
	.add('Apple tree seed', 1, 170) // Max 4
	.add('Willow seed', 1, 135) // Max 4
	.add('Banana tree seed', 1, 108) // Max 4
	.add('Orange tree seed', 1, 85) // Max 4
	.add('Curry tree seed', 1, 68) // Max 4
	.add('Maple seed', 1, 54) // Max 4
	.add('Pineapple seed', 1, 42) // Max 4
	.add('Papaya tree seed', 1, 34) // Max 4
	.add('Yew seed', 1, 27) // Max 4
	.add('Palm tree seed', 1, 22) // Max 4
	.add('Calquat tree seed', 1, 17) // Max 4
	.add('Spirit seed', 1, 11) // Max 4
	.add('Dragonfruit tree seed', 1, 6) // Max 4
	.add('Magic seed', 1, 5) // Max 4
	.add('Teak seed', 1, 4) // Max 4
	.add('Mahogany seed', 1, 4) // Max 4
	.add('Celastrus seed', 1, 3) // Max 4
	.add('Redwood tree seed', 1, 2); // Max 4

const seedsLoot = new LootTable()
	.add('Potato seed', 1, 1567735)
	.add('Onion seed', 1, 1180708)
	.add('Cabbage seed', 1, 619972)
	.add('Tomato seed', 1, 561932)
	.add('Barley seed', 1, 497148)
	.add('Hammerstone seed', 1, 494318)
	.add('Marigold seed', 1, 409668)
	.add('Asgarnian seed', 1, 369067)
	.add('Jute seed', 1, 368455)
	.add('Redberry seed', 1, 343409)
	.add('Nasturtium seed', 1, 270351)
	.add('Yanillian seed', 1, 245383)
	.add('Cadavaberry seed', 1, 242164)
	.add('Sweetcorn seed', 1, 197249)
	.add('Rosemary seed', 1, 173977)
	.add('Dwellberry seed', 1, 172110)
	.add('Guam seed', 1, 135320)
	.add('Woad seed', 1, 129804)
	.add('Krandorian seed', 1, 122649)
	.add('Limpwurt seed', 1, 103567)
	.add('Strawberry seed', 1, 97042)
	.add('Marrentill seed', 1, 93062)
	.add('Jangerberry seed', 1, 69567)
	.add('Wildblood seed', 1, 62976)
	.add('Tarromin seed', 1, 62551)
	.add('Watermelon seed', 1, 47071)
	.add('Harralander seed', 1, 43198)
	.add('Snape grass seed', 1, 34094)
	.add('Whiteberry seed', 1, 24586)
	.add('Toadflax seed', 1, 19990)
	.add('Mushroom spore', 1, 19266)
	.add('Irit seed', 1, 14019)
	.add('Belladonna seed', 1, 11594)
	.add('Avantoe seed', 1, 9229)
	.add('Poison ivy seed', 1, 9199)
	.add('Cactus seed', 1, 7850)
	.add('Kwuarm seed', 1, 6599)
	.add('Ranarr seed', 1, 5305)
	.add('Snapdragon seed', 1, 3901)
	.add('Potato cactus seed', 1, 3790)
	.add('Cadantine seed', 1, 2817)
	.add('Lantadyme seed', 1, 2097)
	.add('Seaweed spore', 1, 1508)
	.add('Dwarf weed seed', 1, 1208)
	.add('Torstol seed', 1, 810);

interface InverseCostTable {
	[key: string]: number;
}

const inverseCostTable: InverseCostTable = {
	Wood: 160,
	Mining: 98,
	Fishing: 158,
	'Cooked Fish': 158,
	Herbs: 11,
	Flax: 224,
	Mahogany: 40,
	Teak: 54,
	'Hardwood (Mahogany and Teak)': 47,
	Farm: 86
};

function getBaseQuantity(materialCategory: string, workers: number, resourcePoints: number): number {
	const inverseCost = inverseCostTable[materialCategory];
	if (inverseCost === undefined) {
		throw new Error(`Unknown material category: ${materialCategory}`);
	}
	return Math.floor((workers * inverseCost * resourcePoints) / 2048);
}

export const managingMiscellaniaTask: MinionTask = {
	type: 'ManagingMiscellania',
	async run(data: ManagingMiscellaniaActivityTaskOptions) {
		const { userID, channelID, mainCollect, secondaryCollect, cofferCost } = data;
		const user = await mUserFetch(userID);
		const loot = new Bank();

		const daysDifference = Math.round(cofferCost / 7500);
		const dailyResourcePoints = 600;
		const totalResourcePoints = dailyResourcePoints * daysDifference;

		const mainQty = getBaseQuantity(mainCollect, 10, totalResourcePoints);
		const secondaryQty = getBaseQuantity(secondaryCollect, 5, totalResourcePoints);

		await userStatsUpdate(user.id, { last_managing_miscellania_timestamp: new Date().getTime() }, {});

		function addLoot(category: string, quantity: number) {
			switch (category) {
				case 'Wood':
					loot.add('Maple logs', quantity);
					loot.add(nests.roll(Math.min(999, Math.floor(quantity / 100))));
					break;
				case 'Mining':
					loot.add('Maple logs', quantity);
					loot.add(miningGems.roll(Math.floor(quantity / 200 + 0.5)));
					break;
				case 'Fishing':
					loot.add('Raw tuna', Math.floor(0.5 * quantity));
					loot.add('Raw swordfish', Math.floor(0.15 * quantity));
					loot.add(fishingLoot.roll(Math.floor(quantity / 200)));
					break;
				case 'Cooked Fish':
					loot.add('Tuna', Math.floor(0.5 * quantity));
					loot.add('Swordfish', Math.floor(0.15 * quantity));
					loot.add(fishingLoot.roll(Math.floor(quantity / 200)));
					break;
				case 'Herbs':
					loot.add(herbsLoot.roll(quantity));
					loot.add(herbSeedsLoot.roll(Math.floor(quantity / 100)));
					break;
				case 'Flax':
					loot.add('Flax', quantity);
					loot.add(flaxSeedsLoot.roll(Math.floor(quantity / 600)));
					break;
				case 'Mahogany':
					loot.add('Mahogany logs', quantity);
					loot.add(nests.roll(Math.floor(quantity / 350)));
					break;
				case 'Teak':
					loot.add('Teak logs', quantity);
					loot.add(nests.roll(Math.floor(quantity / 350)));
					break;
				case 'Hardwood (Mahogany and Teak)':
					loot.add('Mahogany logs', Math.floor(quantity * 0.5));
					loot.add('Teak logs', Math.floor(quantity * 0.5));
					loot.add(nests.roll(Math.floor(quantity / 350)));
					break;
				case 'Farm':
					loot.add(seedsLoot.roll(quantity));
					loot.add(treeSeedsLoot.roll(Math.floor(quantity / 200)));
					break;
			}
		}

		addLoot(mainCollect, mainQty);
		addLoot(secondaryCollect, secondaryQty);

		const str = `${user}, ${user.minionName} finished collecting from the kingdom, you received ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		updateBankSetting('managing_miscellania_loot', loot);

		const image = await makeBankImage({ bank: loot, title: 'Managing Miscellania Loot', user });

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
