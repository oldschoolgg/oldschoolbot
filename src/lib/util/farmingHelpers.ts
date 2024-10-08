import { dateFm, makeComponents, stringMatches } from '@oldschoolgg/toolkit/util';
import type { User } from '@prisma/client';
import type { BaseMessageOptions, ButtonBuilder } from 'discord.js';

import { Emoji } from '../constants';
import type { IPatchData, IPatchDataDetailed } from '../minions/farming/types';
import Farming from '../skilling/skills/farming';
import { makeAutoFarmButton } from './smallUtils';

export const farmingPatchNames = [
	'herb',
	'fruit_tree',
	'tree',
	'allotment',
	'hops',
	'cactus',
	'bush',
	'spirit',
	'hardwood',
	'seaweed',
	'vine',
	'calquat',
	'redwood',
	'crystal',
	'celastrus',
	'hespori',
	'flower',
	'mushroom',
	'belladonna'
] as const;

export type FarmingPatchName = (typeof farmingPatchNames)[number];

export function isPatchName(name: string): name is FarmingPatchName {
	return farmingPatchNames.includes(name as FarmingPatchName);
}

export const farmingKeys: (keyof User)[] = farmingPatchNames.map(i => `farmingPatches_${i}` as const);

export function getFarmingKeyFromName(name: FarmingPatchName): keyof User {
	return `farmingPatches_${name}`;
}

export function findPlant(lastPlanted: IPatchData['lastPlanted']) {
	if (!lastPlanted) return null;
	const plant = Farming.Plants.find(
		plants => stringMatches(plants.name, lastPlanted) || plants.aliases.some(a => stringMatches(a, lastPlanted))
	);
	if (!plant) return null;
	return plant;
}
export function userGrowingProgressStr(patchesDetailed: IPatchDataDetailed[]): BaseMessageOptions {
	let str = '';
	for (const patch of patchesDetailed.filter(i => i.ready === true)) {
		str += `${Emoji.Tick} **${patch.friendlyName}**: ${patch.lastQuantity} ${patch.lastPlanted} are ready to be harvested!\n`;
	}
	for (const patch of patchesDetailed.filter(i => i.ready === false)) {
		str += `${Emoji.Stopwatch} **${patch.friendlyName}**: ${patch.lastQuantity} ${
			patch.lastPlanted
		} ready at ${dateFm(patch.readyAt!)}\n`;
	}
	const notReady = patchesDetailed.filter(i => i.ready === null);
	str += `${Emoji.RedX} **Nothing planted:** ${notReady.map(i => i.friendlyName).join(', ')}.`;

	const buttons: ButtonBuilder[] = [];

	if (patchesDetailed.filter(i => i.ready === true).length > 0) {
		buttons.push(makeAutoFarmButton());
	}

	return {
		content: str,
		components: makeComponents(buttons)
	};
}
