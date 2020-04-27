import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import findMonster from '../../lib/minions/functions/findMonster';
import { minionNotBusy } from '../../lib/minions/decorators';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<monster:string> <quantity:int> <users:...user>',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true
		});
	}

	@minionNotBusy
	async run(
		msg: KlasaMessage,
		[monsterName, qty, users]: [string, number, readonly KlasaUser[]]
	) {
		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;

		// Check if every user has the requirements for this monster.
		for (const user of users) {
			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			users,
			minSize: 1,
			maxSize: 10,
			message: `${users
				.map(u => u.username)
				.join(', ')} - Do you want to join Magnaboy's party to kill ${qty}x ${
				monster.name
			}? Say \`join\` to join.`,

			joinWord: 'join'
		};

		try {
			await msg.makeInviteParty(partyOptions);
		} catch (err) {
			return msg.send(err.message);
		}

		return msg.send(
			`${partyOptions.leader.username}'s party is now off to kill ${qty}x ${monster.name}`
		);
	}
}
