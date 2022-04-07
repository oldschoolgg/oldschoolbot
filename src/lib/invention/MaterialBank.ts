import { toTitleCase } from '../util';
import { IMaterialBank, MaterialType } from '.';

export class MaterialBank {
	public bank: IMaterialBank;

	constructor(initialBank?: IMaterialBank) {
		this.bank = initialBank ?? {};
	}

	public amount(material: MaterialType): number {
		return this.bank[material] ?? 0;
	}

	addItem(material: MaterialType, quantity: number): this {
		if (quantity < 1) return this;
		if (this.bank[material] !== undefined) this.bank[material]! += quantity;
		else this.bank[material] = quantity;
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
}
