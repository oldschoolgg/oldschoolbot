import { Time, toTitleCase } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';
import { ECreature } from 'oldschooljs';

import { QuestID } from '@/lib/minions/data/quests.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { hasFullHunterOutfit, hunterOutfitBonus } from '@/lib/skilling/skills/hunter/hunter.js';
import {
	canAssignRumour,
	getRumourHunter,
	type Rumour,
	type RumourHunterID,
	RumourHunters,
	type RumourOption,
	RumourOptions,
	tierToHunterLevel
} from '@/lib/skilling/skills/hunter/rumours/util.js';
import { type Creature, HunterTechniqueEnum } from '@/lib/skilling/types.js';
import { RumourTierBank } from '@/lib/structures/Bank.js';
import type { RumourActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

interface RumourDropRates {
	dropRate: number;
	pityThreshold: number;
	outfitPityThreshold: number;
}

const hunterTechniqueToRates: Partial<Record<HunterTechniqueEnum, RumourDropRates>> = {
	[HunterTechniqueEnum.BirdSnaring]: { dropRate: 20, pityThreshold: 40, outfitPityThreshold: 38 },
	[HunterTechniqueEnum.BoxTrapping]: { dropRate: 50, pityThreshold: 100, outfitPityThreshold: 94 },
	[HunterTechniqueEnum.ButterflyNetting]: { dropRate: 40, pityThreshold: 80, outfitPityThreshold: 76 },
	[HunterTechniqueEnum.DeadfallTrapping]: { dropRate: 15, pityThreshold: 30, outfitPityThreshold: 28 },
	[HunterTechniqueEnum.Falconry]: { dropRate: 10, pityThreshold: 20, outfitPityThreshold: 18 },
	[HunterTechniqueEnum.NetTrapping]: { dropRate: 25, pityThreshold: 50, outfitPityThreshold: 46 },
	[HunterTechniqueEnum.PitfallTrapping]: { dropRate: 15, pityThreshold: 30, outfitPityThreshold: 28 },
	[HunterTechniqueEnum.Tracking]: { dropRate: 15, pityThreshold: 30, outfitPityThreshold: 28 }
};

export async function rumoursCommand(user: MUser, channelId: string, input?: RumourHunterID) {
	const hunterLevel = user.skillsAsLevels.hunter;
	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return 'You need to complete the Children of the Sun quest before you can be assigned a Hunter Rumour. Use /activities quest.';
	}
	if (hunterLevel < 46) return 'You need at least level 46 in Hunter to begin doing Hunter Rumours.';
	const hunterID = input ?? highestLevelRumourHunter(user);
	if (!hunterID)
		return 'All available guild hunters are holding blocked rumours. Unblock a creature before starting a trip.';
	const hunter = getRumourHunter(hunterID);
	const tier = hunter.tier;
	if (hunterLevel < tierToHunterLevel[tier]) {
		return `You need level ${tierToHunterLevel[tier]} Hunter to do ${hunter.label} rumours!`;
	}
	if (user.rumourBlockList[hunter.id] !== undefined) {
		return `${hunter.label} is holding a blocked rumour. Unblock that creature before completing rumours with this hunter.`;
	}
	const maxTripLength = await user.calcMaxTripLength('Rumour');
	const rumours = generateRumourTasks(user, hunter.id, maxTripLength);
	if (rumours.length === 0) return 'No rumours fit into this trip. Try again or unblock some creatures.';
	const duration = rumours.reduce((total, rumour) => total + rumour.duration, 0);
	await ActivityManager.startTrip<RumourActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity: rumours.length,
		tier,
		hunter: hunter.id,
		rumours,
		duration,
		type: 'Rumour'
	});
	let response = `${user.minionName} is now completing ${hunter.label} rumours. It'll return ${formatTripDuration(user, duration)}.`;
	const boosts: string[] = [];
	const outfitBonus = hunterOutfitBonus(user);
	if (outfitBonus > 0) boosts.push(`+${outfitBonus}% catch chance from the Guild hunter outfit`);
	if (hasFullHunterOutfit(user)) {
		boosts.push('+5% rare creature part chance and reduced pity thresholds from the full Guild hunter outfit');
	}
	if (boosts.length > 0) response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	return response;
}

