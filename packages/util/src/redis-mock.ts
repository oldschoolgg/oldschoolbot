type PipelineResult = [Error | null, unknown];

type MockPipeline = {
	set(key: string, value: string, exFlag?: 'EX', ttl?: number): MockPipeline;
	del(key: string): MockPipeline;
	sadd(key: string, ...members: string[]): MockPipeline;
	srem(key: string, ...members: string[]): MockPipeline;
	exec(): Promise<PipelineResult[]>;
};

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

	async ttlHelper(key: string): Promise<number> {
		this.purgeIfExpired(key);

		if (!this.store.has(key) && !this.counters.has(key)) return -2;

		const expiresAt = this.expirations.get(key);
		if (expiresAt === undefined) return -1;

		// If things work right, then this shouldn't be needed:
		const remainingMs = expiresAt - Date.now();
		if (remainingMs <= 0) {
			this.purgeIfExpired(key);
			return -2;
		}
		return remainingMs - 1;
	}
	async ttl(key: string): Promise<number> {
		const remainingMs = await this.ttlHelper(key);
		return Math.ceil(remainingMs / 1000);
	}

	async pttl(key: string): Promise<number> {
		return await this.ttlHelper(key);
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

	pipeline(): MockPipeline {
		const ops: Array<() => Promise<unknown>> = [];
		const self = this;

		return {
			set(key: string, value: string, exFlag?: 'EX', ttl?: number) {
				ops.push(() => self.set(key, value, exFlag, ttl));
				return this;
			},
			del(key: string) {
				ops.push(() => self.del(key));
				return this;
			},
			sadd(key: string, ...members: string[]) {
				ops.push(() => self.sadd(key, ...members));
				return this;
			},
			srem(key: string, ...members: string[]) {
				ops.push(() => self.srem(key, ...members));
				return this;
			},
			async exec(): Promise<PipelineResult[]> {
				const wrapped = ops.map(op =>
					op()
						.then(val => [null, val] as PipelineResult)
						.catch(err => [err as Error, null] as PipelineResult)
				);

				return Promise.all(wrapped);
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
