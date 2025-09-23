import { type MonsterData, MonsterSlayerMaster } from '@/meta/monsterData.js';
import {
	getAncientShardChanceFromHP,
	getBrimKeyChanceFromCBLevel,
	getLarranKeyChanceFromCBLevel,
	getSlayersEnchantmentChanceFromHP,
	getTotemChanceFromHP,
	roll
} from '@/util/util.js';
import { Bank } from './Bank.js';
import type LootTable from './LootTable.js';
import type { LootTableRollOptions } from './LootTable.js';

import _monsterData from '../assets/monsters_data.json' with { type: 'json' };
const monsterData = _monsterData as { [key: string]: MonsterData };

export interface MonsterOptions {
	id: number;
	name: string;
	combatLevel?: number;
	hitpoints?: number;
	aliases?: string[];
	allItems?: number[];
}

export interface MonsterKillOptions {
	/**
	 * This is *true* if the monster is being killed inside the catacombs.
	 */
	inCatacombs?: boolean;
	/**
	 * This is *true* if the monster is being killed inside the wilderness.
	 */
	inWilderness?: boolean;
	/**
	 * This is *true* if the monster being killed is on-task.
	 */
	onSlayerTask?: boolean;
	/**
	 * This is the assigner of this task, if on a task.
	 */
	slayerMaster?: MonsterSlayerMaster;
	/**
	 * If monster is eligible for superior, pass the LootTable.
	 */
	hasSuperiors?: SimpleMonster;
	farmingLevel?: number;
	isAwakened?: boolean;
	lootTableOptions?: LootTableRollOptions;
}

export abstract class Monster {
	public id: number;
	public name: string;
	public aliases: string[];
	public data: MonsterData;
	public allItems: number[];
	public abstract kill(_quantity: number, _options: MonsterKillOptions): Bank;

	constructor(options: MonsterOptions) {
		this.id = options.id;
		this.name = options.name;
		this.aliases = options.aliases ?? [];
		this.data = monsterData[this.id];
		this.allItems = options.allItems ?? [];
		const pluralName = `${this.name.toLowerCase()}s`;
		if (!this.aliases.includes(pluralName)) {
			this.aliases.push(pluralName);
		}
	}
}

type CustomKillLogic = (options: MonsterKillOptions, currentLoot: Bank) => void;

interface SimpleMonsterOptions extends MonsterOptions {
	table?: LootTable;
	onTaskTable?: LootTable;
	wildyCaveTable?: LootTable;
	pickpocketTable?: LootTable;
	customKillLogic?: CustomKillLogic;
}

export class SimpleMonster extends Monster {
	public table?: LootTable;
	public onTaskTable?: LootTable;
	public wildyCaveTable?: LootTable;
	public pickpocketTable?: LootTable;
	public customKillLogic?: CustomKillLogic;

	constructor(options: SimpleMonsterOptions) {
		let allItems: number[] = [];
		if (options.table) {
			allItems = allItems.concat(options.table.allItems);
		}
		if (options.pickpocketTable) {
			allItems = allItems.concat(options.pickpocketTable.allItems);
		}
		super({ ...options, allItems });
		this.table = options.table;
		this.pickpocketTable = options.pickpocketTable;
		this.onTaskTable = options.onTaskTable;
		this.wildyCaveTable = options.wildyCaveTable;
		this.customKillLogic = options.customKillLogic;
	}

	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();
		const canGetBrimKey = options.onSlayerTask && options.slayerMaster === MonsterSlayerMaster.Konar;
		const wildySlayer = options.onSlayerTask && options.slayerMaster === MonsterSlayerMaster.Krystilia;
		const slayerMonster: boolean = Boolean(
			options.onSlayerTask && (this.data.slayerLevelRequired || this.data.isSlayerMonster)
		);
		const lootTableOptions = {
			...options.lootTableOptions,
			targetBank: loot
		};

		if (!canGetBrimKey && !wildySlayer && !options.inCatacombs && !options.onSlayerTask) {
			this.table?.roll(quantity, lootTableOptions);
			if (this.customKillLogic) {
				for (let i = 0; i < quantity; i++) {
					this.customKillLogic(options, loot);
				}
			}
			return loot;
		}

		for (let i = 0; i < quantity; i++) {
			if (canGetBrimKey) {
				if (roll(getBrimKeyChanceFromCBLevel(this.data.combatLevel))) {
					loot.add('Brimstone key');
				}
			}
			if (wildySlayer && this.data.hitpoints) {
				if (roll(getSlayersEnchantmentChanceFromHP(this.data.hitpoints))) {
					loot.add("Slayer's enchantment");
				}
				if (roll(getLarranKeyChanceFromCBLevel(this.data.combatLevel, slayerMonster))) {
					loot.add("Larran's key");
				}
			}
			if (options.inCatacombs && this.data.hitpoints && !wildySlayer) {
				if (roll(getAncientShardChanceFromHP(this.data.hitpoints))) {
					loot.add('Ancient shard');
				}
				if (roll(getTotemChanceFromHP(this.data.hitpoints))) {
					// Always drop Dark totem base and bot will transmog accordingly.
					loot.add('Dark totem base');
				}
			}
			if (options.onSlayerTask) {
				if (wildySlayer && this.wildyCaveTable) {
					// Roll the monster's wildy slayer cave table
					this.wildyCaveTable.roll(1, lootTableOptions);
				} else if (this.onTaskTable) {
					// Roll the monster's "on-task" table.
					this.onTaskTable.roll(1, lootTableOptions);
				} else {
					// Monster doesn't have a unique on-slayer table
					this.table?.roll(1, lootTableOptions);
				}
			} else {
				// Not on slayer task
				this.table?.roll(1, lootTableOptions);
			}
			if (this.customKillLogic) {
				this.customKillLogic(options, loot);
			}
		}
		return loot;
	}
}
