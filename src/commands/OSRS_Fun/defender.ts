import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Simulates how long it takes you to get all the defenders.',
			examples: ['+defender'],
			categoryFlags: ['fun', 'simulation']
		});
	}

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
