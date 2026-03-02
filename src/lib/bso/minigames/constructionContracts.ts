import type { ConstructionContractsTaskOptions } from '@/lib/bso/bsoTypes.js';

import {
	formatDuration,
	reduceNumByPercent,
	stringMatches,
	Time,
} from '@oldschoolgg/toolkit';
import { randArrItem, randInt, roll } from '@oldschoolgg/rng';
import { Bank, type Item, Items } from 'oldschooljs';

import type { Skills } from '@/lib/types/index.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import {
	getMinigameRewardBonus,
	defaultIslandUpgrades,
	defaultMaintenanceTimestamps,
	type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

const CONSTRUCTION_REQUIREMENT = 110;
const BASE_DURATION_PER_CONTRACT = Time.Second * 3.2;
const BASE_CONSTRUCTION_XP = 245;

const CONTRACT_CLIENTS = [
	'A Wealthy Merchant',
	'A Noble Family',
	'The Local Temple',
	'A Retired Adventurer',
	'The Town Mayor',
	'A Mysterious Benefactor',
	'A Grateful Wizard',
	'The Royal Family',
	'An Eccentric Collector',
	'A Wealthy Guild Master',
	'A Generous Patron',
	'A Thankful Community'
];

const FLAVOR_MESSAGES = {
	disastrous: [
		'*Nearly every contract fell apart. Your minion spent most of the time fixing catastrophic failures.*',
		'*A series of unfortunate events plagued the entire workshop.*',
		'*The materials seemed cursed - nothing went according to plan.*',
		'*Your minion questions their life choices after this terrible run.*',
		'*Everything that could go wrong, did go wrong.*'
	],
	poor: [
		'*Your minion dropped a plank on their foot multiple times.*',
		'*Critical joints failed repeatedly throughout the trip.*',
		'*The wood seemed to fight back against every cut.*',
		'*Support beams kept cracking under pressure.*',
		'*Your minion forgot basic measurements constantly.*',
		'*The crystal infusions refused to set properly.*'
	],
	average: [
		'*Your minion maintained steady craftsmanship.*',
		'*Everything was built to specification.*',
		'*Your minion worked with precision.*',
		'*The workshop operated smoothly.*',
		'*A productive day of construction.*',
		'*Your minion followed the blueprints perfectly.*',
		'*Consistent output from the workshop.*',
		'*Your minion kept a methodical pace.*'
	],
	good: [
		'*Your minion discovered perfect wood grain alignments!*',
		'*The materials bonded exceptionally well throughout!*',
		"*Your minion's techniques improved dramatically!*",
		'*The crystalline ore reacted better than expected!*',
		'*Your minion hummed tunes that improved precision!*',
		'*Favorable conditions led to exceptional results!*',
		'*The construction spirits blessed this trip!*'
	],
	exceptional: [
		'***Your minion achieved unprecedented perfection throughout the entire trip!***',
		'***Every single client was absolutely amazed by the masterwork!***',
		'***Your minion unlocked ancient secrets of master carpentry!***',
		'***A construction miracle - clients lined up with bonuses!***',
		'***The materials aligned perfectly for supreme quality across the board!***',
		'***An legendary streak of flawless craftsmanship!***'
	]
};

interface ContractRecipe {
	name: string;
	description: string;
	ingredients: { item: Item; quantity: number }[];
	requiredTool?: Item;
	toolQuantity?: number;
	constructionLevel: number;
	xpMultiplier: number;
	rewardWeight: number;
}

