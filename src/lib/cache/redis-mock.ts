export class MockedRedis {
	private store = new Map<string, string>();
	private counters = new Map<string, number>();
	private expirations = new Map<string, number>(); // epoch ms

	async set(key: string, value: string, exFlag?: 'EX', ttl?: number): Promise<'OK'> {
		this.store.set(key, value);

		if (exFlag === 'EX' && typeof ttl === 'number') {
			this.expirations.set(key, Date.now() + ttl * 1000);
		} else {
			this.expirations.delete(key);
		}

		return 'OK';
	}

	async get(key: string): Promise<string | null> {
		this.purgeIfExpired(key);
		return this.store.get(key) ?? null;
	}

	async del(key: string): Promise<number> {
		this.purgeIfExpired(key);

		const existed = this.store.has(key) || this.counters.has(key);
		this.store.delete(key);
		this.counters.delete(key);
		this.expirations.delete(key);
		return existed ? 1 : 0;
	}

	async incr(key: string): Promise<number> {
		this.purgeIfExpired(key);

		const current = this.counters.get(key) ?? 0;
		const newValue = current + 1;
		this.counters.set(key, newValue);
		this.store.set(key, String(newValue));
		return newValue;
	}

	async expire(key: string, seconds: number): Promise<number> {
		this.purgeIfExpired(key);

		if (!this.store.has(key) && !this.counters.has(key)) return 0;
		this.expirations.set(key, Date.now() + seconds * 1000);
		return 1;
	}

	async pexpire(key: string, milliseconds: number): Promise<number> {
		this.purgeIfExpired(key);

		if (!this.store.has(key) && !this.counters.has(key)) return 0;
		this.expirations.set(key, Date.now() + milliseconds);
		return 1;
	}

	async ttl(key: string): Promise<number> {
		this.purgeIfExpired(key);

		if (!this.store.has(key) && !this.counters.has(key)) return -2;

		const expiresAt = this.expirations.get(key);
		if (expiresAt === undefined) return -1;

		const remainingMs = expiresAt - Date.now();
		if (remainingMs <= 0) {
			this.purgeIfExpired(key);
			return -2;
		}

		return Math.ceil(remainingMs / 1000);
	}

	async pttl(key: string): Promise<number> {
		this.purgeIfExpired(key);

		if (!this.store.has(key) && !this.counters.has(key)) return -2;

		const expiresAt = this.expirations.get(key);
		if (expiresAt === undefined) return -1;

		const remainingMs = expiresAt - Date.now();
		if (remainingMs <= 0) {
			this.purgeIfExpired(key);
			return -2;
		}

		return remainingMs;
	}

	private purgeIfExpired(key: string): void {
		const expiresAt = this.expirations.get(key);
		if (expiresAt !== undefined && Date.now() >= expiresAt) {
			this.expirations.delete(key);
			this.store.delete(key);
			this.counters.delete(key);
		}
	}

	async sadd(key: string, ...members: string[]): Promise<number> {
		this.purgeIfExpired(key);

		const cur = this.store.get(key);
		const s = new Set(cur ? cur.split(',') : []);
		const before = s.size;
		for (const m of members) s.add(m);
		this.store.set(key, [...s].join(','));
		return s.size - before; // closer to real Redis
	}

	async srem(key: string, ...members: string[]): Promise<number> {
		this.purgeIfExpired(key);

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
		this.purgeIfExpired(key);

		const cur = this.store.get(key);
		if (!cur) return 0;
		return cur.split(',').includes(member) ? 1 : 0;
	}

	async smembers(key: string): Promise<string[]> {
		this.purgeIfExpired(key);

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
					self.expirations.delete(key);
				});
				return this;
			},
			sadd(key: string, ...members: string[]) {
				ops.push(() => {
					self.purgeIfExpired(key);
					const cur = self.store.get(key);
					const s = new Set(cur ? cur.split(',') : []);
					for (const m of members) s.add(m);
					self.store.set(key, [...s].join(','));
				});
				return this;
			},
			srem(key: string, ...members: string[]) {
				ops.push(() => {
					self.purgeIfExpired(key);
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
		this.expirations.clear();
		return 'OK';
	}
}
