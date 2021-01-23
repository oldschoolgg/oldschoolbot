import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Events } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user> <amount:int{1}>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Pays GP to another user.',
			examples: ['+pay @Magnaboy 10m'],
			restrictedChannels: ['792691343284764693', '792692390778896424']
		});
	}

	async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get(UserSettings.GP);
		if (msg.author.isIronman) throw `Iron players can't send money.`;
		if (user.isIronman) throw `Iron players can't receive money.`;
		if (GP < amount) throw `You don't have enough GP.`;
		if (this.client.oneCommandAtATimeCache.has(user.id)) throw `That user is busy right now.`;
		if (user.id === msg.author.id) throw `You can't send money to yourself.`;
		if (user.bot) throw `You can't send money to a bot.`;

		await msg.author.removeGP(amount);
		await user.addGP(amount);

		this.client.emit(
			Events.EconomyLog,
			`${msg.author.sanitizedName} paid ${amount} GP to ${user.sanitizedName}.`
		);

		return msg.send(`You sent ${amount.toLocaleString()} GP to ${user}.`);
	}
}
