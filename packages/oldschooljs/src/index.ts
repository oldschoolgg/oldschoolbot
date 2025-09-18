import { ECreature } from './ECreature.js';
import { EGear } from './EGear.js';
import { EItem } from './EItem.js';
import { EMonster } from './EMonster.js';
import * as ItemGroups from './itemGroups.js';
import { MonsterSlayerMaster } from './meta/monsterData.js';
import * as Misc from './simulation/misc/index.js';
import { Monsters } from './simulation/monsters/index.js';
import Openables from './simulation/openables/index.js';
import { Bank, type ItemBank, type LootBank } from './structures/Bank.js';
import Items, { resolveItems, deepResolveItems, type ArrayItemsResolved, itemNameMap } from './structures/Items.js';
import LootTable from './structures/LootTable.js';
import type { Monster, MonsterKillOptions, SimpleMonster } from './structures/Monster.js';
import type { OpenableOpenOptions } from './structures/Openable.js';
import { SimpleOpenable } from './structures/SimpleOpenable.js';
import { addBanks, addItemToBank, averageBank, calcDropRatesFromBank } from './util/bank.js';
import itemID from './util/itemID.js';
import { fromKMB, randomVariation, toKMB } from './util/smallUtils.js';
import { calcCombatLevel, convertLVLtoXP, convertXPtoLVL } from './util/util.js';

export {
	Bank,
	Items,
	Misc,
	Monsters,
	MonsterSlayerMaster,
	Openables,
	EMonster,
	SimpleOpenable,
	LootTable,
	EGear,
	EItem,
	ECreature,
	ItemGroups,
	toKMB,
	fromKMB,
	itemID,
	resolveItems,
	addItemToBank,
	addBanks,
	randomVariation,
	averageBank,
	convertLVLtoXP,
	convertXPtoLVL,
	deepResolveItems,
	calcCombatLevel,
	itemNameMap,
	calcDropRatesFromBank
};

export type { ItemBank, LootBank, OpenableOpenOptions, MonsterKillOptions, Monster, ArrayItemsResolved, SimpleMonster };

export * from './structures/LootTable.js';
export * from './meta/item.js';
export * from './simulation/clues/index.js';
export * from './simulation/openables/index.js';
export * from './simulation/misc/index.js';
export * from './simulation/openables/Implings.js';
export * from './meta/monsterData.js';
export * from './simulation/subtables/index.js';
export * from './simulation/clues/index.js';

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;

export * from './hiscores/index.js';
export * from './gear/index.js';
