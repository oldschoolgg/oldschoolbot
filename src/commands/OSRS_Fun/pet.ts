import { Command, CommandStore, KlasaMessage } from 'klasa';
import { cleanString } from 'oldschooljs/dist/util';

import pets = require('../../../data/pets');

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Rolls a singular pet until you get it and shows the KC/Rolls',
			usage: '<petName:str>'
		});
	}

	async run(msg: KlasaMessage, [petName]: [string]) {
		const cleanName = cleanString(petName);

		const pet = pets.find(
			_pet => cleanString(_pet.name) === cleanName || _pet.altNames.includes(cleanName)
		);
		if (!pet) return msg.send("I don't recognize that pet!");

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const count = pet.finish();

		return msg.send(pet.formatFinish(count));
	}
}
