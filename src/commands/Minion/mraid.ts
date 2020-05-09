import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { removeDuplicatesFromArray, rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Tasks, Time, Activity } from '../../lib/constants';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { minimumMeleeGear, minimumMageGear, minimumRangeGear } from '../../lib/gear/raidsGear';
import { MinigameIDEnum } from '../../lib/minigames';
import {
	getMeleeContribution,
	getMageContribution,
	getRangeContribution,
	getGearMultiplier,
	getKcMultiplier
} from '../../lib/minions/functions/raidsCalculations';
import { TeamMember } from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';
import { UserSettings } from '../../lib/settings/types/UserSettings';

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

	calculateUsersPoints(user: KlasaUser) {
		const KC = user.getMinigameKC(MinigameIDEnum.Raids);
		const pointsFromGear = 15_000;
		const pointsFromKC = KC * 5;

		return pointsFromGear + pointsFromKC;
	}

	checkUsersGear(user: KlasaUser): [boolean, string] {
		this.calculateUsersPoints(user);
		const { meleeGear, mageGear, rangeGear } = user.getCombatGear();

		if (getMeleeContribution(meleeGear) < getMeleeContribution(minimumMeleeGear)) {
			return [false, `Melee`];
		}

		if (getMageContribution(mageGear) < getMageContribution(minimumMageGear)) {
			return [false, `Mage`];
		}

		if (getRangeContribution(rangeGear) < getRangeContribution(minimumRangeGear)) {
			return [false, `Range`];
		}

		return [true, ''];
	}

	async checkUsers(users: readonly KlasaUser[]) {
		for (const user of users) {
			if (user.bot) throw `${user.username} can't do raids, because they're a bot.`;
			if (user.minionIsBusy) throw `${user.username} is busy and can't join the raid.`;
			const [hasReqGear, reason] = this.checkUsersGear(user);
			if (!hasReqGear) {
				throw `${user.username}'s ${reason} gear doesn't meet the minimum requirements.`;
			}
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

	async mass(msg: KlasaMessage) {
		const duration = Number(Time.Minute);
		await msg.channel.messages.fetch({ limit: 100 });
		const members = [
			...new Set(
				msg.channel.messages
					.first(100)
					.filter(u => !u.author.bot)
					.map(m => m.author)
					.sort(() => {
						return 0.5 - Math.random();
					})
			)
		].slice(0, 10);

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
			team: members.map(u => ({
				id: u.id,
				personalPoints: 30_000,
				canReceiveDust: true,
				canReceiveAncientTablet: false
			}))
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		return msg.send(
			`The raid is starting... the leader is ${
				msg.author.username
			}, and the party members are: ${members.map(u => u.username).join(', ')}`
		);
	}

	async party(msg: KlasaMessage, [users = []]: [readonly KlasaUser[]]) {
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

		const BASE_POINTS = 8_000;
		let teamMembers: TeamMember[] = [];
		let teamMultiplier = 0;
		for (const user of newUsers) {
			const userGearMultiplier = getGearMultiplier(user.getCombatGear());
			const userKcMultiplier = getKcMultiplier(
				// TODO: use correct kc lookup value
				user.settings.get(UserSettings.MonsterScores)[1]
			);
			const userMultiplier = userGearMultiplier + userKcMultiplier + 1;
			const userPoints = BASE_POINTS * userMultiplier;
			teamMultiplier += userMultiplier;
			teamMembers = teamMembers.concat([
				{
					id: user.id,
					personalPoints: userPoints
				}
			]);
		}

		const BASE_TIME = 100 * Time.Minute;
		const duration = BASE_TIME * (newUsers.length / teamMultiplier);

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
			team: teamMembers
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		return msg.send(
			`The raid is starting... the leader is ${
				msg.author.username
			}, and the party members are: ${usersWithoutLeader.map(u => u.username).join(', ')}`
		);
	}
}
