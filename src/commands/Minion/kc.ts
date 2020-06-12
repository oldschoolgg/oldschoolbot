import { KlasaMessage, CommandStore } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<monsterName:string>'
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [monsterName]: [string]): Promise<KlasaMessage> {
		const mon = Monsters.find(
			mon =>
				stringMatches(mon.name, monsterName) ||
				mon.aliases.some(alias => stringMatches(alias, monsterName))
		);
		if (!mon) {
			throw `That's not a valid monster.`;
		}
		const kc = msg.author.getKC(mon);
		return msg.send(`Your ${mon.name} KC is: ${kc}.`);
	}
}
