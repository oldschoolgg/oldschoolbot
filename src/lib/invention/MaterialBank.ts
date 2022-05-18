import { assert, toTitleCase } from '../util';
import { IMaterialBank, MaterialType, materialTypes } from '.';

export class MaterialBank {
	public bank: IMaterialBank;

	constructor(initialBank?: IMaterialBank) {
		this.bank = initialBank ?? {};
		this.validate();
	}

	private validate() {
		for (const [key, value] of Object.entries(this.bank)) {
			assert(materialTypes.includes(key as any));
			assert(typeof value === 'number' && value > 0 && !isNaN(value));
		}
	}

	public amount(material: MaterialType): number {
		return this.bank[material] ?? 0;
	}

	addItem(material: MaterialType, quantity: number): this {
		if (quantity < 1) return this;
		if (this.bank[material] !== undefined) this.bank[material]! += quantity;
		else this.bank[material] = quantity;
		this.validate();
		return this;
	}

	removeItem(material: MaterialType, quantity: number): this {
		if (!this.bank[material] || this.bank[material]! < quantity) {
			throw new Error('Tried to remove more from a material bank than is owned');
		}
		this.bank[material]! -= quantity;
		this.validate();
		return this;
	}

	public add(material: MaterialType | MaterialBank, quantity = 1): MaterialBank {
		if (typeof material !== 'string') {
			for (const [type, qty] of Object.entries(material.bank)) {
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
		for (const [type, qty] of entries.sort((a, b) => b[1] - a[1])) {
			res.push(`${qty.toLocaleString()}x ${toTitleCase(type)}`);
		}

		return res.join(', ');
	}

	public values() {
		let values: { type: MaterialType; quantity: number }[] = [];
		for (const [key, value] of Object.entries(this.bank)) {
			values.push({ type: key as MaterialType, quantity: value });
		}
		return values;
	}
}
