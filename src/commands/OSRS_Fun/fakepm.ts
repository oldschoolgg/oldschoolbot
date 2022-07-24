import { MessageAttachment } from 'discord.js';
import { readFile } from 'fs/promises';
import { CommandStore, KlasaMessage } from 'klasa';
import { Canvas, Image, loadImage } from 'skia-canvas/lib';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	bg: Image;
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Generates a fake private message from someone.',
			examples: ['+fakeely Woox Hello'],
			requiredPermissionsForBot: ['ATTACH_FILES'],
			usage: '(username:string) <message:...str>',
			usageDelim: ',',
			categoryFlags: ['fun']
		});
		this.bg = readFile('./src/lib/resources/images/pm-bg.png').then(loadImage) as unknown as Image;
	}

	async init() {
		await this.bg;
	}

	async run(msg: KlasaMessage, [username, message]: [string, string]) {
		const canvas = new Canvas(376, 174);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFont';
		ctx.drawImage(this.bg, 0, 0, this.bg.width, this.bg.height);

		ctx.fillStyle = '#000000';
		ctx.fillText(`From ${username}: ${message}`, 6, 98);
		ctx.fillStyle = '#00ffff';
		ctx.fillText(`From ${username}: ${message}`, 5, 97);

		return msg.channel.send({
			files: [new MessageAttachment(await canvas.toBuffer('png'), `${Math.round(Math.random() * 10_000)}.jpg`)]
		});
	}
}
