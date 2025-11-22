export class MockedRedis {
	private store = new Map<string, string>();
	private counters = new Map<string, number>();

	async set(key: string, value: string, _exFlag?: 'EX', _ttl?: number): Promise<'OK'> {
		this.store.set(key, value);
		return 'OK';
	}

	async get(key: string): Promise<string | null> {
		return this.store.get(key) ?? null;
	}

	async del(key: string): Promise<number> {
		const existed = this.store.delete(key);
		this.counters.delete(key);
		return existed ? 1 : 0;
	}

	async incr(key: string): Promise<number> {
		const current = this.counters.get(key) ?? 0;
		const newValue = current + 1;
		this.counters.set(key, newValue);
		this.store.set(key, String(newValue));
		return newValue;
	}

	async expire(_key: string, _seconds: number): Promise<number> {
		return 1;
	}

	async pexpire(_key: string, _milliseconds: number): Promise<number> {
		return 1;
	}

	async ttl(_key: string): Promise<number> {
		return -1;
	}

	async pttl(_key: string): Promise<number> {
		return -1;
	}

	async sadd(key: string, ...members: string[]): Promise<number> {
		const cur = this.store.get(key);
		const s = new Set(cur ? cur.split(',') : []);
		for (const m of members) s.add(m);
		this.store.set(key, [...s].join(','));
		return s.size;
	}

	async srem(key: string, ...members: string[]): Promise<number> {
		const cur = this.store.get(key);
		if (!cur) return 0;
		const s = new Set(cur.split(','));
		let removed = 0;
		for (const m of members) {
			if (s.delete(m)) removed++;
		}
		this.store.set(key, [...s].join(','));
		return removed;
	}

	async sismember(key: string, member: string): Promise<number> {
		const cur = this.store.get(key);
		if (!cur) return 0;
		return cur.split(',').includes(member) ? 1 : 0;
	}

	async smembers(key: string): Promise<string[]> {
		const cur = this.store.get(key);
		if (!cur || cur === '') return [];
		return cur.split(',');
	}

	pipeline() {
		const ops: Array<() => void> = [];
		const self = this;

		return {
			set(key: string, value: string) {
				ops.push(() => self.store.set(key, value));
				return this;
			},
			del(key: string) {
				ops.push(() => {
					self.store.delete(key);
					self.counters.delete(key);
				});
				return this;
			},
			sadd(key: string, ...members: string[]) {
				ops.push(() => {
					const cur = self.store.get(key);
					const s = new Set(cur ? cur.split(',') : []);
					for (const m of members) s.add(m);
					self.store.set(key, [...s].join(','));
				});
				return this;
			},
			srem(key: string, ...members: string[]) {
				ops.push(() => {
					const cur = self.store.get(key);
					if (!cur) return;
					const s = new Set(cur.split(','));
					for (const m of members) s.delete(m);
					self.store.set(key, [...s].join(','));
				});
				return this;
			},
			exec() {
				for (const op of ops) op();
				return Promise.resolve([]);
			}
		};
	}

	async quit(): Promise<'OK'> {
		this.store.clear();
		this.counters.clear();
		return 'OK';
	}
}
