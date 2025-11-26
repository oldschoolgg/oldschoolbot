import type { CanvasSpritesheet, SpriteData } from "@/components/Canvas/CanvasSpritesheet.ts";
import { drawImageWithOutline, getClippedRegion, type IBgSprite } from "@/components/Canvas/canvasUtil.ts";
import { formatItemStackQuantity, generateHexColorForCashStack } from "@/osrs/utils.ts";

const Fonts = {
	Compact: '16px OSRSFontCompact',
	Bold: '16px RuneScape Bold 12',
	TinyPixel: '10px Smallest Pixel-7'
} as const;

type FontName = keyof typeof Fonts;

export class OSRSCanvas {
	public static Fonts = Fonts;
	public static COLORS = {
		ORANGE: '#FF981F',
		WHITE: '#FFFFFF',
		RED: '#FF0000',
		DARK_RED: '#8F0000',
		GREEN: '#00FF00',
		DARK_GREEN: '#005F00',
		YELLOW: '#FFFF00',
		PURPLE: '#AC7FFF',
		MAGENTA: '#ff00f2',
		LIGHT_CHOCOLATE: '#494034'
	};

	public sprite: IBgSprite | null = null;
	public ctx: CanvasRenderingContext2D;
	public itemSize = {
		width: 36,
		height: 32
	};
	public distanceFromTop = 32;
	public distanceFromSide = 16;

	private canvas: HTMLCanvasElement;

