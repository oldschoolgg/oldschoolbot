import { readFile } from 'node:fs/promises';
import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit/util';
import { CanvasRenderingContext2D as CanvasContext, FontLibrary, Image, Canvas as RawCanvas } from 'skia-canvas';

import { assert } from '../util';

export function registerFont(fontFamily: string, fontPath: string) {
	FontLibrary.use(fontFamily, fontPath);
}
export function createCanvas(width: number, height: number) {
	return new RawCanvas(width, height);
}

export type Canvas = ReturnType<typeof createCanvas>;

export const CanvasImage = Image;
export type CanvasImage = Image;

export async function loadImage(_buffer: Buffer | string): Promise<CanvasImage> {
	const buffer = typeof _buffer === 'string' ? await readFile(_buffer) : _buffer;
	return new Promise<CanvasImage>((resolve, reject) => {
		const image = new CanvasImage();
		image.onload = () => resolve(image as CanvasImage);
		image.onerror = e => reject(e);
		image.src = buffer;
	});
}

export { CanvasContext };

export function fillTextXTimesInCtx(ctx: CanvasContext, text: string, x: number, y: number) {
	ctx.fillText(text, x, y);
}

export function drawItemQuantityText(ctx: CanvasContext, quantity: number, x: number, y: number) {
	const quantityColor = generateHexColorForCashStack(quantity);
	const formattedQuantity = formatItemStackQuantity(quantity);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'start';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, formattedQuantity, x + 1, y + 1);

	ctx.fillStyle = quantityColor;
	fillTextXTimesInCtx(ctx, formattedQuantity, x, y);
}

export function drawTitleText(ctx: CanvasContext, title: string, x: number, y: number) {
	ctx.textAlign = 'center';
	ctx.font = '16px RuneScape Bold 12';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, title, x + 1, y + 1);

	ctx.fillStyle = '#ff981f';
	fillTextXTimesInCtx(ctx, title, x, y);
}

export function drawImageWithOutline(
	ctx: CanvasContext,
	image: Canvas | Image,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	dx: number,
	dy: number,
	dw: number,
	dh: number
): void {
	const alpha = 0.5;
	const outlineColor = '#ac7fff';
	const outlineWidth = 1;
	const dArr = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1];
	const purplecanvas = createCanvas(image.width + (outlineWidth + 2), image.height + (outlineWidth + 2));
	const pctx = purplecanvas.getContext('2d');
	for (let i = 0; i < dArr.length; i += 2) pctx.drawImage(image, dArr[i] * outlineWidth, dArr[i + 1] * outlineWidth);
	pctx.globalAlpha = alpha;
	pctx.globalCompositeOperation = 'source-in';
	pctx.fillStyle = outlineColor;
	pctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	pctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(pctx.canvas, sx, sy, sw, sh, dx, dy, dw + (outlineWidth + 2), dh + (outlineWidth + 2));
	ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

function printMultilineText(ctx: CanvasContext, text: string, x: number, y: number) {
	const lines = text.split(/\r?\n/);

	let linePositionY = y;
	for (const line of lines) {
		const lineMeasured = ctx.measureText(line);
		const thisX = Math.floor(x - lineMeasured.width / 2);
		ctx.fillText(line, thisX, Math.floor(linePositionY));
		const height: number = lineMeasured.actualBoundingBoxAscent + lineMeasured.actualBoundingBoxDescent;
		linePositionY += height + 1;
	}
}

// MIT Copyright (c) 2017 Antonio Román
const textWrap = (ctx: CanvasContext, text: string, wrapWidth: number): string => {
	const result = [];
	const buffer = [];

	const spaceWidth: number = ctx.measureText(' ').width;

	// Run the loop for each line
	for (const line of text.split(/\r?\n/)) {
		let spaceLeft = wrapWidth;

		// Run the loop for each word
		for (const word of line.split(' ')) {
			const wordWidth: number = ctx.measureText(word).width;
			const wordWidthWithSpace = wordWidth + spaceWidth;

			if (wordWidthWithSpace > spaceLeft) {
				if (buffer.length > 0) {
					result.push(buffer.join(' '));
					buffer.length = 0;
				}
				buffer.push(word);
				spaceLeft = wrapWidth - wordWidth;
			} else {
				spaceLeft -= wordWidthWithSpace;
				buffer.push(word);
			}
		}

		if (buffer.length > 0) {
			result.push(buffer.join(' '));
			buffer.length = 0;
		}
	}
	return result.join('\n');
};

export function printWrappedText(ctx: CanvasContext, text: string, x: number, y: number, wrapWidth: number) {
	const wrappedText = textWrap(ctx, text, wrapWidth);
	return printMultilineText(ctx, wrappedText, x, y);
}

export function getClippedRegion(image: Image | Canvas, x: number, y: number, width: number, height: number) {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	return canvas;
}

export async function canvasToBuffer(canvas: Canvas): Promise<Buffer> {
	return canvas.png;
}

export async function getClippedRegionImage(
	image: Image | Canvas,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	return loadImage(await canvasToBuffer(canvas));
}

export function measureTextWidth(ctx: CanvasContext, text: string) {
	const num = ctx.measureText(text).width as number;
	assert(typeof num === 'number');
	return num;
}

const localImageCache = new Map<string, Image>();

export async function loadAndCacheLocalImage(path: string) {
	const cached = localImageCache.get(path);
	if (cached) return cached;
	const buff = await readFile(path);
	const image = await loadImage(buff);
	return image;
}