function generateRumourTasks(user: MUser, hunterID: RumourHunterID, maxLength: number): Rumour[] {
	const hunter = getRumourHunter(hunterID);
	const tier = hunter.tier;
	const rumours: Rumour[] = [];
	const minLength = maxLength * 0.75;
	const blockedCreatureIDs = Object.values(user.rumourBlockList);
	const available = creatures.filter(
		creature =>
			canAssignRumour(hunter, creature) &&
			(creature.rumourLevel ?? creature.level) <= user.skillsAsLevels.hunter &&
			(!creature.qpRequired || user.QP >= creature.qpRequired) &&
			(!creature.herbloreLvl || user.skillsAsLevels.herblore >= creature.herbloreLvl) &&
			!blockedCreatureIDs.includes(creature.id)
	);
	let totalDuration = 0;
	let lastCreatureID: number | undefined;
	while (totalDuration < maxLength) {
		const candidates = available.filter(c => available.length === 1 || c.id !== lastCreatureID);
		if (candidates.length === 0) break;
		const creature = MathRNG.pick(candidates);
		const [seconds, quantity] = calcDurationAndQty(creature, user);
		// Low tier creatures are more spread out, adding travel time between rumours.
		const duration = (seconds + (tier === 'novice' || tier === 'adept' ? 50 : 0)) * Time.Second;
		// Include the whole rumour until at least 75% of the trip allowance is filled, even if it overruns.
		if (totalDuration >= minLength && totalDuration + duration > maxLength) break;
		rumours.push({ creatureID: creature.id, duration, quantity });
		totalDuration += duration;
		lastCreatureID = creature.id;
	}
	return rumours;
}

function calcDurationAndQty(creature: Creature, user: MUser): [number, number] {
	const rates =
		creature.id === ECreature.HERBIBOAR
			? { dropRate: 7, pityThreshold: 14, outfitPityThreshold: 12 }
			: hunterTechniqueToRates[creature.huntTechnique];
	if (rates === undefined) throw new Error(`No rumour drop rate for ${creature.huntTechnique}.`);
	const fullOutfit = hasFullHunterOutfit(user);
	const pityThreshold = fullOutfit ? rates.outfitPityThreshold : rates.pityThreshold;
	// The full outfit increases the existing rare-part chance by 5%.
	const rarePartChance = (100 / rates.dropRate) * (fullOutfit ? 1.05 : 1);
	let quantity = 0;
	// The rare part is guaranteed at the applicable pity threshold.
	for (let i = 0; i < pityThreshold; i++) {
		quantity++;
		if (MathRNG.percentChance(rarePartChance)) break;
	}
	const chanceOfSuccess =
		Math.min(
			100,
			Math.max(1, creature.slope * user.skillsAsLevels.hunter + creature.intercept + hunterOutfitBonus(user))
		) / 100;
	const attempts = Math.ceil(quantity / chanceOfSuccess);
	const traps = creature.multiTraps ? 1 + Math.min(Math.floor(user.skillLevel('hunter') / 20), 5) : 1;
	// Allow 40 seconds to collect hunting gear and reach the creature.
	return [(attempts * creature.catchTime) / traps + 40, quantity];
}

function highestLevelRumourHunter(user: MUser): RumourHunterID | undefined {
	const blockList = user.rumourBlockList;
	return RumourHunters.filter(
		hunter => user.skillsAsLevels.hunter >= tierToHunterLevel[hunter.tier] && blockList[hunter.id] === undefined
	).sort((a, b) => tierToHunterLevel[b.tier] - tierToHunterLevel[a.tier])[0]?.id;
}

export async function rumourCount(user: MUser) {
	const { rumours } = await user.fetchStats();
	const rumourTierBank = new RumourTierBank(rumours as Record<RumourOption, number>);
	const total = rumourTierBank.total;
	if (!total) return 'Your minion has not completed any rumours yet. Use /rumours start to begin.';
	const counts = RumourOptions.map(tier => `${rumourTierBank.amount(tier)} ${toTitleCase(tier)} rumours.`);
	return `Your minion has completed:\n${counts.join('\n')}\nTotal: ${total}`;
}
