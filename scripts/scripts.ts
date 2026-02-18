import { renderCreatablesFile } from './creatables.js';
import { renderDataFiles } from './dataFiles.js';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile.js';
import { clueBoosts } from './wiki/clueBoosts.js';
import { renderFishingXpHrTable } from './wiki/fishingSnapshots.js';
import { renderMiningXpHrTable } from './wiki/miningSnapshots.js';
import { renderCoxMarkdown } from './wiki/renderCox.js';
import { renderMonstersMarkdown } from './wiki/renderMonsters.js';
import { renderQuestsMarkdown } from './wiki/renderQuests.js';
import { renderTripBuyables } from './wiki/tripBuyables.js';
import { updateAuthors } from './wiki/updateAuthors.js';

type Script = { desc: string; fn: () => Promise<unknown> | unknown };
const isWikiBuild = true;

export const scripts: Script[] = [
	{ desc: 'Rendering commands file', fn: renderCommandsFile },
	{ desc: 'Rendering monsters file', fn: createMonstersJson },
	{ desc: 'Rendering creatables file', fn: renderCreatablesFile },
	{ desc: 'Rendering skilling data files', fn: renderDataFiles },
	{ desc: 'Wiki: Rendering clue boosts', fn: clueBoosts },
	{ desc: 'Wiki: Rendering monsters markdown', fn: renderMonstersMarkdown },
	{ desc: 'Wiki: Rendering cox markdown', fn: renderCoxMarkdown },
	{ desc: 'Wiki: Rendering trip buyables', fn: renderTripBuyables },
	{ desc: 'Wiki: Rendering quests markdown', fn: renderQuestsMarkdown },
	...(isWikiBuild
		? [
				{
					desc: 'Wiki: Rendering fishing snapshots',
					fn: renderFishingXpHrTable
				},
				{
					desc: 'Wiki: Rendering mining snapshots',
					fn: renderMiningXpHrTable
				},
				{ desc: 'Wiki: Rendering authors', fn: updateAuthors }
			]
		: [])
];
