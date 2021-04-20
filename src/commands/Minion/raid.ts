import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji, Time } from '../../lib/constants';
import { calculateUserGearPercents, hasMinRaidsRequirements } from '../../lib/data/cox';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { RaidsOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[mass|solo]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	checkReqs(users: KlasaUser[], solo: boolean) {
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} doesn't have a minion, so they can't join!`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy right now and can't join!`;
			}

			if (!hasMinRaidsRequirements(user, solo)) {
				throw `${user.username} doesn't meet the minimum requirements to raid.`;
			}
		}
	}

	async run(msg: KlasaMessage, [type]: [string | undefined]) {
		if (!type || (type !== 'mass' && type !== 'solo')) {
			return msg.send(`Specify your team setup for Chambers of Xeric, either solo or mass.`);
		}

		this.checkReqs([msg.author], type === 'solo');

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 15,
			ironmanAllowed: true,
			message: `${msg.author.username} is hosting a Chambers of Xeric mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];
		let debugStr = '';
		let duration = Time.Minute * 50;
		const isSolo = users.length === 1;

		await addSubTaskToActivityTask<RaidsOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.Raids,
			leader: msg.author.id,
			users: users.map(u => u.id),
			challengeMode: false
		});

		let str = isSolo
			? `${
					msg.author.minionName
			  } is now doing a Chambers of Xeric raid. The total trip will take ${formatDuration(
					duration
			  )}`
			: `${partyOptions.leader.username}'s party (${users
					.map(u => u.username)
					.join(
						', '
					)}) is now off to do a Chambers of Xeric raid - the total trip will take ${formatDuration(
					duration
			  )}.`;

		str += '\n\nGearStats: ';
		for (const u of users) {
			const i = calculateUserGearPercents(u);
			str += `${u.username}[Melee:${i.melee}%][Mage:${i.mage}%][Range:${i.range}%], `;
		}

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
