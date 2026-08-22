import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';
import * as z from 'zod';

import { type DegradeableItem, degradeableItems } from '@/lib/degradeableItems.js';
import { assert } from '@/lib/util/logError.js';

export const ZRawItemBank = z.record(z.string(), z.number().int().positive());

function itemBankMatchesSanitizedBank(bank: ItemBank): boolean {
	const sanitized = Bank.withSanitizedValues(bank).toJSON();
	const bankEntries = Object.entries(bank);
	const sanitizedEntries = Object.entries(sanitized);
	if (bankEntries.length !== sanitizedEntries.length) return false;

	for (const [itemID, quantity] of bankEntries) {
		if (sanitized[itemID] !== quantity) return false;
	}

	return true;
}

export const ZItemBank = ZRawItemBank.transform(bank => Bank.withSanitizedValues(bank).toJSON());

export const ZStrictItemBank = ZRawItemBank.refine(itemBankMatchesSanitizedBank, {
	message: 'Invalid item bank.'
}).transform(bank => Bank.withSanitizedValues(bank).toJSON());

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}

	override toString() {
		return this.entries()
			.map(
				([key, qty]) =>
					`${qty.toLocaleString()} ${degradeableItems.find(i => i.settingsKey === key)!.item.name} charges`
			)
			.join(', ');
	}
}

export class FloatBank extends GeneralBank<number> {
	constructor() {
		super({ valueSchema: { floats: true, min: 0, max: 1_222_222.100_150_02 } });
	}

	toItemBankRoundedUp() {
		const itemBank = new Bank();
		for (const [_item, qty] of this.entries().sort((a, b) => a[0] - b[0])) {
			const item = Number(_item);
			assert(
				typeof item === 'number' && !Number.isNaN(item) && item > 0,
				`Invalid item ID in FloatBank: ${item}`
			);
			itemBank.add(item, Math.ceil(qty));
		}
		return itemBank;
	}

	public fits(bank: Bank): number {
		const divisions = this.entries()
			.map(([item, qty]) => Math.floor(bank.amount(Number(item)) / qty))
			.sort((a, b) => a - b);
		return divisions[0] ?? 0;
	}

	public multiply(multiplier: number): this {
		for (const [itemID, quantity] of this.entries()) {
			this.remove(itemID, quantity);
			this.add(itemID, quantity * multiplier);
		}
		return this;
	}
}
