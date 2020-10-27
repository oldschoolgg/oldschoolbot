import { Command, CommandStore, KlasaMessage } from 'klasa';

import pets = require('../../../data/pets');
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'View the virtual pets you have.',
			cooldown: 3
		});
	}

	async run(msg: KlasaMessage) {
		const userPets = msg.author.settings.get(UserSettings.Pets);
		const keys = Object.keys(userPets);
		if (keys.length === 0) {
			return msg.send(`You have no pets yet.

You can get pets by talking in a server which has petmessages enabled. (\`${msg.cmdPrefix}petmessages enable\`)`);
		}

		const formatted = [];
		for (const key of keys) {
			const id = parseInt(key);
			const pet = pets.find(_pet => _pet.id === id)!;
			formatted.push(`${pet.emoji} ${pet.name}: ${userPets[id]}`);
		}

		return msg.send(formatted.join('\n'), { split: true });
	}
}
