import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Time, PerkTier } from '../../lib/constants';
import { formatDuration, roll, itemID } from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getRandomMysteryBox } from '../../lib/openables';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			perkTier: PerkTier.One
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastGivenBox);
		const difference = currentDate - lastDate;

		if (difference < Time.Hour * 24) {
			const duration = formatDuration(Date.now() - (lastDate + Time.Hour * 24));
			return msg.send(`You can give another box in ${duration}.`);
		}
		console.log({ currentDate });
		await msg.author.settings.update(UserSettings.LastGivenBox, currentDate);

		const box = roll(10) ? getRandomMysteryBox() : itemID('Mystery box');

		await user.addItemsToBank({ [box]: 1 });

		return msg.channel.send(`Gave a mystery box to ${user.username}.`);
	}
}
