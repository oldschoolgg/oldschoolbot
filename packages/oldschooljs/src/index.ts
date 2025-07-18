import './structures/Items';
import { ECreature } from './ECreature';
import { EItem } from './EItem';
import { EMonster } from './EMonster';
import { EQuest } from './EQuest';
import * as constants from './constants';
import { MonsterSlayerMaster } from './meta/monsterData';
import type { MonsterKillOptions } from './meta/types';
import * as Misc from './simulation/misc';
import Monsters from './simulation/monsters/index';
import Openables from './simulation/openables/index';
import Bank from './structures/Bank';
import { Hiscores } from './structures/Hiscores';
import Items from './structures/Items';
import LootTable from './structures/LootTable';
import Player from './structures/Player';
import { Quests } from './structures/Quest';
import SimpleMonster from './structures/SimpleMonster';
import SimpleOpenable from './structures/SimpleOpenable';
import * as Util from './util';
export * from './simulation/clues';

export {
	Bank,
	constants,
	Items,
	LootTable,
	Misc,
	type MonsterKillOptions,
	Monsters,
	MonsterSlayerMaster,
	Openables,
	Player,
	Hiscores,
	Util,
	SimpleMonster,
	EItem,
	EMonster,
	EQuest,
	SimpleOpenable,
	ECreature,
	Quests
};

export * from './simulation/monsters';
export * from './constants';
export * from './util';
export * from './structures/Items';
export * from './meta/types';
export type { default as Monster } from './structures/Monster';
export * from './simulation/clues';
export * from './simulation/openables';
export * from './simulation/misc';
export * from './simulation/openables/Implings';
export * from './meta/monsterData';
export * from './simulation/subtables/index';
export * as ItemGroups from './itemGroups';

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
