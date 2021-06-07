import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, PerkTier } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemChallenge, reactChallenge, triviaChallenge } from '../../monitors/boxSpawns';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 60 * 45,
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		if (
			msg.author.perkTier < PerkTier.Four &&
			!msg.author.settings
				.get(UserSettings.BitField)
				.includes(BitField.HasPermanentEventBackgrounds)
		) {
			return msg.send(`You need to be a T3 patron or higher to use this command.`);
		}

		if (msg.author.id !== '157797566833098752' && msg.channel.id !== '732207379818479756') {
			return msg.send(`You can only use this in the BSO channel.`);
		}
		const item = randArrItem([
			itemChallenge,
			itemChallenge,
			itemChallenge,
			itemChallenge,
			reactChallenge,
			triviaChallenge
		]);
		const winner = await item(msg);
		if (winner) {
			const loot = new Bank().add(getRandomMysteryBox());
			await winner.addItemsToBank(loot);
			return msg.channel.send(`Congratulations, ${winner}! You received: **${loot}**.`);
		}
	}
}
