import '../../../src/lib/safeglobals.js';

import { renderCreatablesFile } from '@scripts/creatables.js';
import { renderDataFiles } from '@scripts/dataFiles.js';
import { createMonstersJson } from '@scripts/monstersJson.js';
import { renderCommandsFile } from '@scripts/renderCommandsFile.js';
import { clueBoosts } from '@scripts/wiki/clueBoosts.js';
import { renderFishingXpHrTable } from '@scripts/wiki/fishingSnapshots.js';
import { renderMiningXpHrTable } from '@scripts/wiki/miningSnapshots.js';
import { renderCoxMarkdown } from '@scripts/wiki/renderCox.js';
import { renderMonstersMarkdown } from '@scripts/wiki/renderMonsters.js';
import { renderQuestsMarkdown } from '@scripts/wiki/renderQuests.js';
import { renderTripBuyables } from '@scripts/wiki/tripBuyables.js';
import { updateAuthors } from '@scripts/wiki/updateAuthors.js';

const isWikiBuild = process.argv.includes('--wiki');

type Script = { desc: string; fn: () => Promise<unknown> | unknown };

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
