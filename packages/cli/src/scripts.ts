import '../../../src/lib/customItems/customItems.js';
import '../../../src/lib/data/itemAliases.js';

import { renderCreatablesFile } from '../../../scripts/creatables.js';
import { createMonstersJson } from '../../../scripts/monstersJson.js';
import { renderCommandsFile } from '../../../scripts/renderCommandsFile.js';
import { renderMiningXpHrTable } from '../../../scripts/wiki/miningSnapshots.js';
import { renderMonstersMarkdown } from '../../../scripts/wiki/renderMonsters.js';
import { renderQuestsMarkdown } from '../../../scripts/wiki/renderQuests.js';
import { renderTripBuyables } from '../../../scripts/wiki/tripBuyables.js';
import { updateAuthors } from '../../../scripts/wiki/updateAuthors.js';

const isWikiBuild = process.argv.includes('--wiki');

type Script = { desc: string; fn: () => Promise<unknown> | unknown };

export const scripts: Script[] = [
	{ desc: 'Rendering commands file', fn: renderCommandsFile },
	{ desc: 'Rendering monsters file', fn: createMonstersJson },
	{ desc: 'Rendering creatables file', fn: renderCreatablesFile },
	{ desc: 'Rendering skilling data files', fn: async () => import('../../../scripts/dataFiles.js') },
	{ desc: 'Wiki: Rendering monsters markdown', fn: renderMonstersMarkdown },
	{ desc: 'Wiki: Rendering trip buyables', fn: renderTripBuyables },
	{ desc: 'Wiki: Rendering quests markdown', fn: renderQuestsMarkdown },
	...(isWikiBuild
		? [
				{
					desc: 'Wiki: Rendering mining snapshots',
					fn: renderMiningXpHrTable
				},
				{ desc: 'Wiki: Rendering authors', fn: updateAuthors }
			]
		: [])
];
