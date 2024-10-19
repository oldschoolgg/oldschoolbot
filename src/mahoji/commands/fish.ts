import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank, EItem, Monsters } from 'oldschooljs';

import { WildernessDiary, userhasDiaryTier } from '../../lib/diaries';
import Fishing, { anglerItemsArr } from '../../lib/skilling/skills/fishing';
import type { Fish } from '../../lib/skilling/types';
import type { GearBank } from '../../lib/structures/GearBank';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import type { OSBMahojiCommand } from '../lib/util';

function radasBlessing(gearBank: GearBank) {
	const blessingBoosts = [
		["Rada's blessing 4", 8],
		["Rada's blessing 3", 6],
		["Rada's blessing 2", 4],
		["Rada's blessing 1", 2]
	];

	for (const [itemName, boostPercent] of blessingBoosts) {
		if (gearBank.hasEquipped(itemName)) {
			return { blessingEquipped: true, blessingChance: boostPercent as number };
		}
	}
	return { blessingEquipped: false, blessingChance: 0 };
}

function rollExtraLoot(
	lootAmount: number,
	flakesUsed: number,
	currentInv: number,
	blessingChance: number,
	spirit_flakes: boolean,
	flakesQuantity: number
): [number, number, number] {
	currentInv++;
	if (Math.random() < blessingChance / 100) {
		lootAmount++;
		currentInv++;
	}
	if (spirit_flakes && flakesUsed < flakesQuantity && Math.random() < 0.5) {
		lootAmount++;
		flakesUsed++;
		currentInv++;
	}
	// Return updated values
	return [lootAmount, flakesUsed, currentInv];
}

function determineFishingTime({
	quantity,
	tripTicks,
	isPowerfishing,
	isUsingSpiritFlakes,
	fish,
	gearBank,
	invSlots,
	blessingChance,
	flakesQuantity,
	harpoonBoost,
	hasWildyEliteDiary
}: {
	quantity: number;
	tripTicks: number;
	isPowerfishing: boolean;
	isUsingSpiritFlakes: boolean;
	fish: Fish;
	gearBank: GearBank;
	invSlots: number;
	blessingChance: number;
	flakesQuantity: number;
	harpoonBoost: number;
	hasWildyEliteDiary: boolean;
}) {
	let ticksElapsed = 0;
	let flakesUsed = 0;
	let currentInv = 0;

	const fishCount = fish.subfishes!.length; // how many fish in the spot
	const catches: number[] = new Array(fishCount).fill(0);
	const lootAmount: number[] = new Array(fishCount).fill(0);

	const fishLvl = gearBank.skillsAsLevels.fishing;
	let effFishLvl = fishLvl;

	// Apply fishing guild boost
	if (fishLvl > 68) {
		if (fish.name === 'Shark' || fish.name === 'Mackerel/Cod/Bass' || fish.name === 'Lobster') {
			effFishLvl += 7; // fishing guild boost
		} else if (fish.name === 'Tuna/Swordfish' && !isPowerfishing) {
			effFishLvl += 7; // can't 2t in the guild
		}
	}

	// Calculate the base probabilities
	const probabilities = fish.subfishes!.map(subfish => {
		return harpoonBoost * (subfish.intercept + (effFishLvl - 1) * subfish.slope);
	});

	// Dark Crab with Wildy Elite Diary
	if (fish.name === 'Dark crab' && hasWildyEliteDiary) {
		const adjustedIntercept = 0.0961;
		const adjustedSlope = 0.0025;

		probabilities[0] = harpoonBoost * (adjustedIntercept + (effFishLvl - 1) * adjustedSlope);
	}

	let ticksPerRoll = fish.ticksPerRoll!;
	let lostTicks = fish.lostTicks!;
	let bankingTime = fish.bankingTime;

	// tick manipulation
	if (fish.name === 'Barbarian fishing') {
		if (isPowerfishing) {
			ticksPerRoll = 3;
			lostTicks = 0.06; // more focused
		}
		if (gearBank.hasEquippedOrInBank(['Fishing cape', 'Fishing cape (t)', 'Max cape'])) {
			bankingTime = 20;
		}
	} else if (fish.name === 'Trout/Salmon') {
		if (isPowerfishing) {
			ticksPerRoll = 3;
			lostTicks = 0.06;
		}
	} else if (fish.name === 'Tuna/Swordfish') {
		if (isPowerfishing) {
			ticksPerRoll = 2;
			lostTicks = 0.05;
		}
	}

	// Main fishing logic
	if (isPowerfishing) {
		while (ticksElapsed < tripTicks) {
			// Loop over subfishes in reverse order (highest level first)
			for (let i = fishCount - 1; i >= 0; i--) {
				if (fishLvl >= fish.subfishes![i].level && Math.random() < probabilities[i]) {
					catches[i]++;
					break; // Only catch one fish per roll, exit loop
				}
			}

			ticksElapsed += ticksPerRoll * (1 + lostTicks);

			if (catches.reduce((acc, curr) => acc + curr, 0) >= quantity) {
				break;
			}
		}
	} else {
		while (ticksElapsed < tripTicks) {
			for (let i = fishCount - 1; i >= 0; i--) {
				if (fishLvl >= fish.subfishes![i].level && Math.random() < probabilities[i]) {
					catches[i]++;
					lootAmount[i]++;
					[lootAmount[i], flakesUsed, currentInv] = rollExtraLoot(
						lootAmount[i],
						flakesUsed,
						currentInv,
						blessingChance,
						isUsingSpiritFlakes,
						flakesQuantity
					);
					break;
				}
			}

			ticksElapsed += ticksPerRoll * (1 + lostTicks);

			if (catches.reduce((acc, curr) => acc + curr, 0) >= quantity) {
				break;
			}

			// Check if the inventory is full and add banking time if necessary
			if (currentInv >= invSlots) {
				ticksElapsed += bankingTime!;
				currentInv = 0; // Reset inventory count after banking
			}
		}
	}

	return {
		catches: catches,
		lootAmount: lootAmount,
		ticksElapsed,
		flakesUsed
	};
}

