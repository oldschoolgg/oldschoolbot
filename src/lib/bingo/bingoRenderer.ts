import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { LRUCache } from 'lru-cache';
import type { Bank } from 'oldschooljs';

import type { BingoTheme } from '@/lib/bingo/bingoTypes.js';
import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { type CanvasContext, createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import type { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import { bingoTileQuantity, getAllTileItems } from '@/mahoji/lib/bingo/bingoUtil.js';

export interface BingoBoardData {
	title: string;
	theme: BingoTheme;
	tiles: {
		name: string;
		iconItemID: number;
		completed: boolean;
		quantity: { current: number; target: number } | null;
	}[];
}

export const bingoBackgrounds: Record<BingoTheme, string> = {
	winter: './src/lib/resources/images/bingo/Winter.png',
	spring: './src/lib/resources/images/bingo/Spring.png',
	summer: './src/lib/resources/images/bingo/Summer.png',
	autumn: './src/lib/resources/images/bingo/Autumn.png',
	ironman: './src/lib/resources/images/bingo/Ironman.png'
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

export async function renderBingoBoard(board: BingoBoardData): Promise<Buffer> {
	if (board.tiles.length !== 28) throw new Error('Seasonal boards require exactly 28 tiles.');
	const background = await loadImage(await readFile(bingoBackgrounds[board.theme]));
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
	for (let size = 54; size >= 24; size -= 2) {
		ctx.font = `${size}px "RuneScape Bold 12"`;
		if (ctx.measureText(board.title).width <= 800) break;
	}
	ctx.fillText(board.title, 742, 91);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const grid = { x: 48, y: 184, width: 1388, height: 738, columns: 7, rows: 4 };
	const tileWidth = grid.width / grid.columns;
	const tileHeight = grid.height / grid.rows;
	for (const [index, tile] of board.tiles.entries()) {
		const x = grid.x + (index % grid.columns) * tileWidth;
		const y = grid.y + Math.floor(index / grid.columns) * tileHeight;
		const completed = tile.completed;
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
		const icon = await OSRSCanvas.getItemImage({ itemID: tile.iconItemID });
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
		const { lines, size } = fitLabel(ctx, tile.name, tileWidth - 20);
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
		if (tile.quantity) {
			ctx.font = '18px OSRSFontCompact';
			ctx.fillStyle = '#342510';
			ctx.textAlign = 'left';
			ctx.fillText(
				`${tile.quantity.current.toLocaleString()}/${tile.quantity.target.toLocaleString()}`,
				x + 9,
				boxY + 12
			);
		}
	}
	ctx.textAlign = 'center';
	ctx.font = '40px "RuneScape Bold 12"';
	ctx.fillStyle = '#ffca50';
	ctx.fillText(`${board.tiles.filter(tile => tile.completed).length}/${board.tiles.length} Completed`, 742, 999);
	return canvas.png;
}

const boardCache = new LRUCache<string, Promise<Buffer>>({ max: 8 });

export function teamBingoBoard(bingo: BingoManager, cl: Bank): BingoBoardData {
	if (!bingo.theme) throw new Error('This bingo does not have seasonal artwork.');
	const progress = bingo.determineProgressOfBank(cl);
	return {
		title: bingo.title,
		theme: bingo.theme,
		tiles: bingo.bingoTiles.map(tile => {
			const quantity = bingoTileQuantity(tile, cl);
			return {
				name: tile.name,
				iconItemID: tile.iconItemID ?? getAllTileItems(tile)[0] ?? 995,
				completed: progress.tilesCompleted.includes(tile),
				quantity: quantity
					? { current: Math.min(quantity.current, quantity.target), target: quantity.target }
					: null
			};
		})
	};
}

export function cachedBingoBoard(bingo: BingoManager, teamID: number, cl: Bank) {
	const board = teamBingoBoard(bingo, cl);
	const hash = createHash('sha256').update(JSON.stringify(board)).digest('hex');
	const key = `${bingo.id}:${teamID}:${hash}`;
	let image = boardCache.get(key);
	if (!image) {
		image = renderBingoBoard(board).catch(err => {
			boardCache.delete(key);
			throw err;
		});
		boardCache.set(key, image);
	}
	return image;
}
