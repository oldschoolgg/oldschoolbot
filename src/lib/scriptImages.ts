import { canvasToBuffer, createCanvas, loadAndCacheLocalImage, printWrappedText } from './util/canvasUtil';

export async function makeScriptImage(text: string) {
	const image = await loadAndCacheLocalImage('./src/lib/resources/images/bare-scroll.png');
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.font = '16px RuneScape Quill 8';
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, 0, 0);
	printWrappedText(ctx, text, image.width / 2, 50, 229);
	return canvasToBuffer(canvas);
}
