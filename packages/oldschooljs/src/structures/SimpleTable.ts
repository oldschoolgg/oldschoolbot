import { MathRNG, type RNGProvider } from 'node-rng';

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
		if (!Number.isFinite(weight) || weight < 0) {
			throw new Error(`Invalid weight ${weight} in SimpleTable.`);
		}

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

	public roll(rng: RNGProvider = MathRNG): SimpleTableItem<T>['item'] | null {
		if (this.table.length === 0 || this.totalWeight <= 0) return null;

		// Random number between 0 and the total weighting.
		const randomWeight = rng.randFloat(0, this.totalWeight);

		let weight = 0;
		let lastRollableItem: SimpleTableItem<T> | null = null;

		for (let i = 0; i < this.table.length; i++) {
			const item = this.table[i];
			if (item.weight <= 0) continue;

			weight += item.weight;
			lastRollableItem = item;
			if (randomWeight < weight) {
				return item.item;
			}
		}

		return lastRollableItem?.item ?? null;
	}

	public rollOrThrow(rng: RNGProvider = MathRNG): SimpleTableItem<T>['item'] {
		const result = this.roll(rng);
		if (result === null) throw new Error('Received null from SimpleTable, but expect not-null.');
		return result;
	}
}
