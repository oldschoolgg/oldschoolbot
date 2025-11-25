import { type CanvasImage, canvasToBuffer, createCanvas, loadAndCacheLocalImage } from '@/lib/canvas/canvasUtil.js';

let bg: CanvasImage | null = null;

export const fakepmCommand = defineCommand({
	name: 'fakepm',
	description: 'Generate fake images of PMs.',
	options: [
		{
			type: 'String',
			name: 'username',
			description: 'The username to put on the image.',
			required: true
		},
		{
			type: 'String',
			name: 'message',
			description: 'The message.',
			required: true
		}
	],
	run: async ({ options }) => {
		const canvas = createCanvas(376, 174);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFont';

		if (!bg) {
			bg = await loadAndCacheLocalImage('./src/lib/resources/images/pm-bg.png');
		}
		ctx.drawImage(bg, 0, 0, bg.width, bg.height);

		ctx.fillStyle = '#000000';
		ctx.fillText(`From ${options.username}: ${options.message}`, 6, 98);
		ctx.fillStyle = '#00ffff';
		ctx.fillText(`From ${options.username}: ${options.message}`, 5, 97);

		return {
			files: [{ buffer: await canvasToBuffer(canvas), name: `${Math.round(Math.random() * 10_000)}.jpg` }]
		};
	}
});
