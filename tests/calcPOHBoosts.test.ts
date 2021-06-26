import { calcPOHBoosts, getPOHObject } from '../src/lib/poh';
import { PoHTable } from '../src/lib/typeorm/PoHTable.entity';

describe('calcPOHBoosts', () => {
	test('no boosts', () => {
		const res = calcPOHBoosts(new PoHTable(), {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10
			}
		});
		expect(res).toEqual([0, []]);
	});
	test('1 boost', () => {
		const poh = new PoHTable();
		poh.pool = getPOHObject('Fancy rejuvenation pool').id;

		const res = calcPOHBoosts(poh, {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 11,
				'Ornate rejuvenation pool': 12
			}
		});
		expect(res).toEqual([11, ['11% for Fancy rejuvenation pool']]);
	});
	test('2 boost', () => {
		const poh = new PoHTable();
		poh.pool = getPOHObject('Fancy rejuvenation pool').id;
		poh.throne = getPOHObject('Demonic throne').id;

		const res = calcPOHBoosts(poh, {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 11,
				'Ornate rejuvenation pool': 12
			},
			throne: {
				'Demonic throne': 5
			}
		});
		expect(res).toEqual([16, ['11% for Fancy rejuvenation pool', '5% for Demonic throne']]);
	});
});
