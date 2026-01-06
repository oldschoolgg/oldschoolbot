import type { BrimstoneDistilleryTaskOptions } from '@/lib/bso/bsoTypes.js';

import {
	Emoji,
	formatDuration,
	reduceNumByPercent,
	stringMatches,
	Time,
} from '@oldschoolgg/toolkit';
import { randArrItem } from '@oldschoolgg/rng';
import { Bank, type Item, Items } from 'oldschooljs';

import type { Skills } from '@/lib/types/index.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

const HERBLORE_REQUIREMENT = 110;
const DURATION_PER_DISTILLATION = Time.Minute * 1.5;
const COAL_PER_DISTILLATION = 10;
const BASE_DILUTED_BRIMSTONE_PER_DISTILLATION = 1.25;
const BASE_HERBLORE_XP = 8_500;

const UNLUCKY_MESSAGES = [
	'*Your minion spilled potions all over the place.*',
	'*Your minion sneezed into the distillery.*',
	'*Your minion got distracted and burned half the batch.*',
	'*A pipe burst and ruined some of your distillation.*',
	'*Your minion dropped a vial and started a chain reaction.*',
	'*The heat got too intense and evaporated some potions.*',
	'*Your minion tripped over the coal bucket.*',
	'*A sudden draft scattered your carefully measured ingredients.*',
	'*Your minion forgot to stir and the mixture separated*',
	'*The distillery hiccupped at the worst possible moment*'
];

const NEUTRAL_MESSAGES = [
	'*Your minion maintained steady production.*',
	'*Everything went according to plan.*',
	'*Your minion worked efficiently.*',
	'*The distillery hummed along smoothly.*',
	'*A typical day at the distillery.*',
	'*Your minion followed the recipe perfectly.*',
	'*Consistent output from the distillery.*',
	'*Your minion kept a steady pace.*'
];

const LUCKY_MESSAGES = [
	'*Your minion discovered a super secret recipe for making more potions, but forgot it!*',
	'*The stars aligned and the distillery produced extra potions!*',
	'*Your minion accidentally created the perfect mixture!*',
	'*A mysterious breeze enhanced the distillation process*',
	'*Your minion found the optimal temperature by pure luck!*',
	'*The brimstone reacted better than expected!*',
	'*Your minion hummed a tune that somehow improved yield*',
	'*Favorable conditions led to exceptional output!*',
	'*Your minion\'s experimental technique paid off!*',
	'*The distillery spirits smiled upon your minion today*'
];

const JACKPOT_MESSAGES = [
	'***Your minion achieved PERFECT distillation and created significantly more potions!***',
	'***The distillery overflowed with an enormous batch!***',
	'***Your minion unlocked the ancient secret of mass production!***',
	'***A distillation miracle occurred - massively increased output!***',
	'***The brimstone essence crystallized perfectly for maximum yield!***'
];

/*
	RARITY UPGRADE SYSTEM (STUB)
	Enable later when the upgrade exists.
*/

// enum DistilleryRarityTier {
// 	NONE = 1,
// 	TIER_1 = 1.15,
// 	TIER_2 = 1.35,
// 	TIER_3 = 1.6
// }

// function getUserRarityMultiplier(_userID: string): number {
// 	return DistilleryRarityTier.NONE;
// }

interface DistilleryRecipe {
	name: string;
	output: Item;
	outputQuantity: [number, number];
	ingredients: { item: Item; quantity: number }[];
	requiredCatalyst?: Item;
	catalystQuantity?: number;
	herbloreLevel: number;
	xpMultiplier: number;
	brimstoneMultiplier: number;
}

