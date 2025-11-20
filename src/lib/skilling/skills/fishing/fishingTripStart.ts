import { MathRNG, type RNGProvider } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, EItem, Items } from 'oldschooljs';

import type { Fish } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import {
	calcLeapingExpectedBait,
	calcRadasBlessingBoost,
	type SharkLureQuantity,
	sharkLureConfig,
	sharkLureQuantities
} from './fishingUtil.js';

const harpoonBoosts = [
	{ id: EItem.CRYSTAL_HARPOON, boostPercent: 35 },
	{ id: EItem.DRAGON_HARPOON, boostPercent: 20 },
	{ id: EItem.INFERNAL_HARPOON, boostPercent: 20 }
];

const harpoonFishSpots = new Set(['Tuna/Swordfish', 'Shark']);

const FEATHER_ID = Items.getId('Feather');
const FEATHER_PACK_ID = Items.getId('Feather pack');
const SHARK_LURE_ID = Items.getId('Shark lure');
const FEATHER_PACK_SIZE = 100;

function isHarpoonFishSpot(fish: Fish) {
	return harpoonFishSpots.has(fish.name);
}

function rollExtraLoot({
	lootAmount,
	flakesUsed,
	currentInv,
	blessingChance,
	spiritFlakes,
	flakesAvailable,
	rng
}: {
	lootAmount: number;
	flakesUsed: number;
	currentInv: number;
	blessingChance: number;
	spiritFlakes: boolean;
	flakesAvailable: number;
	rng: RNGProvider;
}) {
	let updatedLoot = lootAmount + 1;
	let updatedFlakesUsed = flakesUsed;
	let updatedInv = currentInv + 1;
	let blessingExtra = 0;
	let flakeExtra = 0;

	if (rng.rand() < blessingChance / 100) {
		updatedLoot += 1;
		updatedInv += 1;
		blessingExtra = 1;
	}

	const canUseFlakes = spiritFlakes && updatedFlakesUsed < flakesAvailable;
	if (canUseFlakes) {
		updatedFlakesUsed += 1;
		if (rng.rand() < 0.5) {
			updatedLoot += 1;
			updatedInv += 1;
			flakeExtra = 1;
		}
	}

	return {
		loot: updatedLoot,
		flakesUsed: updatedFlakesUsed,
		inv: updatedInv,
		blessingExtra,
		flakeExtra
	};
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
	flakesAvailable,
	harpoonBoost,
	hasWildyEliteDiary,
	initialBait,
	useBarbarianCutEat,
	rng,
	sharkLureMultiplier
}: {
	quantity: number;
	tripTicks: number;
	isPowerfishing: boolean;
	isUsingSpiritFlakes: boolean;
	fish: Fish;
	gearBank: GearBank;
	invSlots: number;
	blessingChance: number;
	flakesAvailable: number;
	harpoonBoost: number;
	hasWildyEliteDiary: boolean;
	initialBait: number;
	useBarbarianCutEat: boolean;
	rng: RNGProvider;
	sharkLureMultiplier: number;
}) {
	let ticksElapsed = 0;
	let flakesUsed = 0;
	let currentInv = 0;
	let blessingExtra = 0;
	let flakeExtra = 0;

	const fishCount = fish.subfishes!.length;
	const catches = new Array<number>(fishCount).fill(0);
	const loot = new Array<number>(fishCount).fill(0);
	const extraCatchRolls = new Array<number>(fishCount).fill(0);

	const fishingLevel = gearBank.skillsAsLevels.fishing;
	let effectiveFishingLevel = fishingLevel;

	const isBarbarianFishing = fish.name === 'Barbarian fishing';
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

	if (fishingLevel > 68) {
		if (['Shark', 'Mackerel/Cod/Bass', 'Lobster'].includes(fish.name)) {
			effectiveFishingLevel += 7;
		} else if (fish.name === 'Tuna/Swordfish' && !isPowerfishing) {
			effectiveFishingLevel += 7;
		}
	}

	const probabilities = fish.subfishes!.map(
		subfish =>
			sharkLureMultiplier * harpoonBoost * (subfish.intercept + (effectiveFishingLevel - 1) * subfish.slope)
	);

	if (fish.name === 'Dark crab' && hasWildyEliteDiary) {
		const adjustedIntercept = 0.0961;
		const adjustedSlope = 0.0025;
		probabilities[0] = harpoonBoost * (adjustedIntercept + (effectiveFishingLevel - 1) * adjustedSlope);
	}

	let ticksPerRoll = fish.ticksPerRoll!;
	let lostTicks = fish.lostTicks!;
	let bankingTime = fish.bankingTime ?? 0;

	if (fish.name === 'Barbarian fishing') {
		if (isPowerfishing) {
			ticksPerRoll = 3;
			lostTicks = 0.06;
		}
		if (gearBank.hasEquippedOrInBank(['Fishing cape', 'Fishing cape (t)', 'Max cape'])) {
			bankingTime = 20;
		}
	} else if (fish.name === 'Trout/Salmon' && isPowerfishing) {
		ticksPerRoll = 3;
		lostTicks = 0.06;
	} else if (fish.name === 'Tuna/Swordfish' && isPowerfishing) {
		ticksPerRoll = 2;
		lostTicks = 0.05;
	}

	const totalRequired = quantity;

	const processExtraLoot = (index: number) => {
		const shouldRollExtraLoot = !isPowerfishing || blessingChance > 0 || isUsingSpiritFlakes;
		if (!shouldRollExtraLoot) {
			if (!isPowerfishing) {
				loot[index] += 1;
				currentInv += 1;
			}
			return;
		}

		const result = rollExtraLoot({
			lootAmount: loot[index],
			flakesUsed,
			currentInv,
			blessingChance,
			spiritFlakes: isUsingSpiritFlakes,
			flakesAvailable,
			rng
		});

		if (!isPowerfishing) {
			loot[index] = result.loot;
			currentInv = result.inv;
		}
		flakesUsed = result.flakesUsed;
		blessingExtra += result.blessingExtra;
		flakeExtra += result.flakeExtra;
		extraCatchRolls[index] += result.blessingExtra + result.flakeExtra;
	};

	if (isPowerfishing) {
		while (ticksElapsed < tripTicks) {
			for (let i = fishCount - 1; i >= 0; i--) {
				const subfish = fish.subfishes![i];
				if (!canHandleSubfish(subfish.id)) continue;
				if (fishingLevel < subfish.level) continue;
				if (rng.rand() < probabilities[i]) {
					catches[i]++;
					processExtraLoot(i);
					break;
				}
			}

			ticksElapsed += ticksPerRoll * (1 + lostTicks);

			if (catches.reduce((total, val) => total + val, 0) >= totalRequired) {
				break;
			}
		}
	} else {
		while (ticksElapsed < tripTicks) {
			for (let i = fishCount - 1; i >= 0; i--) {
				const subfish = fish.subfishes![i];
				if (!canHandleSubfish(subfish.id)) continue;
				if (fishingLevel < subfish.level) continue;
				if (rng.rand() < probabilities[i]) {
					catches[i]++;
					processExtraLoot(i);
					break;
				}
			}

			ticksElapsed += ticksPerRoll * (1 + lostTicks);

			if (catches.reduce((total, val) => total + val, 0) >= totalRequired) {
				break;
			}

			if (currentInv >= invSlots) {
				ticksElapsed += bankingTime;
				currentInv = 0;
			}
		}
	}

	const totalCaught = catches.reduce((total, val) => total + val, 0);
	let baitUsed = 0;
	if (fish.bait) {
		baitUsed = totalCaught;
		if (useBarbarianCutEat) {
			const cookingLevel = gearBank.skillsAsLevels.cooking;
			const expectedBait = fish.subfishes!.reduce((sum, subfish, idx) => {
				const qty = catches[idx] ?? 0;
				return sum + calcLeapingExpectedBait(subfish.id, qty, cookingLevel);
			}, 0);
			baitUsed = Math.max(0, Math.ceil(totalCaught - expectedBait));
			baitUsed = Math.min(baitUsed, initialBait);
		}
	}

	return {
		catches,
		loot,
		ticksElapsed,
		flakesUsed,
		baitUsed,
		blessingExtra,
		flakeExtra,
		extraCatchRolls
	};
}

