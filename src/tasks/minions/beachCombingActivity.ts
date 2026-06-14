import { BSOItem } from '@/lib/bso/BSOItem.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { handleCrateSpawns } from '@/lib/bso/handleCrateSpawns.js';

import { SimpleTable, Time } from '@oldschoolgg/toolkit';
import { randArrItem, roll } from 'node-rng';
import { Bank, type ItemBank } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import type { BeachCombingActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const BEACH_COMBING_PET = {
	itemID: BSOItem.PATRICIA,
	name: 'Patricia',
	emoji: '<:starfish:1508057689645402152>',
	baseRate: 6_000,
	clIncreaseMultiplier: 2
} as const;

const noLootClosers = [
	'Mostly driftwood. Mostly shells. Mostly sand in the shoes.',
	'The beach kept its better secrets this time.',
	'Plenty of sea breeze, very little actual treasure.'
];

async function rollBuriedTreasurePrize(userID: string) {
	return prisma.$transaction(async tx => {
		const clientStorage = await tx.clientStorage.findFirst({
			where: { id: globalConfig.clientID },
			select: { buried_treasure_bank: true, buried_treasure_winners: true }
		});
		const buriedTreasureBank = (clientStorage?.buried_treasure_bank ?? {}) as ItemBank;
		if (Object.keys(buriedTreasureBank).length === 0) {
			return null;
		}

		const buriedTreasureWinners = (clientStorage?.buried_treasure_winners ?? {}) as Record<string, ItemBank>;
		const treasureLootTable = new SimpleTable<number>();

		for (const [itemId, qty] of Object.entries(buriedTreasureBank)) {
			treasureLootTable.add(Number(itemId), qty);
		}

		const rolledItem = treasureLootTable.roll();
		if (rolledItem === null) return null;

		const updatedTreasureBank = new Bank(buriedTreasureBank).remove(rolledItem, 1);
		const updatedWinnerBank = new Bank(buriedTreasureWinners[userID] ?? {}).add(rolledItem, 1);
		await tx.clientStorage.update({
			where: { id: globalConfig.clientID },
			data: {
				buried_treasure_bank: updatedTreasureBank.toJSON(),
				buried_treasure_winners: {
					...buriedTreasureWinners,
					[userID]: updatedWinnerBank.toJSON()
				}
			}
		});

		return rolledItem;
	});
}

export const beachCombingTask: MinionTask = {
	type: 'BeachCombing',
	async run(data: BeachCombingActivityTaskOptions, { user, handleTripFinish }) {
		const { channelId, duration, method } = data;
		const minutes = Math.floor(duration / Time.Minute);
		const loot = new Bank();
		const discoveries: string[] = [];

		const crateDurationMultiplier = user.hasEquipped(BSOItem.OLD_CRAB_CAGE) ? 1.1 : 1;
		const summerCrates = handleCrateSpawns(user, duration * 10 * crateDurationMultiplier, 'trip');
		if (summerCrates && summerCrates.length > 0) {
			loot.add(summerCrates);
			discoveries.push(
				user.hasEquipped(BSOItem.OLD_CRAB_CAGE)
					? `Your old crab cage helped snag ${summerCrates} from the surf.`
					: `A wave coughed up ${summerCrates}.`
			);
		}

		for (let i = 0; i < minutes; i++) {
			if (roll(200)) {
				loot.add(BSOItem.SUMMER_CRATE_KEY_S9);
			}
		}
		if (loot.amount(BSOItem.SUMMER_CRATE_KEY_S9) > 0) {
			discoveries.push(
				`Your minion found ${new Bank().add(BSOItem.SUMMER_CRATE_KEY_S9, loot.amount(BSOItem.SUMMER_CRATE_KEY_S9))} buried in the wet sand.`
			);
		}

		const patriciaRate = clAdjustedDroprate(
			user,
			BEACH_COMBING_PET.itemID,
			BEACH_COMBING_PET.baseRate,
			BEACH_COMBING_PET.clIncreaseMultiplier
		);
		let foundBeachPet = false;
		for (let i = 0; i < minutes; i++) {
			if (roll(patriciaRate)) {
				foundBeachPet = true;
				break;
			}
		}
		if (foundBeachPet) {
			loot.add(BEACH_COMBING_PET.itemID);
			discoveries.push(
				`${BEACH_COMBING_PET.emoji} A bright little starfish clung to the shoreline and decided ${BEACH_COMBING_PET.name} lives with you now.`
			);
		}

		let buriedTreasureFinds = 0;
		for (let i = 0; i < minutes; i++) {
			if (!roll(1000)) continue;
			const buriedTreasureItem = await rollBuriedTreasurePrize(user.id);
			if (buriedTreasureItem === null) continue;
			buriedTreasureFinds++;
			loot.add(buriedTreasureItem);
		}
		if (buriedTreasureFinds > 0) {
			discoveries.push(
				`${buriedTreasureFinds === 1 ? 'One' : buriedTreasureFinds.toString()} buried cache${
					buriedTreasureFinds === 1 ? ' was' : 's were'
				} pried loose from the shoreline stash.`
			);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded,
						title: 'Beach Combing Finds:',
						user,
						previousCL
					});

		let intro = '';
		let outro = '';
		switch (method) {
			case 'Surfing':
				intro =
					'Your minion spent the trip paddling after waves, wiping out dramatically, and occasionally noticing useful things in the foam.';
				outro = 'Mostly saltwater, style penalties, and the occasional good find.';
				break;
			case 'BeachCombing':
				intro =
					'Your minion walked the tide line with intense focus, checking shells, kelp piles and every vaguely treasure-shaped lump.';
				outro = 'A classic day of sand, shells and questionable optimism.';
				break;
			case 'BuildSandcastles':
				intro =
					'Your minion built ambitious sandcastles, then immediately looted the surrounding moat for anything the sea had delivered.';
				outro = 'The castles looked magnificent right up until the tide disagreed.';
				break;
			case 'PickupTrash':
				intro =
					'Your minion cleaned the shoreline, salvaged odd scraps and kept anything that looked less like rubbish and more like buried luck.';
				outro = 'The beach looked cleaner, even if the loot stayed modest.';
				break;
		}

		let content = `${user}, ${intro}\n\n${user.minionName} finished beach combing for ${minutes} minutes with a focus on ${method}.`;
		if (discoveries.length > 0) {
			content += `\n\n${discoveries.join('\n')}`;
		}
		if (itemsAdded.length > 0) {
			content += `\n\nRecovered loot: ${itemsAdded}.`;
		} else {
			content += `\n\n${outro} ${randArrItem(noLootClosers)}`;
		}

		return handleTripFinish({
			user,
			channelId,
			message: {
				content,
				files: [image]
			},
			data,
			loot: itemsAdded
		});
	}
};
