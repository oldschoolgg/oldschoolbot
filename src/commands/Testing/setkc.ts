import { CommandStore, KlasaMessage } from 'klasa';

import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<monster:str> <kc:int{0,5000}>',
			usageDelim: ',',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [name, kc]: [string, number]) {
		const mon = effectiveMonsters.find(m =>
			m.aliases.some(alias => stringMatches(alias, name))
		);
		if (!mon) {
			return msg.channel.send(`Thats not a valid monster.`);
		}
		const currentMonsterScores = {
			...msg.author.settings.get(UserSettings.MonsterScores)
		};
		currentMonsterScores[mon.id] = kc;
		await msg.author.settings.update(UserSettings.MonsterScores, currentMonsterScores);
		return msg.send(`Set your ${mon.name} KC to ${kc}.`);
	}
}
