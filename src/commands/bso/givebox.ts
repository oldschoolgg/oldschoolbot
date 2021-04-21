import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { PerkTier, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, itemID, roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			perkTier: PerkTier.One,
			restrictedChannels: ['732207379818479756', '792691343284764693']
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === msg.author.id) throw `You can't give boxes to yourself!`;
		if (user.isIronman) return;
		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastGivenBox);
		const difference = currentDate - lastDate;

		if (difference < Time.Hour * 24 && msg.author.id !== '157797566833098752') {
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
