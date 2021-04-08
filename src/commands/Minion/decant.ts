import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import decantPotionFromBank from '../../lib/minions/functions/decantPotionFromBank';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[dose:int{1,4}] <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Allows you to decant potions into 4-doses, or any dosage.',
			examples: ['+decant prayer potion'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [dose = 4, itemName]: [1 | 2 | 3 | 4, string]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		const { potionsToAdd, sumOfPots, potionName, finalUserBank } = decantPotionFromBank(
			userBank,
			itemName,
			dose
		);

		await msg.author.settings.update(UserSettings.Bank, finalUserBank);

		return msg.send(
			`You decanted **${sumOfPots}x ${potionName}${
				sumOfPots > 0 ? 's' : ''
			}** into **${new Bank(potionsToAdd)}**.`
		);
	}
}
