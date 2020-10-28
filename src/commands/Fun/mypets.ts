import { CommandStore, KlasaMessage } from 'klasa';

import pets from '../../../data/pets';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description:
				'View the virtual pets you have, which are not the pets in your bank or from your minion.',
			cooldown: 3,
			examples: ['+mypets']
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
