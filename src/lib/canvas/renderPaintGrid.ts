import { canvasToBuffer, createCanvas } from './canvasUtil';

export interface PaintTile {
	name: string;
	img: any;
}
export interface RenderPaintGridOptions {
	gap?: number;
	padding?: number;
	textBand?: number;
	extraTextWidth?: number;
	maxCols?: number;
	minCols?: number;
	tileRadius?: number;
	bg?: string;
	tileBg?: string;
	baseFontSize?: number;
	minFontSize?: number;
	fontFamily?: string;
}

export async function renderPaintGrid(tiles: PaintTile[], opts: RenderPaintGridOptions = {}): Promise<Buffer> {
	if (!tiles.length) {
		throw new Error('renderPaintGrid: no tiles provided');
	}

	const {
		gap = 14,
		padding = 20,
		textBand = 22,
		extraTextWidth = 30,
		maxCols = 6,
		minCols = 3,
		tileRadius = 10,
		bg = '#1b1b1b',
		tileBg = '#252525',
		baseFontSize = 14,
		minFontSize = 10,
		fontFamily = "'Noto Sans', 'DejaVu Sans', Arial, sans-serif"
	} = opts;

	const iconWidth = Math.max(...tiles.map(t => t.img.width));
	const iconHeight = Math.max(...tiles.map(t => t.img.height));

	const n = tiles.length;
	const cols = Math.min(maxCols, Math.max(minCols, Math.ceil(Math.sqrt(n))));
	const rows = Math.ceil(n / cols);

	const tileWidth = iconWidth + extraTextWidth;
	const tileHeight = iconHeight + textBand;

	const canvasWidth = padding * 2 + cols * tileWidth + (cols - 1) * gap;
	const canvasHeight = padding * 2 + rows * tileHeight + (rows - 1) * gap;

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.textAlign = 'center';
	ctx.fillStyle = '#ffffff';

	const setFont = (size: number) => (ctx.font = `${size}px ${fontFamily}`);

	const drawTile = (x: number, y: number, w: number, h: number, r = tileRadius) => {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
		ctx.fill();
	};

	const drawWrapped = (text: string, cx: number, cy: number, maxWidth: number) => {
		for (let size = baseFontSize; size >= minFontSize; size--) {
			setFont(size);
			if (ctx.measureText(text).width <= maxWidth) {
				ctx.fillText(text, cx, cy);
				return;
			}
		}

		const words = text.split(' ');
		if (words.length > 1) {
			const splits: number[] = [];
			const mid = Math.floor(words.length / 2);
			for (let offset = 0; offset < words.length; offset++) {
				const left = mid - offset;
				const right = mid + offset + 1;
				if (left >= 1) splits.push(left);
				if (right < words.length) splits.push(right);
				if (splits.length >= words.length - 1) break;
			}
			for (let size = baseFontSize; size >= minFontSize; size--) {
				setFont(size);
				for (const split of splits) {
					const l1 = words.slice(0, split).join(' ');
					const l2 = words.slice(split).join(' ');
					if (ctx.measureText(l1).width <= maxWidth && ctx.measureText(l2).width <= maxWidth) {
						const v = Math.ceil(size * 0.6);
						ctx.fillText(l1, cx, cy - v);
						ctx.fillText(l2, cx, cy + v);
						return;
					}
				}
			}
		}

		setFont(minFontSize);
		let s = text;
		while (ctx.measureText(`${s}…`).width > maxWidth && s.length > 0) s = s.slice(0, -1);
		ctx.fillText(`${s}…`, cx, cy);
	};

	tiles.forEach((t, i) => {
		const col = i % cols;
		const row = Math.floor(i / cols);

		const tileX = padding + col * (tileWidth + gap);
		const tileY = padding + row * (tileHeight + gap);

		ctx.fillStyle = tileBg;
		drawTile(tileX, tileY, tileWidth, tileHeight, tileRadius);

		const iconX = tileX + (tileWidth - iconWidth) / 2;
		const iconY = tileY + 6;
		ctx.drawImage(t.img, iconX, iconY, iconWidth, iconHeight);

		ctx.fillStyle = '#ffffff';
		const textMaxWidth = tileWidth - 8;
		const textCX = tileX + tileWidth / 2;
		const textCY = iconY + iconHeight + Math.floor(textBand / 2);
		drawWrapped(t.name, textCX, textCY, textMaxWidth);
	});

	return canvas.toBuffer ? canvas.toBuffer('image/png' as any) : await canvasToBuffer(canvas);
}
