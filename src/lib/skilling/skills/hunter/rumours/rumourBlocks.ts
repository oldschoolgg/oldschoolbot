import { stringMatches } from '@oldschoolgg/toolkit';

import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import {
	canAssignRumour,
	getRumourHunter,
	type RumourHunterID,
	RumourHunters,
	tierToHunterLevel
} from '@/lib/skilling/skills/hunter/rumours/util.js';

export async function rumourBlock(user: MUser, hunterID: RumourHunterID, creature: string) {
	const hunter = getRumourHunter(hunterID);
	const blockList = { ...user.rumourBlockList };
	const blockedTask = blockList[hunter.id];

	if (user.skillsAsLevels.hunter < tierToHunterLevel[hunter.tier]) {
		return `You need level ${tierToHunterLevel[hunter.tier]} Hunter to block creatures with ${hunter.label}.`;
	}

	const resolvedCreature = creatures.find(c =>
		c.aliases.some(alias => stringMatches(alias, creature) || stringMatches(alias.split(' ')[0], creature))
	);
	const blockedCreature = creatures.find(c => c.id === blockedTask);

	if (!resolvedCreature) return "That's not a valid creature.";

	if (!canAssignRumour(hunter, resolvedCreature)) {
		return `${hunter.label} cannot assign that creature.`;
	}
	const levelRequired = resolvedCreature.rumourLevel ?? resolvedCreature.level;
	if (user.skillsAsLevels.hunter < levelRequired) {
		return `You need level ${levelRequired} Hunter to block ${resolvedCreature.name}.`;
	}

	if (Object.values(blockList).includes(resolvedCreature.id)) return 'That creature is already blocked.';

	blockList[hunter.id] = resolvedCreature.id;

	let str = `You have blocked ${resolvedCreature.name} with ${hunter.label}.`;

	if (blockedCreature) {
		str += ` You have unblocked ${blockedCreature.name}`;
	}

	await user.update({ rumour_blocked_ids: blockList });

	return str;
}

export async function rumourUnblock(user: MUser, creature: string) {
	const blockList = { ...user.rumourBlockList };

	const resolvedCreature = creatures.find(c =>
		c.aliases.some(alias => stringMatches(alias, creature) || stringMatches(alias.split(' ')[0], creature))
	);

	if (!resolvedCreature) return "That's not a valid creature.";

	const blockedHunter = RumourHunters.find(hunter => blockList[hunter.id] === resolvedCreature.id);

	if (blockedHunter === undefined) {
		return `${resolvedCreature.name} is not blocked with any hunter.`;
	}

	delete blockList[blockedHunter.id];

	const str = `You have unblocked ${resolvedCreature.name}.`;

	await user.update({ rumour_blocked_ids: blockList });

	return str;
}

export async function rumourBlockList(user: MUser) {
	const blockList = user.rumourBlockList;

	if (Object.keys(blockList).length === 0) {
		return 'You may hold one blocked creature with each guild hunter. Use another hunter to complete rumours while those creatures are blocked. You currently have no creatures blocked.';
	}

	let str = 'You have the following creatures blocked:';

	for (const hunter of RumourHunters) {
		let creatureName = 'None';

		const creature = creatures.find(c => c.id === blockList[hunter.id]);

		if (creature) creatureName = creature.name;

		str += `\n${hunter.label}: ${creatureName}`;
	}

	return str;
}
