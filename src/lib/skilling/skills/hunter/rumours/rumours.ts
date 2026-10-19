import { formatDuration, Time, toTitleCase } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';

import { QuestID } from '@/lib/minions/data/quests.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { hunterOutfitBonus } from '@/lib/skilling/skills/hunter/hunter.js';
import {
	type Rumour,
	type RumourOption,
	RumourOptions,
	tierToHunterLevel
} from '@/lib/skilling/skills/hunter/rumours/util.js';
import { type Creature, HunterTechniqueEnum } from '@/lib/skilling/types.js';
import { RumourTierBank } from '@/lib/structures/Bank.js';
import type { RumourActivityTaskOptions } from '@/lib/types/minions.js';

const hunterTechniqueToRate: Partial<Record<HunterTechniqueEnum, number>> = {
	[HunterTechniqueEnum.BirdSnaring]: 20,
	[HunterTechniqueEnum.BoxTrapping]: 50,
	[HunterTechniqueEnum.ButterflyNetting]: 75,
	[HunterTechniqueEnum.DeadfallTrapping]: 15,
	[HunterTechniqueEnum.Falconry]: 10,
	[HunterTechniqueEnum.NetTrapping]: 25,
	[HunterTechniqueEnum.PitfallTrapping]: 15,
	[HunterTechniqueEnum.Tracking]: 15
};

export async function rumoursCommand(user: MUser, channelId: string, input?: RumourOption) {
	const hunterLevel = user.skillsAsLevels.hunter;
	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return 'You need to complete the Children of the Sun quest before you can be assigned a Hunter Rumour. Use /activities quest.';
	}
	if (hunterLevel < 46) return 'You need at least level 46 in Hunter to begin doing Hunter Rumours.';
	const tier = input ?? highestLevelRumour(user);
	if (hunterLevel < tierToHunterLevel[tier]) {
		return `You need level ${tierToHunterLevel[tier]} Hunter to do ${tier} rumours!`;
	}
	const maxTripLength = await user.calcMaxTripLength('Rumour');
	const rumours = generateRumourTasks(user, tier, maxTripLength);
	if (rumours.length === 0) return 'No rumours fit into this trip. Try again or unblock some creatures.';
	const duration = rumours.reduce((total, rumour) => total + rumour.duration, 0);
	await ActivityManager.startTrip<RumourActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity: rumours.length,
		tier,
		rumours,
		duration,
		type: 'Rumour'
	});
	return `${user.minionName} is now completing ${tier} tier rumours. It'll return in ${formatDuration(duration)}.`;
}

function generateRumourTasks(user: MUser, tier: RumourOption, maxLength: number): Rumour[] {
	const rumours: Rumour[] = [];
	const available = creatures.filter(
		creature =>
			creature.tier?.includes(tier) &&
			creature.level <= user.skillsAsLevels.hunter &&
			(!creature.qpRequired || user.QP >= creature.qpRequired) &&
			(!creature.herbloreLvl || user.skillsAsLevels.herblore >= creature.herbloreLvl) &&
			!Object.values(user.rumourBlockList).includes(creature.id)
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

function highestLevelRumour(user: MUser): RumourOption {
	if (user.skillLevel('hunter') >= 91) return 'master';
	if (user.skillLevel('hunter') >= 72) return 'expert';
	if (user.skillLevel('hunter') >= 57) return 'adept';
	return 'novice';
}

export async function rumourCount(user: MUser) {
	const { rumours } = await user.fetchStats();
	const rumourTierBank = new RumourTierBank(rumours as Record<RumourOption, number>);
	const total = rumourTierBank.total;
	if (!total) return 'Your minion has not completed any rumours yet. Use /rumours start to begin.';
	const counts = RumourOptions.map(tier => `${rumourTierBank.amount(tier)} ${toTitleCase(tier)} rumours.`);
	return `Your minion has completed:\n${counts.join('\n')}\nTotal: ${total}`;
}
