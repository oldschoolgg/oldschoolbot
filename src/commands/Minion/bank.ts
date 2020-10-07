import { createCanvas, Image, registerFont } from 'canvas';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import * as fs from 'fs';
import { Command, CommandStore, KlasaMessage, util } from 'klasa';
import { Items } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { ItemBank } from '../../lib/types';
import {
	addItemToBank,
	chunkObject,
	formatItemStackQuantity,
	generateHexColorForCashStack
} from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

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
			usage: '[page:int|name:string]',
			requiredPermissions: ['ATTACH_FILES'],
			aliases: ['b']
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
	async run(msg: KlasaMessage, [pageNumberOrItemName = 1]: [number | string]) {
		await msg.author.settings.sync(true);
		const coins = msg.author.settings.get(UserSettings.GP);
		const _bank = msg.author.settings.get(UserSettings.Bank);

		const bank: ItemBank = { ..._bank, 995: coins };

		if (typeof pageNumberOrItemName === 'string') {
			if (pageNumberOrItemName.includes(',')) {
				const arrItemNameOrID = pageNumberOrItemName.split(',');
				let view: ItemBank = {};
				for (const nameOrID of arrItemNameOrID) {
					try {
						const item = getOSItem(nameOrID);
						if (bank[item.id] && !view[item.id]) {
							view = addItemToBank(view, item.id, bank[item.id]);
						}
					} catch (_) {}
				}
				if (Object.keys(view).length === 0) {
					throw `You have none of those items!`;
				}
				return msg.channel.sendBankImage({
					bank: view,
					title: `${msg.author.username}'s Bank`
				});
			}
			const item = getOSItem(pageNumberOrItemName);
			return msg.send(`You have ${(bank[item.id] ?? 0).toLocaleString()}x ${item.name}.`);
		}

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
			const debug = Boolean(msg.flagArgs.debug);
			const textBank = [];
			for (const [id, qty] of Object.entries(bank)) {
				const item = Items.get(Number(id));
				textBank.push(
					`${item ? item.name : `WTF-${id}`}${
						debug ? `[${id}]` : ''
					}: ${qty.toLocaleString()}`
				);
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
			return msg.channel.sendBankImage({
				bank,
				title: `${msg.author.username}'s Bank`,
				flags: { ...msg.flagArgs, page: 0 },
				background: msg.author.settings.get(UserSettings.BankBackground),
				user: msg.author
			});
		}

		const chunkedObject = chunkObject(bank, 56);
		const bankPage = chunkedObject[pageNumberOrItemName - 1];

		if (!bankPage) throw "You don't have any items on that page!";

		if (msg.flagArgs.full) {
			return msg.channel.sendBankImage({
				bank,
				title: `${msg.author.username}'s Bank`,
				flags: msg.flagArgs,
				background: msg.author.settings.get(UserSettings.BankBackground),
				user: msg.author
			});
		}

		return msg.channel.sendBankImage({
			bank,
			title: `${msg.author.username}'s Bank`,
			flags: {
				...msg.flagArgs,
				page: pageNumberOrItemName - 1
			},
			background: msg.author.settings.get(UserSettings.BankBackground),
			user: msg.author
		});
	}
}