export const DistilleryRecipes: DistilleryRecipe[] = [
	{
		name: 'Super Restore',
		output: Items.getOrThrow('Super restore(4)'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Snapdragon'), quantity: 1 },
			{ item: Items.getOrThrow("Red spiders' eggs"), quantity: 1 }
		],
		herbloreLevel: 110,
		xpMultiplier: 1,
		brimstoneMultiplier: 1
	},
	{
		name: 'Saradomin Brew',
		output: Items.getOrThrow('Saradomin brew(4)'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Toadflax'), quantity: 1 },
			{ item: Items.getOrThrow('Crushed nest'), quantity: 1 }
		],
		herbloreLevel: 110,
		xpMultiplier: 1,
		brimstoneMultiplier: 1
	},
	{
		name: 'Stamina Potion',
		output: Items.getOrThrow('Stamina potion(4)'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Super energy(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Amylase crystal'), quantity: 4 }
		],
		herbloreLevel: 110,
		xpMultiplier: 1.1,
		brimstoneMultiplier: 1.2
	},

	{
		name: 'Enhanced Super Restore',
		output: Items.getOrThrow('Enhanced super restore'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Super restore(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Crystal dust'), quantity: 3 }
		],
		herbloreLevel: 115,
		xpMultiplier: 1.5,
		brimstoneMultiplier: 1.5
	},
	{
		name: 'Enhanced Saradomin Brew',
		output: Items.getOrThrow('Enhanced saradomin brew'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Saradomin brew(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Crystal dust'), quantity: 3 }
		],
		herbloreLevel: 115,
		xpMultiplier: 1.5,
		brimstoneMultiplier: 1.5
	},
	{
		name: 'Enhanced Stamina Potion',
		output: Items.getOrThrow('Enhanced stamina potion'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Stamina potion(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Crystal dust'), quantity: 4 }
		],
		herbloreLevel: 115,
		xpMultiplier: 1.6,
		brimstoneMultiplier: 1.6
	},

	{
		name: 'Heat res. restore',
		output: Items.getOrThrow('Heat res. restore'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Super restore(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Lava scale'), quantity: 3 }
		],
		requiredCatalyst: Items.getOrThrow('Heat res. vial'),
		catalystQuantity: 1,
		herbloreLevel: 112,
		xpMultiplier: 1.3,
		brimstoneMultiplier: 1.3
	},
	{
		name: 'Heat res. brew',
		output: Items.getOrThrow('Heat res. brew'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Saradomin brew(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Lava scale'), quantity: 3 }
		],
		requiredCatalyst: Items.getOrThrow('Heat res. vial'),
		catalystQuantity: 1,
		herbloreLevel: 112,
		xpMultiplier: 1.3,
		brimstoneMultiplier: 1.3
	},

	{
		name: 'Divination Potion',
		output: Items.getOrThrow('Divination potion'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Spirit weed'), quantity: 1 },
			{ item: Items.getOrThrow('Advax berry'), quantity: 1 }
		],
		herbloreLevel: 111,
		xpMultiplier: 1.25,
		brimstoneMultiplier: 1.25
	},

	{
		name: 'Enhanced Divine Water',
		output: Items.getOrThrow('Enhanced divine water'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Divine water'), quantity: 1 },
			{ item: Items.getOrThrow('Crystal dust'), quantity: 2 }
		],
		herbloreLevel: 113,
		xpMultiplier: 1.35,
		brimstoneMultiplier: 1.35
	},

	{
		name: "Dragon's Fury",
		output: Items.getOrThrow("Dragon's fury"),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Ignecarus scales'), quantity: 3 },
			{ item: Items.getOrThrow('Abyssal dragon bones'), quantity: 1 }
		],
		herbloreLevel: 118,
		xpMultiplier: 1.6,
		brimstoneMultiplier: 1.6
	},

	{
		name: 'Brimstone Elixir',
		output: Items.getOrThrow('Brimstone elixir'),
		outputQuantity: [25, 75],
		ingredients: [
			{ item: Items.getOrThrow('Extended anti-venom+(4)'), quantity: 1 },
			{ item: Items.getOrThrow('Heat res. restore'), quantity: 1 },
			{ item: Items.getOrThrow('Heat res. brew'), quantity: 1 },
			{ item: Items.getOrThrow('Diluted brimstone'), quantity: 1 },
			{ item: Items.getOrThrow('Primordial scales'), quantity: 5 },
			{ item: Items.getOrThrow('Korulsi'), quantity: 1 },
			{ item: Items.getOrThrow('Ignilace'), quantity: 1 }
		],
		herbloreLevel: 120,
		xpMultiplier: 2,
		brimstoneMultiplier: 2.5
	}
];

function rollWeightedOutput(min: number, max: number): number {
	if (min === max) return min;

	if (Math.random() < 0.01) {
		return max * 10;
	}

	const roll = Math.random();
	const range = max - min;
	
	if (roll < 0.25) {
		return min + Math.floor(Math.random() * (range * 0.2));
	} else if (roll < 0.75) {
		return min + Math.floor(range * 0.35) + Math.floor(Math.random() * (range * 0.2));
	} else if (roll < 0.95) {
		return min + Math.floor(range * 0.7) + Math.floor(Math.random() * (range * 0.2));
	} else {
		return min + Math.floor(range * 0.9) + Math.floor(Math.random() * (range * 0.1));
	}
}

export async function brimstoneDistilleryStartCommand({
	user,
	recipe,
	channelId
}: {
	user: MUser;
	channelId: string;
	recipe: string;
}) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const maxTripLength = await user.calcMaxTripLength('BrimstoneDistillery');
	const quantity = Math.floor(maxTripLength / DURATION_PER_DISTILLATION);
	const duration = quantity * DURATION_PER_DISTILLATION;

	const skillReqs: Skills = { herblore: HERBLORE_REQUIREMENT };
	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to use the Brimstone Distillery.`;
	}

	const selectedRecipe = DistilleryRecipes.find(r => stringMatches(r.name, recipe));
	if (!selectedRecipe) {
		return `Invalid recipe. Available recipes: ${DistilleryRecipes.map(r => r.name).join(', ')}`;
	}

	if (user.skillLevel('herblore') < selectedRecipe.herbloreLevel) {
		return `You need ${selectedRecipe.herbloreLevel} Herblore to distill ${selectedRecipe.name}.`;
	}

	let coalNeeded = COAL_PER_DISTILLATION * quantity;
	let vialsNeeded = quantity;
	const boosts: string[] = [];

	if (user.hasEquippedOrInBank(['Herblore master cape'])) {
		boosts.push('10% less catalyst usage');
		coalNeeded = Math.floor(reduceNumByPercent(coalNeeded, 10));
		vialsNeeded = Math.floor(reduceNumByPercent(vialsNeeded, 10));
	}

	if (user.hasEquippedOrInBank(['Celestial pendant'])) {
		boosts.push('10% chance for extra potions (Celestial Pendant)');
	}

	const hasEnhancedStamina = user.bank.has('Enhanced stamina potion');
	if (hasEnhancedStamina) {
		boosts.push('10% chance for extra potions (Enhanced Stamina)');
	}

	const hasDragonsFury = user.bank.has("Dragon's fury");
	if (hasDragonsFury) {
		boosts.push("10% chance for extra potions (Dragon's Fury catalyst)");
	}

	const costMultiplier = 1.5 + Math.random();
	
	const cost = new Bank().add('Coal', coalNeeded);

	if (selectedRecipe.requiredCatalyst) {
		cost.add(selectedRecipe.requiredCatalyst.id, vialsNeeded);
	} else {
		cost.add('Vial of water', vialsNeeded);
	}

	for (const ingredient of selectedRecipe.ingredients) {
		cost.add(ingredient.item.id, Math.ceil(ingredient.quantity * quantity * costMultiplier));
	}

	if (hasEnhancedStamina) {
		cost.add('Enhanced stamina potion', 1);
	}
	if (hasDragonsFury) {
		cost.add("Dragon's fury", 1);
	}

	if (!user.owns(cost)) {
		return `You don't have enough supplies. You need: ${cost}.`;
	}

	await user.removeItemsFromBank(cost);

	await ActivityManager.startTrip<BrimstoneDistilleryTaskOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'BrimstoneDistillery',
		minigameID: 'brimstone_distillery',
		recipe: selectedRecipe.name
	});

	const costMultiplierText = `${(costMultiplier * 100).toFixed(0)}%`;
	return `${user.minionName} is distilling ${quantity}x ${selectedRecipe.name} for ${formatDuration(duration)}.
${Emoji.Herblore} Ingredient cost multiplier: **${costMultiplierText}**
${Emoji.Herblore} Total ingredients needed: ${selectedRecipe.ingredients.map(i => `${Math.ceil(i.quantity * quantity * costMultiplier)}x ${i.item.name}`).join(', ')}
${Emoji.Herblore} Coal: ${coalNeeded}x | ${selectedRecipe.requiredCatalyst ? `${selectedRecipe.requiredCatalyst.name}: ${vialsNeeded}x` : `Vial of water: ${vialsNeeded}x`}
Boosts: ${boosts.length ? boosts.join(', ') : 'None'}`;
}

export function calculateDistilleryResult(data: BrimstoneDistilleryTaskOptions, user: MUser) {
	const recipe = DistilleryRecipes.find(r => r.name === data.recipe)!;
	const loot = new Bank();
	
	let totalPotions = 0;
	let unluckyRolls = 0;
	let luckyRolls = 0;
	let jackpotRolls = 0;
	let boostProcs = 0;
	const [min, max] = recipe.outputQuantity;

	const hasCelestialPendant = user.hasEquipped(['Celestial pendant']);
	const hasEnhancedStamina = user.bank.has('Enhanced stamina potion');
	const hasDragonsFury = user.bank.has("Dragon's fury");

	for (let i = 0; i < data.quantity; i++) {
		let amount = rollWeightedOutput(min, max);

		if (hasCelestialPendant && Math.random() < 0.20) {
			amount = Math.floor(amount * 1.1);
			boostProcs++;
		}
		if (hasEnhancedStamina && Math.random() < 0.10) {
			amount = Math.floor(amount * 1.1);
			boostProcs++;
		}
		if (hasDragonsFury && Math.random() < 0.10) {
			amount = Math.floor(amount * 1.1);
			boostProcs++;
		}
		
		loot.add(recipe.output.id, amount);
		totalPotions += 1;
		
		if (amount >= max * 10) {
			jackpotRolls++;
		} else if (amount >= min + (max - min) * 0.7) {
			luckyRolls++;
		} else if (amount <= min + (max - min) * 0.2) {
			unluckyRolls++;
		}
	}

	loot.add(
		'Diluted brimstone',
		Math.floor(data.quantity * BASE_DILUTED_BRIMSTONE_PER_DISTILLATION * recipe.brimstoneMultiplier)
	);

	let flavorMessage = '';
	if (jackpotRolls > 0) {
		flavorMessage = `\n\n${randArrItem(JACKPOT_MESSAGES)}`;
	} else if (luckyRolls > unluckyRolls + 3) {
		flavorMessage = `\n\n **Lucky!** ${randArrItem(LUCKY_MESSAGES)}`;
	} else if (unluckyRolls > luckyRolls + 3) {
		flavorMessage = `\n\n **Unlucky!** ${randArrItem(UNLUCKY_MESSAGES)}`;
	} else {
		flavorMessage = `\n\n ${randArrItem(NEUTRAL_MESSAGES)}`;
	}

	return {
		loot,
		herbloreXP: data.quantity * BASE_HERBLORE_XP * recipe.xpMultiplier,
		recipe,
		flavorMessage
	};
}