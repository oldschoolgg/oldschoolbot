import { type CanvasRenderingContext2D as CanvasContext, Canvas as SkiaCanvas } from 'skia-canvas';

import type { IBgSprite } from './bankImage';

const Fonts = {
	Compact: '16px OSRSFontCompact',
	Bold: '16px RuneScape Bold 12',
	TinyPixel: '10px Smallest Pixel-7'
} as const;
type FontName = keyof typeof Fonts;

export class OSRSCanvas {
	public Fonts = Fonts;

	public sprite: IBgSprite | null = null;
	private canvas: SkiaCanvas;
	public ctx: CanvasContext;

	constructor(width: number, height: number, sprite?: IBgSprite) {
		this.canvas = new SkiaCanvas(width, height);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;
		this.sprite = sprite ?? null;
	}

	measureText(text: string, font: FontName = 'Compact') {
		this.ctx.font = this.Fonts[font];
		return this.ctx.measureText(text);
	}

	measureTextWidth(text: string, font: FontName = 'Compact'): number {
		this.ctx.font = this.Fonts[font];
		const metrics = this.ctx.measureText(text);
		return metrics.width;
	}

	setHeight(height: number) {
		this.canvas.height = height;
		return this;
	}

	setWidth(width: number) {
		this.canvas.width = width;
		return this;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	getCanvas() {
		return this.canvas;
	}

	private rawDrawText({
		text,
		x,
		y
	}: {
		text: string;
		x: number;
		y: number;
	}) {
		const textPath = this.ctx.outlineText(text);
		this.ctx.fill(textPath.offset(x, y));
	}

	drawText({
		text,
		x,
		y,
		color = '#000000',
		font = 'Compact',
		center
	}: {
		text: string;
		x: number;
		y: number;
		color?: string;
		font?: FontName;
		center?: boolean;
	}) {
		this.ctx.font = this.Fonts[font];

		if (center) {
			const textWidth = this.measureTextWidth(text, font);
			x -= Math.floor(textWidth / 2);
		}

		this.ctx.fillStyle = 'black';
		this.rawDrawText({ text, x: x + 1, y: y + 1 });

		this.ctx.fillStyle = color;
		this.rawDrawText({ text, x, y });
	}

	drawTitleText({ text, x, y, center }: { text: string; x: number; y: number; center?: boolean }) {
		return this.drawText({
			text,
			x,
			y,
			font: 'Bold',
			color: '#ff981f',
			center
		});
	}

	drawSquare(x: number, y: number, w: number, h: number, color?: string) {
		const ctx = this.ctx;
		const pixelSize = 1;
		ctx.save();
		if (color) ctx.fillStyle = color;
		ctx.translate(0.5, 0.5);
		ctx.fillRect(x, y, w - pixelSize, h - pixelSize);
		ctx.translate(-0.5, -0.5);
		ctx.restore();
	}

	drawHollowSquare(x: number, y: number, w: number, h: number, color?: string) {
		const ctx = this.ctx;
		const pixelSize = 1;
		ctx.save();
		if (color) ctx.strokeStyle = color;
		ctx.translate(0.5, 0.5);
		ctx.lineWidth = pixelSize;
		ctx.moveTo(x, y); // top left
		ctx.lineTo(w + x - pixelSize, y); // top right
		ctx.lineTo(w + x - pixelSize, y + h - pixelSize); // bottom right
		ctx.lineTo(x, y + h - pixelSize); // bottom left
		ctx.lineTo(x, y); // top left
		ctx.translate(-0.5, -0.5);
		ctx.stroke();
		ctx.restore();
	}

	drawBackgroundPattern(_sprite?: IBgSprite) {
		const sprite = _sprite ?? this.sprite;
		if (!sprite) throw new Error('No sprite provided for drawing border');
		this.ctx.save();
		this.ctx.fillStyle = this.ctx.createPattern(sprite.repeatableBg, 'repeat')!;
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.restore();
	}

	drawBorder(_sprite?: IBgSprite, titleLine = true) {
		const sprite = _sprite ?? this.sprite;
		if (!sprite) throw new Error('No sprite provided for drawing border');
		const ctx = this.ctx;
		// Top border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.translate(0, 0);
		ctx.scale(1, 1);
		ctx.fillRect(0, 0, ctx.canvas.width, sprite.border.height);
		ctx.restore();
		// Bottom border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.width, sprite.border.height);
		ctx.restore();
		// Right border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.rotate((Math.PI / 180) * 90);
		ctx.translate(0, -ctx.canvas.width);
		ctx.fillRect(0, 0, ctx.canvas.height, sprite.border.height);
		ctx.restore();
		// Left border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(sprite.border, 'repeat-x')!;
		ctx.rotate((Math.PI / 180) * 90);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.height, sprite.border.height);
		ctx.restore();
		// Corners
		// Top left
		ctx.save();
		ctx.scale(1, 1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Top right
		ctx.save();
		ctx.translate(ctx.canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Bottom right
		ctx.save();
		ctx.translate(ctx.canvas.width, ctx.canvas.height);
		ctx.scale(-1, -1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Bottom left
		ctx.save();
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.drawImage(sprite.borderCorner, 0, 0);
		ctx.restore();
		// Title border
		if (titleLine) {
			ctx.save();
			ctx.fillStyle = ctx.createPattern(sprite.borderTitle, 'repeat-x')!;
			ctx.translate(sprite.border.height - 1, 27);
			ctx.fillRect(0, 0, ctx.canvas.width - sprite.border.height * 2 + 2, sprite.borderTitle.height);
			ctx.restore();
		}
	}

	async toScaledOutput(scale: number) {
		const scaledCanvas = new OSRSCanvas(this.width * scale, this.height * scale);
		scaledCanvas.ctx.drawImage(
			this.canvas,
			0,
			0,
			this.width,
			this.height,
			0,
			0,
			scaledCanvas.width,
			scaledCanvas.height
		);
		return scaledCanvas.toBuffer();
	}

	public async toBuffer() {
		return this.canvas.png;
	}
}
