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

export class CanvasSpritesheet {
	private readonly spriteData: Map<string, [number, number, number, number]>;
	private readonly image: HTMLImageElement;
	public readonly allItemIds: number[];

	private constructor(spriteData: Map<string, [number, number, number, number]>, image: HTMLImageElement) {
		this.spriteData = spriteData;
		this.image = image;
		this.allItemIds = Array.from(this.spriteData.keys()).map(id => Number(id));
	}

	static async create(jsonUrl: string, imageUrl: string): Promise<CanvasSpritesheet> {
		// Fetch JSON data from URL
		const jsonResponse = await fetch(jsonUrl);
		if (!jsonResponse.ok) {
			throw new Error(`Failed to load sprite data from ${jsonUrl}: ${jsonResponse.statusText}`);
		}
		const jsonData = await jsonResponse.json();
		const spriteData = new Map(Object.entries(jsonData)) as typeof CanvasSpritesheet.prototype.spriteData;

		// Load image from URL
		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(`Failed to load image from ${imageUrl}`));
			img.src = imageUrl;
		});

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

	getImage(): HTMLImageElement {
		return this.image;
	}

	drawSprite(
		ctx: CanvasRenderingContext2D,
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
		ctx: CanvasRenderingContext2D,
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

	getSprite(spriteId: string | number): HTMLCanvasElement {
		const spriteData = this.getData(spriteId);
		if (!spriteData) {
			throw new Error(`Sprite with ID ${spriteId} not found in spritesheet.`);
		}
		const { x, y, width, height } = spriteData;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);
		return canvas;
	}
}
