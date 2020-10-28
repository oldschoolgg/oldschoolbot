import { createCanvas, Image } from 'canvas';
import { MessageAttachment } from 'discord.js';
import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

const bg = fs.readFileSync('./resources/images/qa-background.png');
const canvas = createCanvas(900, 506);
const ctx = canvas.getContext('2d');

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Get yourself a Fake Ely!',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<image:image>'
		});
	}

	async run(msg: KlasaMessage, [res]: [[Buffer]]) {
		if (!res) {
			throw `No image found.`;
		}
		const [imageBuffer] = res;
		const BG = new Image();
		BG.src = bg;

		const userImage = new Image();
		userImage.src = imageBuffer;

		ctx.drawImage(userImage, -50, 84, 180, 107);
		ctx.drawImage(userImage, 144, 84, 180, 100);
		ctx.drawImage(userImage, 331, 85, 184, 102);
		ctx.drawImage(userImage, 520, 84, 180, 107);
		ctx.drawImage(userImage, 707, 84, 196, 108);

		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		return msg.send(
			new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`)
		);
	}
}
