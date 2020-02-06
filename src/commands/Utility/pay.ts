import { KlasaClient, CommandStore, KlasaUser, KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import { Events, UserSettings, Time, Channel } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user> <amount:int{1}>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get('GP');
		if (GP < amount) throw `You don't have enough GP.`;
		if (this.client.oneCommandAtATimeCache.has(user.id)) throw `That user is busy right now.`;
		if (user.id === msg.author.id) throw `You can't send money to yourself.`;
		if (user.bot) throw `You can't send money to a bot.`;
		if (
			Date.now() - msg.author.settings.get(UserSettings.LastDailyTimestamp) <
			Time.Minute * 1
		) {
			(this.client.channels.get(Channel.ErrorLogs) as TextChannel).send(
				`(${msg.author.sanitizedName})[${msg.author.id}] paid daily to (${user.sanitizedName})[${user.id}]`
			);
		}

		await msg.author.removeGP(amount);
		await user.addGP(amount);
		this.client.emit(
			Events.Log,
			`${msg.author.sanitizedName} sent ${amount} to ${user.sanitizedName}`
		);
		return msg.send(`You sent ${amount.toLocaleString()} GP to ${user}.`);
	}
}
