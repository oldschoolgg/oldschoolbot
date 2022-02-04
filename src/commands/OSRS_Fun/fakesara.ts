import { createCanvas, Image, registerFont } from 'canvas';
import { MessageAttachment } from 'discord.js';
import { randInt } from 'e';
import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

const bg = fs.readFileSync('./src/lib/resources/images/tob-bg.png');
const canvas = createCanvas(399, 100);
const ctx = canvas.getContext('2d');

ctx.font = '16px OSRSFont';

registerFont('./src/lib/resources/osrs-font.ttf', { family: 'Regular' });

const randomMessages = ['omfgggggg', '!#@$@#$@##@$', 'adfsjklfadkjsl;l', 'l00000l wtf'];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Generates a fake image of someone getting a saradomin pet.',
			examples: ['+fakesara Woox 50'],
			cooldown: 3,
			requiredPermissionsForBot: ['ATTACH_FILES'],
			usage: '(username:string) [kc:int{1,999999}]',
			usageDelim: ',',
			categoryFlags: ['fun']
		});
	}

	async run(msg: KlasaMessage, [username, kc = randInt(1, 150)]: [string, number]) {
		ctx.fillStyle = '#000000';
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		ctx.fillText('Your Commander Zilyana kill count is: ', 11, 10);
		ctx.fillStyle = '#ff0000';
		ctx.fillText(kc.toString(), 12 + ctx.measureText('Your Commander Zilyana kill count is: ').width, 10);

		ctx.fillStyle = '#ff0000';
		ctx.fillText("You have a funny feeling like you're being followed.", 11, 25);

		ctx.fillStyle = '#005f00';
		ctx.fillText(`${username} received a drop: Pet zilyana`, 11, 40);

		ctx.fillStyle = '#005f00';
		ctx.fillText(
			`${username} received a drop: ${Math.random() > 0.5 ? 'Saradomin hilt' : 'Armadyl crossbow'}`,
			11,
			54
		);

		/* Username */
		const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
		ctx.fillStyle = '#000000';
		ctx.fillText(`${username}: `, 11, 69);
		ctx.fillStyle = '#0000ff';
		ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);

		return msg.channel.send({
			files: [new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10_000)}.jpg`)]
		});
	}
}
