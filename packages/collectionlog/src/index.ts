import * as clueCls from './clues.js';
import * as minigamesCls from './minigame.js';
import * as pvmCls from './pvm.js';
import { collectionLogRanks } from './ranks.js';
import * as skillingCLs from './skilling.js';

export const CollectionLog = {
	ranks: collectionLogRanks,
	...pvmCls,
	...minigamesCls,
	...skillingCLs,
	...clueCls
};
