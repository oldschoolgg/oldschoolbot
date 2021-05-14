import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';

import { formatItemStackQuantity, generateHexColorForCashStack } from '../util';

export function fillTextXTimesInCtx(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	numberOfTimes = 3
) {
	for (let i = 0; i < numberOfTimes; i++) {
		ctx.fillText(text, x, y);
	}
}

export function drawItemQuantityText(
	ctx: CanvasRenderingContext2D,
	quantity: number,
	x: number,
	y: number
) {
	const quantityColor = generateHexColorForCashStack(quantity);
	const formattedQuantity = formatItemStackQuantity(quantity);
	ctx.font = '16px OSRSFontCompact';
	ctx.textAlign = 'start';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, formattedQuantity, x + 1, y + 1);

	ctx.fillStyle = quantityColor;
	fillTextXTimesInCtx(ctx, formattedQuantity, x, y);
}

export function drawTitleText(ctx: CanvasRenderingContext2D, title: string, x: number, y: number) {
	ctx.textAlign = 'center';
	ctx.font = '16px RuneScape Bold 12';

	ctx.fillStyle = '#000000';
	fillTextXTimesInCtx(ctx, title, x + 1, y + 1);

	ctx.fillStyle = '#ff981f';
	fillTextXTimesInCtx(ctx, title, x, y);
}

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return new Promise((resolve, reject) => {
		const canvasImage = new Image();

		canvasImage.onload = () => resolve(canvasImage);
		canvasImage.onerror = () => reject(new Error('Failed to load image.'));
		canvasImage.src = imageBuffer;
	});
}

export function canvasToBufferAsync(canvas: Canvas, ...args: any[]) {
	return new Promise<Buffer>((resolve, reject) =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		canvas.toBuffer((error: Error | null, buffer: Buffer | null): void => {
			if (error) reject(error);
			else resolve(buffer!);
		}, ...args)
	);
}
