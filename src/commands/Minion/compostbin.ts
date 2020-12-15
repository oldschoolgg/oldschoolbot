import { CommandStore, KlasaMessage } from 'klasa';
import { itemID } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addItemToBank, bankHasItem, removeItemFromBank, stringMatches } from '../../lib/util';

const SuperCompostables = [
	`Pineapple`,
	`Watermelon`,
	`Coconut`,
	`Coconut shell`,
	`Papaya fruit`,
	`Mushroom`,
	`Poison ivy berries`,
	`Jangerberries`,
	`White berries`,
	`Snape grass`,
	`Toadflax`,
	`Avantoe`,
	`Kwuarm`,
	`Snapdragon`,
	`Cadantine`,
	`Lantadyme`,
	`Dwarf weed`,
	`Torstol`,
	`Oak roots`,
	`Willow roots`,
	`Maple roots`,
	`Yew roots`,
	`Magic roots`,
	`Celastrus bark`,
	`Calquat fruit`,
	`White tree fruit`,
	`White lily`
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}|cropToCompost:...string] [cropToCompost:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Composts crops into supercompost.',
			examples: ['+compostbin watermelon']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [quantity, cropToCompost]: [null | number | string, string]) {
		await msg.author.settings.sync(true);

		if (typeof quantity === 'string') {
			cropToCompost = quantity;
			quantity = null;
		}

		if (!cropToCompost) {
			return msg.send(
				`You need to select a crop to compost. The crops you can compost are: ${SuperCompostables.join(
					', '
				)}.`
			);
		}

		const superCompostableCrop = SuperCompostables.find(crop =>
			stringMatches(crop, cropToCompost)
		);

		if (!superCompostableCrop) {
			return msg.send(
				`That's not a valid crop to compost. The crops you can compost are: ${SuperCompostables.join(
					', '
				)}.`
			);
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (quantity === null) {
			quantity = msg.author.numItemsInBankSync(itemID(superCompostableCrop));
		} else if (!bankHasItem(userBank, itemID(superCompostableCrop), quantity)) {
			return msg.send(
				`You do not have enough ${superCompostableCrop} to compost for the quantity specified`
			);
		}

		let newBank = userBank;
		newBank = await removeItemFromBank(newBank, itemID(superCompostableCrop), quantity);
		newBank = await addItemToBank(newBank, itemID(`Supercompost`), quantity);

		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`You've composted ${quantity}x ${superCompostableCrop} and received ${quantity}x Supercompost in return.`
		);
	}
}
