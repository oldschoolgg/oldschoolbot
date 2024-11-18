import type { PlayerOwnedHouse } from '@prisma/client';
import { describe, expect, test } from 'vitest';

import { calcPOHBoosts, getPOHObject } from '../../src/lib/poh';

const basePOH: PlayerOwnedHouse = {
	user_id: '123',
	background_id: 1,
	altar: null,
	throne: null,
	mounted_cape: null,
	mounted_fish: null,
	mounted_head: null,
	mounted_item: null,
	jewellery_box: null,
	prayer_altar: null,
	spellbook_altar: null,
	guard: null,
	torch: null,
	dungeon_decoration: null,
	prison: null,
	pool: null,
	teleport: null,
	amulet: null,
	garden_decoration: null
} as const;

describe('calcPOHBoosts', () => {
	test('no boosts', () => {
		const poh: PlayerOwnedHouse = { ...basePOH };
		const res = calcPOHBoosts(poh, {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10
			}
		});
		expect(res).toEqual({ boost: 0, messages: [] });
	});
	test('1 boost', () => {
		const poh: PlayerOwnedHouse = { ...basePOH, pool: getPOHObject('Fancy rejuvenation pool').id };

		const res = calcPOHBoosts(poh, {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 11,
				'Ornate rejuvenation pool': 12
			}
		});
		expect(res).toEqual({ boost: 11, messages: ['11% for Fancy rejuvenation pool'] });
	});
	test('2 boost', () => {
		const poh: PlayerOwnedHouse = { ...basePOH, pool: getPOHObject('Fancy rejuvenation pool').id };
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
		expect(res).toEqual({ boost: 16, messages: ['11% for Fancy rejuvenation pool', '5% for Demonic throne'] });
	});
});
