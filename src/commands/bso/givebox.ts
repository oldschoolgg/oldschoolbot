import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { Channel, giveBoxResetTime, PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, itemID, roll } from '../../lib/util';
import { isPrimaryPatron } from '../../lib/util/getUsersPerkTier';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[user:user]',
			perkTier: PerkTier.One,
			restrictedChannels: [Channel.BSOChannel, Channel.BSOGeneral]
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (!isPrimaryPatron(msg.author)) {
			return msg.channel.send('Shared-perk accounts cannot use this.');
		}

		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastGivenBox);
		const difference = currentDate - lastDate;
		const isOwner = this.client.owners.has(msg.author);

		// If no user or not an owner and can not send one yet, show time till next box.
		if (!user || (difference < giveBoxResetTime && !isOwner)) {
			if (difference >= giveBoxResetTime || isOwner) {
				return msg.channel.send('You can give another box!');
			}
			return msg.channel.send(`You can give another box in ${formatDuration(giveBoxResetTime - difference)}`);
		}
		// Disable box to self or irons
		if (user.id === msg.author.id) return msg.channel.send("You can't give boxes to yourself!");
		if (user.isIronman) return msg.channel.send("You can't give boxes to ironmen!");

		await msg.author.settings.update(UserSettings.LastGivenBox, currentDate);

		const boxToReceive = new Bank().add(roll(10) ? MysteryBoxes.roll() : itemID('Mystery box'));

		await user.addItemsToBank({ items: boxToReceive, collectionLog: false });

		return msg.channel.send(`Gave **${boxToReceive}** to ${user.username}.`);
	}
}
