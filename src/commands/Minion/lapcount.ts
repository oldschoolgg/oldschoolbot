import { CommandStore, KlasaMessage } from 'klasa';

import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lapcounts'],
			description: 'Shows your agility course lapcounts.',
			examples: ['+lapcounts'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage): Promise<KlasaMessage> {
		const entries = Object.entries(msg.author.settings.get(UserSettings.LapsScores)).map(arr => [
			parseInt(arr[0]),
			arr[1]
		]);
		const sepulchreCount = await msg.author.getMinigameScore('sepulchre');
		if (sepulchreCount === 0 && entries.length === 0) {
			return msg.channel.send("You haven't done any laps yet! Sad.");
		}
		const data = `${entries
			.map(([id, qty]) => `**${Agility.Courses.find(c => c.id === id)!.name}:** ${qty}`)
			.join('\n')}\n**Hallowed Sepulchre:** ${await sepulchreCount}`;
		return msg.channel.send(data);
	}
}
