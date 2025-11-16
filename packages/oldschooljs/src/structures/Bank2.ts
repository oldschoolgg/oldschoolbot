import type { Item } from '@/meta/item.js';
import itemIDMapRaw from '../../itemIDMap.json' with { type: 'json' };
import { Items } from './Items.js';

const frozenErrorStr = 'Tried to mutate a frozen Bank.';
const ARRAY_SIZE = 31234; // Max index from itemIDMap + 1
const itemIDMap = itemIDMapRaw as Record<string, number>;

// Create reverse map: index -> itemID for efficient lookups
const indexToItemID: number[] = new Array(ARRAY_SIZE);
for (const [itemID, index] of Object.entries(itemIDMap)) {
	indexToItemID[index] = Number(itemID);
}

type ItemResolvable = Item | string | number;

export class Bank2 {
	private data: Int32Array;
	public frozen = false;

	constructor(initialBank?: ItemBank | Bank2 | Map<number, number>) {
		this.data = new Int32Array(ARRAY_SIZE);
		this.initializeFromBank(initialBank);
	}

	private resolveItemID(item: ItemResolvable): number {
		if (typeof item === 'number') return item;
		if (typeof item === 'string') return Items.getId(item);
		return item.id;
	}

	private getIndex(itemID: number): number {
		const index = itemIDMap[itemID.toString()];
		if (index === undefined) {
			throw new Error(`Item ID ${itemID} not found in itemIDMap`);
		}
		return index;
	}

	public clear(item?: Item | string | number): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		if (item) {
			this.set(this.resolveItemID(item), 0);
			return this;
		}
		this.data.fill(0);
		return this;
	}

	private initializeFromBank(initialBank?: Record<string, number> | Bank2 | Map<number, number>) {
		if (!initialBank) return;

		if (initialBank instanceof Bank2) {
			this.data.set(initialBank.data);
			return;
		}

		if (initialBank instanceof Map) {
			for (const [itemID, qty] of initialBank) {
				if (qty > 0) {
					const index = this.getIndex(itemID);
					this.data[index] = qty;
				}
			}
			return;
		}

		const has = Items.has.bind(Items);
		const getId = Items.resolveID.bind(Items);

		for (const k in initialBank) {
			const qty = initialBank[k];
			if (qty == null || qty <= 0) continue;
			const n = +k;
			const id = Number.isInteger(n) && has(n) ? n : getId(k);
			if (id) {
				const index = this.getIndex(id);
				this.data[index] = qty;
			}
		}
	}

	public toJSON(): ItemBank {
		const out: ItemBank = {};
		for (let i = 0; i < this.data.length; i++) {
			const qty = this.data[i];
			if (qty > 0) {
				const itemID = indexToItemID[i];
				if (itemID !== undefined) {
					out[itemID] = qty;
				}
			}
		}
		return out;
	}

	public set(item: ItemResolvable, quantity: number): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		const id = this.resolveItemID(item);
		const index = this.getIndex(id);
		this.data[index] = quantity;
		return this;
	}

	public freeze(): this {
		this.frozen = true;
		Object.freeze(this.data);
		return this;
	}

	public amount(item: ItemResolvable): number {
		const id = this.resolveItemID(item);
		const index = this.getIndex(id);
		return this.data[index];
	}

	public addItem(item: number, quantity = 1): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		if (quantity < 1) return this;
		const index = this.getIndex(item);
		this.data[index] += quantity;
		return this;
	}

	public removeItem(item: number | string, quantity = 1): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		const id = this.resolveItemID(item);
		const index = this.getIndex(id);
		const currentValue = this.data[index];

		if (currentValue === 0) return this;
		this.data[index] = Math.max(0, currentValue - quantity);

		return this;
	}

	public add(item: string | number | IntKeyBank | Bank2 | Item | undefined, quantity = 1): Bank2 {
		if (this.frozen) throw new Error(frozenErrorStr);

		// Bank.add(123);
		if (typeof item === 'number') {
			return this.addItem(item, quantity);
		}

		// Bank.add('Twisted bow');
		// Bank.add('Twisted bow', 5);
		if (typeof item === 'string') {
			return this.addItem(Items.getId(item), quantity);
		}

		if (item instanceof Bank2) {
			for (let i = 0; i < item.data.length; i++) {
				const qty = item.data[i];
				if (qty > 0) {
					this.data[i] += qty;
				}
			}
			return this;
		}

		if (!item) {
			return this;
		}

		if ('id' in item) {
			const _item = item as Item;
			return this.addItem(_item.id, quantity);
		}

		for (const [itemID, qty] of Object.entries(item)) {
			let int: number | undefined = Number.parseInt(itemID);
			if (Number.isNaN(int)) {
				int = Items.getId(itemID);
			}
			this.addItem(int!, qty);
		}

		return this;
	}

	public remove(item: string | number | ItemBank | Bank2, quantity = 1): Bank2 {
		if (this.frozen) throw new Error(frozenErrorStr);

		// Bank.remove('Twisted bow');
		// Bank.remove('Twisted bow', 5);
		if (typeof item === 'string') {
			return this.removeItem(Items.getId(item), quantity);
		}

		// Bank.remove(123);
		if (typeof item === 'number') {
			return this.removeItem(item, quantity);
		}

		if (item instanceof Bank2) {
			for (let i = 0; i < item.data.length; i++) {
				const qty = item.data[i];
				if (qty > 0) {
					this.data[i] = Math.max(0, this.data[i] - qty);
				}
			}
			return this;
		}

		this.remove(new Bank2(item));
		return this;
	}

	public has(items: Item | string | number | (string | number)[] | ItemBank | Bank2): boolean {
		if (typeof items === 'string' || typeof items === 'number') {
			return this.amount(items) > 0;
		}

		if (Array.isArray(items)) {
			return items.every(item => this.amount(item) > 0);
		}

		if (items instanceof Bank2) {
			return items.items().every(itemEntry => this.amount(itemEntry[0].id) >= itemEntry[1]);
		}

		if ('id' in items) {
			return this.has(items.id);
		}

		return this.has(new Bank2(items));
	}

	public items(): [Item, number][] {
		const arr: [Item, number][] = [];
		for (let i = 0; i < this.data.length; i++) {
			const qty = this.data[i];
			if (qty < 1) continue;

			const itemID = indexToItemID[i];
			if (itemID !== undefined) {
				const item = Items.getById(itemID);
				if (item) {
					arr.push([item, qty]);
				}
			}
		}
		return arr;
	}

	public clone(): Bank2 {
		return new Bank2(this);
	}

	public get length(): number {
		let count = 0;
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i] > 0) count++;
		}
		return count;
	}

	public value(): number {
		let value = 0;
		for (const [item, quantity] of this.items()) {
			if (!item.price) continue;
			value += item.price * quantity;
		}
		return value;
	}

	public equals(otherBank: Bank2): boolean {
		if (this.length !== otherBank.length) {
			return false;
		}
		for (const [item, quantity] of this.items()) {
			if (otherBank.amount(item.id) !== quantity) {
				return false;
			}
		}
		return true;
	}

	get itemIDs(): number[] {
		const ids: number[] = [];
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i] > 0) {
				const itemID = indexToItemID[i];
				if (itemID !== undefined) {
					ids.push(itemID);
				}
			}
		}
		return ids;
	}
}

export interface IntKeyBank {
	[key: number]: number;
}
export interface ItemBank {
	[key: string]: number;
}

export interface LootBank {
	[key: string]: Bank2;
}
export interface BankItem {
	id: number;
	qty: number;
}
