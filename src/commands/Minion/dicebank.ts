import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { rand, sleep, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(msg: KlasaMessage) {
		await msg.channel.send(
			`${msg.author} please type \`confirm\` to confirm you want to dice your bank. If you lose, your entire bank and gp will be deleted. If you win, both will be doubled. There is a 55% chance of losing, 45% chance of winning.`
		);
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: Time.Second * 15,
					errors: ['time']
				}
			);
		} catch (err) {
			return msg.channel.send(
				`${msg.author} has chickened out, and didn't confirm dicebank.`
			);
		}

		const number = rand(1, 100);
		await msg.author.settings.sync(true);
		await msg.channel.send(
			`You pick up the dice, and throw them up high in the air.....they slowly fall to the ground and come to a halt...`
		);
		await sleep(5000);

		const bank = msg.author.settings.get(UserSettings.Bank);
		if (number < 56) {
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
