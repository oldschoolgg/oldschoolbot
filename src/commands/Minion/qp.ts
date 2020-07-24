import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['questpoints', 'qp'],
			usage: '[amount:int{-277,277}]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		await msg.author.settings.sync(true);
		const currentQP = msg.author.settings.get(UserSettings.QP);
		const newQP = Math.min(277, currentQP + amount);
		if (newQP < 0) {
			await msg.author.settings.update(UserSettings.QP, 0);
		} else if (newQP > 277) {
			await msg.author.settings.update(UserSettings.QP, 277);
		} else {
			await msg.author.settings.update(UserSettings.QP, Math.floor(newQP));
		}
	}
}
