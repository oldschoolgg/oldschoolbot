import { roll } from 'e';

import { MonsterSlayerMaster } from '../meta/monsterData';
import type { CustomKillLogic, MonsterKillOptions, MonsterOptions } from '../meta/types';
import {
	getAncientShardChanceFromHP,
	getBrimKeyChanceFromCBLevel,
	getLarranKeyChanceFromCBLevel,
	getSlayersEnchantmentChanceFromHP,
	getTotemChanceFromHP
} from '../util/util';
import Bank from './Bank';
import type LootTable from './LootTable';
import Monster from './Monster';

interface SimpleMonsterOptions extends MonsterOptions {
	table?: LootTable;
	modifiedTable?: LootTable;
	onTaskTable?: LootTable;
	wildyCaveTable?: LootTable;
	pickpocketTable?: LootTable;
	customKillLogic?: CustomKillLogic;
}

export default class SimpleMonster extends Monster {
	public table?: LootTable;
	public modifiedTable?: LootTable;
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
		this.modifiedTable = options.modifiedTable;
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

		const rollTable = this.modifiedTable && options.lootTableOptions?.modifyTable ? this.modifiedTable : this.table;

		if (!canGetBrimKey && !wildySlayer && !options.inCatacombs && !options.onSlayerTask) {
			rollTable?.roll(quantity, lootTableOptions);
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
					rollTable?.roll(1, lootTableOptions);
				}
			} else {
				// Not on slayer task
				rollTable?.roll(1, lootTableOptions);
			}
			if (this.customKillLogic) {
				this.customKillLogic(options, loot);
			}
		}
		return loot;
	}
}
