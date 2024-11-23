import { randArrItem } from 'e';

import type { BankItem, IntKeyBank, Item, ItemBank } from '../meta/types';
import itemID from '../util/itemID';
import { toKMB } from '../util/smallUtils';
import Items from './Items';

const frozenErrorStr = 'Tried to mutate a frozen Bank.';

const isValidInteger = (str: string): boolean => /^-?\d+$/.test(str);

type ItemResolvable = Item | string | number;

function isValidBankQuantity(qty: number): boolean {
	return typeof qty === 'number' && qty >= 1 && Number.isInteger(qty);
}

function sanitizeItemBank(mutSource: ItemBank) {
	for (const [key, qty] of Object.entries(mutSource)) {
		if (!isValidBankQuantity(qty)) {
			delete mutSource[key];
		}
		const item = Items.get(Number.parseInt(key));
		if (!item) {
			delete mutSource[key];
		}
	}
}

export default class Bank {
	private map: Map<number, number>;
	public frozen = false;

	static withSanitizedValues(source: ItemBank | IntKeyBank): Bank {
		const mutSource = { ...source };
		sanitizeItemBank(mutSource);
		return new Bank(mutSource);
	}

	constructor(initialBank?: IntKeyBank | ItemBank | Bank) {
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
		if (typeof item === 'string') return itemID(item);
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

	private makeFromInitialBank(initialBank?: IntKeyBank | ItemBank | Bank) {
		if (!initialBank) return new Map();
		if (initialBank instanceof Bank) {
			return new Map(initialBank.map.entries());
		}
		const entries = Object.entries(initialBank);
		if (entries.length === 0) return new Map();
		if (isValidInteger(entries[0][0])) {
			return new Map(entries.map(([k, v]) => [Number(k), v]));
		} else {
			return new Map(entries.map(([k, v]) => [Items.get(k)!.id, v]));
		}
	}

	public toJSON(): ItemBank {
		return Object.fromEntries(this.map);
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
			return this.addItem(itemID(item), quantity);
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
				int = Items.get(itemID)?.id;
			}
			if (!int) {
				console.trace(`Tried to add a invalid item to a bank with an id of '${itemID}'`);
				return this;
			}
			this.addItem(int, qty);
		}

		return this;
	}

	public remove(item: string | number | ItemBank | Bank, quantity = 1): Bank {
		if (this.frozen) throw new Error(frozenErrorStr);

		// Bank.remove('Twisted bow');
		// Bank.remove('Twisted bow', 5);
		if (typeof item === 'string') {
			return this.removeItem(itemID(item), quantity);
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

	public random(): BankItem | null {
		const entries = Array.from(this.map.entries());
		if (entries.length === 0) return null;
		const randomEntry = randArrItem(entries);
		return { id: randomEntry[0], qty: randomEntry[1] };
	}

	public multiply(multiplier: number, itemsToNotMultiply?: number[]): this {
		if (this.frozen) throw new Error(frozenErrorStr);
		for (const [itemID, quantity] of this.map.entries()) {
			if (itemsToNotMultiply?.includes(itemID)) continue;
			this.map.set(itemID, quantity * multiplier);
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
			const item = Items.get(key)!;
			if (!item) {
				console.warn(`Bank has an invalid item: ${item}, with quantity of ${val}`);
				continue;
			}
			arr.push([item, val]);
		}
		return arr;
	}

	public forEach(fn: (item: Item, quantity: number) => unknown): void {
		for (const item of this.items()) {
			fn(...item);
		}
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

	public get length(): number {
		return this.map.size;
	}

	public value(): number {
		let value = 0;
		for (const [item, quantity] of this.items()) {
			value += item.price * quantity;
		}
		return value;
	}

	public equals(otherBank: Bank): boolean {
		if (this.length !== otherBank.length) return false;
		for (const [item, quantity] of this.items()) {
			if (otherBank.amount(item.id) !== quantity) return false;
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

	public validateOrThrow() {
		const errors = this.validate();
		if (errors.length > 0) {
			throw new Error(`Bank validation failed: ${errors.join(', ')}`);
		}
	}

	get itemIDs(): number[] {
		return Array.from(this.map.keys());
	}
}
