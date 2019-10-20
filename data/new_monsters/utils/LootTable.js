const { rand } = require('../../../config/util');

module.exports = class LootTable {
	constructor(limit) {
		this.table = [];
		this.length = 0;
		this.totalWeight = 0;
		this.limit = limit;
	}

	addMany(arrayOfItems) {
		for (const item of arrayOfItems) {
			this.add(...item);
		}
		return this;
	}

	add(item, weight, quantity) {
		// eslint-disable-next-line eqeqeq
		if (weight == null || weight <= 0) weight = 1;
		// eslint-disable-next-line eqeqeq
		if (quantity == null || quantity <= 0) quantity = 1;

		this.length += 1;
		this.totalWeight += weight;

		this.table.push({
			item,
			weight,
			quantity
		});

		return this;
	}

	roll() {
		// If this loot table has no items, return null;
		if (this.length === 0) return null;

		// Random number between 1 and the total weighting
		const randomWeight = rand(1, this.limit || this.totalWeight);

		if (randomWeight > this.totalWeight) return null;

		// The index of the item that will be used.
		let result;
		let weight = 0;

		for (let i = 0; i < this.table.length; i++) {
			const item = this.table[i];

			weight += item.weight;
			if (randomWeight <= weight) {
				result = i;
				break;
			}
		}

		const chosenItem = this.table[result];

		if (chosenItem.item === undefined) return null;

		return {
			item: chosenItem.item,
			quantity:
				typeof chosenItem.quantity === 'function'
					? chosenItem.quantity()
					: chosenItem.quantity
		};
	}
};
