import { stringMatches, toTitleCase } from '@oldschoolgg/toolkit';

import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { type RumourOption, RumourOptions, tierToHunterLevel } from '@/lib/skilling/skills/hunter/rumours/util.js';

export async function rumourBlock(user: MUser, tier: RumourOption, creature: string) {
	const blockList = { ...user.rumourBlockList };
	const blockedTask = blockList[tier];

	if (user.skillsAsLevels.hunter < tierToHunterLevel[tier]) {
		return `You need level ${tierToHunterLevel[tier]} hunter to block creatures in the ${tier} slot.`;
	}

	const resolvedCreature = creatures.find(c =>
		c.aliases.some(alias => stringMatches(alias, creature) || stringMatches(alias.split(' ')[0], creature))
	);
	const blockedCreature = creatures.find(c => c.id === blockedTask);

	if (!resolvedCreature) return "That's not a valid creature.";

	if (!resolvedCreature.tier?.some(t => t === tier)) {
		return `That creature is not part of the ${tier} tier.`;
	}

	if (Object.values(blockList).includes(resolvedCreature.id)) return 'That creature is already blocked.';

	blockList[tier] = resolvedCreature.id;

	let str = `You have blocked ${resolvedCreature.name}.`;

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

	const blockedTier = RumourOptions.find(tier => blockList[tier] === resolvedCreature.id);

	if (blockedTier === undefined) {
		return `${resolvedCreature.name} is not blocked in any tier.`;
	}

	delete blockList[blockedTier];

	const str = `You have unblocked ${resolvedCreature.name}.`;

	await user.update({ rumour_blocked_ids: blockList });

	return str;
}

export async function rumourBlockList(user: MUser) {
	const blockList = user.rumourBlockList;

	if (Object.keys(blockList).length === 0) {
		return 'You may block one creature of each tier from appearing in rumours of any tier. You currently have no creatures blocked.';
	}

	let str = 'You have the following creatures blocked:';

	for (const tier of RumourOptions) {
		let creatureName = 'None';

		const creature = creatures.find(c => c.id === blockList[tier]);

		if (creature) creatureName = creature.name;

		str += `\n${toTitleCase(tier)}: ${creatureName}`;
	}

	return str;
}
