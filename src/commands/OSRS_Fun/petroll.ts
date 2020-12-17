import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import pets from '../../lib/pets';
import { roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Rolls a chance at getting every Pet at once.',
			cooldown: 5,
			oneAtTime: true,
			usage: '<amount:int{1,100}>',
			examples: ['+petroll 1'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		const received = [];

		for (let i = 0; i < amount; i++) {
			for (const pet of pets) {
				if (roll(pet.chance)) received.push(pet.emoji);
			}
		}

		if (received.length === 0) return msg.send("You didn't get any pets!");
		return msg.send(received.join(' '));
	}
}
