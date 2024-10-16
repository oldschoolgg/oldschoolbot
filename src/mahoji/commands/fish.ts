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
	harpoonBoost
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
}) {
	let ticksElapsed = 0;
	let catches1 = 0;
	let catches2 = 0;
	let catches3 = 0;
	let lootAmount1 = 0;
	let lootAmount2 = 0;
	let lootAmount3 = 0;
	let flakesUsed = 0;
	let currentInv = 0;

	const fishLvl = gearBank.skillsAsLevels.fishing;
	let effFishLvl = fishLvl;
	if (fishLvl > 68) {
		if (fish.name === 'Shark' || fish.name === 'Mackerel/Cod/Bass' || fish.name === 'Lobster') {
			effFishLvl += 7; // fishing guild boost
		} else if (fish.name === 'Tuna/Swordfish' && !isPowerfishing) {
			effFishLvl += 7; // can't 2t in the guild
		}
	}

	// probabilities of catching a fish at the user's fishing lvl
	const p1 = harpoonBoost * (fish.intercept1! + (effFishLvl - 1) * fish.slope1!);
	const p2 = fish.id2 === undefined ? 0 : harpoonBoost * (fish.intercept2! + (effFishLvl - 1) * fish.slope2!);
	const p3 = fish.id3 === undefined ? 0 : harpoonBoost * (fish.intercept3! + (effFishLvl - 1) * fish.slope3!);

	let ticksPerRoll = fish.ticksPerRoll!;
	let lostTicks = fish.lostTicks!;
	let bankingTime = fish.bankingTime;

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
			lostTicks = 0.06;
		}
	}

	if (isPowerfishing) {
		while (ticksElapsed < tripTicks) {
			if (p3 !== 0 && fishLvl >= fish.level3! && Math.random() < p3) {
				catches3++; // roll for the highest lvl fish first
			} else if (p2 !== 0 && fishLvl >= fish.level2! && Math.random() < p2) {
				catches2++; // then the second only if first one wasn't caught
			} else if (Math.random() < p1) {
				catches1++;
			}
			ticksElapsed += ticksPerRoll! * (1 + lostTicks!); // only part of the code that's not exactly how it works in osrs

			if (catches1 + catches2 + catches3 >= quantity) {
				break;
			}
		}
	} else {
		while (ticksElapsed < tripTicks) {
			if (p3 !== 0 && fishLvl >= fish.level3! && Math.random() < p3) {
				catches3++;
				lootAmount3++;
				[lootAmount3, flakesUsed, currentInv] = rollExtraLoot(
					lootAmount3,
					flakesUsed,
					currentInv,
					blessingChance,
					isUsingSpiritFlakes,
					flakesQuantity
				);
			} else if (p2 !== 0 && fishLvl >= fish.level2! && Math.random() < p2) {
				catches2++;
				lootAmount2++;
				[lootAmount2, flakesUsed, currentInv] = rollExtraLoot(
					lootAmount2,
					flakesUsed,
					currentInv,
					blessingChance,
					isUsingSpiritFlakes,
					flakesQuantity
				);
			} else if (Math.random() < p1) {
				catches1++;
				lootAmount1++;
				[lootAmount1, flakesUsed, currentInv] = rollExtraLoot(
					lootAmount1,
					flakesUsed,
					currentInv,
					blessingChance,
					isUsingSpiritFlakes,
					flakesQuantity
				);
			}

			ticksElapsed += ticksPerRoll! * (1 + lostTicks!);

			if (catches1 + catches2 + catches3 >= quantity) {
				break;
			}

			if (currentInv >= invSlots) {
				ticksElapsed += bankingTime!;
				currentInv = 0;
			}
		}
	}

	return { catches1, catches2, catches3, lootAmount1, lootAmount2, lootAmount3, ticksElapsed, flakesUsed };
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
	const isPowerfishing = options.powerfish ?? false;
	if (isPowerfishing) {
		isUsingSpiritFlakes = false;
	}

	const boosts: string[] = [];
	if (isHarpoonFishSpot(spot)) {
		for (const { id, boostPercent } of harpoonBoosts) {
			if (gearBank.hasEquipped(id)) {
				boosts.push(`+${boostPercent}% boost for ${itemNameFromID(id)}`);
				break;
			}
		}
	}

	if (isPowerfishing) boosts.push('**Powerfishing**');

	if (spot.name === 'Dark crab' && hasWildyEliteDiary) {
		// fish.intercept1 = 0.0961;
		// fish.slope1 = 0.0025;
		boosts.push('Increased dark crab catch rate from having the Elite Wilderness Diary');
	}

	if (isUsingSpiritFlakes) {
		if (!gearBank.bank.has('Spirit flakes')) {
			return 'You need to have at least one spirit flake!';
		}
		boosts.push('50% more fish from using spirit flakes');
	}

	const { blessingEquipped, blessingChance } = radasBlessing(gearBank);
	if (blessingEquipped) {
		boosts.push(`\nYour Rada's Blessing gives ${blessingChance}% chance of extra fish`);
	}

	let harpoonBoost = 1.0;
	if (isHarpoonFishSpot(spot)) {
		for (const { id, boostPercent } of harpoonBoosts) {
			if (gearBank.hasEquipped(id)) {
				harpoonBoost = 1 + boostPercent / 100;
				boosts.push(`+${boostPercent}% boost for ${itemNameFromID(id)}`);
				break;
			}
		}
	}

	let invSlots = 26;
	if (gearBank.hasEquippedOrInBank(['Fish sack barrel', 'Fish barrel'])) {
		invSlots += 28;
	}

	let maxTripLength = baseMaxTripLength;
	if (!isPowerfishing && gearBank.hasEquipped(['Fish sack barrel', 'Fish barrel'])) {
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
		catches1: Qty1,
		catches2: Qty2,
		catches3: Qty3,
		lootAmount1: loot1,
		lootAmount2: loot2,
		lootAmount3: loot3,
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
		gearBank
	});

	const duration = Time.Second * 0.6 * tripLength;

	return {
		duration,
		Qty1,
		Qty2,
		Qty3,
		loot1,
		loot2,
		loot3,
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
			name: 'minutes',
			description: 'Trip length in minutes (optional).',
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

		if (user.skillsAsLevels.fishing < spot.level) {
			return `${user.minionName} needs ${spot.level} Fishing to fish ${spot.name}.`;
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
			fishID: spot.id,
			userID: user.id,
			channelID: channelID.toString(),
			duration: result.duration,
			quantity: quantity,
			Qty1: result.Qty1,
			Qty2: result.Qty2,
			Qty3: result.Qty3,
			loot1: result.loot1,
			loot2: result.loot2,
			loot3: result.loot3,
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
