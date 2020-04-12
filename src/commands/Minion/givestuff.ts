import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<quantity:int{1}>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity]: [number]) {
		await msg.author.addGP(quantity);
		await msg.author.addSlayerPoints(quantity);
		const loot = {
			[itemID('Armadyl chestplate')]: quantity
		};
		loot[itemID('Armadyl chainskirt')] = quantity;
		loot[itemID('Anti-dragon shield')] = quantity;
		await msg.author.addItemsToBank(loot, true);
		return msg.send(`Goodluck trying to dice the gp lmfao`);
	}
}
