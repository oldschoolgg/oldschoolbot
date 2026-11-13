import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { bingoBackgrounds, renderBingoBoard, wrapBingoText } from '@/lib/bingo/bingoRenderer.js';
import { bingoThemes } from '@/lib/bingo/bingoTypes.js';
import { loadImage } from '@/lib/canvas/canvasUtil.js';

describe('Seasonal bingo renderer', () => {
	it('wraps long words and descriptions within the available width', () => {
		const measure = (text: string) => text.length * 8;
		for (const text of ['Twisted bow / Kodai / Buckler', 'AnExtremelyLongChallengeNameWithoutAnySpaces']) {
			const lines = wrapBingoText(text, 100, measure);
			expect(lines.length).toBeGreaterThan(1);
			expect(lines.every(line => measure(line) <= 100)).toBe(true);
			expect(lines.join('').replaceAll(' ', '')).toBe(text.replaceAll(' ', ''));
		}
	});
	it.each(bingoThemes)('renders 28 tiles and completion indicators on the %s artwork', async theme => {
		const challenges = defaultBingoChallenges();
		const season = { theme, year: 2026, challenges };
		const incomplete = await renderBingoBoard(season, []);
		const complete = await renderBingoBoard(
			season,
			challenges.map(c => ({
				season_id: 'preview',
				challenge_id: c.id,
				quantity: 1,
				items: {},
				completed_by: 'preview',
				completed_at: new Date(),
				completion_event_id: 'preview',
				reset_at: null
			}))
		);
		expect(complete.equals(incomplete)).toBe(false);
		const [background, rendered] = await Promise.all([
			loadImage(await readFile(bingoBackgrounds[theme])),
			loadImage(incomplete)
		]);
		expect([rendered.width, rendered.height]).toEqual([background.width, background.height]);
	}, 30_000);
});
