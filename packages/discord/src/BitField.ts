export type BitFieldValue = number;
export type BitFieldResolvable = BitFieldValue | string | BitField | BitFieldResolvable[];

export class BitField {
	static Flags: Record<string | number, BitFieldValue> = {};
	static DefaultBit: BitFieldValue = 0;

	bitfield: BitFieldValue;

	constructor(bits?: BitFieldResolvable) {
		this.bitfield = BitField.resolve(bits ?? BitField.DefaultBit);
	}

	any(bit: BitFieldResolvable): boolean {
		return (this.bitfield & BitField.resolve(bit)) !== BitField.DefaultBit;
	}

	equals(bit: BitFieldResolvable): boolean {
		return this.bitfield === BitField.resolve(bit);
	}

	has(bit: BitFieldResolvable, ..._hasParams: unknown[]): boolean {
		const b = BitField.resolve(bit);
		return (this.bitfield & b) === b;
	}

	missing(bits: BitFieldResolvable, ...hasParams: unknown[]): string[] {
		return new BitField(bits).remove(this).toArray(...hasParams);
	}

	freeze(): Readonly<this> {
		return Object.freeze(this);
	}

	add(...bits: BitFieldResolvable[]): BitField {
		let total = BitField.DefaultBit;
		for (const b of bits) total |= BitField.resolve(b);
		if (Object.isFrozen(this)) return new BitField(this.bitfield | total);
		this.bitfield |= total;
		return this;
	}

	remove(...bits: BitFieldResolvable[]): BitField {
		let total = BitField.DefaultBit;
		for (const b of bits) total |= BitField.resolve(b);
		if (Object.isFrozen(this)) return new BitField(this.bitfield & ~total);
		this.bitfield &= ~total;
		return this;
	}

	serialize(...hasParams: unknown[]): Record<string, boolean> {
		const out: Record<string, boolean> = {};
		for (const [flag, bit] of Object.entries(BitField.Flags)) {
			if (Number.isNaN(flag as any)) out[flag] = this.has(bit, ...hasParams);
		}
		return out;
	}

	toArray(...hasParams: unknown[]): string[] {
		return [...this[Symbol.iterator](...hasParams)];
	}

	toJSON(): number {
		return this.bitfield;
	}

	valueOf(): BitFieldValue {
		return this.bitfield;
	}

	*[Symbol.iterator](...hasParams: unknown[]): Generator<string> {
		for (const name of Object.keys(BitField.Flags)) {
			if (Number.isNaN(name) && this.has(name, ...hasParams)) yield name;
		}
	}

	static resolve(bit?: BitFieldResolvable): BitFieldValue {
		if (typeof bit === 'number') return bit;
		if (bit instanceof BitField) return bit.bitfield;
		if (Array.isArray(bit)) return bit.map(b => BitField.resolve(b)).reduce((p, c) => p | c, BitField.DefaultBit);
		if (typeof bit === 'string') {
			if (!Number.isNaN(bit)) return Number(bit);
			if (BitField.Flags[bit] !== undefined) return BitField.Flags[bit] as number;
		}
		throw new Error(`BitFieldInvalid: ${String(bit)}`);
	}
}
