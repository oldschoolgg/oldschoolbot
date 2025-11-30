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
import { Items, resolveItems } from './structures/Items.js';
import LootTable from './structures/LootTable.js';
import { type Monster, type MonsterKillOptions, SimpleMonster } from './structures/Monster.js';
import type { OpenableOpenOptions } from './structures/Openable.js';
import { SimpleOpenable } from './structures/SimpleOpenable.js';
import {
	addBanks,
	addItemToBank,
	averageBank,
	calcDropRatesFromBank,
	convertBankToPerHourStats,
	generateRandomBank,
	increaseBankQuantitesByPercent
} from './util/bank.js';
import { fromKMB, toKMB } from './util/smallUtils.js';
import { convertLVLtoXP, convertXPtoLVL } from './util/util.js';

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
	resolveItems,
	addItemToBank,
	addBanks,
	averageBank,
	convertLVLtoXP,
	convertXPtoLVL,
	increaseBankQuantitesByPercent,
	calcDropRatesFromBank,
	convertBankToPerHourStats,
	SimpleMonster,
	generateRandomBank
};

export type { ItemBank, LootBank, OpenableOpenOptions, MonsterKillOptions, Monster };

export * from './meta/item.js';
export * from './meta/monsterData.js';
export * from './simulation/clues/index.js';
export * from './simulation/clues/index.js';
export * from './simulation/misc/index.js';
export * from './simulation/openables/Implings.js';
export * from './simulation/openables/index.js';
export * from './simulation/subtables/index.js';
export * from './structures/LootTable.js';

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;

export * from './gear/index.js';
export * from './hiscores/Hiscores.js';

export function itemID(name: string | number): number {
	return Items.getId(name);
}
