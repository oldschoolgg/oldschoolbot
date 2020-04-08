import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { removeDuplicatesFromArray, rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Tasks, Time, Activity } from '../../lib/constants';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<solo|party|mass> [users:...user]',
			usageDelim: ' ',
			subcommands: true,
			permissionLevel: 10
		});
	}

	async checkUsers(users: readonly KlasaUser[]) {
		for (const user of users) {
			if (user.bot) throw `${user.username} can't do raids, because they're a bot.`;
			if (user.minionIsBusy) throw `${user.username} is busy and can't join the raid.`;
		}
	}

	async cleanUpParty(msg: KlasaMessage, users: readonly KlasaUser[]) {
		const newUsers = removeDuplicatesFromArray(users.filter(user => user.id !== msg.author.id));

		if (users.length === 0) {
			throw `Please specify which users you want in your party, by tagging them all.`;
		}

		if (users.length > 50) {
			throw `You can't have more than 50 people in a raid!.`;
		}

		newUsers.push(msg.author);

		await this.checkUsers(newUsers);

		return newUsers;
	}

	async party(msg: KlasaMessage, [users]: [readonly KlasaUser[]]) {
		let newUsers: KlasaUser[] | undefined;
		try {
			newUsers = await this.cleanUpParty(msg, users);
		} catch (err) {
			return msg.send(err);
		}

		const usersWithoutLeader = newUsers.filter(user => user.id !== msg.author.id);
		if (usersWithoutLeader.length === 0) {
			return msg.send(`You need to invite some people to your party.`);
		}

		const confirmationMessage = `${usersWithoutLeader
			.map(u => u.username)
			.join(', ')} - Do you wish to join ${
			msg.author.username
		}'s Party, to do a Group Raid? Please reply with \`raid\` to confirm you want to join the party. You have **30 seconds** to accept.`;

		const confirmMessage = await msg.channel.send(confirmationMessage);
		const usersWhoConfirmed: KlasaUser[] = [];

		try {
			const confirmMessages = await msg.channel.awaitMessages(
				_msg => {
					if (
						usersWithoutLeader.includes(_msg.author) &&
						_msg.content.toLowerCase() === 'raid'
					) {
						usersWhoConfirmed.push(_msg.author);
						confirmMessage.edit(
							`${confirmationMessage}\n\nConfirmed Users: ${usersWhoConfirmed
								.map(u => u.username)
								.join(', ')}`
						);
						return true;
					}
					return false;
				},
				{
					max: usersWithoutLeader.length,
					time: 45_000,
					errors: ['time']
				}
			);
			if (confirmMessages.size !== usersWithoutLeader.length) {
				throw `The party invite wasn't accepted by everyone.`;
			}
			for (const user of usersWithoutLeader) {
				if (!confirmMessages.some(_msg => _msg.author.id === user.id)) {
					throw `${user.username} didn't accept the invite.`;
				}
			}
		} catch (err) {
			return msg.send(
				typeof err === 'string'
					? err
					: 'The time ran out, not everyone accepted the invite.'
			);
		}

		const duration = Number(Time.Minute);

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
			team: newUsers.map(u => ({
				id: u.id,
				personalPoints: 20_000,
				canReceiveDust: false,
				canReceiveAncientTablet: false
			}))
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		return msg.send(
			`The raid is starting... the leader is ${
				msg.author.username
			}, and the party members are: ${usersWithoutLeader.map(u => u.username).join(', ')}`
		);
	}
}
