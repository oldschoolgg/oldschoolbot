import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { rand, sleep, multiplyBank } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(msg: KlasaMessage) {
		const number = rand(1, 100);
		await msg.author.settings.sync(true);
		await msg.channel.send(
			`You pick up the dice, and throw them up high in the air.....they slowly fall to the ground and come to a halt...`
		);
		await sleep(5000);

		const bank = msg.author.settings.get(UserSettings.Bank);
		if (number < 60) {
			await msg.author.settings.reset(['bank', 'GP']);
			return msg.channel.sendBankImage({
				content: `You lose your entire bank! Heres an image for you to remember what you lost...`,
				bank: { ...bank, 995: msg.author.settings.get(UserSettings.GP) },
				title: `Bank Lost by ${msg.author.username}`
			});
		}

		await msg.author.settings.update([
			['bank', multiplyBank(bank, 2)],
			['GP', msg.author.settings.get(UserSettings.GP) * 2]
		]);
		return msg.channel.send(`You win! Your bank has been multiplied by 2.`);
	}
}
