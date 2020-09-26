import { formatItemStackQuantity, generateHexColorForCashStack } from '../util';
import { fillTextXTimesInCtx } from './fillTextXTimesInCtx';

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
