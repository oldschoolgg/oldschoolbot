import { readFileSync, writeFileSync } from 'node:fs';
import { Writable } from 'node:stream';
import { Readable } from 'node:stream';
import * as Canvas from 'pureimage';

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

const spritesheet = readFileSync('./items-spritesheet.png');
const spritesheetData = JSON.parse(readFileSync('./items-spritesheet.json', 'utf-8'));
async function pure() {
	const width = 1000;
	const height = 1000;
	const canvas = Canvas.make(width, height);
	const ctx: Canvas.Context = canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);
	// for (const [id, pos] of Object.entries(layout.positions)) {
	// 	const img = await Canvas.decodePNGFromStream(bufferToStream(images[id]!.buffer));
	// 	ctx.drawImage(img, pos.x, pos.y);
	// }
	const img = await Canvas.decodePNGFromStream(bufferToStream(spritesheet));

	const itemsToDraw = Object.values(spritesheetData).slice(0, 300);
	const spriteInfo = spritesheetData['4151'] as [number, number, number, number];
	if (!spriteInfo) throw new Error('No sprite info');
	for (let index = 0; index < itemsToDraw.length; index++) {
		const [x, y, w, h] = itemsToDraw[index] as [number, number, number, number];
		const destX = (index % 20) * 50;
		const destY = Math.floor(index / 10) * 50;
		ctx.drawImage(img, x, y, w, h, destX, destY, 48, 48);
	}

	const imageBuffer = await encodePNGToBuffer(canvas);
	writeFileSync('output.png', imageBuffer);
}

pure();
