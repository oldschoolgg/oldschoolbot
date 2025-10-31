'use strict';

const { DataManager } = require('./DataManager.js');

class CachedManager extends DataManager {

	constructor(client, holds, iterable) {
		super(client, holds);
		this.cache = new Map();
		if (iterable) {
			for (const item of iterable) {
				this._add(item);
			}
		}
	}

	_add(data, cache = true, { id, extras = [] } = {}) {
		const existing = this.cache.get(id ?? data.id);
		if (existing) {
			if (cache) {
				existing._patch(data);
				return existing;
			}

			const clone = existing._clone();
			clone._patch(data);
			return clone;
		}

		const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
		if (cache) this.cache.set(id ?? entry.id, entry);
		return entry;
	}
}

exports.CachedManager = CachedManager;
