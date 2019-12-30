import { Command, KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { createCanvas, Image, registerFont } from 'canvas';
import * as fs from 'fs';

import { generateHexColorForCashStack, formatItemStackQuantity } from '../../lib/util';

const bg = fs.readFileSync('./resources/images/coins.png');
const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

ctx.font = '14px OSRSFont';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });

export default class extends Command {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			description: 'Shows how much virtual GP you have',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	generateImage(amount: number) {
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		const color = generateHexColorForCashStack(amount);
		const formattedNumber = formatItemStackQuantity(amount);

		ctx.fillStyle = '#000000';
		ctx.fillText(formattedNumber.split('0').join('O'), 10, 15);
		ctx.fillStyle = color;
		ctx.fillText(formattedNumber.split('0').join('O'), 9, 14);

		return new MessageAttachment(canvas.toBuffer(), `bank.jpg`);
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const coins = msg.author.settings.get('GP');
		const bank = msg.author.settings.get('bank');

		const hasItemsInBank = Object.keys(bank).length > 0;

		if (coins === 0 && !hasItemsInBank) {
			throw `You have no GP yet <:Sad:421822898316115969> You can get some GP by using the +daily command.`;
		}

		if (!hasItemsInBank) return msg.send(this.generateImage(coins));
		const task = this.client.tasks.get('bankImage');
		const image = await task!.generateBankImage(bank);
		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
