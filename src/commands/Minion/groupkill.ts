import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import findMonster from '../../lib/minions/functions/findMonster';
import { minionNotBusy } from '../../lib/minions/decorators';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { Activity, Tasks } from '../../lib/constants';
import { rand, calcPercentOfNum, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int] <monster:string> <users:...user>',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true
		});
	}

	@minionNotBusy
	async run(
		msg: KlasaMessage,
		[quantity, monsterName, users]: [number | undefined, string, KlasaUser[]]
	) {
		users.push(msg.author);

		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;

		// Check if every user has the requirements for this monster.
		for (const user of users) {
			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs && 1 < 0) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}
		}

		let perKillTime = monster.timeToFinish;

		for (let i = 0; i < users.length; i++) {
			perKillTime -= calcPercentOfNum(20, perKillTime);
		}

		const maxQty = Math.floor(msg.author.maxTripLength / (perKillTime + monster.respawnTime!));
		if (!quantity) quantity = maxQty;

		if (quantity > maxQty) {
			throw `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
		}

		const duration = maxQty * (perKillTime + monster.respawnTime!) - monster.respawnTime!;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			users,
			minSize: 1,
			maxSize: 10,
			message: `${users
				.map(u => u.username)
				.join(', ')} - Do you want to join Magnaboy's party to kill ${quantity}x ${
				monster.name
			}? Say \`join\` to join.`,

			joinWord: 'join'
		};

		try {
			await msg.makeInviteParty(partyOptions);
		} catch (err) {
			return msg.send(err.message);
		}

		const data: GroupMonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GroupMonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + 1000,
			leader: msg.author.id,
			users: users.map(u => u.id)
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.send(
			`${partyOptions.leader.username}'s party is now off to kill ${quantity}x ${
				monster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				monster.timeToFinish
			)} - the total trip will take ${formatDuration(duration)}`
		);
	}
}
