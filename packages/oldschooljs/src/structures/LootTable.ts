import { randArrItem } from 'e';
import itemID from '../util/itemID';
import Bank from './Bank';
import Items from './Items';

export function reduceNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value - value * (percent / 100);
}
export function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function roll(upperLimit: number): boolean {
	return randInt(1, upperLimit) === 1;
}

export interface LootTableOptions {
	limit?: number;
}

export interface LootTableMoreOptions {
	multiply?: boolean;
	freeze?: boolean;
}

export interface LootTableItem {
	item: number | LootTable;
	weight?: number;
	quantity: number | number[];
	options?: LootTableMoreOptions;
}

export interface OneInItems extends LootTableItem {
	chance: number;
}
export function isArrayOfItemTuples(x: readonly unknown[]): x is [string, (number | number[])?][] {
	return Array.isArray(x[0]);
}

export interface LootTableRollOptions {
	/**
	 * Map<item_id, percentage>
	 *
	 * item_id droprate will be decreased by percentage%.
	 */
	tertiaryItemPercentageChanges?: Map<string, number>;
	targetBank?: Bank;
}

export default class LootTable {
	public length: number;
	public table: LootTableItem[];
	public totalWeight: number;
	public limit?: number;
	public oneInItems: OneInItems[];
	public tertiaryItems: OneInItems[];
	public everyItems: LootTableItem[];
	public allItems: number[];

	public constructor(lootTableOptions: LootTableOptions = {}) {
		this.table = [];
		this.oneInItems = [];
		this.tertiaryItems = [];
		this.everyItems = [];
		this.length = 0;
		this.totalWeight = 0;
		this.limit = lootTableOptions.limit;
		this.allItems = [];
	}

	public clone(): LootTable {
		const newTable = new LootTable();
		newTable.table = [...this.table];
		newTable.oneInItems = [...this.oneInItems];
		newTable.tertiaryItems = [...this.tertiaryItems];
		newTable.everyItems = [...this.everyItems];
		newTable.length = this.length;
		newTable.totalWeight = this.totalWeight;
		newTable.limit = this.limit;
		newTable.allItems = [...this.allItems];

		return newTable;
	}

	private resolveName(name: string): number {
		return itemID(name);
	}

	private addToAllItems(items: number | number[] | LootTable | LootTableItem | LootTableItem[]): void {
		if (Array.isArray(items)) {
			for (const item of items) {
				this.addToAllItems(item);
			}
			return;
		}

		if (items instanceof LootTable) {
			this.allItems = Array.from(new Set(this.allItems.concat(Array.isArray(items) ? items : items.allItems)));
			return;
		}

		if (typeof items === 'number') {
			if (this.allItems.includes(items)) return;
			this.allItems.push(items);
		} else {
			this.addToAllItems(items.item);
		}
	}

	public oneIn(
		chance: number,
		item: LootTable | number | string,
		quantity: number | number[] = 1,
		options?: LootTableMoreOptions
	): this {
		const resolved = typeof item === 'string' ? this.resolveName(item) : item;
		this.oneInItems.push({
			item: resolved,
			chance,
			quantity,
			options
		});

		this.addToAllItems(resolved);

		return this;
	}

	public tertiary(
		chance: number,
		item: LootTable | number | string,
		quantity: number | number[] = 1,
		options?: LootTableMoreOptions
	): this {
		const resolved = typeof item === 'string' ? this.resolveName(item) : item;
		this.tertiaryItems.push({
			item: resolved,
			chance,
			quantity,
			options
		});

		this.addToAllItems(resolved);

		return this;
	}

	public every(
		item: LootTable | number | string,
		quantity: number | number[] = 1,
		options?: LootTableMoreOptions
	): this {
		const resolved = typeof item === 'string' ? this.resolveName(item) : item;
		this.everyItems.push({
			item: resolved,
			quantity,
			options
		});

		this.addToAllItems(resolved);

		return this;
	}

	public add(
		item: LootTable | number | string,
		quantity: number[] | number = 1,
		weight = 1,
		options?: LootTableMoreOptions
	): this {
		if (this.limit && weight + this.totalWeight > this.limit) {
			throw new Error('Loot table total weight exceeds limit');
		}
		if (typeof item === 'string') {
			return this.add(this.resolveName(item), quantity, weight, options);
		}

		this.length += 1;
		this.totalWeight += weight;

		this.addToAllItems(item);

		this.table.push({
			item,
			weight,
			quantity,
			options
		});

		return this;
	}

	private cachedOptimizedTable: number[] | null = null;
	roll(quantity?: number): Bank;
	roll(quantity: number, options: { targetBank?: undefined } & LootTableRollOptions): Bank;
	roll(quantity: number, options: { targetBank: Bank } & LootTableRollOptions): null;
	public roll(quantity = 1, options: LootTableRollOptions = {}): Bank | null {
		const loot = options.targetBank ?? new Bank();
		const effectiveTertiaryItems = options.tertiaryItemPercentageChanges
			? this.tertiaryItems.map(i => {
					if (typeof i.item !== 'number') return i;
					if (i.options?.freeze === true) return i;
					const change = options.tertiaryItemPercentageChanges?.get(Items.get(i.item)!.name);
					if (!change) return i;
					return {
						...i,
						chance: Math.ceil(reduceNumByPercent(i.chance, change))
					};
				})
			: this.tertiaryItems;
		const limit = this.limit || this.totalWeight;

		if (this.table.every(i => Number.isInteger(i.weight)) && this.cachedOptimizedTable === null) {
			this.cachedOptimizedTable = [];
			for (const item of this.table) {
				for (let j = 0; j < item.weight!; j++) {
					this.cachedOptimizedTable.push(this.table.indexOf(item));
				}
			}
			while (this.cachedOptimizedTable.length < limit) {
				this.cachedOptimizedTable.push(-1);
			}
		}

		outerLoop: for (let i = 0; i < quantity; i++) {
			for (let j = 0; j < this.everyItems.length; j++) {
				this.addResultToLoot(this.everyItems[j], loot);
			}

			for (let j = 0; j < effectiveTertiaryItems.length; j++) {
				if (roll(effectiveTertiaryItems[j].chance)) {
					this.addResultToLoot(effectiveTertiaryItems[j], loot);
				}
			}

			for (let j = 0; j < this.oneInItems.length; j++) {
				if (roll(this.oneInItems[j].chance)) {
					this.addResultToLoot(this.oneInItems[j], loot);
					continue outerLoop;
				}
			}

			if (this.cachedOptimizedTable) {
				this.addResultToLoot(this.table[randArrItem(this.cachedOptimizedTable)], loot);
			} else {
				const randomWeight = randFloat(0, limit);
				let weight = 0;
				for (let i = 0; i < this.table.length; i++) {
					weight += this.table[i].weight!;
					if (randomWeight <= weight) {
						this.addResultToLoot(this.table[i], loot);
						break;
					}
				}
			}
		}

		if (!options.targetBank) {
			return loot;
		}
		return null;
	}

	private addResultToLoot(result: LootTableItem, loot: Bank): void {
		if (typeof result?.item === 'number') {
			loot.addItem(result.item, this.determineQuantity(result.quantity));
			return;
		}

		if (result?.item instanceof LootTable) {
			const qty = this.determineQuantity(result.quantity);
			if (result.options?.multiply) loot.add(result.item.roll(1).multiply(qty));
			else result.item.roll(qty, { targetBank: loot });
			return;
		}
	}

	protected determineQuantity(quantity: number | number[]): number {
		if (Array.isArray(quantity)) {
			return randInt(quantity[0], quantity[1]);
		}
		return quantity;
	}
}
