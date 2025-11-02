import { type BaseMessageOptions, ButtonBuilder, dateFm, makeComponents } from '@oldschoolgg/discord';
import { Emoji, stringMatches } from '@oldschoolgg/toolkit';
import { ButtonStyle } from 'discord-api-types/v10';

import { EmojiId } from '@/lib/data/emojis.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { IPatchData, IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import { formatList } from '@/lib/util/smallUtils.js';

function makeAutoFarmButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_FARM')
		.setLabel('Auto Farm')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Farming });
}

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

export type FarmingPatchSettingsKey = `farmingPatches_${FarmingPatchName}`;

export function getFarmingKeyFromName(name: FarmingPatchName): FarmingPatchSettingsKey {
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
	str += `${Emoji.RedX} **Nothing planted:** ${formatList(notReady.map(i => i.friendlyName))}.`;

	const buttons: ButtonBuilder[] = [];

	if (patchesDetailed.filter(i => i.ready === true).length > 0) {
		buttons.push(makeAutoFarmButton());
	}

	return {
		content: str,
		components: makeComponents(buttons)
	};
}
