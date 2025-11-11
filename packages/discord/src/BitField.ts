export type BitFieldValue = number;
export type BitFieldResolvable = BitFieldValue | BitField | BitFieldResolvable[];

export class BitField {
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

	has(bit: BitFieldResolvable): boolean {
		const b = BitField.resolve(bit);
		return (this.bitfield & b) === b;
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

	toJSON(): number {
		return this.bitfield;
	}

	valueOf(): BitFieldValue {
		return this.bitfield;
	}

	static resolve(bit: BitFieldResolvable): BitFieldValue {
		if (typeof bit === 'number') return bit;
		if (bit instanceof BitField) return bit.bitfield;
		return bit.map(b => BitField.resolve(b)).reduce((p, c) => p | c, BitField.DefaultBit);
	}
}
