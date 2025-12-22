import { MathRNG, type RNGProvider } from '@oldschoolgg/rng';

import type { Item } from '@/meta/item.js';
import { toKMB } from '../util/smallUtils.js';
import { Items } from './Items.js';

const frozenErrorStr = 'Tried to mutate a frozen Bank.';

type ItemResolvable = Item | string | number;

function isValidBankQuantity(qty: number): boolean {
	return typeof qty === 'number' && qty >= 1 && Number.isInteger(qty);
}

export class Bank {
	private map: Map<number, number>;
	public frozen = false;

	static withSanitizedValues(source: ItemBank | IntKeyBank): Bank {
		const map = new Map<number, number>();
		for (const [key, qty] of Object.entries(source)) {
			const id = Number.parseInt(key);
			if (!Items.has(id)) continue;
			if (!isValidBankQuantity(qty)) continue;
			map.set(id, qty);
		}
		const bank = new Bank();
		bank.map = map;
		return bank;
	}

	static fromNameBank(nameBank: Record<string, number>): Bank {
		const bank = new Bank();
		for (const [name, qty] of Object.entries(nameBank)) {
			bank.add(name, qty);
		}
		return bank;
	}

	constructor(initialBank?: number[] | ItemBank | Bank | Map<number, number>) {
		this.map = this.makeFromInitialBank(initialBank);
	}

	public removeInvalidValues(): Bank {
		for (const [key, qty] of this.map.entries()) {
			if (!isValidBankQuantity(qty) || !Items.has(key)) {
				this.map.delete(key);
			}
		}
		return this;
	}

	private resolveItemID(item: ItemResolvable): number {
		if (typeof item === 'number') return item;
		if (typeof item === 'string') return Items.getId(item);
		return item.id;
	}

