export type BGSpriteName = 'dark' | 'default' | 'transparent';

export interface IBgSprite {
	name: BGSpriteName;
	border: HTMLCanvasElement;
	borderCorner: HTMLCanvasElement;
	borderTitle: HTMLCanvasElement;
	repeatableBg: HTMLCanvasElement;
	tabBorderInactive: HTMLCanvasElement;
	tabBorderActive: HTMLCanvasElement;
	oddListColor: string;
}

export function getClippedRegion(
	image: HTMLImageElement | HTMLCanvasElement,
	x: number,
	y: number,
	width: number,
	height: number
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
	return canvas;
}

export function drawImageWithOutline(
	ctx: CanvasRenderingContext2D,
	image: HTMLCanvasElement | HTMLImageElement,
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
	const outlineCanvas = document.createElement('canvas');
	outlineCanvas.width = sw + padding * 2;
	outlineCanvas.height = sh + padding * 2;
	const octx = outlineCanvas.getContext('2d')!;

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
		dx - outlineWidth,
		dy - outlineWidth,
		dw + outlineWidth * 2,
		dh + outlineWidth * 2
	);

	// Draw original image on top
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}
