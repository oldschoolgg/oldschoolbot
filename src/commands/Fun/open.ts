import { Command, KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import ClueTiers from '../../lib/clueTiers';
import { Bank } from '../../lib/types';
import { Events } from '../../lib/constants';

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

		await msg.author.removeItemFromBank(clueTier.id);

		const loot = clueTier.table.open();

		const opened = `You opened one of your ${clueTier.name} Clue Caskets`;

		if (Object.keys(loot).length === 0) {
			return msg.send(`${opened} and got nothing :(`);
		}

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened a ${clueTier.name} casket.`
		);

		await msg.author.addItemsToBank(loot, true);

		const task = this.client.tasks.get('bankImage');

		// TODO - add 'WTF' error handling, maybe coerce this
		if (!task || !task.generateBankImage) throw '';
		const image = await task!.generateBankImage(
			loot,
			`You opened a ${clueTier.name} clue and received...`
		);

		msg.author.incrementClueScore(clueTier.id);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