const harpoonBoosts = [
	{
		id: EItem.CRYSTAL_HARPOON,
		boostPercent: 35
	},
	{
		id: EItem.DRAGON_HARPOON,
		boostPercent: 20
	},
	{
		id: EItem.INFERNAL_HARPOON,
		boostPercent: 20
	}
];

function isHarpoonFishSpot(fish: Fish) {
	return fish.name === 'Tuna/Swordfish' || fish.name === 'Shark';
}

export function determineFishingTrip({
	gearBank,
	spot,
	hasWildyEliteDiary,
	baseMaxTripLength,
	...options
}: {
	baseMaxTripLength: number;
	hasWildyEliteDiary: boolean;
	gearBank: GearBank;
	quantity: number | undefined;
	powerfish: boolean | undefined;
	spirit_flakes: boolean | undefined;
	spot: Fish;
}) {
	let quantity = options.quantity ?? 3000;
	let isUsingSpiritFlakes = options.spirit_flakes ?? false;
	let isPowerfishing = options.powerfish ?? false;

	if (spot.name === 'Minnow' || spot.name === 'Karambwanji') {
		isPowerfishing = false; // stackable fish
	}
	if (isPowerfishing) {
		isUsingSpiritFlakes = false;
	}

	const boosts: string[] = [];

	if (isPowerfishing) boosts.push('**Powerfishing**');

	let harpoonBoost = 1.0;
	if (isHarpoonFishSpot(spot)) {
		for (const { id, boostPercent } of harpoonBoosts) {
			if (gearBank.hasEquipped(id)) {
				harpoonBoost = 1 + boostPercent / 100;
				boosts.push(`+${boostPercent}% for ${itemNameFromID(id)}`);
				break;
			}
		}
	}

	if (spot.name === 'Dark crab' && hasWildyEliteDiary) {
		boosts.push('Increased dark crab catch rate from having the Elite Wilderness Diary');
	}

	if (isUsingSpiritFlakes) {
		if (!gearBank.bank.has('Spirit flakes')) {
			return 'You need to have at least one spirit flake!';
		}
		boosts.push('50% more fish from using spirit flakes');
	}

	const { blessingEquipped, blessingChance } = radasBlessing(gearBank);
	if (blessingEquipped && !isPowerfishing) {
		boosts.push(`\nYour Rada's Blessing gives ${blessingChance}% chance of extra fish`);
	}

	let invSlots = 26;
	if (gearBank.hasEquippedOrInBank(['Fish sack barrel', 'Fish barrel'])) {
		invSlots += 28;
	}

	let maxTripLength = baseMaxTripLength;
	if (
		!isPowerfishing &&
		gearBank.hasEquippedOrInBank(['Fish sack barrel', 'Fish barrel']) &&
		spot.name !== 'Minnow'
	) {
		maxTripLength += Time.Minute * 9;
		boosts.push('+9 minutes for Fish barrel');
	}
	const tripTicks = maxTripLength / (Time.Second * 0.6);

	const flakesQuantity = gearBank.bank.amount('Spirit flakes');

	if (spot.bait) {
		const baseCost = new Bank().add(spot.bait);
		const maxCanDo = gearBank.bank.fits(baseCost);
		if (maxCanDo === 0) {
			return `You need ${itemNameFromID(spot.bait)} to fish ${spot.name}!`;
		}

		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}
	}

	// determining fish time and quantities
	const {
		catches: Qty,
		lootAmount: loot,
		ticksElapsed: tripLength,
		flakesUsed: flakesToRemove
	} = determineFishingTime({
		quantity,
		tripTicks,
		isUsingSpiritFlakes,
		isPowerfishing,
		fish: spot,
		invSlots,
		blessingChance,
		flakesQuantity,
		harpoonBoost,
		gearBank,
		hasWildyEliteDiary
	});

	const duration = Time.Second * 0.6 * tripLength;

	return {
		duration,
		Qty,
		loot,
		flakesToRemove,
		boosts,
		isPowerfishing,
		isUsingSpiritFlakes
	};
}

