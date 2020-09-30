import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatDuration, itemID, roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			perkTier: PerkTier.One
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === msg.author.id) throw `You can't give boxes to yourself!`;
		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastGivenBox);
		const difference = currentDate - lastDate;

		if (difference < Time.Hour * 24) {
			const duration = formatDuration(Date.now() - (lastDate + Time.Hour * 24));
			return msg.send(`You can give another box in ${duration}.`);
		}
		await msg.author.settings.update(UserSettings.LastGivenBox, currentDate);

		const box = roll(10) ? getRandomMysteryBox() : itemID('Mystery box');

		await user.addItemsToBank({ [box]: 1 });

		return msg.channel.send(
			`Gave ${[19939].includes(box) ? 'an' : 'a'} **${getOSItem(box).name}** to ${
				user.username
			}.`
		);
	}
}
