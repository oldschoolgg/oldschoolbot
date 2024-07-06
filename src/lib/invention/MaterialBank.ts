import { toTitleCase } from '@oldschoolgg/toolkit';
import { calcPercentOfNum } from 'e';

import { type IMaterialBank, type MaterialType, materialTypes } from '.';
import { assert } from '../util';

export class MaterialBank {
	public bank: IMaterialBank;

	constructor(initialBank?: IMaterialBank) {
		this.bank = initialBank ?? {};
		this.validate();
	}

	clone() {
		return new MaterialBank({ ...this.bank });
	}

	validate(): void {
		for (const [key, value] of Object.entries(this.bank)) {
			if (!materialTypes.includes(key as any)) {
				delete this.bank[key as keyof IMaterialBank];
				return this.validate();
			}
			assert(materialTypes.includes(key as any), `${key} ${value}`);
			assert(typeof value === 'number' && value > 0 && !Number.isNaN(value));
			assert(Number.parseInt(value.toString()) === value, `${key} ${value} ${Number.parseInt(value.toString())}`);
		}
	}

	public amount(material: MaterialType): number {
		return this.bank[material] ?? 0;
	}

	has(bank: MaterialType | MaterialBank) {
		if (typeof bank === 'string') {
			return typeof this.bank[bank] !== 'undefined';
		}
		for (const { type, quantity } of bank.values()) {
			if (this.amount(type) < quantity) return false;
		}
		return true;
	}

	addItem(material: MaterialType, quantity: number): this {
		quantity = Math.floor(quantity);
		if (quantity < 1) return this;
		if (this.bank[material] !== undefined) this.bank[material]! += quantity;
		else this.bank[material] = quantity;
		this.validate();
		return this;
	}

	removeItem(material: MaterialType, quantity: number): this {
		quantity = Math.floor(quantity);
		if (typeof this.bank[material] === 'undefined') return this;
		this.bank[material]! -= quantity;
		if (this.bank[material]! <= 0) delete this.bank[material];

		this.validate();
		return this;
	}

	public add(material: MaterialType | IMaterialBank | MaterialBank, quantity = 1): MaterialBank {
		if (typeof material !== 'string') {
			for (const [type, qty] of Object.entries(material instanceof MaterialBank ? material.bank : material)) {
				this.addItem(type as MaterialType, qty);
			}
			return this;
		}
		return this.addItem(material, quantity);
	}

	public remove(material: MaterialType | MaterialBank, quantity = 1): MaterialBank {
		if (typeof material !== 'string') {
			for (const [type, qty] of Object.entries(material.bank)) {
				this.removeItem(type as MaterialType, qty);
			}
			return this;
		}
		return this.removeItem(material, quantity);
	}

	public toString(): string {
		const entries = Object.entries(this.bank);
		if (entries.length === 0) {
			return 'No materials';
		}
		const res = [];
		for (const [type, qty] of entries.sort((a, b) => a[0].localeCompare(b[0]))) {
			res.push(`${toTitleCase(type)}: ${qty.toLocaleString()}`);
		}

		return res.join(', ');
	}

	public values() {
		const values: { type: MaterialType; quantity: number }[] = [];
		for (const [key, value] of Object.entries(this.bank)) {
			values.push({ type: key as MaterialType, quantity: value });
		}
		return values;
	}

	public multiply(multiplier: number) {
		if (!Number.isInteger(multiplier)) throw new Error('Tried to multiply material bank by non-integer');
		for (const material of Object.keys(this.bank) as (keyof IMaterialBank)[]) {
			this.bank[material]! *= multiplier;
		}
		return this;
	}

	public fits(bank: MaterialBank): number {
		const items = bank.values();
		const divisions = items
			.map(({ type, quantity }) => Math.floor(this.amount(type) / quantity))
			.sort((a, b) => a - b);
		return divisions[0] ?? 0;
	}

	mutReduceAllValuesByPercent(percent: number) {
		for (const [key, value] of Object.entries(this.bank) as [MaterialType, number][]) {
			const percentOfThisItem = Math.floor(calcPercentOfNum(value, percent));
			this.remove(key, percentOfThisItem);
		}
		return this;
	}

	mutIncreaseAllValuesByPercent(percent: number) {
		for (const [key, value] of Object.entries(this.bank) as [MaterialType, number][]) {
			const percentOfThisItem = Math.floor(calcPercentOfNum(value, percent));
			this.add(key, percentOfThisItem);
		}
		return this;
	}
}