export const ContractRecipes: ContractRecipe[] = [
	{
		name: 'Mahogany Furniture Contract',
		description: 'Build luxury mahogany furniture for a wealthy client',
		ingredients: [
			{ item: Items.getOrThrow('Mahogany plank'), quantity: 3 },
			{ item: Items.getOrThrow('Crystalline ore'), quantity: 1 }
		],
		constructionLevel: 110,
		xpMultiplier: 1,
		rewardWeight: 1
	},
	{
		name: 'Verdant Lodge Contract',
		description: 'Construct a verdant-themed hunting lodge',
		ingredients: [
			{ item: Items.getOrThrow('Verdant plank'), quantity: 2 },
			{ item: Items.getOrThrow('Crystalline ore'), quantity: 2 }
		],
		constructionLevel: 112,
		xpMultiplier: 1.2,
		rewardWeight: 1.2
	},
	{
		name: 'Elder Shrine Contract',
		description: 'Build an elder wood shrine for worship',
		ingredients: [
			{ item: Items.getOrThrow('Elder plank'), quantity: 3 },
			{ item: Items.getOrThrow('Gem infused ore'), quantity: 1 }
		],
		constructionLevel: 114,
		xpMultiplier: 1.5,
		rewardWeight: 1.4
	},
	{
		name: 'Crystalline Structure Contract',
		description: 'Construct a crystalline architectural masterpiece',
		ingredients: [
			{ item: Items.getOrThrow('Crystalline plank'), quantity: 2 },
			{ item: Items.getOrThrow('Elder plank'), quantity: 1 },
			{ item: Items.getOrThrow('Gem infused ore'), quantity: 2 }
		],
		constructionLevel: 115,
		xpMultiplier: 1.6,
		rewardWeight: 1.5
	},
	{
		name: 'Myconid Habitat Contract',
		description: 'Build a specialized myconid living space',
		ingredients: [
			{ item: Items.getOrThrow('Myconid plank'), quantity: 2 },
			{ item: Items.getOrThrow('Elder plank'), quantity: 1 },
			{ item: Items.getOrThrow('Crystalline ore'), quantity: 3 }
		],
		constructionLevel: 116,
		xpMultiplier: 1.7,
		rewardWeight: 1.6
	},
	{
		name: 'Ancient Verdant Estate Contract',
		description: 'Construct an ancient verdant manor estate',
		ingredients: [
			{ item: Items.getOrThrow('Ancient verdant plank'), quantity: 2 },
			{ item: Items.getOrThrow('Elder plank'), quantity: 2 },
			{ item: Items.getOrThrow('Gem infused ore'), quantity: 3 }
		],
		constructionLevel: 118,
		xpMultiplier: 1.9,
		rewardWeight: 1.7
	},
	{
		name: 'Reinforced Complex Contract',
		description: 'Build a heavily reinforced compound',
		ingredients: [
			{ item: Items.getOrThrow('Myconid plank'), quantity: 3 },
			{ item: Items.getOrThrow('Crystalline plank'), quantity: 2 },
			{ item: Items.getOrThrow('Elder plank'), quantity: 2 },
			{ item: Items.getOrThrow('Gem infused ore'), quantity: 4 }
		],
		constructionLevel: 119,
		xpMultiplier: 2.1,
		rewardWeight: 1.8
	},
	{
		name: 'Legendary Monument Contract',
		description: 'Construct a legendary monument that will stand for ages',
		ingredients: [
			{ item: Items.getOrThrow('Ancient verdant plank'), quantity: 3 },
			{ item: Items.getOrThrow('Crystalline plank'), quantity: 3 },
			{ item: Items.getOrThrow('Elder plank'), quantity: 3 },
			{ item: Items.getOrThrow('Myconid plank'), quantity: 2 },
			{ item: Items.getOrThrow('Gem infused ore'), quantity: 5 }
		],
		constructionLevel: 120,
		xpMultiplier: 2.5,
		rewardWeight: 2.5
	}
];

function getTripQualityMultiplier(): number {
	const r = Math.random();
	if (r < 0.05) return 0.2;
	if (r < 0.15) return 0.5;
	if (r < 0.65) return 0.75 + Math.random() * 0.35;
	if (r < 0.90) return 1.10 + Math.random() * 0.25;
	if (r < 0.98) return 1.35 + Math.random() * 0.20;
	return 1.55 + Math.random() * 0.15;
}

function rollContractQuality(tripMultiplier: number): number {
	const baseQuality = Math.random() * 100;
	const adjustedQuality = baseQuality * tripMultiplier;
	return Math.min(100, Math.max(0, adjustedQuality));
}

