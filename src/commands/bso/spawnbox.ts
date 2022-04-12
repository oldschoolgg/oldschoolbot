import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { BitField, Channel, PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { isPrimaryPatron } from '../../lib/util/getUsersPerkTier';
import { createdChallenge, itemChallenge, reactChallenge, triviaChallenge } from '../../monitors/boxSpawns';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 60 * 45
		});
	}

	async run(msg: KlasaMessage) {
		if (!isPrimaryPatron(msg.author)) {
			return msg.channel.send('Shared-perk accounts cannot use this.');
		}
		if (
			msg.author.perkTier < PerkTier.Four &&
			!msg.author.settings.get(UserSettings.BitField).includes(BitField.HasPermanentEventBackgrounds)
		) {
			return msg.channel.send('You need to be a T3 patron or higher to use this command.');
		}

		if (!this.client.owners.has(msg.author) && msg.channel.id !== Channel.BSOChannel) {
			return msg.channel.send('You can only use this in the BSO channel.');
		}
		const item = randArrItem([itemChallenge, itemChallenge, createdChallenge, reactChallenge, triviaChallenge]);
		const winner = await item(msg);
		if (winner) {
			const loot = new Bank().add(MysteryBoxes.roll());
			await winner.addItemsToBank({ items: loot, collectionLog: false });
			return msg.channel.send(`Congratulations, ${winner}! You received: **${loot}**.`);
		}
	}
}
