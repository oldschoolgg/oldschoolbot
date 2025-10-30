'use strict';

const { MakeCacheOverrideSymbol } = require('../util/Symbols.js');
const { DataManager } = require('./DataManager.js');

class CachedManager extends DataManager {
	constructor(client, holds, iterable) {
		super(client, holds);

		Object.defineProperty(this, '_cache', {
			value: this.client.options.makeCache({
				holds: this.holds,
				manager: this.constructor,
				managerType: this.constructor[MakeCacheOverrideSymbol] ?? this.constructor,
			}),
		});

		if (iterable) {
			for (const item of iterable) {
				this._add(item);
			}
		}
	}

	get cache() {
		return this._cache;
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
