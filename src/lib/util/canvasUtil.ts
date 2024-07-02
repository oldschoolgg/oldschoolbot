import type { Image, SKRSContext2D } from '@napi-rs/canvas';
import { Canvas, loadImage } from '@napi-rs/canvas';
import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit';

import { assert } from '../util';

export function fillTextXTimesInCtx(ctx: SKRSContext2D, text: string, x: number, y: number) {
	ctx.fillText(text, x, y);
}

export function drawItemQuantityText(ctx: SKRSContext2D, quantity: number, x: number, y: number) {
	const quantityColor = generateHexColorForCashStack(quantity);
	const formattedQuantity = formatItemStackQuantity(quantity);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'start';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, formattedQuantity, x + 1, y + 1);

	ctx.fillStyle = quantityColor;
	fillTextXTimesInCtx(ctx, formattedQuantity, x, y);
}

export function drawTitleText(ctx: SKRSContext2D, title: string, x: number, y: number) {
	ctx.textAlign = 'center';
	ctx.font = '16px RuneScape Bold 12';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, title, x + 1, y + 1);

	ctx.fillStyle = '#ff981f';
	fillTextXTimesInCtx(ctx, title, x, y);
}

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return loadImage(imageBuffer);
}

export function drawImageWithOutline(
	ctx: SKRSContext2D,
	image: Canvas | Image,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
	outlineColor: string,
	outlineWidth = 1,
	alpha = 0.5
): void {
	const dArr = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1];
	const purplecanvas = new Canvas(image.width + (outlineWidth + 2), image.height + (outlineWidth + 2));
	const pctx = purplecanvas.getContext('2d');
	for (let i = 0; i < dArr.length; i += 2) pctx.drawImage(image, dArr[i] * outlineWidth, dArr[i + 1] * outlineWidth);
	pctx.globalAlpha = alpha;
	pctx.globalCompositeOperation = 'source-in';
	pctx.fillStyle = outlineColor;
	pctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	pctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(pctx.canvas, dx, dy, dw + (outlineWidth + 2), dh + (outlineWidth + 2));
	ctx.drawImage(image, dx, dy, dw, dh);
}

function printMultilineText(ctx: SKRSContext2D, text: string, x: number, y: number) {
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
const textWrap = (ctx: SKRSContext2D, text: string, wrapWidth: number): string => {
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

export function printWrappedText(ctx: SKRSContext2D, text: string, x: number, y: number, wrapWidth: number) {
	const wrappedText = textWrap(ctx, text, wrapWidth);
	return printMultilineText(ctx, wrappedText, x, y);
}

export function getClippedRegion(image: Image | Canvas, x: number, y: number, width: number, height: number) {
	const canvas = new Canvas(width, height);
	const ctx = canvas.getContext('2d');
	if (image instanceof Canvas) {
		ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	} else {
		ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	}
	return canvas;
}
export async function getClippedRegionImage(
	image: Image | Canvas,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const canvas = new Canvas(width, height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	return loadImage(await canvas.encode('png'));
}

export function measureTextWidth(ctx: SKRSContext2D, text: string) {
	const num = ctx.measureText(text).width as number;
	assert(typeof num === 'number');
	return num;
}

const localImageCache = new Map<string, Image>();

export async function loadAndCacheLocalImage(path: string) {
	const cached = localImageCache.get(path);
	if (cached) return cached;
	const image = await loadImage(path);
	return image;
}
