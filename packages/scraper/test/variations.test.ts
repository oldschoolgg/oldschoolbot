import { describe, expect, it } from 'vitest';

import { splitVariations } from '../src/util/variations.js';

describe('splitVariations', () => {
	it('returns single object when no numeric suffixes exist', () => {
		const input = { attack: 10, defence: 20, name: 'sword' };
		const result = splitVariations(input);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ attack: 10, defence: 20, name: 'sword' });
	});

	it('splits object with underscore suffixes', () => {
		const input = {
			attack_stab: -10,
			dstab_1: 22,
			dstab_2: 72,
			dslash_1: 30,
			dslash_2: 80,
			slot: 'shield'
		};
		const result = splitVariations(input);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			attack_stab: -10,
			dstab: 22,
			dslash: 30,
			slot: 'shield'
		});
		expect(result[1]).toEqual({
			attack_stab: -10,
			dstab: 72,
			dslash: 80,
			slot: 'shield'
		});
	});

	it('splits object with non-underscore suffixes', () => {
		const input = { atk1: 5, atk2: 10, def1: 15, def2: 20, name: 'item' };
		const result = splitVariations(input);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ atk: 5, def: 15, name: 'item' });
		expect(result[1]).toEqual({ atk: 10, def: 20, name: 'item' });
	});

	it('handles mixed underscore and non-underscore suffixes', () => {
		const input = { atk1: 5, def_1: 10, atk2: 15, def_2: 20 };
		const result = splitVariations(input);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ atk: 5, def: 10 });
		expect(result[1]).toEqual({ atk: 15, def: 20 });
	});

	it('handles three or more variations', () => {
		const input = { hp_1: 100, hp_2: 200, hp_3: 300, name: 'boss' };
		const result = splitVariations(input);

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ hp: 100, name: 'boss' });
		expect(result[1]).toEqual({ hp: 200, name: 'boss' });
		expect(result[2]).toEqual({ hp: 300, name: 'boss' });
	});

	it('sorts variations by suffix number', () => {
		const input = { val_3: 'c', val_1: 'a', val_2: 'b' };
		const result = splitVariations(input);

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ val: 'a' });
		expect(result[1]).toEqual({ val: 'b' });
		expect(result[2]).toEqual({ val: 'c' });
	});

	it('handles empty object', () => {
		const result = splitVariations({});

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({});
	});

	it('preserves value types', () => {
		const input = {
			str_1: 'text',
			num_1: 42,
			bool_1: true,
			arr_1: [1, 2],
			obj_1: { nested: true },
			str_2: 'other',
			num_2: 100,
			bool_2: false,
			arr_2: [3, 4],
			obj_2: { nested: false }
		};
		const result = splitVariations(input);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			str: 'text',
			num: 42,
			bool: true,
			arr: [1, 2],
			obj: { nested: true }
		});
		expect(result[1]).toEqual({
			str: 'other',
			num: 100,
			bool: false,
			arr: [3, 4],
			obj: { nested: false }
		});
	});

	it('handles original example from requirements', () => {
		const input = {
			attack_stab: -10,
			attack_slash: -10,
			attack_crush: -10,
			attack_magic: 15,
			attack_range: -10,
			dstab_1: 22,
			dstab_2: 72,
			dslash_1: 30,
			dslash_2: 80,
			dcrush_1: 25,
			dcrush_2: 75,
			defence_magic: 15,
			drange_1: -55,
			drange_2: -5,
			melee_strength: -2,
			ranged_strength: 0,
			magic_damage: 2,
			prayer: 0,
			slot: 'shield',
			type: 'infobox_bonuses'
		};
		const result = splitVariations(input);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			attack_stab: -10,
			dstab: 22,
			dslash: 30,
			dcrush: 25,
			drange: -55,
			slot: 'shield'
		});
		expect(result[1]).toMatchObject({
			attack_stab: -10,
			dstab: 72,
			dslash: 80,
			dcrush: 75,
			drange: -5,
			slot: 'shield'
		});
	});
});
