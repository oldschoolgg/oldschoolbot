import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, PerkTier, Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>'
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		const cl = new Bank(msg.author.settings.get(UserSettings.CollectionLogBank));
		if (!cl.has('Cursed banana')) {
			return msg.send(
				`You cant give out a birthday pack because you haven't yet completed the birthday event.`
			);
		}
		if (user.id === msg.author.id) throw `You can't give boxes to yourself!`;
		if (user.bot) throw 'no';
		if (
			msg.author.settings.get(UserSettings.BitField).includes(BitField.HasGivenBirthdayPack)
		) {
			return msg.send(`You have already given out a birthday pack.`);
		}
		if (
			msg.author.perkTier < PerkTier.Four &&
			Date.now() - msg.author.createdTimestamp < Time.Month * 12 &&
			!msg.author.settings.get(UserSettings.BitField).includes(BitField.BypassAgeRestriction)
		) {
			throw `You cannot use this command as your account is too new, as a measure against alt accounts. You can become a T3 patron at <https://github.com/sponsors/gc> to bypass this.`;
		}

		await user.addItemsToBank(new Bank({ 'Birthday pack': 1 }));
		await msg.author.settings.update(UserSettings.BitField, BitField.HasGivenBirthdayPack);

		return msg.channel.send(`You gave a Birthday pack to ${user.username}.`);
	}
}
