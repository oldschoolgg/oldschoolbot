import { CommandStore, KlasaMessage } from 'klasa';
import Monster from 'oldschooljs/dist/structures/Monster';

import { Minigames } from '../../lib/minions/data/minigames';
import { requiresMinion } from '../../lib/minions/decorators';
import { NexMonster } from '../../lib/nex';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import KillableMonsters, { NightmareMonster } from './../../lib/minions/data/killableMonsters';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:string>',
			description: "Shows your minions' KC for monsters/bosses.",
			examples: ['+kc vorkath', '+kc bandos'],
			categoryFlags: ['minion', 'pvm']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage> {
		const mon = [...KillableMonsters, NightmareMonster, NexMonster].find(
			mon =>
				stringMatches(mon.name, name) ||
				mon.aliases.some(alias => stringMatches(alias, name))
		);
		const minigame = Minigames.find(game => stringMatches(game.name, name));

		if (!mon && !minigame) {
			return msg.send(`That's not a valid monster or minigame.`);
		}

		const kc = mon
			? msg.author.getKC((mon as unknown) as Monster)
			: msg.author.getMinigameScore(minigame!.id);

		return msg.send(`Your ${minigame ? minigame.name : mon!.name} KC is: ${kc}.`);
	}
}
