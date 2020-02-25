import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import { Events, Time, Channel, BitField, Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (Date.now() - msg.author.createdTimestamp < Time.Year) {
			throw `Sorry, you're too young to give out a gift. Maybe next year?`;
		}

		await msg.author.settings.sync(true);

		if (
			msg.author.settings
				.get(UserSettings.BitField)
				.includes(BitField.HasGivenBirthdayPresent)
		) {
			throw `You have already given out a Birthday Present! :(`;
		}

		if (this.client.oneCommandAtATimeCache.has(user.id)) throw `That user is busy right now.`;
		if (user.id === msg.author.id) throw `You can't give a present to yourself!`;
		if (user.bot) throw `You can't give a present to a bot!`;

		await msg.author.settings.update(UserSettings.BitField, BitField.HasGivenBirthdayPresent, {
			arrayAction: 'add'
		});

		await user.addItemsToBank({ 11918: 1 });

		this.client.emit(
			Events.Log,
			`${msg.author.sanitizedName} gave gift to ${user.sanitizedName}`
		);

		const channel = this.client.channels.get(Channel.Notifications);
		if (channel)
			(channel as TextChannel).send(
				`${Emoji.BirthdayPresent} ${msg.author.username} just gave a gift to ${user.username}!`
			);

		return msg.send(
			`You gave a present to ${user} ${Emoji.BirthdayPresent}! You can open this present with \`${msg.cmdPrefix}open present\``
		);
	}
}
