import type { BrimstoneDistilleryTaskOptions } from '@/lib/bso/bsoTypes.js';
import {
	defaultIslandUpgrades,
	defaultMaintenanceTimestamps,
	getMinigameRewardBonus,
	type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { formatDuration, reduceNumByPercent, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items } from 'oldschooljs';

import type { Skills } from '@/lib/types/index.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

const HERBLORE_REQUIREMENT = 110;
const BASE_DURATION_PER_DISTILLATION = Time.Second * 2.77;
const COAL_PER_DISTILLATION = 1;
const BASE_DILUTED_BRIMSTONE_PER_DISTILLATION = 0.04;
const BASE_HERBLORE_XP = 212;

const FLAVOR_MESSAGES = {
	disastrous: [
		'*The distillery exploded multiple times throughout the trip.*',
		'*Your minion spent most of the time cleaning up catastrophic spills.*',
		'*Every vial seemed to shatter at the slightest touch.*',
		'*The brimstone refused to cooperate at every turn.*',
		'*Your minion questions their career choice as an alchemist.*'
	],
	poor: [
		'*Your minion spilled potions all over the place.*',
		'*Your minion sneezed into the distillery repeatedly.*',
		'*Your minion got distracted and burned most batches.*',
		'*Multiple pipes burst and ruined distillations.*',
		'*Chain reactions of dropped vials plagued the workshop.*',
		'*The heat got too intense and evaporated batches.*',
		'*Your minion tripped over the coal bucket multiple times.*'
	],
	average: [
		'*Your minion maintained steady production.*',
		'*Everything went according to plan.*',
		'*Your minion worked efficiently.*',
		'*The distillery hummed along smoothly.*',
		'*A typical day at the distillery.*',
		'*Your minion followed the recipe perfectly.*',
		'*Consistent output from the distillery.*',
		'*Your minion kept a steady pace.*'
	],
	good: [
		'*Your minion discovered secret recipes, though they forgot them!*',
		'*The stars aligned and the distillery produced extra potions!*',
		'*Your minion accidentally created perfect mixtures repeatedly!*',
		'*Mysterious breezes enhanced the distillation process!*',
		'*Your minion found optimal temperatures by pure luck!*',
		'*The brimstone reacted better than expected throughout!*',
		'*Your minion hummed tunes that improved yield significantly!*'
	],
	exceptional: [
		'***Your minion achieved PERFECT distillation throughout the entire trip!***',
		'***The distillery overflowed with enormous batches!***',
		'***Your minion unlocked ancient secrets of mass production!***',
		'***Distillation miracles occurred - massively increased output!***',
		'***The brimstone essence crystallized perfectly for maximum yield!***',
		'***Every single distillation was a masterwork of alchemy!***'
	]
};

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
			{ item: Items.getOrThrow('Crystal dust'), quantity: 10 },
			{ item: Items.getOrThrow('Korulsi'), quantity: 1 }
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
			{ item: Items.getOrThrow('Crystal dust'), quantity: 10 },
			{ item: Items.getOrThrow('Korulsi'), quantity: 1 }
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
			{ item: Items.getOrThrow('Crystal dust'), quantity: 10 },
			{ item: Items.getOrThrow('Korulsi'), quantity: 1 }
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
			{ item: Items.getOrThrow('Super antifire potion(4)'), quantity: 1 }
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
			{ item: Items.getOrThrow('Super antifire potion(4)'), quantity: 1 }
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
			{ item: Items.getOrThrow('Crystal dust'), quantity: 10 },
			{ item: Items.getOrThrow('Korulsi'), quantity: 1 }
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

function getTripQualityMultiplier(): number {
	const roll = Math.random();

	if (roll < 0.05) return 0.2;
	if (roll < 0.15) return 0.5;
	if (roll < 0.65) return 0.75 + Math.random() * 0.35;
	if (roll < 0.9) return 1.1 + Math.random() * 0.25;
	if (roll < 0.98) return 1.35 + Math.random() * 0.2;
	return 1.55 + Math.random() * 0.15;
}

function rollDistillationQuality(tripMultiplier: number): number {
	const baseQuality = Math.random() * 100;
	const adjustedQuality = baseQuality * tripMultiplier;
	return Math.min(100, Math.max(0, adjustedQuality));
}

function qualityToPotionOutput(quality: number): number {
	if (quality >= 95) return 4;
	if (quality >= 75) return 3;
	if (quality >= 50) return 2;
	if (quality >= 25) return 1;
	return 0;
}

export async function brimstoneDistilleryStartCommand({
	user,
	recipe,
	channelId,
	quantity: requestedQuantity
}: {
	user: MUser;
	channelId: string;
	recipe: string;
	quantity?: number;
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

	const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
	const islandMaint = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = (user.user.island_upgrades as any)?.assignment ?? null;
	const minigameBonus = getMinigameRewardBonus(islandUpgrades, islandMaint, islandAssign);
	if (minigameBonus > 0) {
		boosts.push(`${(minigameBonus * 100).toFixed(0)}% better rewards (Settlement Infrastructure)`);
	}

	const hasFullGraceful = user.hasEquippedOrInBank([
		'Graceful hood',
		'Graceful top',
		'Graceful legs',
		'Graceful gloves',
		'Graceful boots',
		'Graceful cape'
	]);
	if (hasFullGraceful) {
		boosts.push('Full Graceful: bad distillation rolls are reduced');
	}

	const maxTripLength = await user.calcMaxTripLength('BrimstoneDistillery');
	const maxQuantity = Math.floor(maxTripLength / durationPerDistillation);
	const quantity = requestedQuantity ? Math.min(requestedQuantity, maxQuantity) : maxQuantity;
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

	for (const ingredient of selectedRecipe.ingredients) {
		cost.add(ingredient.item.id, ingredient.quantity * quantity);
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
		recipe: selectedRecipe.name,
		hasFullGraceful,
		maxQuantity
	});

	return `${user.minionName} is distilling ${quantity}x ${selectedRecipe.name} for ${formatDuration(duration)}.
Ingredients: ${selectedRecipe.ingredients.map(i => `${i.quantity * quantity}x ${i.item.name}`).join(', ')}
Coal: ${coalNeeded}x | ${selectedRecipe.requiredCatalyst ? `${selectedRecipe.requiredCatalyst.name}: ${vialsNeeded}x` : `Vial of water: ${vialsNeeded}x`}
Boosts: ${boosts.length ? boosts.join(', ') : 'None'}`;
}

export function calculateDistilleryResult(data: BrimstoneDistilleryTaskOptions) {
	const recipe = DistilleryRecipes.find(r => r.name === data.recipe)!;
	const loot = new Bank();
	const rarityBonus = [0, 0.05, 0.1, 0.15, 0.2, 0.25][data.rarityUpgradeTier ?? 0] ?? 0;

	const tripFillRatio = Math.min(1, data.quantity / data.maxQuantity);
	const partialTripPenalty = 0.85 + 0.15 * tripFillRatio;

	const tripMultiplier = getTripQualityMultiplier() * partialTripPenalty;

	const distillationQualities: number[] = [];
	let totalPotions = 0;
	let totalQualityPoints = 0;
	let failedDistillations = 0;
	let petDropped = false;

	for (let i = 0; i < data.quantity; i++) {
		const quality = rollDistillationQuality(tripMultiplier);
		const adjustedQuality = data.hasFullGraceful ? Math.max(quality, 20) : quality;
		distillationQualities.push(adjustedQuality);

		const potionOutput = qualityToPotionOutput(adjustedQuality);

		if (potionOutput > 0) {
			const boostedOutput = Math.floor(potionOutput * (1 + rarityBonus));
			loot.add(recipe.output.id, boostedOutput);
			totalPotions += boostedOutput;
			totalQualityPoints += quality;
		} else {
			failedDistillations++;
		}
	}

	const brimstoneAmount = Math.floor(
		(totalQualityPoints / 100) * BASE_DILUTED_BRIMSTONE_PER_DISTILLATION * recipe.brimstoneMultiplier
	);
	loot.add('Diluted brimstone', brimstoneAmount);

	if (roll(100000 / data.quantity)) {
		loot.add('Sedryn', 1);
		petDropped = true;
	}

	const avgQuality = distillationQualities.reduce((sum, q) => sum + q, 0) / data.quantity;
	const jackpotCount = distillationQualities.filter(q => q >= 99).length;
	const exceptionalCount = distillationQualities.filter(q => q >= 90 && q < 99).length;
	const greatCount = distillationQualities.filter(q => q >= 75 && q < 90).length;

	let tripQuality: 'disastrous' | 'poor' | 'average' | 'good' | 'exceptional';
	if (avgQuality >= 75) tripQuality = 'exceptional';
	else if (avgQuality >= 60) tripQuality = 'good';
	else if (avgQuality >= 40) tripQuality = 'average';
	else if (avgQuality >= 25) tripQuality = 'poor';
	else tripQuality = 'disastrous';

	let flavorMessage = '';

	if (petDropped) {
		flavorMessage = `\n\n**As your minion completes the final distillation, a shimmering spirit fox materializes from the brimstone vapors. It circles the distillery gracefully before approaching your minion with knowing eyes.**

	*In memory of Sedrukaius, the first to achieve 5b Herblore xp.*`;
	} else {
		flavorMessage = `\n\n${randArrItem(FLAVOR_MESSAGES[tripQuality])}`;

		if (tripQuality === 'exceptional') {
			flavorMessage += `\n**The distillery produced extraordinary results!**`;
		} else if (tripQuality === 'good') {
			flavorMessage += `\n**Your minion had a very productive session!**`;
		} else if (tripQuality === 'average') {
			flavorMessage += `\n**A standard day at the distillery.**`;
		} else if (tripQuality === 'poor') {
			flavorMessage += `\n**The distillery struggled today.**`;
		} else {
			flavorMessage += `\n**Perhaps alchemy isn't for everyone.**`;
		}
	}

	const avgQualityStr = avgQuality.toFixed(1);
	const avgPerDistillation = (totalPotions / data.quantity).toFixed(2);
	const qualityPointsStr = totalQualityPoints.toFixed(0);

	flavorMessage += `\nAvg Quality: ${avgQualityStr} | Quality Points: ${qualityPointsStr} | Avg Output: ${avgPerDistillation} | Failed: ${failedDistillations}`;

	const notableResults: string[] = [];
	if (jackpotCount > 0) notableResults.push(`Jackpots: ${jackpotCount}`);
	if (exceptionalCount > 0) notableResults.push(`Exceptional: ${exceptionalCount}`);
	if (greatCount > 0) notableResults.push(`Great: ${greatCount}`);

	if (notableResults.length > 0) {
		flavorMessage += `\n${notableResults.join(' | ')}`;
	}

	return {
		loot,
		herbloreXP: data.quantity * BASE_HERBLORE_XP * recipe.xpMultiplier,
		recipe,
		flavorMessage,
		petDropped,
		totalQualityPoints,
		failedDistillations
	};
}