export function calcFishingTripStart({
	gearBank,
	fish,
	maxTripLength,
	quantityInput,
	wantsToUseFlakes,
	powerfish,
	hasWildyEliteDiary,
	rng,
	sharkLureQuantity
}: {
	gearBank: GearBank;
	fish: Fish;
	maxTripLength: number;
	quantityInput: number | undefined;
	wantsToUseFlakes: boolean;
	powerfish: boolean;
	hasWildyEliteDiary: boolean;
	rng?: RNGProvider;
	sharkLureQuantity?: SharkLureQuantity;
}) {
	const rngProvider = rng ?? MathRNG;

	if (!fish.subfishes || fish.subfishes.length === 0) {
		return 'This fishing spot is not yet supported.';
	}

	let quantity = quantityInput ?? 3000;
	const spiritFlakePreference = wantsToUseFlakes;
	let isUsingSpiritFlakes = wantsToUseFlakes;
	let isPowerfishing = powerfish;
	if (sharkLureQuantity !== undefined) {
		if (!sharkLureQuantities.includes(sharkLureQuantity)) {
			return 'Invalid Shark lure quantity specified.';
		}
	}
	const normalizedSharkLureQuantity: SharkLureQuantity = sharkLureQuantity ?? 0;
	const isSharkTrip = fish.name === 'Shark';
	const appliedSharkLureQuantity: SharkLureQuantity = isSharkTrip ? normalizedSharkLureQuantity : 0;
	const sharkLurePreference = appliedSharkLureQuantity;
	let sharkLureMultiplier = 1;

	const baitIsFeather = fish.bait === FEATHER_ID;
	const availableFeathers = baitIsFeather ? gearBank.bank.amount(FEATHER_ID) : 0;
	const availableFeatherPacks = baitIsFeather ? gearBank.bank.amount(FEATHER_PACK_ID) : 0;
	const totalFeatherSupply = baitIsFeather ? availableFeathers + availableFeatherPacks * FEATHER_PACK_SIZE : 0;

	if (['Minnow', 'Karambwanji'].includes(fish.name)) {
		isPowerfishing = false;
	}

	if (isPowerfishing) {
		isUsingSpiritFlakes = false;
	}

	const boosts: string[] = [];
	if (isPowerfishing) {
		boosts.push('**Powerfishing**');
	}

	let harpoonBoost = 1;
	if (isHarpoonFishSpot(fish)) {
		for (const { id, boostPercent } of harpoonBoosts) {
			if (gearBank.hasEquipped(id)) {
				harpoonBoost = 1 + boostPercent / 100;
				boosts.push(`+${boostPercent}% for ${Items.itemNameFromId(id)}`);
				break;
			}
		}
	}

	if (fish.name === 'Dark crab' && hasWildyEliteDiary) {
		boosts.push('Increased dark crab catch rate from Elite Wilderness Diary');
	}

	if (isUsingSpiritFlakes) {
		if (!gearBank.bank.has('Spirit flakes')) {
			return 'You need to have at least one Spirit flake!';
		}
		boosts.push('50% more fish from using spirit flakes');
	}

	if (appliedSharkLureQuantity > 0) {
		const availableSharkLures = gearBank.bank.amount(SHARK_LURE_ID);
		if (availableSharkLures <= 0) {
			return 'You need Shark lure to use that option.';
		}
		const maxCatchFromLures = Math.floor(availableSharkLures / appliedSharkLureQuantity);
		if (maxCatchFromLures <= 0) {
			return `You need at least ${appliedSharkLureQuantity.toLocaleString()} Shark lures to use that setting.`;
		}
		quantity = Math.min(quantity, maxCatchFromLures);
		const lureConfig = sharkLureConfig[appliedSharkLureQuantity];
		sharkLureMultiplier = lureConfig.successRateMultiplier;
		boosts.push(
			`Using Shark lure (${appliedSharkLureQuantity} per catch): ${lureConfig.successRateMultiplier.toFixed(1)}x catch rate, ${lureConfig.xpPerCatch} XP each`
		);
	}

	const { blessingEquipped, blessingChance } = calcRadasBlessingBoost(gearBank);
	if (blessingEquipped && !isPowerfishing) {
		boosts.push(`Your Rada's Blessing gives ${blessingChance}% chance of extra fish`);
	}

	let invSlots = 26;
	const hasFishBarrel = gearBank.hasEquippedOrInBank(['Fish sack barrel', 'Fish barrel']);
	if (hasFishBarrel) {
		invSlots += 28;
	}

	let maxTrip = maxTripLength;
	if (!isPowerfishing && hasFishBarrel && fish.name !== 'Minnow') {
		maxTrip += Time.Minute * 9;
		boosts.push('+9 minutes for Fish barrel');
	}

	const tripTicks = maxTrip / (Time.Second * 0.6);
	const flakesAvailable = gearBank.bank.amount('Spirit flakes');

	const useBarbarianCutEat =
		fish.name === 'Barbarian fishing' &&
		isPowerfishing &&
		gearBank.skillsAsLevels.fishing >= 99 &&
		gearBank.skillsAsLevels.cooking >= 80;

	const initialBait = fish.bait ? (baitIsFeather ? totalFeatherSupply : gearBank.bank.amount(fish.bait)) : 0;

	if (fish.bait) {
		if (baitIsFeather) {
			if (totalFeatherSupply === 0) {
				return `You need ${Items.itemNameFromId(fish.bait)} to fish ${fish.name}!`;
			}
			if (!useBarbarianCutEat) {
				quantity = Math.min(quantity, totalFeatherSupply);
			}
		} else {
			const baseCost = new Bank().add(fish.bait);
			const maxCanDo = gearBank.bank.fits(baseCost);
			if (maxCanDo === 0) {
				return `You need ${Items.itemNameFromId(fish.bait)} to fish ${fish.name}!`;
			}
			if (!useBarbarianCutEat) {
				quantity = Math.min(quantity, maxCanDo);
			}
		}
	}

	let sharkLuresToConsume = 0;
	const { catches, loot, ticksElapsed, flakesUsed, baitUsed, blessingExtra, flakeExtra, extraCatchRolls } =
		determineFishingTime({
			quantity,
			tripTicks,
			isPowerfishing,
			isUsingSpiritFlakes,
			fish,
			gearBank,
			invSlots,
			blessingChance,
			flakesAvailable,
			harpoonBoost,
			hasWildyEliteDiary,
			initialBait,
			useBarbarianCutEat,
			rng: rngProvider,
			sharkLureMultiplier
		});

	const totalCaught = catches.reduce((total, val) => total + val, 0);
	if (appliedSharkLureQuantity > 0) {
		sharkLuresToConsume = totalCaught * appliedSharkLureQuantity;
	}
	if (totalCaught === 0) {
		return `You can't fish any ${fish.name}. Try a higher quantity or ensure you have the required supplies.`;
	}

	const duration = Time.Second * 0.6 * ticksElapsed;

	let featherPacksToOpen = 0;
	if (baitIsFeather && baitUsed > 0) {
		const directFeatherUsage = Math.min(availableFeathers, baitUsed);
		const remainingFeathersNeeded = baitUsed - directFeatherUsage;
		if (remainingFeathersNeeded > 0) {
			featherPacksToOpen = Math.ceil(remainingFeathersNeeded / FEATHER_PACK_SIZE);
			if (featherPacksToOpen > availableFeatherPacks) {
				if (fish.bait === undefined) {
					return `You need bait to fish ${fish.name}!`;
				}
				return `You need ${Items.itemNameFromId(fish.bait)} to fish ${fish.name}!`;
			}
		}
	}

	const suppliesToRemove = new Bank();
	if (fish.bait && baitUsed > 0) {
		suppliesToRemove.add(fish.bait, baitUsed);
	}
	if (flakesUsed > 0) {
		suppliesToRemove.add('Spirit flakes', flakesUsed);
	}
	if (sharkLuresToConsume > 0) {
		suppliesToRemove.add(SHARK_LURE_ID, sharkLuresToConsume);
	}

	return {
		duration,
		quantity: totalCaught,
		flakesBeingUsed: flakesUsed > 0 ? flakesUsed : undefined,
		boosts,
		fish,
		catches,
		loot,
		isPowerfishing,
		isUsingSpiritFlakes: flakesUsed > 0,
		spiritFlakePreference,
		sharkLureQuantity: appliedSharkLureQuantity,
		sharkLuresToConsume: sharkLuresToConsume > 0 ? sharkLuresToConsume : undefined,
		sharkLurePreference,
		suppliesToRemove,
		blessingExtra,
		flakeExtra,
		usedBarbarianCutEat: useBarbarianCutEat,
		featherPacksToOpen: featherPacksToOpen > 0 ? featherPacksToOpen : undefined,
		extraCatchRolls
	};
}
