import { readFile } from 'node:fs/promises';
import { Bank } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import {
	bingoBackgrounds,
	cachedBingoBoard,
	fitBingoLabel,
	renderBingoBoard,
	teamBingoBoard,
	wrapBingoText
} from '@/lib/bingo/bingoRenderer.js';
import { bingoThemes } from '@/lib/bingo/bingoTypes.js';
import { createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { getAllTileItems } from '@/mahoji/lib/bingo/bingoUtil.js';
import { parseBingoConfiguration } from '@/mahoji/lib/bingo/seasonalBingo.js';
import { bingoWithTiles } from '../../test-utils/bingo.js';

describe('Seasonal images from normal team progress', () => {
	const tiles = parseBingoConfiguration(defaultBingoChallenges());
	it('wraps long names within the available width', () => {
		const measure = (text: string) => text.length * 8;
		const text = 'AnExtremelyLongChallengeNameWithoutAnySpaces';
		const lines = wrapBingoText(text, 100, measure);
		expect(lines.every(line => measure(line) <= 100)).toBe(true);
		expect(lines.join('')).toBe(text);
	});
	it('truncates long generated native labels within the space above the quantity and checkbox', () => {
		const items = [...new Set(bingoWithTiles(tiles).bingoTiles.flatMap(getAllTileItems))];
		const bingo = bingoWithTiles([{ allOf: items }, ...tiles.slice(1)]);
		const text = bingo.bingoTiles[0].name;
		const ctx = createCanvas(200, 185).getContext('2d');
		const label = fitBingoLabel(ctx, text, 178, 48);
		expect(text.length).toBeGreaterThan(80);
		expect(label.lines.length * label.size).toBeLessThanOrEqual(48);
		expect(label.lines.every(line => ctx.measureText(line).width <= 178)).toBe(true);
		expect(label.lines.at(-1)).toMatch(/\.\.\.$/);
		const shortLabel = fitBingoLabel(ctx, 'Elysian sigil', 178, 48);
		expect(shortLabel.lines.join(' ')).toBe('Elysian sigil');
	});
	it('shares unchanged renders and invalidates when progress, title or artwork changes', async () => {
		const bingo = bingoWithTiles(tiles);
		const cl = new Bank();
		const initial = cachedBingoBoard(bingo, 1, cl);
		expect(cachedBingoBoard(bingo, 1, cl)).toBe(initial);
		const complete = cachedBingoBoard(bingo, 1, cl.clone().add('Zenyte shard'));
		expect(complete).not.toBe(initial);
		expect((await initial).equals(await complete)).toBe(false);
		bingo.title = 'Another bingo';
		expect(cachedBingoBoard(bingo, 1, cl)).not.toBe(initial);
		bingo.theme = 'spring';
		expect(cachedBingoBoard(bingo, 1, cl)).not.toBe(initial);
		await cachedBingoBoard(bingo, 1, cl);
	}, 30_000);
	it('uses the original scorer and team bank for displayed completion and quantities', () => {
		const bingo = bingoWithTiles(tiles);
		const board = teamBingoBoard(bingo, new Bank().add('Redwood logs', 1000).add('Zenyte shard'));
		expect(board.tiles[2]).toMatchObject({ completed: false, quantity: { current: 1000, target: 5000 } });
		expect(board.tiles[4].completed).toBe(true);
		expect(teamBingoBoard(bingo, new Bank()).tiles[4].completed).toBe(false);
	});
	it.each(bingoThemes)('renders all 28 tiles on the %s background', async theme => {
		const bingo = bingoWithTiles(tiles, theme);
		const result = await renderBingoBoard(teamBingoBoard(bingo, new Bank()));
		const [background, rendered] = await Promise.all([
			loadImage(await readFile(bingoBackgrounds[theme])),
			loadImage(result)
		]);
		expect([rendered.width, rendered.height]).toEqual([background.width, background.height]);
	}, 30_000);
});
