import { Inhibitor, KlasaMessage } from 'klasa';

import { roll } from '../util';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (msg.author.settings.get('troll') && roll(4)) {
			throw `${msg.author}, No.`;
		}
	}
}