	constructor({
		width,
		height,
		sprite,
	}: { width: number; height: number; sprite?: IBgSprite | undefined | null;  }) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext('2d')!;
		this.ctx.imageSmoothingEnabled = false;
		this.sprite = sprite ?? null;
	}

	measureText(text: string, font: FontName = 'Compact') {
		this.ctx.font = OSRSCanvas.Fonts[font];
		return this.ctx.measureText(text);
	}

	measureTextWidth(text: string, font: FontName = 'Compact'): number {
		this.ctx.font = OSRSCanvas.Fonts[font];
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

	private rawDrawText({ text, x, y }: { text: string; x: number; y: number }) {
		// In browser, we use fillText/strokeText instead of outlineText
		this.ctx.fillText(text, x, y);
	}

	drawText({
		text,
		x,
		y,
		color = '#000000',
		font = 'Compact',
		center,
		maxWidth,
		lineHeight = 16
	}: {
		text: string;
		x: number;
		y: number;
		color?: string;
		font?: FontName;
		center?: boolean;
		maxWidth?: number;
		lineHeight?: number;
	}) {
		this.ctx.font = OSRSCanvas.Fonts[font];

		const textLines = [];
		if (maxWidth) {
			const measuredText = this.ctx.measureText(text);
			if (measuredText.width > maxWidth) {
				const explodedText = text.split(' ');
				let newTextLine = '';
				for (const word of explodedText) {
					const testLine = newTextLine ? `${newTextLine} ${word}` : word;
					if (this.ctx.measureText(testLine).width >= maxWidth && newTextLine) {
						textLines.push(newTextLine);
						newTextLine = word;
					} else {
						newTextLine = testLine;
					}
				}
				textLines.push(newTextLine);
			} else {
				textLines.push(text);
			}
		} else {
			textLines.push(text);
		}

		// Draw each line
		for (const [index, textLine] of textLines.entries()) {
			let lineX = x;
			const lineY = y + lineHeight * index;

			// Center each line if center is true
			if (center) {
				const textWidth = this.measureTextWidth(textLine.trim(), font);
				lineX -= Math.floor(textWidth / 2);
			}

			// Draw shadow/outline
			this.ctx.fillStyle = 'black';
			this.rawDrawText({ text: textLine.trim(), x: lineX + 1, y: lineY + 1 });

			// Draw main text
			this.ctx.fillStyle = color;
			this.rawDrawText({ text: textLine.trim(), x: lineX, y: lineY });
		}
	}

	drawTitleText({ text, x, y, center }: { text: string; x: number; y: number; center?: boolean }) {
		return this.drawText({
			text,
			x,
			y,
			font: 'Bold',
			color: OSRSCanvas.COLORS.ORANGE,
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
		if (!this.sprite) throw new Error('No sprite provided for drawing border');
		OSRSCanvas.drawBorder(this.ctx, _sprite ?? this.sprite, titleLine);
	}

	static drawBorder(ctx: CanvasRenderingContext2D, sprite: IBgSprite, titleLine = true) {
		if (!sprite) throw new Error('No sprite provided for drawing border');
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

	// Spritesheet registry for browser usage
	private static spritesheets: {
		osrsItems?: CanvasSpritesheet;
		bsoItems?: CanvasSpritesheet;
	} = {};

	public static registerSpritesheets(spritesheets: {
		osrsItems?: CanvasSpritesheet;
		bsoItems?: CanvasSpritesheet;
	}): void {
		OSRSCanvas.spritesheets = { ...OSRSCanvas.spritesheets, ...spritesheets };
	}

	private static getItemSpriteData(itemID: number): CanvasSpritesheet | null {
		if (OSRSCanvas.spritesheets.bsoItems?.has(itemID)) {
			return OSRSCanvas.spritesheets.bsoItems;
		}

		if (OSRSCanvas.spritesheets.osrsItems?.has(itemID)) {
			return OSRSCanvas.spritesheets.osrsItems;
		}

		return null;
	}

	public static async getItemImage({
		itemID,
	}: {
		itemID: number;
	}): Promise<HTMLCanvasElement | HTMLImageElement> {
		// Spritesheet icons
		const itemSpriteData = OSRSCanvas.getItemSpriteData(itemID);
		if (itemSpriteData) {
			const { x, y, width, height } = itemSpriteData.getData(itemID) as SpriteData;
			return getClippedRegion(itemSpriteData.getImage(), x, y, width, height);
		}

		throw new Error(`Item sprite not found for item ID: ${itemID}`);
	}

	async drawItemIDSprite({
		itemID,
		x,
		y,
		outline,
		quantity,
		textColor,
		glow
	}: {
		itemID: number;
		x: number;
		y: number;
		outline?: { outlineColor: string; alpha: number };
		quantity?: number;
		textColor?: string;
		glow?: {
			color: string;
			radius: number;
			blur: number;
		};
	}) {
		const itemIcon = await OSRSCanvas.getItemImage({ itemID });
		const destX = Math.floor(x + (this.itemSize.width - itemIcon.width) / 2);
		const destY = Math.floor(y + (this.itemSize.height - itemIcon.height) / 2);

		const args = [
			itemIcon,
			0,
			0,
			itemIcon.width,
			itemIcon.height,
			destX,
			destY,
			itemIcon.width,
			itemIcon.height
		] as const;

		if (glow) {
			this.drawGlowingBlur(
				destX + itemIcon.width / 2,
				destY + itemIcon.height / 2,
				glow.radius,
				glow.color,
				glow.blur
			);
		}

		if (outline) {
			drawImageWithOutline(this.ctx, ...args);
		} else {
			this.ctx.drawImage(...args);
		}

		if (quantity) {
			this.drawText({
				text: formatItemStackQuantity(quantity),
				x: x + this.distanceFromSide - 18,
				y: y + this.distanceFromTop - 24,
				color: textColor ?? generateHexColorForCashStack(quantity)
			});
		}
	}

	public drawGlowingBlur(x: number, y: number, radius: number, color: string, blur: number, intensity = 1) {
		this.ctx.save();
		const filters = [
			`blur(${blur * 0.3}px)`,
			`drop-shadow(0 0 ${blur}px ${color})`,
			`drop-shadow(0 0 ${blur * 2}px ${color})`,
			`brightness(${1 + intensity * 0.5})`,
			`saturate(${1 + intensity * 0.3})`
		];

		this.ctx.filter = filters.join(' ');
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.ctx.fill();

		this.ctx.restore();
	}

	async toScaledOutput(scale: number): Promise<Blob> {
		const scaledCanvas = new OSRSCanvas({ width: this.width * scale, height: this.height * scale });
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

	public async toBuffer(): Promise<Blob> {
		// Convert canvas to Blob (browser equivalent of Buffer)
		return new Promise((resolve, reject) => {
			this.canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error('Failed to convert canvas to blob'));
				}
			}, 'image/png');
		});
	}
}
