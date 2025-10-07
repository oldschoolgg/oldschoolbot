import { getPaintedItemImage } from '@/lib/bso/paintColors.js';

import type { Item } from 'oldschooljs';

import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import { paintColors } from '@/lib/customItems/paintCans.js';

export async function renderPaintGrid({ item }: { item: Item }): Promise<Buffer> {
	const canvases = await Promise.all(paintColors.map(color => getPaintedItemImage(color, item.id)));
	const tiles = paintColors
		.map((color, i) => ({ name: color.paintCanItem.name, img: canvases[i], paint: color }))
		.filter(t => t.img);

	const iconWidth = Math.max(...tiles.map(t => t.img.width));
	const iconHeight = Math.max(...tiles.map(t => t.img.height));

	const cols = 4;
	const rows = Math.ceil(tiles.length / cols);
	const verticalPadding = 32;

	const tileWidth = 488 / cols;
	const tileHeight = iconHeight;

	const canvasWidth = 488;
	const canvasHeight = rows * tileHeight + verticalPadding * rows + 21 + 8 + 16;
	const { sprite } = bankImageTask.getBgAndSprite({
		bankBackgroundId: 1
	});
	const canvas = new OSRSCanvas({ width: canvasWidth, height: canvasHeight, sprite });
	const ctx = canvas.ctx;
	ctx.fillStyle = ctx.createPattern(sprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	canvas.drawBorder(sprite, true);

	canvas.drawTitleText({
		text: `Paint Preview for ${item.name}`,
		x: Math.floor(canvas.width / 2),
		y: 21,
		center: true
	});

	for (let i = 0; i < tiles.length; i++) {
		const t = tiles[i];
		const col = i % cols;
		const row = Math.floor(i / cols);

		const tileX = col * tileWidth;
		const tileY = row * tileHeight + 21 + 8 + verticalPadding * row;

		const iconX = tileX + (tileWidth - iconWidth) / 2;
		const iconY = tileY + 6;
		ctx.drawImage(t.img, iconX, iconY, iconWidth, iconHeight);

		// Draw paint name
		const textCX = Math.floor(tileX + tileWidth / 2);
		const textCY = Math.floor(iconY + iconHeight);
		const name = t.name.replace(' paint can', '');
		const metrics = ctx.measureText(name);
		const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		canvas.drawText({
			text: name,
			x: textCX,
			y: textCY + height,
			color: OSRSCanvas.COLORS.YELLOW,
			center: true,
			font: 'Bold'
		});

		// Draw paint can
		const image = await OSRSCanvas.getItemImage({ itemID: t.paint.itemId });
		const bucketWidth = image.width / 2;
		const bucketHeight = image.height / 2;
		ctx.drawImage(
			image,
			iconX + t.img.width - bucketWidth,
			iconY + t.img.height - bucketHeight,
			bucketWidth,
			bucketHeight
		);
	}

	return canvas.toScaledOutput(2);
}
