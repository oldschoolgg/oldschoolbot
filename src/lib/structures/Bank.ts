import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit/structures';
import { Bank } from 'oldschooljs';

import type { DegradeableItem } from '../degradeableItems';
import { degradeableItems } from '../degradeableItems';

export class ChargeBank extends GeneralBank<DegradeableItem['settingsKey']> {
	constructor(initialBank?: GeneralBankType<DegradeableItem['settingsKey']>) {
		super({ initialBank, allowedKeys: degradeableItems.map(i => i.settingsKey) });
	}

	toString() {
		return this.entries()
			.map(
				([key, qty]) =>
					`${qty.toLocaleString()} ${degradeableItems.find(i => i.settingsKey === key)!.item.name} charges`
			)
			.join(', ');
	}
}

export { XPBank } from './XPBank';

export class FloatBank extends GeneralBank<number> {
	constructor() {
		super({ valueSchema: { floats: true, min: 0, max: 1_222_222.100_150_02 } });
	}

	toItemBankRoundedUp() {
		const itemBank = new Bank();
		for (const [item, qty] of this.entries()) {
			itemBank.add(Number.parseInt(item as any), Math.ceil(qty));
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
