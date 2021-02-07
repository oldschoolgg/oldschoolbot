import { CommandStore, KlasaMessage } from 'klasa';
import Monster from 'oldschooljs/dist/structures/Monster';

import { Minigames } from '../../lib/minions/data/minigames';
import { requiresMinion } from '../../lib/minions/decorators';
import creatures from '../../lib/skilling/skills/hunter/creatures';
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
		const mon = [...KillableMonsters, NightmareMonster].find(
			mon =>
				stringMatches(mon.name, name) ||
				mon.aliases.some(alias => stringMatches(alias, name))
		);
		const minigame = Minigames.find(game => stringMatches(game.name, name));
		const creature = creatures.find(c => c.aliases.some(alias => stringMatches(alias, name)));

		if (!mon && !minigame && !creature) {
			return msg.send(`That's not a valid monster, minigame or hunting creature.`);
		}

		const kc = mon
			? msg.author.getKC((mon as unknown) as Monster)
			: minigame
			? msg.author.getMinigameScore(minigame!.id)
			: msg.author.getCreatureScore(creature!);

		return msg.send(
			`Your ${minigame ? minigame.name : mon ? mon!.name : creature?.name} KC is: ${kc}.`
		);
	}
}
