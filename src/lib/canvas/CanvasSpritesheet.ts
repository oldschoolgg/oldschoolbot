import { readFileSync } from 'node:fs';
import { type Canvas, type Image, loadImage } from 'skia-canvas';
import { createCanvas } from './canvasUtil';

export interface SpriteData {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DrawSpriteOptions {
	dx?: number;
	dy?: number;
	dw?: number;
	dh?: number;
	flipX?: boolean;
	flipY?: boolean;
	rotation?: number;
	alpha?: number;
}

export type CanvasContext = CanvasRenderingContext2D;

export class CanvasSpritesheet {
	private readonly spriteData: Map<string, [number, number, number, number]>;
	private readonly image: Image;

	private constructor(spriteData: Map<string, [number, number, number, number]>, image: Image) {
		this.spriteData = spriteData;
		this.image = image;
	}

	static async create(jsonPath: string, imagePath: string): Promise<CanvasSpritesheet> {
		const jsonContent = readFileSync(jsonPath, 'utf-8');
		const jsonData = JSON.parse(jsonContent);
		const spriteData = new Map(Object.entries(jsonData)) as typeof CanvasSpritesheet.prototype.spriteData;

		const buffer = readFileSync(imagePath);
		const image = await loadImage(buffer);

		return new CanvasSpritesheet(spriteData, image);
	}

	has(spriteId: string | number): boolean {
		return this.spriteData.has(String(spriteId));
	}

	getData(spriteId: string | number): SpriteData | null {
		const key = String(spriteId);
		const spriteInfo = this.spriteData.get(key);
		if (!spriteInfo) {
			return null;
		}

		const [x, y, width, height] = spriteInfo;
		return { x, y, width, height };
	}

	getImage(): Image {
		return this.image;
	}

	drawSprite(
		ctx: CanvasContext,
		spriteId: string | number,
		dx: number,
		dy: number,
		options: DrawSpriteOptions = {}
	): void {
		const spriteData = this.getData(spriteId);
		if (!spriteData) {
			throw new Error(`Sprite with ID ${spriteId} not found in spritesheet.`);
		}
		const {
			dw = spriteData.width,
			dh = spriteData.height,
			flipX = false,
			flipY = false,
			rotation = 0,
			alpha = 1
		} = options;

		const needsTransform = flipX || flipY || rotation !== 0 || alpha !== 1;

		if (needsTransform) {
			ctx.save();

			if (alpha !== 1) {
				ctx.globalAlpha = alpha;
			}

			if (flipX || flipY || rotation !== 0) {
				ctx.translate(dx + dw / 2, dy + dh / 2);

				if (rotation !== 0) {
					ctx.rotate(rotation);
				}

				ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
				ctx.translate(-dw / 2, -dh / 2);

				ctx.drawImage(
					this.image,
					spriteData.x,
					spriteData.y,
					spriteData.width,
					spriteData.height,
					0,
					0,
					dw,
					dh
				);
			} else {
				ctx.drawImage(
					this.image,
					spriteData.x,
					spriteData.y,
					spriteData.width,
					spriteData.height,
					dx,
					dy,
					dw,
					dh
				);
			}

			ctx.restore();
		} else {
			ctx.drawImage(this.image, spriteData.x, spriteData.y, spriteData.width, spriteData.height, dx, dy, dw, dh);
		}
	}

	drawSpriteRaw(
		ctx: CanvasContext,
		spriteId: string | number,
		sx?: number,
		sy?: number,
		sw?: number,
		sh?: number,
		dx?: number,
		dy?: number,
		dw?: number,
		dh?: number
	): void {
		const spriteData = this.getData(spriteId);
		if (!spriteData) {
			throw new Error(`Sprite with ID ${spriteId} not found in spritesheet.`);
		}
		const sourceX = sx ?? spriteData.x;
		const sourceY = sy ?? spriteData.y;
		const sourceW = sw ?? spriteData.width;
		const sourceH = sh ?? spriteData.height;
		const destX = dx ?? 0;
		const destY = dy ?? 0;
		const destW = dw ?? sourceW;
		const destH = dh ?? sourceH;

		ctx.drawImage(this.image, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
	}

	getAllSpriteIds(): string[] {
		return Array.from(this.spriteData.keys());
	}

	getSprite(spriteId: string | number): Canvas {
		const spriteData = this.getData(spriteId);
		if (!spriteData) {
			throw new Error(`Sprite with ID ${spriteId} not found in spritesheet.`);
		}
		const { x, y, width, height } = spriteData;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);
		return canvas;
	}
}
