import { CommandStore, KlasaMessage } from 'klasa';

import { getHalloweenPeople, keys } from '../lib/halloweenEvent';
import { minionNotBusy, requiresMinion } from '../lib/minions/decorators';
import { BotCommand } from '../lib/structures/BotCommand';
import { itemNameFromID } from '../lib/util';

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
		const halloweenData = getHalloweenPeople(msg.author);
		const { victim, suspects, murderers } = halloweenData;

		// you accused an innocent person! you feel a bit strange... and realize that time has been reversed, and you now have to find the killers again?!
		return msg.channel.send(
			`Can you solve the Murder Mystery? Two suspects worked together, to murder the owner the host of the party ${
				victim.person.name
			} while they were in their special ${
				victim.roomColor.name
			} room, everyone claims that they were sleeping in their own rooms when it happened. The guard has given you keys to access all the rooms to complete your investigation (${keys
				.map(i => i.item.name)
				.join(', ')}).

**Suspects:** ${suspects.map(sus => `${sus.person.name} (${sus.roomColor.name} room)`).join(', ')}
**Victim:** ${victim.person.name} was ${victim.person.word} in ${victim.person.gender === 'male' ? 'his' : 'her'} ${
				victim.roomColor.name
			} room.
            
            ${murderers.map(
				m => `${m.person.name} Room[${m.roomColor.name}][${m.roomColor.keys.map(itemNameFromID).join(', ')}]`
			)}`
		);
	}
}
