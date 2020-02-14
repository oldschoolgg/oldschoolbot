import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import ClueTiers from '../../lib/clueTiers';
import { Events } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '<ClueTier:string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [tier]: [string]) {
		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) {
			throw `Not a valid clue tier. The valid tiers are: ${ClueTiers.map(
				_tier => _tier.name
			).join(', ')}`;
		}

		const hasCasket = await msg.author.hasItem(clueTier.id);
		if (!hasCasket) {
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
		// eslint-disable-next-line @typescript-eslint/unbound-method
		if (!task || !task.generateBankImage) throw '';

		const image = await task!.generateBankImage(
			loot,
			`You opened a ${clueTier.name} clue and received...`
		);

		msg.author.incrementClueScore(clueTier.id);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