function generateMiddlingLoot(recipe: ContractRecipe, successfulContracts: number): Bank {
	const loot = new Bank();

	const plankReturnChance = 0.15;
	for (let i = 0; i < successfulContracts; i++) {
		if (Math.random() < plankReturnChance) {
			const plankIngredients = recipe.ingredients.filter(ing =>
				ing.item.name.toLowerCase().includes('plank')
			);
			if (plankIngredients.length > 0) {
				const returned = randArrItem(plankIngredients);
				loot.add(returned.item.id, 1);
			}
		}
	}

	const supplyRoll = Math.random();
	const supplyQty = Math.floor(successfulContracts * 0.3);
	if (supplyQty > 0) {
		if (supplyRoll < 0.35) {
			loot.add('Steel nail', supplyQty * randInt(5, 15));
		} else if (supplyRoll < 0.60) {
			loot.add('Ball of wool', supplyQty * randInt(2, 6));
		} else if (supplyRoll < 0.80) {
			loot.add('Bolt of cloth', supplyQty * randInt(1, 4));
		} else {
			loot.add('Limestone brick', supplyQty * randInt(1, 3));
		}
	}

	const resourceRoll = Math.random();
	const resourceQty = Math.max(1, Math.floor(successfulContracts * recipe.rewardWeight * 0.2));
	if (resourceRoll < 0.25) {
		loot.add('Oak logs', resourceQty * randInt(3, 8));
	} else if (resourceRoll < 0.50) {
		loot.add('Teak logs', resourceQty * randInt(2, 6));
	} else if (resourceRoll < 0.70) {
		loot.add('Mahogany logs', resourceQty * randInt(1, 4));
	} else if (resourceRoll < 0.85 && recipe.rewardWeight >= 1.4) {
		loot.add('Runite ore', resourceQty * randInt(1, 3));
	} else if (resourceRoll < 0.95 && recipe.rewardWeight >= 1.8) {
		loot.add('Onyx bolt tips', resourceQty * randInt(1, 5));
	}

	return loot;
}

function generateRewardsFromPool(totalQualityPoints: number, recipeWeight: number, rarityBonus = 0): Bank {
	const loot = new Bank();

	if (recipeWeight >= 2.5) {
		const elderScrollChance = totalQualityPoints / 1000000;
		if (Math.random() < elderScrollChance) {
			loot.add('Elder scroll piece', 1);
		}
		const sigilChance = totalQualityPoints / 500000;
		if (Math.random() < sigilChance && !loot.has('Elder scroll piece')) {
			const fragmentType = randInt(1, 3);
			loot.add(`Elder sigil fragment (${fragmentType})`, 1);
		}
	}

	if (recipeWeight >= 1.5) {
		const gmClueChance = totalQualityPoints / 500000;
		if (Math.random() < gmClueChance && loot.length === 0) {
			loot.add('Clue scroll (grandmaster)', 1);
		}
	}

	if (roll(100000)) {
		loot.add('Bamyr', 1);
	}

	const rewardBudget = Math.floor((totalQualityPoints / 100) * (1 + rarityBonus));
	let remainingBudget = rewardBudget;

	while (remainingBudget > 0) {
		const rollValue = Math.random() * 100;

		if (rollValue < 1 && remainingBudget >= 80 && recipeWeight >= 2.0) {
			const qty = Math.min(Math.floor(remainingBudget / 80), randInt(1, 3));
			loot.add('Gemstone core', qty);
			remainingBudget -= qty * 80;
		} else if (rollValue < 5 && remainingBudget >= 50 && recipeWeight >= 1.5) {
			const qty = Math.min(Math.floor(remainingBudget / 50), randInt(1, 2));
			loot.add('Brimstone elixir', qty);
			remainingBudget -= qty * 50;
		} else if (rollValue < 15 && remainingBudget >= 35 && recipeWeight >= 1.2) {
			const qty = Math.min(Math.floor(remainingBudget / 35), randInt(1, 4));
			loot.add('Gemstone bundle', qty);
			remainingBudget -= qty * 35;
		} else if (rollValue < 35 && remainingBudget >= 20) {
			const qty = Math.min(Math.floor(remainingBudget / 20), randInt(2, 8));
			loot.add('Gemstone satchel', qty);
			remainingBudget -= qty * 20;
		} else if (rollValue < 60 && remainingBudget >= 10) {
			const seeds = randArrItem(['Ignilace seed', 'Athelas seed', 'Korulsi seed']);
			const qty = Math.min(Math.floor(remainingBudget / 10), randInt(3, 12));
			loot.add(seeds, qty);
			remainingBudget -= qty * 10;
		} else if (remainingBudget >= 5) {
			const qty = Math.min(Math.floor(remainingBudget / 5), randInt(20, 100));
			loot.add('Bow string', qty);
			remainingBudget -= qty * 5;
		} else {
			break;
		}
	}

	return loot;
}

