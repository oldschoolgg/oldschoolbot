import { createCanvas, Image, registerFont } from 'canvas';
import { MessageAttachment } from 'discord.js';
import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

const bg = fs.readFileSync('./src/lib/resources/images/pm-bg.png');
const canvas = createCanvas(376, 174);
const ctx = canvas.getContext('2d');

ctx.font = '16px OSRSFont';

registerFont('./src/lib/resources/osrs-font.ttf', { family: 'Regular' });

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Generates a fake private message from someone.',
			examples: ['+fakeely Woox Hello'],
			cooldown: 3,
			requiredPermissionsForBot: ['ATTACH_FILES'],
			usage: '(username:string) <message:...str>',
			usageDelim: ',',
			categoryFlags: ['fun']
		});
	}

	async run(msg: KlasaMessage, [username, message]: [string, string]) {
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		ctx.fillStyle = '#000000';
		ctx.fillText(`From ${username}: ${message}`, 6, 98);
		ctx.fillStyle = '#00ffff';
		ctx.fillText(`From ${username}: ${message}`, 5, 97);

		return msg.channel.send({
			files: [new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10_000)}.jpg`)]
		});
	}
}
