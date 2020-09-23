import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import Potions from '../../lib/minions/data/potions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addBanks, removeBankFromBank, stringMatches } from '../../lib/util';
import createReadableItemListFromTuple from '../../lib/util/createReadableItemListFromTuple';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[dose:int{1,4}] <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [dose = 4, itemName]: [1 | 2 | 3 | 4, string]) {
		const potionToDecant = Potions.find(pot => stringMatches(pot.name, itemName));
		if (!potionToDecant) {
			throw `You can't decant that!`;
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const potionsBank: ItemBank = {};
		const newPotions: ItemBank = {};
		let sumOfPots = 0;
		let totalDosesToCreate = 0;

		for (let i = 0; i < potionToDecant.items.length; i++) {
			if (i === dose - 1) continue;
			potionsBank[potionToDecant.items[i]] = userBank[potionToDecant.items[i]] ?? 0;
			sumOfPots += potionsBank[potionToDecant.items[i]];
			totalDosesToCreate += potionsBank[potionToDecant.items[i]] * (i + 1);
		}

		if (!totalDosesToCreate) {
			throw `You don't have any **${potionToDecant.name}** to decant!`;
		}

		const newPotionDoseRequested = Math.floor(totalDosesToCreate / dose);
		const leftOverDoses = totalDosesToCreate % dose;
		if (newPotionDoseRequested) {
			newPotions[potionToDecant.items[dose - 1]] = newPotionDoseRequested;
		}
		if (leftOverDoses) {
			newPotions[potionToDecant.items[leftOverDoses - 1]] = 1;
		}

		const resultString = await createReadableItemListFromTuple(this.client, newPotions);

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([newPotions, removeBankFromBank(userBank, potionsBank)])
		);

		return msg.send(
			`You decanted **${sumOfPots}x ${potionToDecant.name}${
				sumOfPots > 0 ? 's' : ''
			}** into **${resultString}**.`
		);
	}
}
