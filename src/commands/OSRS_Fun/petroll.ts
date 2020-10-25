import { Command, CommandStore, KlasaMessage } from 'klasa';

import pets = require('../../../data/pets');
import { roll } from '../../lib/util';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Rolls a chance at getting every Pet at once.',
			usage: '<amount:int{1,100}>'
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
