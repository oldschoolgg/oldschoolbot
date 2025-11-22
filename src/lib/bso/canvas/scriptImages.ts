import { type Image, loadImage } from 'skia-canvas';

import { canvasToBuffer, createCanvas, printWrappedText } from '@/lib/canvas/canvasUtil.js';

class ScriptImageGenerator {
	private scrollImage!: Image;
	private initialized = false;

	async init(): Promise<void> {
		if (this.initialized) return;

		this.scrollImage = await loadImage('./src/lib/resources/images/bare-scroll.png');

		this.initialized = true;
	}

	async generateScriptImage(text: string): Promise<Buffer> {
		if (!this.initialized || !this.scrollImage) {
			await this.init();
		}

		const canvas = createCanvas(this.scrollImage.width, this.scrollImage.height);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px RuneScape Quill 8';
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.scrollImage, 0, 0);
		printWrappedText(ctx, text, this.scrollImage.width / 2, 50, 229);
		return canvasToBuffer(canvas);
	}
}

export const scriptImageGenerator = new ScriptImageGenerator();
