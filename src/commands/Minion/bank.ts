import { Command, KlasaMessage, CommandStore, util } from 'klasa';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { createCanvas, Image, registerFont } from 'canvas';
import * as fs from 'fs';
import { Items } from 'oldschooljs';

import { generateHexColorForCashStack, formatItemStackQuantity, chunkObject } from '../../lib/util';
import { Bank } from '../../lib/types';
import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import addArrayOfBanks from '../../lib/util/addArrayOfBanks';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';

const bg = fs.readFileSync('./resources/images/coins.png');
const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

ctx.font = '14px OSRSFont';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
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

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	async run(msg: KlasaMessage, [page = 1]: [number]) {
		await msg.author.settings.sync(true);
		const coins: number = msg.author.settings.get(UserSettings.GP);
		const _bank: Bank = msg.author.settings.get(UserSettings.Bank);

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

		const task = this.client.tasks.get('bankImage');

		if (msg.flagArgs.server && msg.guild) {
			if (getUsersPerkTier(msg.author) < 100) {
				throw `This feature is currently disabled.`;
			}

			if (getUsersPerkTier(msg.author) < 2) {
				throw `This feature is available only to patrons.`;
			}

			const serverBank = addArrayOfBanks(
				msg.guild.members.map(member => member.user.settings.get(UserSettings.Bank))
			);

			const image = await task!.generateBankImage(
				serverBank,
				`Bank Of All Users in ${msg.guild.name}`,
				true,
				{
					...msg.flagArgs
				}
			);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		if (msg.flagArgs.text) {
			const textBank = [];
			for (const [id, qty] of Object.entries(bank)) {
				textBank.push(`${Items.get(parseInt(id))!.name}: ${qty.toLocaleString()}`);
			}

			if (msg.flagArgs.full) {
				return msg.channel.sendFile(
					Buffer.from(textBank.join('\n')),
					`${msg.author.username}s_Bank.txt`,
					'Here is your entire bank in txt file format.'
				);
			}

			const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
			const display = new UserRichDisplay();
			display.setFooterPrefix(`Page `);

			for (const page of util.chunk(textBank, 10)) {
				display.addPage(
					new MessageEmbed()
						.setTitle(`${msg.author.username}'s Bank`)
						.setDescription(page.join('\n'))
				);
			}

			return display.start(loadingMsg as KlasaMessage, msg.author.id, {
				jump: false,
				stop: false
			});
		}

		if (!hasItemsInBank) return msg.send(this.generateImage(coins));

		if (bankKeys.length < 57) {
			const image = await task!.generateBankImage(
				bank,
				`${msg.author.username}'s Bank - Page 1 of 1`,
				true,
				{
					...msg.flagArgs
				},
				msg.author.settings.get(UserSettings.BankBackground)
			);
			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		const chunkedObject = chunkObject(bank, 56);
		const bankPage = chunkedObject[page - 1];

		if (!bankPage) throw "You don't have any items on that page!";
		const image = await task!.generateBankImage(
			bank,
			`${msg.author.username}'s Bank - Page ${page} of ${chunkedObject.length}`,
			true,
			{
				...msg.flagArgs,
				page: page - 1
			},
			msg.author.settings.get(UserSettings.BankBackground)
		);

		if (msg.flagArgs.full) {
			const image = await task!.generateBankImage(
				bank,
				`${msg.author.username}'s Bank`,
				true,
				{
					...msg.flagArgs
				}
			);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
