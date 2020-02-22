import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import ClueTiers from '../../lib/clueTiers';
import { Events } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';
import Openables from '../../lib/openables';
import { stringMatches } from '../../lib/util';
import bankFromLootTableOutput from '../../lib/util/bankFromLootTableOutput';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

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
			return this.nonClueOpen(msg, tier);
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

	async nonClueOpen(msg: KlasaMessage, type: string) {
		const openable = Openables.find(thing =>
			thing.aliases.some(alias => stringMatches(alias, type))
		);

		if (!openable) {
			throw `That's not a valid thing you can open. You can open a clue tier (${ClueTiers.map(
				tier => tier.name
			).join(', ')}), or another non-clue thing (${Openables.map(thing => thing.name).join(
				', '
			)})`;
		}

		const hasItem = await msg.author.hasItem(openable.itemID);
		if (!hasItem) {
			throw `You don't have a ${openable.name} to open!`;
		}

		await msg.author.removeItemFromBank(openable.itemID);

		const loot = bankFromLootTableOutput(openable.table.roll());

		await msg.author.addItemsToBank(loot, true);

		return msg.send(
			`${openable.emoji} You opened a ${openable.name} and received: ${
				Object.keys(loot).length > 0 ? createReadableItemListFromBank(loot) : 'Nothing! Sad'
			}.`
		);
	}
}
