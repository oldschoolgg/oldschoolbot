import { randInt } from 'e';

export interface SimpleTableItem<T> {
	item: T;
	weight: number;
}

export class SimpleTable<T> {
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
			throw new Error(`${item} doesn't exist in this SimpleTable.`);
		}

		this.length -= 1;
		this.totalWeight -= tableItem.weight;

		this.table = this.table.filter(_item => _item !== tableItem);

		return this;
	}

	public roll(): SimpleTableItem<T>['item'] | null {
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

		const item: SimpleTableItem<T>['item'] | null = this.table[result]?.item ?? null;
		return item;
	}

	public rollOrThrow(): SimpleTableItem<T>['item'] {
		const result = this.roll();
		if (result === null) throw new Error('Received null from SimpleTable, but expect not-null.');
		return result;
	}
}