export async function constructionContractsStartCommand({
	user,
	recipe,
	channelId
}: {
	user: MUser;
	channelId: string;
	recipe: string;
}) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const selectedRecipe = ContractRecipes.find(r => stringMatches(r.name, recipe));
	if (!selectedRecipe) {
		return `Invalid contract. Available contracts: ${ContractRecipes.map(r => r.name).join(', ')}`;
	}

	const skillReqs: Skills = { construction: CONSTRUCTION_REQUIREMENT };
	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to take on Construction Contracts.`;
	}

	if (user.skillLevel('construction') < selectedRecipe.constructionLevel) {
		return `You need ${selectedRecipe.constructionLevel} Construction to fulfill ${selectedRecipe.name}.`;
	}

	let durationPerContract = BASE_DURATION_PER_CONTRACT;
	const boosts: string[] = [];

	if (user.hasEquippedOrInBank(["Carpenter's helmet", "Carpenter's shirt", "Carpenter's trousers", "Carpenter's boots"])) {
		boosts.push("10% faster construction (Carpenter's Outfit)");
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 10));
	}

	const hasEnhancedStam = user.bank.has('Enhanced stamina potion');
	if (hasEnhancedStam) {
		boosts.push('10% faster construction (Enhanced stamina potion)');
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 10));
	}

	const hasMasterConstructionCape = user.hasEquippedOrInBank(['Construction master cape']);
	if (hasMasterConstructionCape) {
		boosts.push('15% faster construction (Construction master cape)');
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 15));
	}

	const hasCelestialPendant = user.hasEquippedOrInBank(['Celestial pendant']);
	if (hasCelestialPendant) {
		boosts.push('25% faster construction (Celestial Pendant)');
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 25));
	}

	const hasDrygoreSaw = user.hasEquippedOrInBank(['Drygore saw']);
	if (hasDrygoreSaw) {
		boosts.push('40% faster construction (Drygore saw)');
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 40));
	}

	const hasDwarvenGreathammer = user.hasEquippedOrInBank(['Dwarven greathammer']);
	if (hasDwarvenGreathammer) {
		boosts.push('10% faster construction (Dwarven greathammer)');
		durationPerContract = Math.floor(reduceNumByPercent(durationPerContract, 10));
	}

	const islandUpgrades  = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
	const islandMaint     = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign    = (user.user.island_upgrades as any)?.assignment  ?? null;
	const minigameBonus   = getMinigameRewardBonus(islandUpgrades, islandMaint, islandAssign);
	if (minigameBonus > 0) {
		boosts.push(`${(minigameBonus * 100).toFixed(0)}% better rewards (Settlement Infrastructure)`);
	}

	const maxTripLength = await user.calcMaxTripLength('ConstructionContracts');
	const quantity = Math.floor(maxTripLength / durationPerContract);
	const duration = quantity * durationPerContract;

	if (!user.hasEquippedOrInBank(['Saw', 'Drygore saw', 'Crystal saw'])) {
		return 'You need a Saw, Drygore saw, or Crystal saw to take on Construction Contracts.';
	}

	if (!user.hasEquippedOrInBank(['Hammer', 'Dwarven greathammer'])) {
		return 'You need a Hammer or Dwarven greathammer to take on Construction Contracts.';
	}

	const cost = new Bank();

	if (selectedRecipe.requiredTool) {
		cost.add(selectedRecipe.requiredTool.id, selectedRecipe.toolQuantity || 1);
	}

	for (const ingredient of selectedRecipe.ingredients) {
		cost.add(ingredient.item.id, ingredient.quantity * quantity);
	}

	if (hasEnhancedStam) {
		cost.add('Enhanced stamina potion', 1);
	}

	if (!user.owns(cost)) {
		return `You don't have enough supplies. You need: ${cost}.`;
	}

	await user.removeItemsFromBank(cost);

	await ActivityManager.startTrip<ConstructionContractsTaskOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'ConstructionContracts',
		minigameID: 'construction_contracts',
		recipe: selectedRecipe.name,
	});

	return `${user.minionName} is working on ${quantity}x ${selectedRecipe.name}s for ${formatDuration(duration)}.
${selectedRecipe.description}
Materials: ${selectedRecipe.ingredients.map(i => `${i.quantity * quantity}x ${i.item.name}`).join(', ')}${selectedRecipe.requiredTool ? `\nSpecial Tool: ${selectedRecipe.requiredTool.name}` : ''}
Boosts: ${boosts.length ? boosts.join(', ') : 'None'}`;
}

