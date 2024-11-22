export class Collection<K, V> extends Map<K, V> {
	filter(predicate: (value: V, key: K, map: this) => boolean): Collection<K, V> {
		const result = new Collection<K, V>();
		for (const [key, value] of this) {
			if (predicate(value, key, this)) {
				result.set(key, value);
			}
		}
		return result;
	}

	map<T>(callback: (value: V, key: K, map: this) => T): T[] {
		const result: T[] = [];
		for (const [key, value] of this) {
			result.push(callback(value, key, this));
		}
		return result;
	}

	random(): V {
		const index = Math.floor(Math.random() * this.size);
		let i = 0;
		for (const entry of this) {
			if (i++ === index) return entry[1];
		}
		throw new Error('No item found');
	}

	array() {
		return Array.from(this.values());
	}

	find(predicate: (value: V, key: K, map: this) => boolean): V | undefined {
		for (const [key, value] of this) {
			if (predicate(value, key, this)) {
				return value;
			}
		}
	}
}
