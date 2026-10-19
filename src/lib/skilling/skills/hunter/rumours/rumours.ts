import { Time, toTitleCase } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';

import { QuestID } from '@/lib/minions/data/quests.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { hunterOutfitBonus } from '@/lib/skilling/skills/hunter/hunter.js';
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

const hunterTechniqueToRate: Partial<Record<HunterTechniqueEnum, number>> = {
	[HunterTechniqueEnum.BirdSnaring]: 20,
	[HunterTechniqueEnum.BoxTrapping]: 50,
	[HunterTechniqueEnum.ButterflyNetting]: 40,
	[HunterTechniqueEnum.DeadfallTrapping]: 15,
	[HunterTechniqueEnum.Falconry]: 10,
	[HunterTechniqueEnum.NetTrapping]: 25,
	[HunterTechniqueEnum.PitfallTrapping]: 15,
	[HunterTechniqueEnum.Tracking]: 15
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
	return `${user.minionName} is now completing ${hunter.label} rumours. It'll return ${formatTripDuration(user, duration)}.`;
}

function generateRumourTasks(user: MUser, hunterID: RumourHunterID, maxLength: number): Rumour[] {
	const hunter = getRumourHunter(hunterID);
	const tier = hunter.tier;
	const rumours: Rumour[] = [];
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
		if (totalDuration + duration > maxLength) break;
		rumours.push({ creatureID: creature.id, duration, quantity });
		totalDuration += duration;
		lastCreatureID = creature.id;
	}
	return rumours;
}

function calcDurationAndQty(creature: Creature, user: MUser): [number, number] {
	const dropRate = hunterTechniqueToRate[creature.huntTechnique];
	if (dropRate === undefined) throw new Error(`No rumour drop rate for ${creature.huntTechnique}.`);
	let quantity = 0;
	// Guarantee the rare part by twice the drop rate: 80 catches for butterflies and moths.
	for (let i = 0; i < dropRate * 2; i++) {
		quantity++;
		if (MathRNG.roll(dropRate)) break;
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
