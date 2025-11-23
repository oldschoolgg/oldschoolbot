import { type Canvas, type Image, loadImage } from 'skia-canvas';

import { canvasToBuffer, createCanvas, drawGrid } from '@/lib/canvas/canvasUtil.js';
import type { MegaDuckLocation } from '../megaDuck.js';

interface GenerateOptions {
	showGrid?: boolean;
	showPreviousSteps?: boolean;
}

export class MegaDuckImageGenerator {
	private mapImage!: Image;
	private noMoveImage!: Image;
	private initialized = false;
	private noMoveCanvasImageData!: Uint8ClampedArray<ArrayBufferLike>;
	private noMoveCanvas!: Canvas;
	private CANVAS_WIDTH = 900;
	private CANVAS_HEIGHT = 500;

	async init(): Promise<void> {
		if (this.initialized) return;

		[this.mapImage, this.noMoveImage] = await Promise.all([
			loadImage('./src/lib/resources/images/megaduckmap.png'),
			loadImage('./src/lib/resources/images/megaducknomovemap.png')
		]);

		this.noMoveCanvas = createCanvas(this.noMoveImage.width, this.noMoveImage.height);
		const noMoveCanvasCtx = this.noMoveCanvas.getContext('2d');
		noMoveCanvasCtx.drawImage(this.noMoveImage, 0, 0);
		this.noMoveCanvasImageData = noMoveCanvasCtx.getImageData(
			0,
			0,
			this.noMoveCanvas.width,
			this.noMoveCanvas.height
		).data;

		this.initialized = true;
	}

	private getPixel(x: number, y: number, data: Uint8ClampedArray, width: number): [number, number, number, number] {
		const i = (width * Math.round(y) + Math.round(x)) * 4;
		return [data[i], data[i + 1], data[i + 2], data[i + 3]];
	}

	public checkTileIsMoveable(x: number, y: number): boolean {
		const color = this.getPixel(x, y, this.noMoveCanvasImageData, this.noMoveCanvas.width);
		const tileIsMovable = color[3] === 0;
		return tileIsMovable;
	}

	async generateImage(
		location: MegaDuckLocation,
		options: GenerateOptions = { showGrid: true, showPreviousSteps: true }
	): Promise<Buffer> {
		if (!this.initialized || !this.mapImage || !this.noMoveImage) {
			await this.init();
		}

		const { x, y, steps = [] } = location;
		const scale = 13;

		const centerX = Math.floor(this.CANVAS_WIDTH / 2 / scale);
		const centerY = Math.floor(this.CANVAS_HEIGHT / 2 / scale);

		const canvas = createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		ctx.save();
		ctx.scale(scale, scale);

		// Only draw the visible subsection of the map
		const sourceX = Math.max(0, x - centerX);
		const sourceY = Math.max(0, y - centerY);
		const sourceWidth = this.CANVAS_WIDTH;
		const sourceHeight = this.CANVAS_HEIGHT;

		ctx.drawImage(
			this.mapImage,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			this.CANVAS_WIDTH,
			this.CANVAS_HEIGHT
		);

		ctx.font = '14px Arial';
		ctx.fillStyle = '#ffff00';
		ctx.fillRect(centerX, centerY, 1, 1);

		if (options.showPreviousSteps) {
			ctx.fillStyle = 'rgba(0,0,255,0.05)';
			for (const [_xS, _yS] of steps) {
				const xS = _xS - sourceX;
				const yS = _yS - sourceY;
				ctx.fillRect(xS, yS, 1, 1);
			}
		}

		if (options.showGrid) {
			ctx.restore();
			drawGrid({ canvas, scale, opacity: 0.2 });
		}

		return await canvasToBuffer(canvas);
	}
}
