import { readFile } from 'node:fs/promises';
import { LRUCache } from 'lru-cache';

import type { BingoSeason, SeasonalBingoProgress } from '@/prisma/main.js';
import { type BingoTheme, bingoBoardSchema, challengeTarget } from '@/lib/bingo/bingoTypes.js';
import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { type CanvasContext, createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

export const bingoBackgrounds: Record<BingoTheme, string> = {
	winter: './src/lib/resources/images/bingo/Winter.png',
	spring: './src/lib/resources/images/bingo/Spring.png',
	summer: './src/lib/resources/images/bingo/Summer.png',
	autumn: './src/lib/resources/images/bingo/Autumn.png'
};

export function wrapBingoText(text: string, width: number, measure: (text: string) => number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.trim().split(/\s+/)) {
		if (line && measure(`${line}${word}`) > width) {
			lines.push(line);
			line = '';
		}
		for (const char of word) {
			if (line && measure(line + char) > width) {
				lines.push(line);
				line = '';
			}
			line += char;
		}
		line += ' ';
	}
	if (line.trim()) lines.push(line.trim());
	return lines.map(l => l.trim());
}

function fitLabel(ctx: CanvasContext, text: string, width: number) {
	for (let size = 28; size >= 12; size -= 2) {
		ctx.font = `${size}px "RuneScape Bold 12"`;
		const lines = wrapBingoText(text, width, s => ctx.measureText(s).width);
		if (lines.length * size <= 60) return { lines, size };
	}
	return { lines: wrapBingoText(text, width, s => ctx.measureText(s).width), size: 12 };
}

export async function renderBingoBoard(
	season: Pick<BingoSeason, 'theme' | 'year' | 'challenges'>,
	progress: SeasonalBingoProgress[]
): Promise<Buffer> {
	const challenges = bingoBoardSchema.parse(season.challenges);
	const background = await loadImage(await readFile(bingoBackgrounds[season.theme as BingoTheme]));
	await CanvasModule.ensureInit();
	const canvas = createCanvas(background.width, background.height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(background, 0, 0);
	// All supplied backgrounds use the same 1484 x 1060 layout.
	ctx.scale(background.width / 1484, background.height / 1060);
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	ctx.font = '54px "RuneScape Bold 12"';
	ctx.fillStyle = '#ffca50';
	ctx.shadowColor = '#000000';
	ctx.shadowOffsetX = 3;
	ctx.shadowOffsetY = 3;
	const theme = season.theme[0].toUpperCase() + season.theme.slice(1);
	ctx.fillText(`${theme} OSB Bingo ${season.year}`, 742, 91);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const grid = { x: 48, y: 184, width: 1388, height: 738, columns: 7, rows: 4 };
	const tileWidth = grid.width / grid.columns;
	const tileHeight = grid.height / grid.rows;
	for (const [index, challenge] of challenges.entries()) {
		const x = grid.x + (index % grid.columns) * tileWidth;
		const y = grid.y + Math.floor(index / grid.columns) * tileHeight;
		const state = progress.find(p => p.challenge_id === challenge.id);
		const completed = Boolean(state?.completed_at);
		if (completed) {
			ctx.fillStyle = 'rgba(74, 149, 65, 0.22)';
			ctx.fillRect(x + 2, y + 2, tileWidth - 4, tileHeight - 4);
		}
		ctx.strokeStyle = '#5a3b1b';
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, tileWidth, tileHeight);
		ctx.fillStyle = '#251b0d';
		ctx.font = '32px "RuneScape Bold 12"';
		ctx.textAlign = 'left';
		ctx.fillText(String(index + 1), x + 9, y + 20);
		const icon = await OSRSCanvas.getItemImage({ itemID: challenge.iconItemID });
		const scale = Math.max(1, Math.floor(Math.min(100 / icon.width, 75 / icon.height)));
		const width = icon.width * scale;
		const height = icon.height * scale;
		ctx.drawImage(
			icon,
			Math.round(x + (tileWidth - width) / 2),
			Math.round(y + 22 + (75 - height) / 2),
			width,
			height
		);
		ctx.textAlign = 'center';
		const { lines, size } = fitLabel(ctx, challenge.name, tileWidth - 20);
		for (const [lineIndex, line] of lines.entries())
			ctx.fillText(line, x + tileWidth / 2, y + 106 + lineIndex * size);
		const boxX = x + tileWidth - 32;
		const boxY = y + tileHeight - 31;
		ctx.fillStyle = completed ? '#d9efbd' : '#f5e4ba';
		ctx.fillRect(boxX, boxY, 23, 23);
		ctx.strokeStyle = '#342510';
		ctx.lineWidth = 2;
		ctx.strokeRect(boxX, boxY, 23, 23);
		if (completed) {
			ctx.strokeStyle = '#205e25';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(boxX + 4, boxY + 12);
			ctx.lineTo(boxX + 10, boxY + 18);
			ctx.lineTo(boxX + 20, boxY + 5);
			ctx.stroke();
		}
		if ('requiredQuantity' in challenge) {
			ctx.font = '18px OSRSFontCompact';
			ctx.fillStyle = '#342510';
			ctx.textAlign = 'left';
			ctx.fillText(
				`${(state?.quantity ?? 0).toLocaleString()}/${challengeTarget(challenge).toLocaleString()}`,
				x + 9,
				boxY + 12
			);
		}
	}
	ctx.textAlign = 'center';
	ctx.font = '40px "RuneScape Bold 12"';
	ctx.fillStyle = '#ffca50';
	ctx.fillText(`${progress.filter(p => p.completed_at).length}/${challenges.length} Completed`, 742, 999);
	return canvas.png;
}

const boardCache = new LRUCache<string, Promise<Buffer>>({ max: 8 });

export function cachedBingoBoard(season: BingoSeason & { progress: SeasonalBingoProgress[] }) {
	const key = `${season.id}:${season.progress_version}`;
	let image = boardCache.get(key);
	if (!image) {
		image = renderBingoBoard(season, season.progress).catch(err => {
			boardCache.delete(key);
			throw err;
		});
		boardCache.set(key, image);
	}
	return image;
}
