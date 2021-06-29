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

		const { potionsToAdd, potionsToRemove, sumOfPots, potionName } = decantPotionFromBank(userBank, itemName, dose);

		await msg.author.exchangeItemsFromBank({ costBank: potionsToRemove, lootBank: potionsToAdd });
		if (
			msg.author.hasItemEquippedAnywhere(['Iron dagger', 'Bronze arrow'], true) &&
			!msg.author.hasItemEquippedOrInBank('Clue hunter gloves')
		) {
			await msg.author.addItemsToBank(new Bank({ 'Clue hunter gloves': 1 }), true);
			msg.channel.send(
				'\n\nWhile decanting some potions, you find a pair of gloves on the floor and pick them up.'
			);
		}

		return msg.channel.send(
			`You decanted **${sumOfPots}x ${potionName}${sumOfPots > 0 ? 's' : ''}** into **${new Bank(
				potionsToAdd
			)}**.`
		);
	}
}
