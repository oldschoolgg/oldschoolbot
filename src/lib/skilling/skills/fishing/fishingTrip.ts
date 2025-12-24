import { MathRNG, type RNGProvider } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { EItem, toKMB } from 'oldschooljs';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import type { Fish, SkillNameType } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { skillingPetDropRate } from '@/lib/util.js';
import {
	calcAnglerBonusXP,
	calcLeapingExpectedCookingXP,
	calcMinnowQuantityRange,
	type SharkLureQuantity,
	sharkLureConfig
} from './fishingUtil.js';

export function calcFishingTripResult({
	fish,
	duration,
	catches = [],
	loot = [],
	gearBank,
	rng,
	blessingExtra = 0,
	flakeExtra = 0,
	usedBarbarianCutEat = false,
	isPowerfishing = false,
	sharkLureQuantity,
	extraCatchRolls = []
}: {
	fish: Fish;
	duration: number;
	catches?: number[];
	loot?: number[];
	gearBank: GearBank;
	rng?: RNGProvider;
	blessingExtra?: number;
	flakeExtra?: number;
	usedBarbarianCutEat?: boolean;
	isPowerfishing?: boolean;
	sharkLureQuantity?: SharkLureQuantity;
	extraCatchRolls?: number[];
}) {
	const rngProvider = rng ?? MathRNG;

	const updateBank = new UpdateBank();
	const messages: string[] = [];
	const fishingLevel = gearBank.skillsAsLevels.fishing;
	const useBarbarianCutEat = Boolean(usedBarbarianCutEat);
	const isBarbarianFishing = fish.name === 'Barbarian fishing';
	const sharkLureQuantityToUse: SharkLureQuantity = fish.name === 'Shark' ? (sharkLureQuantity ?? 0) : 0;
	const sharkLureSettings = fish.name === 'Shark' ? sharkLureConfig[sharkLureQuantityToUse] : undefined;
	const canCatchSalmon =
		isBarbarianFishing && gearBank.skillsAsLevels.agility >= 30 && gearBank.skillsAsLevels.strength >= 30;
	const canCatchSturgeon =
		isBarbarianFishing && gearBank.skillsAsLevels.agility >= 45 && gearBank.skillsAsLevels.strength >= 45;
	const canHandleSubfish = (id: number) => {
		if (!isBarbarianFishing) {
			return true;
		}
		if (id === EItem.LEAPING_SALMON) {
			return canCatchSalmon;
		}
		if (id === EItem.LEAPING_STURGEON) {
			return canCatchSturgeon;
		}
		return true;
	};

	const subfishCount = fish.subfishes?.length ?? 0;
	const catchesArray = catches.length > 0 ? catches : new Array(subfishCount).fill(0);
	const lootArray = loot.length > 0 ? loot : new Array(subfishCount).fill(0);
	const extraCatchRollsArray = extraCatchRolls.length > 0 ? extraCatchRolls : new Array(subfishCount).fill(0);

	let fishingXP = 0;
	const bonusXP: Partial<Record<SkillNameType, number>> = {};
	const totalCatches = catchesArray.reduce((total, val) => total + val, 0);
	const totalExtraCatchRolls = extraCatchRollsArray.reduce((total, val) => total + val, 0);

	for (let i = 0; i < fish.subfishes!.length; i++) {
		const subfish = fish.subfishes![i];
		const quantity = catchesArray[i] ?? 0;
		const rawLootQty = lootArray[i] ?? 0;
		const extraRolls = extraCatchRollsArray[i] ?? 0;
		const totalRollsForSubfish = quantity + extraRolls;

		if (quantity === 0 && rawLootQty === 0 && extraRolls === 0) continue;
		if (!canHandleSubfish(subfish.id)) continue;

		const xpPerCatch = sharkLureSettings ? sharkLureSettings.xpPerCatch : subfish.xp;
		fishingXP += quantity * xpPerCatch;
		const totalLoot = isPowerfishing ? 0 : Math.max(quantity + extraRolls, rawLootQty);
		if (totalLoot > 0) {
			updateBank.itemLootBank.add(subfish.id, totalLoot);
		}

		if (subfish.bonusXP) {
			for (const [skillName, xpPerCatch] of Object.entries(subfish.bonusXP) as [SkillNameType, number][]) {
				if (skillName === 'cooking' && !useBarbarianCutEat) {
					continue;
				}
				if (
					isBarbarianFishing &&
					(skillName === 'agility' || skillName === 'strength') &&
					!canHandleSubfish(subfish.id)
				) {
					continue;
				}

				let xpToAdd = quantity * xpPerCatch;

				if (skillName === 'cooking') {
					xpToAdd = calcLeapingExpectedCookingXP({
						id: subfish.id,
						quantity,
						cookingLevel: gearBank.skillsAsLevels.cooking,
						xpPerSuccess: xpPerCatch,
						rng: rngProvider
					});
				}

				bonusXP[skillName] = (bonusXP[skillName] ?? 0) + xpToAdd;
			}
		}

		if (subfish.tertiary) {
			for (let j = 0; j < totalRollsForSubfish; j++) {
				if (rngProvider.roll(subfish.tertiary.chance)) {
					updateBank.itemLootBank.add(subfish.tertiary.id);
				}
			}
		}
	}

	const {
		percent: anglerBoost,
		bonusXP: anglerBonusXP,
		totalXP: fishingXPWithAngler
	} = calcAnglerBonusXP({
		gearBank,
		xp: fishingXP
	});
	if (anglerBonusXP > 0) {
		fishingXP = fishingXPWithAngler;
		messages.push(
			`**Bonus XP:** ${anglerBonusXP.toFixed(1)} (+${anglerBoost.toFixed(1)}%) XP for Angler outfit pieces`
		);
	}

	if (blessingExtra > 0) {
		messages.push(`Rada's blessing granted ${blessingExtra.toLocaleString()} extra fish`);
	}

	if (flakeExtra > 0) {
		messages.push(`Spirit flakes granted ${flakeExtra.toLocaleString()} extra fish`);
	}

	updateBank.xpBank.add('fishing', fishingXP, { duration });
	for (const [skillName, xp] of Object.entries(bonusXP) as [SkillNameType, number][]) {
		if (xp > 0) {
			updateBank.xpBank.add(skillName, xp, { duration });
		}
	}

	if (fish.name === 'Minnow') {
		const [min, max] = calcMinnowQuantityRange(gearBank);
		const catchCount = updateBank.itemLootBank.amount(EItem.MINNOW);
		let totalMinnows = 0;
		for (let i = 0; i < catchCount; i++) {
			totalMinnows += rngProvider.randInt(min, max);
		}
		updateBank.itemLootBank.set(EItem.MINNOW, totalMinnows);
	} else if (fish.name === 'Karambwanji') {
		const baseKarambwanji = 1 + Math.floor(fishingLevel / 5);
		const qty = updateBank.itemLootBank.amount(EItem.RAW_KARAMBWANJI);
		if (qty > 0) {
			updateBank.itemLootBank.set(EItem.RAW_KARAMBWANJI, qty * baseKarambwanji);
		}
	}

	const totalCatchRolls = totalCatches + totalExtraCatchRolls;

	// Extra fish granted by items like Rada's blessing or Spirit flakes shouldn't roll extra clues or pets,
	// since they are duplicates of the same catch tick. Those rolls should only be based on the number of
	// actual catches performed.
	if (fish.clueScrollChance) {
		addSkillingClueToLoot(gearBank, 'fishing', totalCatches, fish.clueScrollChance, updateBank.itemLootBank);
	}

	if (fish.petChance) {
		const petChanceToUse =
			fish.name === 'Shark' ? sharkLureConfig[sharkLureQuantityToUse].petChance : fish.petChance;

		if (petChanceToUse) {
			const { petDropRate } = skillingPetDropRate(gearBank, 'fishing', petChanceToUse);
			for (let i = 0; i < totalCatches; i++) {
				if (rngProvider.roll(petDropRate)) {
					updateBank.itemLootBank.add('Heron');
				}
			}
		}
	}

	const xpPerHour = duration === 0 ? 0 : Math.floor((fishingXP * Time.Hour) / duration);
	const bonusXpPerHour: Partial<Record<SkillNameType, string>> = {};
	if (duration > 0) {
		for (const [skillName, xp] of Object.entries(bonusXP) as [SkillNameType, number][]) {
			const perHour = Math.floor((xp * Time.Hour) / duration);
			if (perHour > 0) {
				bonusXpPerHour[skillName] = toKMB(perHour);
			}
		}
	}

	return {
		updateBank,
		totalCatches,
		totalCatchRolls,
		messages,
		xpPerHour: toKMB(xpPerHour),
		bonusXpPerHour,
		blessingExtra,
		flakeExtra
	};
}
