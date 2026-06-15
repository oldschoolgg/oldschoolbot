import { BSOItem } from '@/lib/bso/BSOItem.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { handleCrateSpawns } from '@/lib/bso/handleCrateSpawns.js';
import { convertMysteriousBottleToSeaWater } from '@/lib/bso/sunScream.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, LootTable, randArrItem, SimpleTable } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import type { BeachCombingActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const BEACH_COMBING_PET = {
	itemID: BSOItem.PATRICIA,
	name: 'Patricia',
	emoji: '<:starfish:1515651612918677564>',
	baseRate: 6_000,
	clIncreaseMultiplier: 2
} as const;
const SUMMER_CRATE_S9_EMOJI = '<:s9chest:1515787545970081843>';

const noLootClosers = [
	'Mostly driftwood. Mostly shells. Mostly sand in the shoes.',
	'The beach kept its better secrets this time.',
	'Plenty of sea breeze, very little actual treasure.'
];
const junkTable = new LootTable()
	.add('Coins', [1, 100], 3)
	.add('Cannonball', 1, 1)
	.add('Raw lobster', [3, 6], 3)
	.add('Raw swordfish', [3, 6], 2)
	.add('Raw shark', [2, 4], 1)
	.add('Clue scroll (beginner)', [1, 2], 2)
	.tertiary(
		100,
		new LootTable()
			.add('Clue scroll (master)', 1, 1)
			.add('Clue scroll (elite)', 1, 2)
			.add('Clue scroll (hard)', 1, 5)
			.add('Clue scroll (medium)', [1, 2], 20)
			.add('Clue scroll (easy)', [1, 2], 25)
			.tertiary(100, 'Clue scroll (grandmaster)', 1)
	);

const brokenSummerCrate = new LootTable()
	.tertiary(2222, BSOItem.IMITATION_CRABHAT)
	.tertiary(1111, BSOItem.SUMMER_PARTYHAT)
	.tertiary(55, BSOItem.PAINT_BOX)
	.add(
		new LootTable()
			.add(BSOItem.CORAL_BIKINI_TOP)
			.add(BSOItem.CORAL_BIKINI_BOTTOM)
			.add(BSOItem.PALM_BOARD_SHORTS)
			.add(BSOItem.BEACH_SANDALS)
			.add(BSOItem.BEACH_SANDALS)
			.add(BSOItem.BEACHBALL_SHIELD)
			.add(BSOItem.BEACH_PINA_COLADA)
			.add(BSOItem.WHALE_FLOATY),
		1
	)
	.add(
		new LootTable()
			.add('Cake')
			.add('Purple sweets', [1, 3])
			.add('Baguette', 1, 10)
			.add('Kebab', 1, 10)
			.add('Spinach roll', 1, 6),
		1,
		35
	)
	.add(
		new LootTable()
			.add('Clue scroll (elite)', 1, 10)
			.add('Clue scroll (master)', 1, 5)
			.add('Clue scroll (grandmaster)', 1, 2)
			.add('Elder scroll piece', 1, 1)
			.tertiary(120, 'Clue scroll (elder)'),
		1,
		20
	);

function flip(rng: RNGProvider = MathRNG) {
	return rng.roll(2);
}

async function getBuriedTreasureChance() {
	const clientStorage = await prisma.clientStorage.findFirst({
		where: { id: globalConfig.clientID },
		select: { buried_treasure_winners: true }
	});
	const buriedTreasureWinners = (clientStorage?.buried_treasure_winners ?? {}) as Record<string, ItemBank>;

	const totalPrizes = Object.values(buriedTreasureWinners).reduce(
		(total, winnerBank) => total + Object.values(winnerBank).reduce((bankTotal, qty) => bankTotal + qty, 0),
		0
	);

	let chance = 1000;
	for (let i = 0; i < totalPrizes; i++) {
		chance *= 1.1;
	}
	return Math.ceil(chance);
}

