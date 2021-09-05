import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, itemID, roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[user:user]',
			perkTier: PerkTier.One,
			restrictedChannels: ['732207379818479756', '792691343284764693']
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastGivenBox);
		const difference = currentDate - lastDate;
		const timeLimit = Time.Hour * 24;
		const isOwner = this.client.owners.has(msg.author);

		// If no user or not an owner and can not send one yet, show time till next box.
		if (!user || (difference < timeLimit && !isOwner)) {
			if (difference >= timeLimit || isOwner) {
				return msg.channel.send('You can give another box!');
			}
			return msg.channel.send(`You can give another box in ${formatDuration(timeLimit - difference)}`);
		}
		// Disable box to self or irons
		if (user.id === msg.author.id) return msg.channel.send("You can't give boxes to yourself!");
		if (user.isIronman) return msg.channel.send("You can't give boxes to ironmans!");

		await msg.author.settings.update(UserSettings.LastGivenBox, currentDate);

		const boxToReceive = new Bank().add(roll(10) ? getRandomMysteryBox() : itemID('Mystery box'));

		await user.addItemsToBank(boxToReceive);

		return msg.channel.send(`Gave **${boxToReceive}** to ${user.username}.`);
	}
}