export const fishCommand: OSBMahojiCommand = {
	name: 'fish',
	description: 'Send your minion to fish fish.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/fish name:Shrimp']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to fish.',
			required: true,
			autocomplete: async (value: string) => {
				return Fishing.Fishes.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to fish (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'powerfish',
			description: 'Set this to true to powerfish. Higher xp/hour, no loot (default false, optional).',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'spirit_flakes',
			description: 'Set this to true to use spirit flakes (default false, optional).',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
		powerfish?: boolean;
		spirit_flakes?: boolean;
	}>) => {
		const user = await mUserFetch(userID);
		const spot = Fishing.Fishes.find(
			fish =>
				stringMatches(fish.id, options.name) ||
				stringMatches(fish.name, options.name) ||
				fish.alias?.some(alias => stringMatches(alias, options.name))
		);
		if (!spot) return 'Thats not a valid spot you can fish at.';

		if (user.skillsAsLevels.fishing < spot.subfishes![0].level) {
			return `${user.minionName} needs ${spot.subfishes![0].level} Fishing to fish ${spot.name}.`;
		}

		if ('skillReqs' in spot && spot.skillReqs && !user.hasSkillReqs(spot.skillReqs)) {
			return `To fish ${spot.name}, you need ${formatSkillRequirements(spot.skillReqs)}.`;
		}

		if (spot.qpRequired) {
			if (user.QP < spot.qpRequired) {
				return `You need ${spot.qpRequired} qp to catch those!`;
			}
		}

		if (spot.name === 'Infernal eel') {
			const jadKC = await user.getKC(Monsters.TzTokJad.id);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}

		if (spot.name === 'Minnow' && anglerItemsArr.some(i => !user.hasEquipped(i.id))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		const { quantity, powerfish, spirit_flakes } = options;

		const result = determineFishingTrip({
			hasWildyEliteDiary: (await userhasDiaryTier(user, WildernessDiary.elite))[0],
			baseMaxTripLength: calcMaxTripLength(user, 'Fishing'),
			spot,
			gearBank: user.gearBank,
			quantity,
			powerfish,
			spirit_flakes
		});

		if (typeof result === 'string') {
			return result;
		}

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: spot.name,
			userID: user.id,
			channelID: channelID.toString(),
			duration: result.duration,
			quantity: quantity,
			Qty: result.Qty,
			loot: result.loot,
			flakesToRemove: result.flakesToRemove,
			powerfish: powerfish,
			spirit_flakes: spirit_flakes,
			type: 'Fishing'
		});

		let response = `${user.minionName} is now fishing ${spot.name}, it'll take ${formatDuration(result.duration)} to finish.`;

		if (result.boosts.length > 0) {
			response += `\n\n**Boosts:** ${result.boosts.join(', ')}.`;
		}

		return response;
	}
};
