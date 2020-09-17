import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lapcounts']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage): Promise<KlasaMessage> {
		const entries = Object.entries(
			msg.author.settings.get(UserSettings.LapsScores)
		).map(arr => [parseInt(arr[0]), arr[1]]);
		if (entries.length === 0) {
			throw `You haven't done any laps yet! Sad.`;
		}
		const data = entries.map(
			([id, qty]) => `**${Agility.Courses.find(c => c.id === id)!.name}:** ${qty}`
		);
		return msg.send(data.join('\n'));
	}
}
