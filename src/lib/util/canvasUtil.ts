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

export function drawItemQuantityText(ctx: CanvasRenderingContext2D, quantity: number, x: number, y: number) {
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

export function drawImageWithOutline(
	ctx: CanvasRenderingContext2D,
	image: Canvas | Image,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
	outlineColor: string,
	outlineWidth: number = 1,
	alpha: number = 0.5
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
