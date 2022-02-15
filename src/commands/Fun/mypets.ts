import { CommandStore, KlasaMessage } from 'klasa';

import pets from '../../lib/data/pets';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'View the virtual pets you have, which are not the pets in your bank or from your minion.',
			examples: ['+mypets'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage) {
		const userPets = msg.author.settings.get(UserSettings.Pets);
		const keys = Object.keys(userPets);
		const petMax = pets.length;
		if (keys.length === 0) {
			return msg.channel.send(`You have no pets yet.

You can get pets by talking in a server which has petmessages enabled. (\`${msg.cmdPrefix}petmessages enable\`)`);
		}

		const formatted = [];
		for (const key of keys) {
			const id = parseInt(key);
			const pet = pets.find(_pet => _pet.id === id)!;
			formatted.push(`${pet.emoji} ${pet.name}: ${userPets[id]}`);
		}
		const petCount = formatted.length;

		return msg.channel.send(`You currently have ${petCount}/${petMax}\n ${formatted.join('\n')}`);
	}
}
