import { expect, test } from 'vitest';
import { SimpleTable } from '../src/structures';

test('SimpleTable', () => {
	const table = new SimpleTable();
	expect(table.table).toEqual([]);
	expect(table.totalWeight).toEqual(0);
	expect(table.roll()).toEqual(null);
	expect(() => table.rollOrThrow()).toThrow();
	expect(table.add('X', 1)).toEqual(table);
	expect(table.table).toEqual([{ item: 'X', weight: 1 }]);
	expect(table.totalWeight).toEqual(1);
	expect(table.roll()).toEqual('X');
	expect(table.rollOrThrow()).toEqual('X');

	table.delete('X');
	expect(table.roll()).toEqual(null);

	expect(() => table.delete('X')).toThrow();
});
