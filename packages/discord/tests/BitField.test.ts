import { beforeEach, describe, expect, it } from 'vitest';

import { BitField } from '../src/BitField.js';

describe('BitField', () => {
	describe('constructor', () => {
		it('should create an empty bitfield when no argument is provided', () => {
			const bf = new BitField();
			expect(bf.bitfield).toBe(0);
		});

		it('should create a bitfield from a number', () => {
			const bf = new BitField(5);
			expect(bf.bitfield).toBe(5);
		});

		it('should create a bitfield from another BitField instance', () => {
			const bf1 = new BitField(5);
			const bf2 = new BitField(bf1);
			expect(bf2.bitfield).toBe(5);
		});

		it('should create a bitfield from an array of numbers', () => {
			const bf = new BitField([1, 2, 4]);
			expect(bf.bitfield).toBe(7); // 1 | 2 | 4 = 7
		});

		it('should create a bitfield from nested arrays', () => {
			const bf = new BitField([1, [2, 4]]);
			expect(bf.bitfield).toBe(7);
		});

		it('should create a bitfield from mixed resolvables', () => {
			const bf1 = new BitField(2);
			const bf2 = new BitField([1, bf1, 4]);
			expect(bf2.bitfield).toBe(7);
		});
	});

	describe('any()', () => {
		let bf: BitField;

		beforeEach(() => {
			bf = new BitField(5); // binary: 101
		});

		it('should return true if any bits match', () => {
			expect(bf.any(1)).toBe(true); // 101 & 001 = 001 (non-zero)
			expect(bf.any(4)).toBe(true); // 101 & 100 = 100 (non-zero)
			expect(bf.any(7)).toBe(true); // 101 & 111 = 101 (non-zero)
		});

		it('should return false if no bits match', () => {
			expect(bf.any(2)).toBe(false); // 101 & 010 = 000 (zero)
			expect(bf.any(8)).toBe(false); // 101 & 1000 = 0000 (zero)
		});

		it('should work with BitField instances', () => {
			const bf2 = new BitField(3);
			expect(bf.any(bf2)).toBe(true); // 101 & 011 = 001 (non-zero)
		});

		it('should work with arrays', () => {
			expect(bf.any([2, 8])).toBe(false); // 101 & 1010 = 0000
			expect(bf.any([1, 2])).toBe(true); // 101 & 011 = 001
		});
	});

	describe('equals()', () => {
		let bf: BitField;

		beforeEach(() => {
			bf = new BitField(5);
		});

		it('should return true for equal values', () => {
			expect(bf.equals(5)).toBe(true);
			expect(bf.equals(new BitField(5))).toBe(true);
			expect(bf.equals([1, 4])).toBe(true); // 1 | 4 = 5
		});

		it('should return false for different values', () => {
			expect(bf.equals(3)).toBe(false);
			expect(bf.equals(7)).toBe(false);
			expect(bf.equals(new BitField(3))).toBe(false);
		});
	});

	describe('has()', () => {
		let bf: BitField;

		beforeEach(() => {
			bf = new BitField(7); // binary: 111
		});

		it('should return true if all specified bits are set', () => {
			expect(bf.has(1)).toBe(true); // 111 & 001 = 001
			expect(bf.has(2)).toBe(true); // 111 & 010 = 010
			expect(bf.has(4)).toBe(true); // 111 & 100 = 100
			expect(bf.has(3)).toBe(true); // 111 & 011 = 011
			expect(bf.has(7)).toBe(true); // 111 & 111 = 111
		});

		it('should return false if any specified bit is not set', () => {
			expect(bf.has(8)).toBe(false); // 111 & 1000 = 0000
			expect(bf.has(9)).toBe(false); // 111 & 1001 = 0001 != 1001
		});

		it('should work with BitField instances', () => {
			const bf2 = new BitField(3);
			expect(bf.has(bf2)).toBe(true);
		});

		it('should work with arrays', () => {
			expect(bf.has([1, 2])).toBe(true); // has both 1 and 2
			expect(bf.has([1, 8])).toBe(false); // doesn't have 8
		});
	});

	describe('add()', () => {
		it('should add bits to the bitfield', () => {
			const bf = new BitField(1);
			bf.add(2);
			expect(bf.bitfield).toBe(3);

			bf.add(4, 8);
			expect(bf.bitfield).toBe(15);
		});

		it('should handle adding already existing bits', () => {
			const bf = new BitField(5);
			bf.add(1);
			expect(bf.bitfield).toBe(5);
		});

		it('should work with various resolvables', () => {
			const bf = new BitField(1);
			const bf2 = new BitField(4);
			bf.add(2, bf2, [8]);
			expect(bf.bitfield).toBe(15);
		});

		it('should return this for chaining', () => {
			const bf = new BitField(1);
			const result = bf.add(2);
			expect(result).toBe(bf);
		});

		it('should return new BitField when frozen', () => {
			const bf = new BitField(1);
			bf.freeze();
			const result = bf.add(2);

			expect(result).not.toBe(bf);
			expect(result.bitfield).toBe(3);
			expect(bf.bitfield).toBe(1); // Original unchanged
		});
	});

	describe('remove()', () => {
		it('should remove bits from the bitfield', () => {
			const bf = new BitField(7); // 111
			bf.remove(1);
			expect(bf.bitfield).toBe(6); // 110

			bf.remove(2, 4);
			expect(bf.bitfield).toBe(0); // 000
		});

		it('should handle removing non-existing bits', () => {
			const bf = new BitField(5); // 101
			bf.remove(8);
			expect(bf.bitfield).toBe(5);
		});

		it('should work with various resolvables', () => {
			const bf = new BitField(15); // 1111
			const bf2 = new BitField(3); // 0011
			bf.remove(bf2, [8]);
			expect(bf.bitfield).toBe(4); // 0100
		});

		it('should return this for chaining', () => {
			const bf = new BitField(7);
			const result = bf.remove(1);
			expect(result).toBe(bf);
		});

		it('should return new BitField when frozen', () => {
			const bf = new BitField(7);
			bf.freeze();
			const result = bf.remove(1);

			expect(result).not.toBe(bf);
			expect(result.bitfield).toBe(6);
			expect(bf.bitfield).toBe(7); // Original unchanged
		});
	});

	describe('freeze()', () => {
		it('should freeze the BitField instance', () => {
			const bf = new BitField(5);
			const frozen = bf.freeze();

			expect(frozen).toBe(bf);
			expect(Object.isFrozen(bf)).toBe(true);
		});

		it('should prevent direct modification after freezing', () => {
			const bf = new BitField(5);
			bf.freeze();

			expect(() => {
				(bf as any).bitfield = 10;
			}).toThrow();
		});
	});

	describe('toJSON()', () => {
		it('should return the bitfield value', () => {
			const bf = new BitField(5);
			expect(bf.toJSON()).toBe(5);
		});

		it('should be used by JSON.stringify', () => {
			const bf = new BitField(5);
			expect(JSON.stringify(bf)).toBe('5');
		});
	});

	describe('valueOf()', () => {
		it('should return the bitfield value', () => {
			const bf = new BitField(5);
			expect(bf.valueOf()).toBe(5);
		});

		it('should enable numeric operations', () => {
			const bf1 = new BitField(5);
			const bf2 = new BitField(3);
			expect(+bf1).toBe(5);
			expect(bf1.valueOf() | bf2.valueOf()).toBe(7);
		});
	});

	describe('static resolve()', () => {
		it('should resolve numbers', () => {
			expect(BitField.resolve(5)).toBe(5);
		});

		it('should resolve BitField instances', () => {
			const bf = new BitField(5);
			expect(BitField.resolve(bf)).toBe(5);
		});

		it('should resolve arrays', () => {
			expect(BitField.resolve([1, 2, 4])).toBe(7);
			expect(BitField.resolve([])).toBe(0);
		});

		it('should resolve nested arrays', () => {
			const bf = new BitField(2);
			expect(BitField.resolve([1, [4, bf]])).toBe(7);
		});
	});

	describe('edge cases', () => {
		it('should handle zero values correctly', () => {
			const bf = new BitField(0);
			expect(bf.any(0)).toBe(false);
			expect(bf.equals(0)).toBe(true);
			expect(bf.has(0)).toBe(true);
		});

		it('should handle large bit values', () => {
			const largeBit = 1 << 30;
			const bf = new BitField(largeBit);
			expect(bf.has(largeBit)).toBe(true);
			expect(bf.bitfield).toBe(largeBit);
		});

		it('should handle method chaining', () => {
			const bf = new BitField();
			const result = bf.add(1).add(2).remove(1).add(4);
			expect(result).toBe(bf);
			expect(bf.bitfield).toBe(6); // 2 | 4
		});

		it('should handle chaining on frozen instances', () => {
			const bf = new BitField(1);
			bf.freeze();
			const result = bf.add(2).add(4).remove(1);

			expect(result).not.toBe(bf);
			expect(result.bitfield).toBe(6); // 2 | 4
			expect(bf.bitfield).toBe(1); // Original unchanged
		});
	});
});
