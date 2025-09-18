import { readFile } from 'node:fs/promises';
import {
	CanvasRenderingContext2D as CanvasContext,
	FontLibrary,
	Image,
	Canvas as RawCanvas,
	loadImage
} from 'skia-canvas';

import type { DetailedFarmingContract } from '../minions/farming/types.js';
import { assert } from '../util/logError.js';
import type { IconPackID } from './iconPacks.js';

export function registerFont(fontFamily: string, fontPath: string) {
	FontLibrary.use(fontFamily, fontPath);
}
export function createCanvas(width: number, height: number) {
	return new RawCanvas(width, height);
}

export type Canvas = ReturnType<typeof createCanvas>;

export const CanvasImage = Image;
export type CanvasImage = Image;

export { CanvasContext };

export function fillTextXTimesInCtx(ctx: CanvasContext, text: string, x: number, y: number) {
	const textPath = ctx.outlineText(text);
	ctx.fill(textPath.offset(x, y));
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
	const alpha = 1;
	const outlineColor = '#ac7fff';
	const outlineWidth = 1;
	const dArr = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1];

	// Create canvas larger by outline width on all sides
	const padding = outlineWidth;
	const outlineCanvas = createCanvas(sw + padding * 2, sh + padding * 2);
	const octx = outlineCanvas.getContext('2d');

	// Draw the image 8 times in different directions to create outline
	for (let i = 0; i < dArr.length; i += 2) {
		octx.drawImage(
			image,
			// Source coordinates from original image
			sx,
			sy,
			sw,
			sh,
			// Offset by padding + outline direction
			padding + dArr[i] * outlineWidth,
			padding + dArr[i + 1] * outlineWidth,
			sw,
			sh
		);
	}

	// Apply outline color
	octx.globalAlpha = alpha;
	octx.globalCompositeOperation = 'source-in';
	octx.fillStyle = outlineColor;
	octx.fillRect(0, 0, outlineCanvas.width, outlineCanvas.height);

	// Draw outline to main canvas (offset by outline width)
	ctx.drawImage(
		outlineCanvas,
		0,
		0,
		outlineCanvas.width,
		outlineCanvas.height,
		dx - padding,
		dy - padding,
		dw + padding * 2,
		dh + padding * 2
	);

	// Draw original image on top
	ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

export function calcAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
	const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
	return { width: srcWidth * ratio, height: srcHeight * ratio };
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

export type BaseCanvasArgs = {
	iconPackId?: IconPackID | null;
	bankBackgroundId?: number | null;
	bankBgHexColor?: string | null;
	farmingContract?: DetailedFarmingContract | null;
};

export type BGSpriteName = 'dark' | 'default' | 'transparent';

export interface IBgSprite {
	name: BGSpriteName;
	border: Canvas;
	borderCorner: Canvas;
	borderTitle: Canvas;
	repeatableBg: Canvas;
	tabBorderInactive: Canvas;
	tabBorderActive: Canvas;
	oddListColor: string;
}
