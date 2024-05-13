import { Canvas } from '@napi-rs/canvas';

import { loadAndCacheLocalImage, printWrappedText } from './util/canvasUtil';

export async function makeScriptImage(text: string) {
	const image = await loadAndCacheLocalImage('./src/lib/resources/images/bare-scroll.png');
	const canvas = new Canvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.font = '16px RuneScape Quill 8';
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, 0, 0);
	printWrappedText(ctx, text, image.width / 2, 50, 229);
	return canvas.encode('png');
}
