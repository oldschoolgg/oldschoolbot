import { stringMatches } from '@oldschoolgg/toolkit';
import { mahojiUsersSettingsFetch } from '../../../../../mahoji/mahojiSettings';
import creatures from '../creatures';
import { type RumourOption, RumourOptions } from './util';

export async function rumourBlock(user: MUser, tier: RumourOption, creature: string) {
	const blockList = (await getRumourBlockList(user.id)).rumour_blocked_ids;
	const tierNumber = RumourOptions.indexOf(tier);
	const blockedTask = blockList[tierNumber];

	const resolvedCreature = creatures.find(c =>
		c.aliases.some(alias => stringMatches(alias, creature) || stringMatches(alias.split(' ')[0], creature))
	);
	const blockedCreature = creatures.find(c => c.id === blockedTask);

	if (!resolvedCreature) return "That's not a valid creature.";

	if (!resolvedCreature.tier?.some(t => t === tier)) {
		return `That creature is not part of the ${tier} tier.`;
	}

	if (resolvedCreature === blockedCreature) return 'That creature is already blocked.';

	blockList[tierNumber] = resolvedCreature.id;

	let str = `You have blocked ${resolvedCreature.name}.`;

	if (blockedCreature) {
		str += ` You have unblocked ${blockedCreature.name}`;
	}

	const updateData: { rumour_blocked_ids: number[] } = { rumour_blocked_ids: blockList };
	await user.update(updateData);

	return str;
}

export async function rumourUnblock(user: MUser, creature: string) {
	const blockList = (await getRumourBlockList(user.id)).rumour_blocked_ids;

	const resolvedCreature = creatures.find(c =>
		c.aliases.some(alias => stringMatches(alias, creature) || stringMatches(alias.split(' ')[0], creature))
	);

	if (!resolvedCreature) return "That's not a valid creature.";

	let tierNumber: number | undefined = undefined;
	for (const tier of resolvedCreature.tier || []) {
		const tierIndex = RumourOptions.indexOf(tier as RumourOption);
		if (tierIndex === -1) continue;

		const blockedTask = blockList[tierIndex];
		if (blockedTask === resolvedCreature.id) {
			tierNumber = tierIndex;
			break;
		}
	}

	if (tierNumber === undefined) {
		return `${resolvedCreature.name} is not blocked in any tier.`;
	}

	blockList[tierNumber] = 0;

	const str = `You have unblocked ${resolvedCreature.name}.`;

	const updateData: { rumour_blocked_ids: number[] } = { rumour_blocked_ids: blockList };
	await user.update(updateData);

	return str;
}

export async function rumourBlockList(user: MUser) {
	const blockList = (await getRumourBlockList(user.id)).rumour_blocked_ids;

	if (blockList.reduce((acc, a) => acc + a) === 0) {
		return 'You may block one creature of each tier from appearing in rumours of any tier. You currently have no creatures blocked.';
	}

	let str = 'You have the following creatures blocked:';

	for (let i = 0; i < 4; i++) {
		const tier = RumourOptions[i].charAt(0).toUpperCase() + RumourOptions[i].slice(1);

		let creaturename = 'None';

		const creature = creatures.find(c => c.id === blockList[i]);

		if (creature) creaturename = creature.name;

		str += `\n${tier}: ${creaturename}`;
	}

	return str;
}

export async function getRumourBlockList(userID: string) {
	return await mahojiUsersSettingsFetch(userID, { rumour_blocked_ids: true });
}
