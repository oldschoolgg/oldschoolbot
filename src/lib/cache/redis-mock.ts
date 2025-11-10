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

	pipeline() {
		const operations: Array<() => void> = [];
		const self = this;
		return {
			set(key: string, value: string, _exFlag?: 'EX', _ttl?: number) {
				operations.push(() => self.store.set(key, value));
				return this;
			},
			async exec() {
				for (const op of operations) {
					op();
				}
				return [];
			}
		};
	}

	async quit(): Promise<'OK'> {
		this.store.clear();
		this.counters.clear();
		return 'OK';
	}
}
