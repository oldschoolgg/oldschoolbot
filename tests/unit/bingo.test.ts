import { Bank, itemID } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { legacyBingoTiles } from '@/mahoji/lib/bingo/legacyBingoTiles.js';
import { parseBingoConfiguration } from '@/mahoji/lib/bingo/seasonalBingo.js';
import { bingoWithTiles } from '../test-utils/bingo.js';

describe('Bingo JSON import into the existing tile system', () => {
	const configuration = defaultBingoChallenges();
	const tiles = parseBingoConfiguration(configuration);
	const bingo = bingoWithTiles(tiles);
	const completed = (bank: Bank) => bingo.determineProgressOfBank(bank).tilesCompleted.map(tile => tile.name);
	it('stores normal item, quantity and all-of definitions with display metadata', () => {
		expect(tiles).toHaveLength(28);
		expect(tiles[2]).toMatchObject({ name: '5,000 Redwood logs', bank: { [itemID('Redwood logs')]: 5000 } });
		expect(tiles[17]).toMatchObject({ allOf: ['Voidwaker blade', 'Voidwaker hilt', 'Voidwaker gem'].map(itemID) });
	});
	it('uses the original scorer for any eligible item and counts the tile once', () => {
		for (const item of ['Arcane sigil', 'Spectral sigil', 'Elysian sigil']) {
			expect(completed(new Bank().add(item, 5))).toEqual(['Any Corp sigil']);
		}
	});
	it('counts the actual Wintertodt and Tempoross tome reward variants', () => {
		for (const item of ['Tome of fire', 'Tome of water (empty)']) {
			expect(completed(new Bank().add(item))).toContain('Tome of fire / water');
		}
	});
	it('loads every historical catalogue reference without exposing it to JSON imports', () => {
		const legacy = bingoWithTiles(
			legacyBingoTiles.map(tile => ({ global: tile.id })),
			null
		);
		expect(legacy.bingoTiles.map(tile => tile.name)).toEqual(legacyBingoTiles.map(tile => tile.name));
		expect(legacy.determineProgressOfBank(new Bank()).tilesCompletedCount).toBe(0);
		const sigilTile = legacy.bingoTiles.find(tile => tile.name === 'Receive any Sigil from Corp');
		expect(legacy.determineProgressOfBank(new Bank().add('Elysian sigil')).tilesCompleted).toContain(sigilTile);
		expect(() => parseBingoConfiguration([{ global: 6 }, ...tiles.slice(1)])).toThrow();
	});
	it('preserves historical custom quantity and ring requirements', () => {
		const legacy = bingoWithTiles([{ global: 13 }, { global: 38 }], null);
		const cl = new Bank()
			.add('Red chinchompa', 4999)
			.add('Ultor ring')
			.add('Ultor icon')
			.add('Ultor vestige')
			.add('Berserker icon')
			.add('Berserker ring')
			.add('Chromium ingot', 2);
		expect(legacy.determineProgressOfBank(cl).tilesCompletedCount).toBe(0);
		expect(legacy.determineProgressOfBank(cl.add('Red chinchompa').add('Chromium ingot')).tilesCompletedCount).toBe(
			2
		);
	});
	it('evaluates quantity totals from the existing combined bank', () => {
		const cl = new Bank().add('Redwood logs', 1000);
		expect(completed(cl)).not.toContain('5,000 Redwood logs');
		expect(completed(cl.add('Redwood logs', 4000))).toContain('5,000 Redwood logs');
		expect(completed(new Bank().add('Logs', 50_000))).not.toContain('5,000 Redwood logs');
	});
	it('supports full alternative sets through the existing customReq branch', () => {
		const cl = new Bank()
			.add("Ahrim's hood")
			.add("Dharok's helm")
			.add("Dharok's platebody")
			.add("Dharok's platelegs");
		expect(completed(cl)).not.toContain('One full Barrows set');
		expect(completed(cl.add("Dharok's greataxe"))).toContain('One full Barrows set');
	});
	it('combines quantities of alternative items without adding a progress store', () => {
		const custom = structuredClone(configuration);
		custom[0] = {
			...custom[0],
			type: 'item_quantity',
			targetItemIDs: [itemID('Logs'), itemID('Oak logs')],
			requiredQuantity: 100
		};
		const imported = bingoWithTiles(parseBingoConfiguration(custom));
		expect(
			imported.determineProgressOfBank(new Bank().add('Logs', 40).add('Oak logs', 60)).tilesCompletedCount
		).toBe(1);
	});
	it('round-trips exported native tiles with explicit item requirements', () => {
		const native = structuredClone(tiles);
		native[0] = { name: 'Arcane sigil', oneOf: [itemID('Arcane sigil')] };
		expect(parseBingoConfiguration(JSON.parse(JSON.stringify(native)))).toEqual(native);
		expect(bingoWithTiles(native).determineProgressOfBank(new Bank().add('Arcane sigil')).tilesCompletedCount).toBe(
			2
		);
	});
	it('preserves ordinary legacy tiles and scoring without seasonal metadata', () => {
		const ordinary = bingoWithTiles([{ oneOf: [itemID('Coal')] }, { bank: { [itemID('Logs')]: 100 } }], null);
		expect(ordinary.determineProgressOfBank(new Bank().add('Coal').add('Logs', 100)).tilesCompletedCount).toBe(2);
	});
	it('rejects invalid counts, duplicate challenge IDs and activity-only challenges', () => {
		expect(() => parseBingoConfiguration([{ global: 6 }, ...tiles.slice(1)])).toThrow();
		expect(() => parseBingoConfiguration(configuration.slice(1))).toThrow();
		expect(() => parseBingoConfiguration(configuration.map(() => configuration[0]))).toThrow();
		expect(() => parseBingoConfiguration(configuration.map(c => ({ ...c, iconItemID: -1 })))).toThrow();
		expect(() =>
			parseBingoConfiguration(
				configuration.map(c => ({
					...c,
					type: 'activity_completion',
					activityID: 'Woodcutting',
					requiredQuantity: 1
				}))
			)
		).toThrow('loot-based');
	});
});
