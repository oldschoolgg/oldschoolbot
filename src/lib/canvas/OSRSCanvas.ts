import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit/runescape';
import fetch from 'node-fetch';
import {
	type Canvas,
	type CanvasRenderingContext2D as CanvasContext,
	FontLibrary,
	type Image,
	Canvas as SkiaCanvas,
	loadImage
} from 'skia-canvas';

import { CanvasModule } from './CanvasModule';
import type { CanvasSpritesheet, SpriteData } from './CanvasSpritesheet';
import { type CanvasImage, type IBgSprite, drawImageWithOutline, getClippedRegion } from './canvasUtil';
import { type IconPackID, ItemIconPacks } from './iconPacks';

const Fonts = {
	Compact: '16px OSRSFontCompact',
	Bold: '16px RuneScape Bold 12',
	TinyPixel: '10px Smallest Pixel-7'
} as const;

type FontName = keyof typeof Fonts;

const fonts = {
	OSRSFont: './src/lib/resources/osrs-font.ttf',
	OSRSFontCompact: './src/lib/resources/osrs-font-compact.otf',
	'RuneScape Bold 12': './src/lib/resources/osrs-font-bold.ttf',
	'Smallest Pixel-7': './src/lib/resources/small-pixel.ttf',
	'RuneScape Quill 8': './src/lib/resources/osrs-font-quill-8.ttf'
} as const;

for (const [fontFamily, fontPath] of Object.entries(fonts)) {
	FontLibrary.use(fontFamily, fontPath);
}

export class OSRSCanvas {
	public static LOCAL_ICON_CACHE = new Map<number, CanvasImage>();
	public static ITEM_ICON_CACHE_DIR = path.resolve('icon_cache');
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
	public ctx: CanvasContext;
	public itemSize = {
		width: 36,
		height: 32
	};
	public distanceFromTop = 32;
	public distanceFromSide = 16;
	public iconPackId: IconPackID | null = null;

	private canvas: SkiaCanvas;

	constructor({
		width,
		height,
		sprite,
		iconPackId
	}: { width: number; height: number; sprite?: IBgSprite | undefined | null; iconPackId?: IconPackID | null }) {
		this.canvas = new SkiaCanvas(width, height);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;
		this.sprite = sprite ?? null;
		this.iconPackId = iconPackId ?? null;
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

	static drawBorder(ctx: CanvasContext, sprite: IBgSprite, titleLine = true) {
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

	private static getItemSpriteData(itemID: number): CanvasSpritesheet | null {
		if (__BOT_TYPE__ === 'BSO' && CanvasModule.Spritesheet.BSOItems.has(itemID)) {
			return CanvasModule.Spritesheet.BSOItems;
		}

		if (CanvasModule.Spritesheet.OSRSItems.has(itemID)) {
			return CanvasModule.Spritesheet.OSRSItems;
		}

		return null;
	}

	public static async getItemImage({
		itemID,
		iconPackId
	}: { itemID: number; iconPackId?: IconPackID }): Promise<Canvas | CanvasImage> {
		// Custom item icon pack icons
		if (iconPackId && ItemIconPacks[iconPackId].icons.has(itemID)) {
			return ItemIconPacks[iconPackId].icons.get(itemID) as Image;
		}

		// Spritesheet icons
		const itemSpriteData = OSRSCanvas.getItemSpriteData(itemID);
		if (itemSpriteData) {
			const { x, y, width, height } = itemSpriteData.getData(itemID) as SpriteData;
			return getClippedRegion(itemSpriteData.getImage(), x, y, width, height);
		}

		return OSRSCanvas.loadLocalIcon(itemID);
	}

	// If the image isnt in the spritesheet, use a local image instead
	private static async loadLocalIcon(itemID: number): Promise<Image> {
		const cached = OSRSCanvas.LOCAL_ICON_CACHE.get(itemID);
		if (cached) return cached;
		const onDisk = await readFile(path.join(OSRSCanvas.ITEM_ICON_CACHE_DIR, `${itemID}.png`)).catch(() => null);
		if (onDisk) {
			const image = await loadImage(onDisk);
			OSRSCanvas.LOCAL_ICON_CACHE.set(itemID, image);
			return image;
		}
		const imageBuffer = await fetch(`https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemID}.png`).then(
			result => result.buffer()
		);

		await writeFile(path.join(OSRSCanvas.ITEM_ICON_CACHE_DIR, `${itemID}.png`), imageBuffer);
		const image = await loadImage(imageBuffer);
		OSRSCanvas.LOCAL_ICON_CACHE.set(itemID, image);
		return image;
	}

	async drawItemIDSprite({
		itemID,
		x,
		y,
		outline,
		iconPackId = this.iconPackId ?? undefined,
		quantity,
		textColor,
		glow
	}: {
		itemID: number;
		x: number;
		y: number;
		outline?: { outlineColor: string; alpha: number };
		iconPackId?: IconPackID;
		quantity?: number;
		textColor?: string;
		glow?: {
			color: string;
			radius: number;
			blur: number;
		};
	}) {
		const itemIcon: Image | Canvas = await OSRSCanvas.getItemImage({ itemID, iconPackId });
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
				destX + this.itemSize.width / 2,
				destY + this.itemSize.height / 2,
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

	async toScaledOutput(scale: number) {
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

	public async toBuffer() {
		return this.canvas.png;
	}
}
