import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import micromatch from 'micromatch';

export class JsonKVStore<T extends Record<string, any> = Record<string, any>> {
	private data: T = {} as T;

	constructor(private path: string) {
		if (existsSync(path)) {
			this.data = JSON.parse(readFileSync(path, 'utf8'));
		}
	}

	get<K extends keyof T>(key: K): T[K] | undefined {
		return this.data[key];
	}

	set<K extends keyof T>(key: K, value: T[K]): void {
		this.data[key] = value;
		this.save();
	}

	delete<K extends keyof T>(key: K): void {
		delete this.data[key];
		this.save();
	}

	getAll(pattern: string): { key: string; value: T[keyof T] }[] {
		const keys = Object.keys(this.data);
		const matches = micromatch(keys, pattern);
		const result: { key: string; value: T[keyof T] }[] = [];
		for (const key of matches) {
			result.push({ key, value: this.data[key] });
		}
		return result;
	}

	private save() {
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
	}
}
