import { CommandStore, KlasaMessage } from 'klasa';

import { getSimilarItems } from '../../lib/data/similarItems';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID, itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		const similar = getSimilarItems(itemID('Drygore longsword (ice)'));

		return msg.send(similar.map(itemNameFromID));
	}
}
