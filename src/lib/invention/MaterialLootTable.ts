import { randInt } from 'e';

import { IMaterialBank, MaterialType } from '.';

interface MaterialTableItem {
	material: MaterialType;
	weight: number;
}

export default class MaterialLootTable {
	public length: number;
	public table: MaterialTableItem[];
	public totalWeight: number;

	public constructor(items?: IMaterialBank) {
		this.table = [];
		this.length = 0;
		this.totalWeight = 0;

		if (items) {
			for (const [key, val] of Object.entries(items)) {
				this.add(key as MaterialType, val);
			}
		}
	}

	public add(material: MaterialType, weight = 1): this {
		this.length += 1;
		this.totalWeight += weight;

		this.table.push({
			material,
			weight
		});

		return this;
	}

	public roll() {
		// Random number between 1 and the total weighting
		const randomWeight = randInt(1, this.totalWeight);

		// The index of the item that will be used.
		let result = -1;
		let weight = 0;

		for (let i = 0; i < this.table.length; i++) {
			const item = this.table[i];

			weight += item.weight;
			if (randomWeight <= weight) {
				result = i;
				break;
			}
		}

		return this.table[result].material;
	}
}
