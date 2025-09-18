import './structures/Items.js';
import { ECreature } from './ECreature.js';
import { EItem } from './EItem.js';
import { EMonster } from './EMonster.js';
import * as constants from './constants.js';
import { MonsterSlayerMaster } from './meta/monsterData.js';
import * as Misc from './simulation/misc/index.js';
import {Monsters} from './simulation/monsters/index.js';
import Openables from './simulation/openables/index.js';
import {Bank, type ItemBank, type LootBank} from './structures/Bank.js';
import Items from './structures/Items.js';
import {SimpleOpenable} from './structures/SimpleOpenable.js';
import LootTable from './structures/LootTable.js';
import type { OpenableOpenOptions } from './structures/Openable.js';

export {
	Bank,
	constants,
	Items,
	Misc,
	Monsters,
	MonsterSlayerMaster,
	Openables,
	EItem,
	EMonster,
	SimpleOpenable,
	LootTable,
	ECreature,
};

export type {
	ItemBank,
	LootBank,
	OpenableOpenOptions
}

export * from './structures/LootTable.js';
export * from './constants.js';
export * from './util/index.js';
export * from './structures/Items.js';
export * from './meta/item.js';
export * from './simulation/clues/index.js';
export * from './simulation/openables/index.js';
export * from './simulation/misc/index.js';
export * from './simulation/openables/Implings.js';
export * from './meta/monsterData.js';
export * from './simulation/subtables/index.js';
export * as ItemGroups from './itemGroups.js';
export * from './simulation/clues/index.js';
export * from './structures/Monster.js';

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
