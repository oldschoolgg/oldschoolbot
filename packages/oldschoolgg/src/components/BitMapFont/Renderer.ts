interface PixelChar {
	width: number;
	offset: [number, number];
	rect: [number, number, number, number];
}

interface PixelFont {
	image: CanvasImageSource;
	characters: Record<string, PixelChar>;
}

interface RendererOptions {
	canvas: HTMLCanvasElement;
	font: PixelFont;
	color?: string;
	colorSymbols?: Record<string, string>;
}

interface DrawOptions {
	scale?: number;
	color?: string;
}

const DEFAULT_COLOR_SYMBOLS: Record<string, string> = {
	'🔵': 'blue',
	'⚪': 'white',
	'🔴': 'red',
	'🟠': 'orange',
	'🟣': 'purple',
	'🟤': 'brown',
	'🟡': 'yellow',
	'🟢': 'green',
	'⚫': 'black'
};

type BufferCanvas = HTMLCanvasElement | OffscreenCanvas;
type BufferContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export class Renderer {
	atlasCache = new Map<string, OffscreenCanvas>();
	options: RendererOptions;
	ctx: CanvasRenderingContext2D;
	bufferCanvas: BufferCanvas;
	buffer: BufferContext;
	color: string;

	constructor(options: RendererOptions) {
		if (!options.canvas) {
			throw new Error('PixelText.Renderer: requires canvas option');
		}

		if (!options.font) {
			throw new Error('PixelText.Renderer: requires font option');
		}

		this.options = {
			color: 'white',
			colorSymbols: { ...DEFAULT_COLOR_SYMBOLS, ...(options.colorSymbols ?? {}) },
			...options
		};

		const ctx = this.options.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('PixelText.Renderer: failed to get 2d context');
		}
		this.ctx = ctx;
		this.color = this.options.color ?? 'white';

		const bufferCanvasEl = document.createElement('canvas');
		bufferCanvasEl.style.position = 'absolute';
		bufferCanvasEl.style.display = 'none';
		document.body.appendChild(bufferCanvasEl);

		this.bufferCanvas = 'OffscreenCanvas' in window ? bufferCanvasEl.transferControlToOffscreen() : bufferCanvasEl;

		const buffer = this.bufferCanvas.getContext('2d') as BufferContext | null;
		if (!buffer) {
			throw new Error('PixelText.Renderer: failed to get buffer context');
		}
		this.buffer = buffer;

		this.checkBufferSize();
	}

	checkBufferSize = (): void => {
		if (this.bufferCanvas.width !== this.options.canvas.width) {
			this.bufferCanvas.width = this.options.canvas.width;
		}
		if (this.bufferCanvas.height !== this.options.canvas.height) {
			this.bufferCanvas.height = this.options.canvas.height;
		}
	};

	getTintedAtlas(color: string) {
		const cached = this.atlasCache.get(color);
		if (cached) return cached;

		const src = this.options.font.image as CanvasImageSource;
		const w = (src as any).width;
		const h = (src as any).height;

		const canvas = new OffscreenCanvas(w, h);
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(src, 0, 0);
		ctx.globalCompositeOperation = 'source-in';
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'source-over';

		this.atlasCache.set(color, canvas);
		return canvas;
	}

	draw(x: number, y: number, text: string, drawOptions: DrawOptions = {}): void {
		this.checkBufferSize();

		const scale = drawOptions.scale ?? 1;
		this.color = drawOptions.color ?? this.options.color ?? 'white';

		const chars = Array.from(text);

		for (let c = 0; c < chars.length; c++) {
			const ch = chars[c];
			const char = this.options.font.characters[ch];

			if (char) {
				this.drawChar(x, y, char, scale);
				x += char.width * scale;
			} else if (this.options.colorSymbols && ch in this.options.colorSymbols) {
				this.color = this.options.colorSymbols[ch]!;
			}
		}
	}

	drawChar(x: number, y: number, char: PixelChar, scale: number) {
		const atlas = this.getTintedAtlas(this.color);
		const [sx, sy, sw, sh] = char.rect;
		this.ctx.drawImage(
			atlas,
			sx,
			sy,
			sw,
			sh,
			x + char.offset[0] * scale,
			y + char.offset[1] * scale,
			sw * scale,
			sh * scale
		);
	}
}
