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
const BASE_DURATION_PER_DISTILLATION = Time.Second * 2.77; // ~1300 per hour base
const COAL_PER_DISTILLATION = 1;
const BASE_DILUTED_BRIMSTONE_PER_DISTILLATION = 0.04; // ~50 per 1300 distillations
const BASE_HERBLORE_XP = 212; // Scales to ~1.7m/hr with 5x multiplier

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

interface DistilleryRecipe {
	name: string;
	output: Item;
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

// Roll for each individual distillation - returns 0, 1, 2, or rarely more
function rollDistillationOutput(): number {
	const roll = Math.random();
	
	// More volatile distribution with rarer jackpots:
	// 30% chance: 0 potions (complete failure - very unlucky)
	// 40% chance: 1 potion (normal success)
	// 20% chance: 2 potions (lucky)
	// 8% chance: 3 potions (very lucky)
	// 1.9% chance: 4 potions (extremely lucky)
	// 0.1% chance: 10 potions (jackpot - about 1-2 per trip)
	
	if (roll < 0.001) {
		return 10; // 0.1% jackpot
	} else if (roll < 0.02) {
		return 4; // 1.9% extremely lucky
	} else if (roll < 0.10) {
		return 3; // 8% very lucky
	} else if (roll < 0.30) {
		return 2; // 20% lucky
	} else if (roll < 0.70) {
		return 1; // 40% normal
	} else {
		return 0; // 30% failure
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

	const selectedRecipe = DistilleryRecipes.find(r => stringMatches(r.name, recipe));
	if (!selectedRecipe) {
		return `Invalid recipe. Available recipes: ${DistilleryRecipes.map(r => r.name).join(', ')}`;
	}

	const skillReqs: Skills = { herblore: HERBLORE_REQUIREMENT };
	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to use the Brimstone Distillery.`;
	}

	if (user.skillLevel('herblore') < selectedRecipe.herbloreLevel) {
		return `You need ${selectedRecipe.herbloreLevel} Herblore to distill ${selectedRecipe.name}.`;
	}

	// Calculate duration with speed boosts
	let durationPerDistillation = BASE_DURATION_PER_DISTILLATION;
	const boosts: string[] = [];

	if (user.hasEquippedOrInBank(['Celestial pendant'])) {
		boosts.push('10% faster distillation (Celestial Pendant)');
		durationPerDistillation = Math.floor(reduceNumByPercent(durationPerDistillation, 10));
	}

	const hasEnhancedStamina = user.bank.has('Enhanced stamina potion');
	if (hasEnhancedStamina) {
		boosts.push('10% faster distillation (Enhanced Stamina)');
		durationPerDistillation = Math.floor(reduceNumByPercent(durationPerDistillation, 10));
	}

	const hasDragonsFury = user.bank.has("Dragon's fury");
	if (hasDragonsFury) {
		boosts.push("10% faster distillation (Dragon's Fury catalyst)");
		durationPerDistillation = Math.floor(reduceNumByPercent(durationPerDistillation, 10));
	}

	const maxTripLength = await user.calcMaxTripLength('BrimstoneDistillery');
	const quantity = Math.floor(maxTripLength / durationPerDistillation);
	const duration = quantity * durationPerDistillation;

	let coalNeeded = Math.ceil(COAL_PER_DISTILLATION * quantity);
	let vialsNeeded = quantity;

	if (user.hasEquippedOrInBank(['Herblore master cape'])) {
		boosts.push('10% less catalyst usage (Herblore Master Cape)');
		coalNeeded = Math.floor(reduceNumByPercent(coalNeeded, 10));
		vialsNeeded = Math.floor(reduceNumByPercent(vialsNeeded, 10));
	}
	
	const cost = new Bank().add('Coal', coalNeeded);

	if (selectedRecipe.requiredCatalyst) {
		cost.add(selectedRecipe.requiredCatalyst.id, vialsNeeded);
	} else {
		cost.add('Vial of water', vialsNeeded);
	}

	// 1:1 ingredient cost per distillation
	for (const ingredient of selectedRecipe.ingredients) {
		cost.add(ingredient.item.id, ingredient.quantity * quantity);
	}

	// Consume boost items
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

	return `${user.minionName} is distilling ${quantity}x ${selectedRecipe.name} for ${formatDuration(duration)}.
${Emoji.Herblore} Ingredients: ${selectedRecipe.ingredients.map(i => `${i.quantity * quantity}x ${i.item.name}`).join(', ')}
${Emoji.Herblore} Coal: ${coalNeeded}x | ${selectedRecipe.requiredCatalyst ? `${selectedRecipe.requiredCatalyst.name}: ${vialsNeeded}x` : `Vial of water: ${vialsNeeded}x`}
Boosts: ${boosts.length ? boosts.join(', ') : 'None'}`;
}

export function calculateDistilleryResult(data: BrimstoneDistilleryTaskOptions ) {
	const recipe = DistilleryRecipes.find(r => r.name === data.recipe)!;
	const loot = new Bank();
	
	let totalPotions = 0;
	let unluckyRolls = 0;
	let normalRolls = 0;
	let luckyRolls = 0;
	let veryLuckyRolls = 0;
	let jackpotRolls = 0;

	// Roll for each individual distillation
	for (let i = 0; i < data.quantity; i++) {
		const amount = rollDistillationOutput();
		
		if (amount > 0) {
			loot.add(recipe.output.id, amount);
			totalPotions += amount;
		}
		
		// Track luck for flavor text
		if (amount >= 10) {
			jackpotRolls++;
		} else if (amount >= 3) {
			veryLuckyRolls++;
		} else if (amount === 2) {
			luckyRolls++;
		} else if (amount === 1) {
			normalRolls++;
		} else {
			unluckyRolls++;
		}
	}

	loot.add(
		'Diluted brimstone',
		Math.floor(data.quantity * BASE_DILUTED_BRIMSTONE_PER_DISTILLATION * recipe.brimstoneMultiplier)
	);

	// Determine flavor message based on overall luck
	// Calculate percentage deviations from expected values
	const expectedPotions = data.quantity * 1.11; // Expected average
	const potionDeviation = ((totalPotions - expectedPotions) / expectedPotions);
	
	let flavorMessage = '';
	
	if (jackpotRolls > 0) {
		flavorMessage = `\n\n${randArrItem(JACKPOT_MESSAGES)}`;
	} else if (potionDeviation > 0.15) {
		// 15%+ more potions than expected
		flavorMessage = `\n\n**Lucky!** ${randArrItem(LUCKY_MESSAGES)}`;
	} else if (potionDeviation < -0.15) {
		// 15%+ fewer potions than expected
		flavorMessage = `\n\n**Unlucky!** ${randArrItem(UNLUCKY_MESSAGES)}`;
	} else {
		flavorMessage = `\n\n${randArrItem(NEUTRAL_MESSAGES)}`;
	}

	// Add detailed stats
	const successRate = ((data.quantity - unluckyRolls) / data.quantity * 100).toFixed(1);
	const avgPerDistillation = (totalPotions / data.quantity).toFixed(2);
	
	flavorMessage += `\n📊 Success rate: ${successRate}% | Avg per distillation: ${avgPerDistillation} | Failed: ${unluckyRolls}`;
	
	if (jackpotRolls > 0) {
		flavorMessage += ` | 🎰 Jackpots: ${jackpotRolls}`;
	}

	return {
		loot,
		herbloreXP: data.quantity * BASE_HERBLORE_XP * recipe.xpMultiplier,
		recipe,
		flavorMessage
	};
}