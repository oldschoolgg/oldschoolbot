import type { Spritesheet } from '@/hooks/useSpritesheet.js';

function createScaledPattern(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement | HTMLCanvasElement,
	scale: number,
	repeat: 'repeat' | 'repeat-x' | 'repeat-y'
): CanvasPattern {
	console.log(`	Creating scaled pattern with scale: ${scale} scale, ${image.width}x${image.height} image size`);
	const scaledCanvas = document.createElement('canvas');
	scaledCanvas.width = image.width * scale;
	scaledCanvas.height = image.height * scale;
	const scaledCtx = scaledCanvas.getContext('2d')!;
	scaledCtx.imageSmoothingEnabled = false;
	scaledCtx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
	return ctx.createPattern(scaledCanvas, repeat)!;
}

export function drawBorder(ctx: CanvasRenderingContext2D, bankSpritesheet: Spritesheet, scale: number = 1) {
	const corner = bankSpritesheet.get('bank_border_c');
	const top = bankSpritesheet.get('bank_border_h');
	const side = bankSpritesheet.get('bank_border_v');

	const scaledTopHeight = top.height * scale;
	const scaledSideWidth = side.width * scale;

	// Draw top border
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);

	// Draw bottom border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.translate(0, ctx.canvas.height);
	ctx.scale(1, -1);
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);
	ctx.restore();

	// Draw title line
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, top, scale, 'repeat-x');
	ctx.translate(scaledSideWidth, 27 * scale);
	ctx.fillRect(0, 0, ctx.canvas.width, scaledTopHeight);
	ctx.restore();

	// Draw left border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, side, scale, 'repeat-y');
	ctx.translate(0, scaledSideWidth);
	ctx.fillRect(0, 0, scaledSideWidth, ctx.canvas.height);
	ctx.restore();

	// Draw right border
	ctx.save();
	ctx.fillStyle = createScaledPattern(ctx, side, scale, 'repeat-y');
	ctx.translate(ctx.canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.fillRect(0, 0, scaledSideWidth, ctx.canvas.height);
	ctx.restore();

	// Draw corner borders
	const scaledCornerWidth = corner.width * scale;
	const scaledCornerHeight = corner.height * scale;

	// Top left
	ctx.save();
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Top right
	ctx.save();
	ctx.translate(ctx.canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Bottom right
	ctx.save();
	ctx.translate(ctx.canvas.width, ctx.canvas.height);
	ctx.scale(-1, -1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();

	// Bottom left
	ctx.save();
	ctx.translate(0, ctx.canvas.height);
	ctx.scale(1, -1);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(corner, 0, 0, corner.width, corner.height, 0, 0, scaledCornerWidth, scaledCornerHeight);
	ctx.restore();
}
