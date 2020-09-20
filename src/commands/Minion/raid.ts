import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks, Time } from '../../lib/constants';
import { MakePartyOptions } from '../../lib/types';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			permissionLevel: 10
		});
	}

	async checkUsers(users: readonly KlasaUser[]) {
		for (const user of users) {
			if (user.hasMinion) {
				throw `${user.username} can't do raids, because they don't have a minion.`;
			}
			if (user.minionIsBusy) throw `${user.username} is busy and can't join the raid.`;
		}
	}

	async run(msg: KlasaMessage) {
		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 50,
			message: `${msg.author.username} is starting a party to defeat the Chambers of Xeric! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const duration =
			Time.Minute * 20 +
			(Time.Minute * 40 - users.length * (Time.Minute * 2)) +
			rand(Time.Minute * 2, Time.Minute * 10);

		const data: RaidsActivityTaskOptions = {
			duration,
			challengeMode: false,
			channelID: msg.channel.id,
			quantity: 1,
			partyLeaderID: msg.author.id,
			userID: msg.author.id,
			type: Activity.Raids,
			id: rand(1, 10_000_000).toString(),
			finishDate: Date.now() + duration,
			team: users.map(u => ({
				id: u.id,
				personalPoints: 30_000,
				canReceiveDust: rand(1, 10) <= 7,
				canReceiveAncientTablet: u.hasItemEquippedOrInBank('Ancient tablet')
			}))
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		return msg.send(
			`The raid is starting... the leader is ${
				msg.author.username
			}, and the party members are: ${users.map(u => u.username).join(', ')}.`
		);
	}
}
