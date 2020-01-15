import { Command, KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { createCanvas, Image, registerFont } from 'canvas';
import * as fs from 'fs';

import { generateHexColorForCashStack, formatItemStackQuantity, chunkObject } from '../../lib/util';
import { Bank } from '../../lib/types';
import { Emoji } from '../../lib/constants';
import { Items } from 'oldschooljs';
import { RichDisplay } from 'klasa';
import { util } from 'klasa';

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
			usage: '[page:int]',
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

	// @ts-ignore
	async run(msg: KlasaMessage, [page = 1]: [number]) {
		await msg.author.settings.sync(true);
		const coins: number = msg.author.settings.get('GP');
		const _bank: Bank = msg.author.settings.get('bank');

		const bank: Bank = { ..._bank, 995: coins };

		for (const key in bank) {
			if (bank[key] === 0) {
				delete bank[key];
			}
		}

		const bankKeys = Object.keys(bank);
		const hasItemsInBank = bankKeys.length > 0;

		if (coins === 0 && !hasItemsInBank) {
			throw `You have no GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command.`;
		}

		if (msg.flagArgs.text) {
			const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
			const display = new RichDisplay();
			display.setFooterPrefix(`Page `);

			let textBank = [];
			for (const [id, qty] of Object.entries(bank)) {
				textBank.push(`**${Items.get(parseInt(id))!.name}:** ${qty.toLocaleString()}`);
			}

			for (const page of util.chunk(textBank, 10)) {
				display.addPage(
					new MessageEmbed()
						.setTitle(`${msg.author.username}'s Bank`)
						.setDescription(page.join('\n'))
				);
			}

			return display.run(loadingMsg as KlasaMessage, { jump: false, stop: false });
		}

		if (!hasItemsInBank) return msg.send(this.generateImage(coins));
		const task = this.client.tasks.get('bankImage');

		// TODO - add 'WTF' error handling, maybe coerce this
		if (!task || !task.generateBankImage) throw '';

		if (bankKeys.length < 57) {
			const image = await task.generateBankImage(
				bank,
				`${msg.author.username}'s Bank - Page 1 of 1`
			);
			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		const chunkedObject = chunkObject(bank, 56);
		const bankPage = chunkedObject[page - 1];

		if (!bankPage) throw "You don't have any items on that page!";
		const image = await task.generateBankImage(
			bank,
			`${msg.author.username}'s Bank - Page ${page} of ${chunkedObject.length}`,
			true,
			{
				...msg.flagArgs,
				page: page - 1
			}
		);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
