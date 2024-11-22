import Decimal from 'decimal.js';

function assert(condition: boolean, desc?: string) {
	if (!condition) {
		throw new Error(desc ?? 'Failed assertion');
	}
}

export type GeneralBankType<T extends string | number> = Record<T, number>;

interface GeneralBankValueSchema {
	min: number;
	max: number;
	floats: boolean;
}

type BankValidator<T extends string | number> = (key: T, value: number, bank: GeneralBankType<T>) => void;

export class GeneralBank<T extends string | number> {
	private bank: GeneralBankType<T>;
	private allowedKeys?: Set<T>;
	private validator?: BankValidator<T>;
	private valueSchema: GeneralBankValueSchema;

	constructor({
		allowedKeys,
		validator,
		initialBank,
		valueSchema
	}: {
		allowedKeys?: T[] | readonly T[];
		validator?: BankValidator<T>;
		initialBank?: GeneralBankType<T>;
		valueSchema?: GeneralBankValueSchema;
	} = {}) {
		this.bank = initialBank ?? ({} as GeneralBankType<T>);
		this.allowedKeys = allowedKeys ? new Set(allowedKeys) : undefined;
		this.validator = validator;

		this.valueSchema = valueSchema ?? { min: 1, max: Number.MAX_SAFE_INTEGER, floats: false };
		if (this.valueSchema.min < 0) throw new Error('Value schema min must be non-negative.');
		if (this.valueSchema.max < this.valueSchema.min) throw new Error('Value schema max must be greater than min.');

		this.validate();
	}

	get _bank() {
		return this.bank;
	}

	clone(): GeneralBank<T> {
		return new GeneralBank<T>({
			allowedKeys: this.allowedKeys ? Array.from(this.allowedKeys) : undefined,
			validator: this.validator,
			initialBank: { ...this.bank },
			valueSchema: this.valueSchema
		});
	}

	validate(): void {
		for (let key of Object.keys(this.bank) as T[]) {
			const value = this.bank[key];
			if (this.allowedKeys) {
				if (typeof Array.from(this.allowedKeys.values())[0] === 'number') {
					key = Number.parseInt(key as string) as T;
				}
				if (!this.allowedKeys.has(key)) {
					throw new Error(
						`Key ${key} (${typeof key}) is not allowed, only these are allowed: ${Array.from(
							this.allowedKeys
						).join(', ')}`
					);
				}
			}
			assert(
				typeof value === 'number' && value >= this.valueSchema.min && value <= this.valueSchema.max,
				`Invalid value (not within minmax ${this.valueSchema.min}-${this.valueSchema.max}) for ${key}: ${value}`
			);
			if (!this.valueSchema.floats) {
				assert(Number.isInteger(value), `Value for ${key} is not an integer: ${value}`);
			}
			this.validator?.(key, value, this.bank);
		}
	}

	entries() {
		return Object.entries(this.bank) as [T, number][];
	}

	length() {
		return Object.keys(this.bank).length;
	}

	amount(key: T): number {
		return this.bank[key] ?? 0;
	}

	has(key: T): boolean {
		return this.amount(key) >= 1;
	}

	toString(): string {
		const entries = Object.entries(this.bank);
		if (entries.length === 0) return 'Bank is empty';
		return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
	}

	private addItem(key: T, quantity: number): this {
		assert(quantity >= 0, 'Quantity must be non-negative.');
		const newValue = Decimal.add(this.amount(key), quantity).toNumber();
		if (newValue > this.valueSchema.max) {
			throw new Error(`Value for ${key} exceeds the maximum of ${this.valueSchema.max}.`);
		}
		this.bank[key] = newValue;
		this.validate();
		return this;
	}

	private removeItem(key: T, quantity: number): this {
		assert(quantity >= 0, 'Quantity must be non-negative.');
		const currentAmount = this.amount(key);
		if (currentAmount < quantity) {
			throw new Error(`Not enough ${key} to remove.`);
		}
		const newValue = Decimal.sub(currentAmount, quantity).toNumber();
		this.bank[key] = newValue;
		if (newValue === 0) {
			delete this.bank[key];
		}
		this.validate();
		return this;
	}

	add(keyOrBank: T | GeneralBank<T>, quantity = 1): this {
		if (keyOrBank instanceof GeneralBank) {
			for (const [key, qty] of keyOrBank.entries()) {
				this.addItem(key, qty);
			}
		} else {
			this.addItem(keyOrBank, quantity);
		}
		return this;
	}

	remove(keyOrBank: T | GeneralBank<T>, quantity = 1): this {
		if (keyOrBank instanceof GeneralBank) {
			for (const [key, qty] of Object.entries(keyOrBank.bank) as [T, number][]) {
				this.removeItem(key as T, qty);
			}
		} else {
			this.removeItem(keyOrBank, quantity);
		}
		return this;
	}
}
