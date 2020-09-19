import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import Potions from '../../lib/minions/data/potions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addItemToBank, stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [itemName]: [string]) {
		const potionToDecant = Potions.find(pot => stringMatches(pot.name, itemName));

		if (!potionToDecant) {
			throw `That item isn't decantable.`;
		}

		await msg.author.settings.sync(true);
		const bank = msg.author.settings.get(UserSettings.Bank);
		let newBank: ItemBank = { ...bank };
		let leftOverMessage = '';

		let totalDecantedDoses = 0;
		const potionTiers = potionToDecant.items as number[];
		const firstThreePotionTiers = potionTiers.slice(0, 3);

		for (const pot of firstThreePotionTiers) {
			const qty = bank[pot];
			if (!qty) continue;
			totalDecantedDoses += (potionTiers.indexOf(pot) + 1) * qty;
		}

		const totalDecantedPotions = Math.floor(totalDecantedDoses / 4);
		const dosesToGiveBack = totalDecantedDoses % 4;

		if (totalDecantedPotions < 1) {
			throw `You don't have any potions to decant!`;
		}

		for (const pot of firstThreePotionTiers) {
			newBank[pot] = 0;
		}
		newBank = addItemToBank(newBank, potionTiers[3], totalDecantedPotions);
		if (dosesToGiveBack > 0) {
			newBank = addItemToBank(newBank, potionTiers[dosesToGiveBack - 1]);
			leftOverMessage = `, with a ${potionToDecant.name}(${dosesToGiveBack}) left over.`;
		}

		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`Decanted all your ${potionToDecant.name}'s into ${totalDecantedPotions}x (4) doses${leftOverMessage}`
		);
	}
}
