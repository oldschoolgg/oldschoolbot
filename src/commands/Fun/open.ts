import { Command } from 'klasa';
import { MessageAttachment } from 'discord.js';

import * as uniqueItems from '../../../data/rareClueItems';
import ClueTiers from '../../lib/clueTiers';

import { KlasaClient, CommandStore } from 'klasa';
import { KlasaMessage } from 'klasa';
import { Bank } from '../../lib/types';
import { addBankToBank, removeItemFromBank } from '../../lib/util';

export default class extends Command {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '<ClueTier:string>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [tier]: [string]) {
		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) {
			throw `Not a valid clue tier. The valid tiers are: ${ClueTiers.map(
				_tier => _tier.name
			).join(', ')}`;
		}

		await msg.author.settings.sync();
		const bank: Bank = msg.author.settings.get('bank');
		if (!bank[clueTier.id]) {
			throw `You don't have any ${clueTier.name} Caskets to open!`;
		}

		let newBank = removeItemFromBank(bank, clueTier.id);

		const lootResult = clueTier.table.open();

		const loot: { [key: number]: number } = {};

		for (const casketResult of lootResult) {
			for (const item of casketResult) {
				if (!uniqueItems.has(item.item)) continue;
				if (!loot[item.item]) loot[item.item] = item.quantity;
				else loot[item.item] += item.quantity;
			}
		}

		const opened = `You opened one of your ${clueTier.name} Clue Caskets`;

		if (Object.keys(loot).length === 0) {
			await msg.author.settings.update('bank', newBank);
			return msg.send(`${opened} and got nothing :(`);
		}
		newBank = addBankToBank(loot, newBank);

		await msg.author.settings.update('bank', newBank);

		const task = this.client.tasks.get('bankImage');

		// TODO - add 'WTF' error handling, maybe coerce this
		if (!task || !task.generateBankImage) throw '';
		const image = await task!.generateBankImage(loot);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