async function rollBuriedTreasurePrize(userID: string, rng: RNGProvider = MathRNG) {
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

		const rolledItem = treasureLootTable.roll(rng);
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
	async run(data: BeachCombingActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, duration, method } = data;
		const minutes = Math.floor(duration / Time.Minute);
		const loot = new Bank();
		const discoveries: string[] = [];

		const hasCageBonus = user.hasEquipped(BSOItem.OLD_CRAB_CAGE);
		const hasPatricia = user.usingPet(BEACH_COMBING_PET.itemID);
		let crateDurationMultiplier = hasCageBonus ? 1.15 : 1;
		if (hasPatricia) {
			discoveries.push(
				`${BEACH_COMBING_PET.emoji} ${BEACH_COMBING_PET.name} spent the trip turning over shells, stones, and anything else that caught her eye.\n`
			);
			crateDurationMultiplier *= 1.2;
		}

		const summerCratesFound = handleCrateSpawns(user, duration * 10 * crateDurationMultiplier, 'trip');
		if (summerCratesFound && summerCratesFound.length > 0) {
			let summerCrateQty = 0;
			let damagedCrateQty = 0;
			for (let i = 0; i < summerCratesFound.amount(BSOItem.SUMMER_CRATE_S9); i++) {
				if (flip(rng)) {
					damagedCrateQty++;
				} else {
					summerCrateQty++;
				}
			}
			if (summerCrateQty > 0) {
				loot.add(BSOItem.SUMMER_CRATE_S9, summerCrateQty);
				discoveries.push(
					hasCageBonus
						? `🦀 Your old crab cage dragged in ${loot} from the shallows, tangled in kelp and clattering with seaside treasure.`
						: `🏖️ Half-buried beneath the tide line, your minion uncovered ${loot} tucked away in the wet sand.`
				);
			}
			if (damagedCrateQty > 0) {
				let destroyedLootQty = 0;
				for (let i = damagedCrateQty; i > 0; i--) {
					const destroyedChance = hasCageBonus ? 50 : 75;
					if (rng.percentChance(destroyedChance)) {
						destroyedLootQty++;
					}
				}
				const salvagedLootQty = damagedCrateQty - destroyedLootQty;
				const damagedLoot = new Bank();
				if (salvagedLootQty > 0) damagedLoot.add(brokenSummerCrate.roll(salvagedLootQty, { rng }));
				discoveries.push(
					hasCageBonus
						? `🐚 Your old crab cage helped snag ${damagedCrateQty} crate${damagedCrateQty === 1 ? '' : 's'} from the surf, but they broke open on the way back. You managed to salvage ${damagedLoot}.`
						: `🌊 You dug up ${damagedCrateQty} crate${damagedCrateQty === 1 ? '' : 's'}, but ${damagedCrateQty === 1 ? '' : 'each time'} a wave hit you right as you found it. You managed to salvage ${damagedLoot}.`
				);
				loot.add(damagedLoot);
			}
		}

		const crateKeyLoot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(200)) {
				crateKeyLoot.add(BSOItem.SUMMER_CRATE_KEY_S9);
			}
		}
		if (crateKeyLoot.length > 0) {
			discoveries.push(`${SUMMER_CRATE_S9_EMOJI} Your minion found ${crateKeyLoot} buried in the wet sand!`);
		}
		loot.add(crateKeyLoot);

		const patriciaRate = clAdjustedDroprate(
			user,
			BEACH_COMBING_PET.itemID,
			BEACH_COMBING_PET.baseRate,
			BEACH_COMBING_PET.clIncreaseMultiplier
		);
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(patriciaRate)) {
				loot.add(BEACH_COMBING_PET.itemID);
				discoveries.push(
					`${BEACH_COMBING_PET.emoji} A bright little starfish clung to the shoreline and decided ${BEACH_COMBING_PET.name} lives with you now.`
				);
				break;
			}
		}
		const buriedTreasureChance = await getBuriedTreasureChance();
		const secretLoot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (!rng.roll(buriedTreasureChance)) continue;
			const buriedTreasureItem = await rollBuriedTreasurePrize(user.id, rng);
			if (buriedTreasureItem === null) break;
			secretLoot.add(buriedTreasureItem);
			discoveries.push(
				`# 🏴‍☠️🏴‍☠️🏴‍☠️\n🤯 A buried cache was pried loose from the shoreline stash...  ---   **... You just found one of Cyr's Treasure Chests!!!**\nIt contains ${secretLoot}.\n`
			);
		}

		if (user.hasEquipped(BSOItem.MYSTERIOUS_BOTTLE)) {
			const mysteriousBottleChance =
				method === 'Surfing' ? (hasPatricia ? 150 : 300) : hasPatricia ? 600 : 900;
			for (let i = 0; i < minutes; i++) {
				if (!rng.roll(mysteriousBottleChance)) continue;
				if (await convertMysteriousBottleToSeaWater(user)) {
					discoveries.push(
						method === 'Surfing'
							? `🌊 Your Mysterious bottle filled with foaming violet seawater while carving through the surf. It is now a **Bottle of sea water**.`
							: `🫧 Your Mysterious bottle caught a strange dark-purple wash from the shoreline. It is now a **Bottle of sea water**.`
					);
				}
				break;
			}
		}

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

		let activityStr = 'Drowning';
		switch (method) {
			case 'Surfing':
				activityStr = 'Surfing';
				break;
			case 'BeachCombing':
				activityStr = 'Combing the sand for treasures';
				break;
			case 'PickupTrash':
				activityStr = 'Beautifying the beach';
				break;
			case 'BuildSandcastles':
				activityStr = 'Building sandcastles';
				break;
			default:
				activityStr = 'Drowning';
		}

		if (hasPatricia && rng.roll(50))
			discoveries.push(
				`📜 You found and old note while ${activityStr} on the beach! It's tattered and damaged from weathering, but you can see it says something about fishing? There's a familiar symbol on the page, too... ${rng.roll(30) ? `${BEACH_COMBING_PET.emoji}` : `𓇼`}`
			);

		let junkQty = 1;
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(10)) junkQty++;
		}
		const junkLoot = new Bank();
		junkLoot.add(junkTable.roll(junkQty, { rng }));
		loot.add(junkLoot);
		let content = `${user}, ${intro}\n\n${user.minionName} finished beach combing for ${minutes} minutes with a focus on ${method}.`;
		if (discoveries.length > 0) {
			content += `\n\n${discoveries.join('\n')}`;
			content += `\n\n${outro} You also found this junk: ${junkLoot}.`;
		} else {
			content += `\n\n${outro} ${randArrItem(noLootClosers)}. You didn't go away totally empty handed, you did find ${junkLoot}.`;
		}
		const { itemsAdded: secretItemsAdded } = await user.transactItems({
			itemsToAdd: secretLoot,
			dontAddToTempCL: true,
			collectionLog: false
		});

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded.add(secretItemsAdded),
						title: 'Beach Combing Finds:',
						user,
						previousCL: previousCL.add(secretItemsAdded)
					});

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
