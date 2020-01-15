import { KlasaClient, CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Events } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			usage: '<user:user> <amount:int{1}>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5
		});
	}

	async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get('GP');
		if (GP < amount) throw `You don't have enough GP.`;
		if (user.id === msg.author.id) throw `You can't send money to yourself.`;
		if (user.bot) throw `You can't send money to a bot.`;
		await msg.author.removeGP(amount);
		await user.addGP(amount);
		this.client.emit(
			Events.Log,
			`${msg.author.sanitizedName} sent ${amount} to ${user.sanitizedName}`
		);
		return msg.send(`You sent ${amount.toLocaleString()} GP to ${user}.`);
	}
}
