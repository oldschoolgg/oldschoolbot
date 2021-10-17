import { CommandStore, KlasaMessage } from 'klasa';

import { getHalloweenPeople, keys } from '../lib/halloweenEvent';
import { minionNotBusy, requiresMinion } from '../lib/minions/decorators';
import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			// usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to chop logs.',
			examples: ['+chop 100 logs', '+chop magic logs'],
			categoryFlags: ['skilling', 'minion']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		for (const id of [
			'157797566833098752',
			'729244028989603850',
			'829398443821891634',
			'303730326692429825',
			'266624760782258186',
			'719720369241718837',
			'720351927581278219'
		]) {
			getHalloweenPeople(Number(id));
		}
		const halloweenData = getHalloweenPeople(Number(msg.author.id));
		const { victim, suspects, murderers, witnessedAsInnocent } = halloweenData;
		console.log(`Murderers for ${msg.author.username} are: ${murderers.map(m => m.person.name)}`);
		// you accused an innocent person! you feel a bit strange... and realize that time has been reversed, and you now have to find the killers again?!
		return msg.channel.send(
			`Can you solve the Murder Mystery? Two suspects worked together, to murder the owner the host of the party, ${
				victim.person.name
			}, while they were in their special ${
				victim.roomColor.name
			} room, everyone claims that they were sleeping in their own rooms when it happened, the guard was with ${witnessedAsInnocent
				.map(i => i.person.name)
				.join(
					', '
				)} when it happened. The guard has given you keys to access all the rooms to complete your investigation (${keys
				.map(i => i.item.name)
				.join(', ')}).

**Suspects:** ${suspects.map(sus => `${sus.person.name} (${sus.roomColor.name} room)`).join(', ')}
**Victim:** ${victim.person.name} was ${victim.person.word} in ${victim.person.gender === 'male' ? 'his' : 'her'} ${
				victim.roomColor.name
			} room.`
		);
	}
}
