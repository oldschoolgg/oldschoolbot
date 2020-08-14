import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Tasks, Time, Activity, Emoji } from '../../lib/constants';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { MakePartyOptions } from '../../lib/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			oneAtTime: true
		});
	}

	checkReqs(users: KlasaUser[]) {
		// Check if every user has the requirements for this raid.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} can't do raids, because they don't have a minion.`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy and can't join the raid.`;
			}
		}
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		this.checkReqs([msg.author]);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 50,
			message: `${msg.author.username} is starting a party to defeat the Chambers of Xeric! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
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

		const users = await msg.makePartyAwaiter(partyOptions);

		let duration;
		if (users.length <= 10) {
			duration =
			Time.Minute * 20 +
			(Time.Minute * 40 - users.length * (Time.Minute * 3)) +
			rand(Time.Minute * 2, Time.Minute * 10);
		}
		else if (users.length <= 20) {
			duration =
			Time.Minute * 20 +
			(Time.Minute * 35 - users.length * (Time.Minute * 2)) +
			rand(Time.Minute * 2, Time.Minute * 10);
		}
		else {
			duration =
			Time.Minute * 20 +
			(Time.Minute * 35 - users.length * (Time.Minute * 1)) +
			rand(Time.Minute * 2, Time.Minute * 10);
		}

		this.checkReqs(users);

		const data: RaidsActivityTaskOptions = {
			duration,
			challengeMode: false,
			channelID: msg.channel.id,
			quantity: 1,
			partyLeaderID: msg.author.id,
			userID: msg.author.id,
			type: Activity.Raids,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration,
			users: users.map(u => u.id),
			team: users.map(u => ({
				id: u.id,
				personalPoints: 30_000,
				canReceiveDust: rand(1, 10) <= 7,
				canReceiveAncientTablet: u.hasItemEquippedOrInBank('Ancient tablet')
			}))
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`The raid is starting... the leader is ${
				msg.author.username
			}, and the party members are: ${users.map(u => u.username).join(', ')}.`
		);
	}
}
