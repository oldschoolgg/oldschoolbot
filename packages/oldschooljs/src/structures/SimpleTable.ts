import { randInt } from 'e';

import type { SimpleTableItem } from '../meta/types';

export default class SimpleTable<T> {
	public length: number;
	public table: SimpleTableItem<T>[];
	public totalWeight: number;

	public constructor() {
		this.table = [];
		this.length = 0;
		this.totalWeight = 0;
	}

	public add(item: T, weight = 1): this {
		this.length += 1;
		this.totalWeight += weight;

		this.table.push({
			item,
			weight
		});

		return this;
	}

	public delete(item: T): this {
		const tableItem = this.table.find(_tableItem => _tableItem.item === item);
		if (!tableItem) {
			throw `${item} doesn't exist in this SimpleTable.`;
		}

		this.length -= 1;
		this.totalWeight -= tableItem.weight;

		this.table = this.table.filter(_item => _item !== tableItem);

		return this;
	}

	public roll(): SimpleTableItem<T>['item'] {
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

		return this.table[result].item;
	}
}
