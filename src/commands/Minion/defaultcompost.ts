import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { CompostTier } from '../../lib/farming/types';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[CompostTier:...string|null]',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Changes which compost type to automatically use while farming.',
			examples: ['+defaultcompost supercompost']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [newCompostTier]: [CompostTier | undefined]) {
		await msg.author.settings.sync(true);

		const currentCompostTier = msg.author.settings.get(UserSettings.Minion.DefaultCompostToUse);

		if (newCompostTier === undefined) {
			return msg.send(`Your current default to automatically use is ${currentCompostTier}.`);
		}

		if (currentCompostTier !== newCompostTier) {
			await msg.author.settings.update(
				UserSettings.Minion.DefaultCompostToUse,
				newCompostTier
			);

			return msg.send(
				`Your minion will now automatically use ${newCompostTier} for farming, if you have any.`
			);
		}
		return msg.send(`You are already automatically using this type of compost.`);
	}
}