export function calculateContractsResult(data: ConstructionContractsTaskOptions) {
	const recipe = ContractRecipes.find(r => r.name === data.recipe)!;
	const rarityBonus = [0, 0.05, 0.10, 0.15, 0.20, 0.25][data.rarityUpgradeTier ?? 0] ?? 0;

	const tripMultiplier = getTripQualityMultiplier();

	const contractQualities: number[] = [];
	let totalQualityPoints = 0;
	let successfulContracts = 0;
	let failedContracts = 0;

	for (let i = 0; i < data.quantity; i++) {
		const quality = rollContractQuality(tripMultiplier);
		contractQualities.push(quality);

		if (quality >= 30) {
			successfulContracts++;
			totalQualityPoints += quality;
		} else {
			failedContracts++;
		}
	}

	const primaryLoot = generateRewardsFromPool(totalQualityPoints, recipe.rewardWeight, rarityBonus);
	const middlingLoot = generateMiddlingLoot(recipe, successfulContracts);
	const totalLoot = new Bank().add(primaryLoot).add(middlingLoot);

	const petDropped = totalLoot.has('Bamyr');

	const avgQuality = contractQualities.reduce((sum, q) => sum + q, 0) / data.quantity;
	const legendaryCount = contractQualities.filter(q => q >= 99.5).length;
	const exceptionalCount = contractQualities.filter(q => q >= 95 && q < 99.5).length;
	const greatCount = contractQualities.filter(q => q >= 80 && q < 95).length;

	let tripQuality: 'disastrous' | 'poor' | 'average' | 'good' | 'exceptional';
	if (avgQuality >= 75) tripQuality = 'exceptional';
	else if (avgQuality >= 60) tripQuality = 'good';
	else if (avgQuality >= 40) tripQuality = 'average';
	else if (avgQuality >= 25) tripQuality = 'poor';
	else tripQuality = 'disastrous';

	let flavorMessage = '';
	const client = randArrItem(CONTRACT_CLIENTS);

	if (petDropped) {
		flavorMessage = `\n\n**While fulfilling the contracts set before you, your minion notices a small deer following them around. As they complete the final touches, the deer approaches and nuzzles your minion.**

*In memory of Bami, whose spirit lives on through exceptional craftsmanship.*`;
	} else {
		flavorMessage = `\n\n${randArrItem(FLAVOR_MESSAGES[tripQuality])}`;

		if (tripQuality === 'exceptional') {
			flavorMessage += `\n**${client} was absolutely blown away and gave you exceptional rewards!**`;
		} else if (tripQuality === 'good') {
			flavorMessage += `\n**${client} was very impressed with your work!**`;
		} else if (tripQuality === 'average') {
			flavorMessage += `\n**${client} was satisfied with your work.**`;
		} else if (tripQuality === 'poor') {
			flavorMessage += `\n**${client} was disappointed with the quality.**`;
		} else {
			flavorMessage += `\n**${client} is reconsidering hiring you again.**`;
		}
	}

	const avgQualityStr = avgQuality.toFixed(1);
	const qualityPointsStr = totalQualityPoints.toFixed(0);

	flavorMessage += `\nAvg Quality: ${avgQualityStr} | Quality Points: ${qualityPointsStr} | Successful: ${successfulContracts} | Failed: ${failedContracts}`;

	const notableResults: string[] = [];
	if (legendaryCount > 0) notableResults.push(`Legendary: ${legendaryCount}`);
	if (exceptionalCount > 0) notableResults.push(`Exceptional: ${exceptionalCount}`);
	if (greatCount > 0) notableResults.push(`Great: ${greatCount}`);

	if (notableResults.length > 0) {
		flavorMessage += `\n${notableResults.join(' | ')}`;
	}

	return {
		loot: totalLoot,
		constructionXP: data.quantity * BASE_CONSTRUCTION_XP * recipe.xpMultiplier,
		recipe,
		flavorMessage,
		completedContracts: successfulContracts,
		failedContracts,
		petDropped
	};
}