import { Writable } from 'node:stream';
import { Readable } from 'node:stream';
import * as Canvas from 'pureimage';

import type { ImageGroup, LayoutResult } from '../types.js';
import type { CanvasProvider } from './canvas.js';

function bufferToStream(buffer: Buffer): Readable {
	return new Readable({
		read() {
			this.push(buffer);
			this.push(null);
		}
	});
}

async function encodePNGToBuffer(bitmap: Canvas.Bitmap, options?: Canvas.PNGOptions): Promise<Buffer> {
	const chunks: Buffer[] = [];
	const sink = new Writable({
		write(chunk, _enc, cb) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
			cb();
		}
	});
	await Canvas.encodePNGToStream(bitmap, sink, options);
	return Buffer.concat(chunks);
}

export const PureImageCanvasProvider: CanvasProvider = {
	async generateSpriteSheet({ layout, images }: { layout: LayoutResult; images: ImageGroup }) {
		const canvas = Canvas.make(layout.width, layout.height);
		const ctx: Canvas.Context = canvas.getContext('2d');
		ctx.clearRect(0, 0, layout.width, layout.height);
		for (const [id, pos] of Object.entries(layout.positions)) {
			const img = await Canvas.decodePNGFromStream(bufferToStream(images[id]!.buffer));
			ctx.drawImage(img, pos.x, pos.y);
		}
		const imageBuffer = await encodePNGToBuffer(canvas);
		return { imageBuffer };
	}
};
