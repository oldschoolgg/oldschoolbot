'use strict';

class SimpleCache {
	constructor(client, holds, iterable) {
		this.cache = new Map();
	}

	_add(data, cache = true, { id, extras = [] } = {}) {
		// const existing = this.cache.get(id ?? data.id);
		// if (existing) {
		// 	if (cache) {
		// 		existing._patch(data);
		// 		return existing;
		// 	}

		// 	const clone = existing._clone();
		// 	clone._patch(data);
		// 	return clone;
		// }

		// const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
		// if (cache) this.cache.set(id ?? entry.id, entry);
		// return entry;
		return this.cache.set(id ?? entry.id, entry);
	}
}

exports.SimpleCache = SimpleCache;
