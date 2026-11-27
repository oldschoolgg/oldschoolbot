import path from 'node:path';

import { createCanvas, loadImage, printWrappedText } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

const textboxPath = path.join('./src/lib/resources/images', 'textbox.png');

export async function petMetamorphChatMsg({ content, petId }: { content: string; petId: number }) {
	const canvas = createCanvas(519, 142);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	const bg = await loadImage(textboxPath);
	ctx.drawImage(bg, 0, 0);
	const petCanvas = new OSRSCanvas({ width: 36, height: 32 });
	await petCanvas.drawItemIDSprite({ itemID: petId, x: 0, y: 0 });
	ctx.drawImage(await loadImage(await petCanvas.toBuffer()), 28, 22, 72, 64);
	ctx.font = '16px RuneScape Quill 8';
	ctx.fillStyle = '#810303';
	const title = 'Your new pet';
	ctx.fillText(title, Math.floor(307 - ctx.measureText(title).width / 2), 36);
	ctx.fillStyle = '#000';
	printWrappedText(ctx, content, 307, 58, 361);
	return canvas.toBuffer('png');
}
