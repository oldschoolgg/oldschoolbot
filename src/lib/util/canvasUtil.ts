import { Canvas, CanvasRenderingContext2D, Image, loadImage } from 'skia-canvas/lib';

import { formatItemStackQuantity, generateHexColorForCashStack } from '../util';

export function fillTextXTimesInCtx(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
	let textPath = ctx.outlineText(text);
	ctx.fill(textPath.offset(x, y));
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
	return loadImage(imageBuffer);
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
