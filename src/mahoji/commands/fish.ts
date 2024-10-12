import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { WildernessDiary, userhasDiaryTier } from '../../lib/diaries';

import type { MUserClass } from '../../lib/MUser';
import Fishing from '../../lib/skilling/skills/fishing';
import { type Fish, SkillsEnum } from '../../lib/skilling/types';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
//import { formatDuration, itemID, itemNameFromID } from '../../lib/util';
import { formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import type { OSBMahojiCommand } from '../lib/util';

function radasBlessing(user: MUser) {
	const blessingBoosts = [
		["Rada's blessing 4", 8],
		["Rada's blessing 3", 6],
		["Rada's blessing 2", 4],
		["Rada's blessing 1", 2]
	];

	for (const [itemName, boostPercent] of blessingBoosts) {
		if (user.hasEquipped(itemName)) {
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

function determineFishingTime(
	quantity: number,
	tripTicks: number,
	powerfish: boolean,
	spirit_flakes: boolean,
	fish: Fish,
	user: MUserClass,
	invSlots: number,
	blessingChance: number,
	flakesQuantity: number,
	harpoonBoost: number
) {
	let ticksElapsed = 0;
	let catches1 = 0;
	let catches2 = 0;
	let catches3 = 0;
	let lootAmount1 = 0;
	let lootAmount2 = 0;
	let lootAmount3 = 0;
	let flakesUsed = 0;
	let currentInv = 0;

	const fishLvl = user.skillLevel(SkillsEnum.Fishing);
	let effFishLvl = fishLvl;
	if (fishLvl > 68) {
		if (fish.name === 'Shark' || fish.name === 'Mackerel/Cod/Bass' || fish.name === 'Lobster') {
			effFishLvl += 7; // fishing guild boost
		} else if (fish.name === 'Tuna/Swordfish' && !powerfish) {
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
		if (powerfish) {
			ticksPerRoll = 3;
			lostTicks = 0.06; // more focused
		}
		if (
			user.allItemsOwned.has('Fishing cape') ||
			user.allItemsOwned.has('Fishing cape (t)') ||
			user.allItemsOwned.has('Max cape')
		) {
			bankingTime = 20;
		}
	} else if (fish.name === 'Trout/Salmon') {
		if (powerfish) {
			ticksPerRoll = 3;
			lostTicks = 0.06;
		}
	} else if (fish.name === 'Tuna/Swordfish') {
		if (powerfish) {
			ticksPerRoll = 2;
			lostTicks = 0.06;
		}
	}

	if (powerfish) {
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
					spirit_flakes,
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
					spirit_flakes,
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
					spirit_flakes,
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
		const fish = Fishing.Fishes.find(
			fish =>
				stringMatches(fish.id, options.name) ||
				stringMatches(fish.name, options.name) ||
				fish.alias?.some(alias => stringMatches(alias, options.name))
		);
		if (!fish) return 'Thats not a valid fish to catch.';

		let { quantity, powerfish, spirit_flakes } = options;

		quantity = quantity ?? 3000;
		powerfish = powerfish ?? false;
		if (powerfish) {
			spirit_flakes = false; // don't use flakes if power fishing
		}
		spirit_flakes = spirit_flakes ?? false;

		// requirement checks
		if (user.skillLevel(SkillsEnum.Fishing) < fish.level) {
			return `${user.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired) {
			if (user.QP < fish.qpRequired) {
				return `You need ${fish.qpRequired} qp to catch those!`;
			}
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(user.skillLevel(SkillsEnum.Agility) < 15 || user.skillLevel(SkillsEnum.Strength) < 15)
		) {
			return 'You need at least 15 Agility and Strength to do Barbarian Fishing.';
		}

		if (fish.name === 'Infernal eel') {
			const jadKC = await user.getKC(Monsters.TzTokJad.id);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}

		const anglerOutfit = Object.keys(Fishing.anglerItems).map(i => itemNameFromID(Number.parseInt(i)));
		if (fish.name === 'Minnow' && anglerOutfit.some(test => !user.hasEquippedOrInBank(test!))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		// boosts
		const boosts = [];
		if (fish.name === 'Tuna/Swordfish' || fish.name === 'Shark') {
			if (user.hasEquipped('Crystal harpoon')) {
				boosts.push('35% for Crystal harpoon');
			} else if (user.hasEquipped('Dragon harpoon')) {
				boosts.push('20% for Dragon harpoon');
			} else if (user.hasEquipped('Infernal harpoon')) {
				boosts.push('20% for Infernal harpoon');
			}
		}

		if (powerfish) {
			boosts.push('**Powerfishing**');
		}

		if (!powerfish) {
			if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
				if (fish.name === 'Minnow' || fish.name === 'Karambwanji' || fish.name === 'Infernal eel') {
					boosts.push(
						`+9 trip minutes for having a ${user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'}`
					);
				} else {
					boosts.push(
						`+9 trip minutes and +28 inventory slots for having a ${user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'}`
					);
				}
			}
		}

		if (fish.name === 'Dark crab') {
			const [hasWildyElite] = await userhasDiaryTier(user, WildernessDiary.elite);
			if (hasWildyElite) {
				fish.intercept1 = 0.0961;
				fish.slope1 = 0.0025;
				boosts.push('Increased dark crab catch rate from having the Elite Wilderness Diary');
			}
		}

		if (spirit_flakes) {
			if (!user.bank.has('Spirit flakes')) {
				return 'You need to have at least one spirit flake!';
			}

			boosts.push('\n50% more fish from using spirit flakes');
		}

		const { blessingEquipped, blessingChance } = radasBlessing(user);
		if (blessingEquipped) {
			boosts.push(`\nYour Rada's Blessing gives ${blessingChance}% chance of extra fish`);
		}

		let harpoonBoost = 1.0;
		if (fish.name === 'Tuna/Swordfish' || fish.name === 'Shark') {
			if (user.hasEquipped('Dragon harpoon') || user.hasEquipped('Infernal harpoon')) {
				harpoonBoost = 1.2;
			} else if (user.hasEquipped('Crystal harpoon')) {
				harpoonBoost = 1.35;
			}
		}

		let invSlots = 26;
		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			invSlots += 28;
		}

		let maxTripLength = calcMaxTripLength(user, 'Fishing');
		if (!powerfish && (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel'))) {
			maxTripLength += Time.Minute * 9;
		}
		const tripTicks = maxTripLength / (Time.Second * 0.6);

		const flakesQuantity = user.bank.amount('Spirit flakes');

		if (fish.bait) {
			const baseCost = new Bank().add(fish.bait);
			const maxCanDo = user.bank.fits(baseCost);
			if (maxCanDo === 0) {
				return `You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`;
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
		} = determineFishingTime(
			quantity,
			tripTicks,
			powerfish,
			spirit_flakes,
			fish,
			user,
			invSlots,
			blessingChance,
			flakesQuantity,
			harpoonBoost
		);

		const duration = Time.Second * 0.6 * tripLength;

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelID: channelID.toString(),
			duration: duration,
			quantity: quantity,
			Qty1: Qty1,
			Qty2: Qty2,
			Qty3: Qty3,
			loot1: loot1,
			loot2: loot2,
			loot3: loot3,
			flakesToRemove: flakesToRemove,
			powerfish: powerfish,
			spirit_flakes: spirit_flakes,
			type: 'Fishing'
		});

		let response = `${user.minionName} is now fishing ${fish.name}, it'll take ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