	public clear(item?: Item | string | number): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		if (item) {
			this.set(this.resolveItemID(item), 0);
			return this;
		}
		this.map.clear();
		return this;
	}

	private makeFromInitialBank(initialBank?: number[] | Record<string, number> | Bank | Map<number, number>) {
		if (!initialBank) return new Map<number, number>();
		if (initialBank instanceof Bank) return new Map(initialBank.map);
		if (initialBank instanceof Map) return new Map(initialBank);
		if (Array.isArray(initialBank)) {
			const map = new Map<number, number>();
			for (let i = 0; i < initialBank.length; i += 2) {
				const itemID = initialBank[i];
				const qty = initialBank[i + 1];
				if (!qty) continue;
				map.set(itemID, qty);
			}
			return map;
		}

		const out = new Map<number, number>();
		const has = Items.has.bind(Items);
		const getId = Items.resolveID.bind(Items);

		for (const k in initialBank) {
			const qty = initialBank[k];
			if (qty == null) continue;
			const n = +k;
			const id = Number.isInteger(n) && has(n) ? n : getId(k);
			if (id) {
				out.set(id, qty);
			}
		}
		return out;
	}

	public toJSON(): ItemBank {
		const out: ItemBank = {};
		for (const [k, v] of this.map) out[k] = v;
		return out;
	}

	public set(item: ItemResolvable, quantity: number): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		const id = this.resolveItemID(item);
		if (quantity === 0) {
			this.map.delete(id);
			return this;
		}
		this.map.set(id, quantity);
		return this;
	}

	public freeze(): this {
		this.frozen = true;
		Object.freeze(this.map);
		return this;
	}

	public amount(item: ItemResolvable): number {
		const id = this.resolveItemID(item);
		return this.map.get(id) ?? 0;
	}

	public addItem(item: number, quantity = 1): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		if (quantity < 1) return this;
		this.map.set(item, (this.map.get(item) ?? 0) + quantity);
		return this;
	}

	public removeItem(item: number | string, quantity = 1): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		const id = this.resolveItemID(item);
		const currentValue = this.map.get(id);

		if (currentValue === undefined) return this;
		if (currentValue - quantity <= 0) {
			this.map.delete(id);
		} else {
			this.map.set(id, currentValue - quantity);
		}

		return this;
	}

	public add(item: string | number | IntKeyBank | Bank | Item | undefined, quantity = 1): Bank {
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

		if (item instanceof Bank) {
			for (const [itemID, qty] of item.map.entries()) {
				this.addItem(itemID, qty);
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

	public remove(item: string | number | ItemBank | Bank, quantity = 1): Bank {
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

		if (item instanceof Bank) {
			for (const [itemID, qty] of item.map.entries()) {
				this.removeItem(itemID, qty);
			}
			return this;
		}

		this.remove(new Bank(item));
		return this;
	}

	public random(rng: RNGProvider = MathRNG): BankItem | null {
		const entries = Array.from(this.map.entries());
		if (entries.length === 0) return null;
		const randomEntry = rng.pick(entries);
		return { id: randomEntry[0], qty: randomEntry[1] };
	}

	public multiply(multiplier: number, itemsToNotMultiply?: number[]): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		for (const [itemID, quantity] of this.map.entries()) {
			if (itemsToNotMultiply?.includes(itemID)) continue;
			this.map.set(itemID, Math.floor(quantity * multiplier));
		}
		return this;
	}

	public has(items: Item | string | number | (string | number)[] | ItemBank | Bank): boolean {
		if (typeof items === 'string' || typeof items === 'number') {
			return this.amount(items) > 0;
		}

		if (Array.isArray(items)) {
			return items.every(item => this.amount(item) > 0);
		}

		if (items instanceof Bank) {
			return items.items().every(itemEntry => this.amount(itemEntry[0].id) >= itemEntry[1]);
		}

		if ('id' in items) {
			return this.has(items.id);
		}

		return this.has(new Bank(items));
	}

	public items(): [Item, number][] {
		const arr: [Item, number][] = [];
		for (const [key, val] of this.map.entries()) {
			if (val < 1) continue;
			const item = Items.getById(key);
			if (!item) {
				continue;
			}
			arr.push([item, val]);
		}
		return arr;
	}

	public clone(): Bank {
		return new Bank(this);
	}

	public fits(bank: Bank): number {
		const items = bank.items();
		const divisions = items.map(([item, qty]) => Math.floor(this.amount(item.id) / qty)).sort((a, b) => a - b);
		return divisions[0] ?? 0;
	}

	public filter(fn: (item: Item, quantity: number) => boolean): Bank {
		const result = new Bank();
		for (const item of this.items()) {
			if (fn(...item)) {
				result.add(item[0].id, item[1]);
			}
		}
		return result;
	}

	public toString(): string {
		const items = this.items();
		if (items.length === 0) {
			return 'No items';
		}
		return items
			.sort((a, b) => a[0].name.localeCompare(b[0].name))
			.map(([item, qty]) => `${qty < 1000 ? `${qty}x` : toKMB(qty)} ${item?.name ?? 'Unknown item'}`)
			.join(', ');
	}

	public toStringFull(): string {
		const items = this.items();
		if (items.length === 0) {
			return 'No items';
		}
		return items
			.sort((a, b) => a[0].name.localeCompare(b[0].name))
			.map(([item, qty]) => `${qty.toLocaleString()}x ${item?.name ?? 'Unknown item'}`)
			.join(', ');
	}

	public get length(): number {
		return this.map.size;
	}

	public value(): number {
		let value = 0;
		for (const [item, quantity] of this.items()) {
			if (!item.price) continue;
			value += item.price * quantity;
		}
		return value;
	}

	public equals(otherBank: Bank): boolean {
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

	public difference(otherBank: Bank): Bank {
		return this.clone().remove(otherBank).add(otherBank.clone().remove(this));
	}

	public validate(): string[] {
		const errors: string[] = [];
		for (const [item, quantity] of this.map.entries()) {
			if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
				errors.push(`Item ${item} has a quantity of ${quantity}`);
			}
			if (typeof item !== 'number' || !item || !Items.get(item)?.id) {
				errors.push(`Item ${item} does not exist.`);
			}
		}
		return errors;
	}

	public validateOrThrow(): void {
		const errors = this.validate();
		if (errors.length > 0) {
			throw new Error(`Bank validation failed: ${errors.join(', ')}`);
		}
	}

	get itemIDs(): number[] {
		return Array.from(this.map.keys());
	}

	toNamedBank(): Record<string, number> {
		const namedBank: Record<string, number> = {};
		for (const [item, quantity] of this.items().sort((a, b) => a[0].name.localeCompare(b[0].name))) {
			namedBank[item.name] = quantity;
		}
		return namedBank;
	}
}

export interface IntKeyBank {
	[key: number]: number;
}
export interface ItemBank {
	[key: string]: number;
}

export interface LootBank {
	[key: string]: Bank;
}
export interface BankItem {
	id: number;
	qty: number;
}
