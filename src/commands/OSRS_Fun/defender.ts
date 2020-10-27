import { Command, KlasaMessage } from 'klasa';

import { roll } from '../../lib/util';

export default class extends Command {
	async run(msg: KlasaMessage) {
		let KC = 0;
		let DKC = 0;
		let defenders = 0;
		while (defenders < 7) {
			if (roll(50)) {
				defenders++;
				KC++;
				continue;
			}
			KC++;
		}
		while (defenders < 8) {
			if (roll(100)) {
				defenders++;
				DKC++;
				continue;
			}
			DKC++;
		}
		return msg.send(
			`You had to kill ${KC} Cyclops to get up to a Rune Defender, and then another ${DKC} for the Dragon Defender.`
		);
	}
}
