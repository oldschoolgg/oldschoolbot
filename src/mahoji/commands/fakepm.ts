import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import type { OSBMahojiCommand } from '@oldschoolgg/toolkit/discord-util';
import { canvasToBuffer, createCanvas, loadAndCacheLocalImage } from '../../lib/canvas/canvasUtil';

const bg = loadAndCacheLocalImage('./src/lib/resources/images/pm-bg.png');

export const fakepmCommand: OSBMahojiCommand = {
	name: 'fakepm',
	description: 'Generate fake images of PMs.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'username',
			description: 'The username to put on the image.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'message',
			description: 'The message.',
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ message: string; username: string }>) => {
		const canvas = createCanvas(376, 174);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFont';
		const img = await bg;
		ctx.drawImage(img, 0, 0, img.width, img.height);

		ctx.fillStyle = '#000000';
		ctx.fillText(`From ${options.username}: ${options.message}`, 6, 98);
		ctx.fillStyle = '#00ffff';
		ctx.fillText(`From ${options.username}: ${options.message}`, 5, 97);

		return {
			files: [{ attachment: await canvasToBuffer(canvas), name: `${Math.round(Math.random() * 10_000)}.jpg` }]
		};
	}
};
