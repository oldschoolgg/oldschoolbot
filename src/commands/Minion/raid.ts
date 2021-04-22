import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { table } from 'table';

import { Activity, Emoji } from '../../lib/constants';
import {
	calcCoxDuration,
	calcCoxInput,
	calculateUserGearPercents,
	checkCoxTeam,
	createTeam,
	hasMinRaidsRequirements,
	minimumCoxSuppliesNeeded
} from '../../lib/data/cox';
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

	checkReqs(users: KlasaUser[]) {
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} doesn't have a minion, so they can't join!`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy right now and can't join!`;
			}

			if (!hasMinRaidsRequirements(user)) {
				throw `${user.username} doesn't meet the minimum requirements to raid.`;
			}
		}
	}

	async run(msg: KlasaMessage, [type]: [string | undefined]) {
		if (msg.flagArgs.simulate) {
			const arr = Array(20).fill(msg.author);
			const normalTable = table([
				[
					'Team Size',
					'Duration - Normal',
					'Points - Normal',
					'Death Chance - Normal',
					'Duration - Challenge Mode',
					'Points - Challenge Mode',
					'Death Chance - Normal'
				],
				...(await Promise.all(
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(async i => {
						let ar = arr.slice(0, i);
						return [
							ar.length,
							formatDuration((await calcCoxDuration(ar, false)).duration),
							(await createTeam(ar, false))[0].personalPoints.toLocaleString(),
							`${(await createTeam(ar, false))[0].deathChance}%`,
							formatDuration((await calcCoxDuration(ar, true)).duration),
							(await createTeam(ar, true))[0].personalPoints.toLocaleString(),
							`${(await createTeam(ar, false))[0].deathChance}%`
						];
					})
				))
			]);
			return msg.channel.sendFile(Buffer.from(normalTable), `cox-sim.txt`);
		}

		if (!type || (type !== 'mass' && type !== 'solo')) {
			return msg.send(`Specify your team setup for Chambers of Xeric, either solo or mass.`);
		}

		const userKC = await msg.author.getMinigameScore('Raids');
		if (userKC < 10 && type === 'solo') {
			return msg.channel.send(`You need atleast 10 KC before you can attempt a solo raid.`);
		}

		const isChallengeMode = Boolean(msg.flagArgs.cm);

		this.checkReqs([msg.author]);

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

				if (!user.owns(minimumCoxSuppliesNeeded)) {
					return [
						true,
						`You don't have enough items, you need a minimum of this amount of items: ${minimumCoxSuppliesNeeded}.`
					];
				}

				const { total } = calculateUserGearPercents(user);
				if (total < 20) {
					return [
						true,
						`Your gear is terrible! You do not stand a chance in the Chambers of Xeric`
					];
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];

		const teamCheckFailure = checkCoxTeam(users);
		if (teamCheckFailure) {
			return msg.channel.send(
				`Your mass failed to start because of this reason: ${teamCheckFailure}.`
			);
		}

		const { duration, messages } = await calcCoxDuration(users, isChallengeMode);

		let debugStr = '';
		const isSolo = users.length === 1;
		await Promise.all(
			users.map(async u => {
				const supplies = await calcCoxInput(u, false);
				await u.removeItemsFromBank(supplies);
				debugStr += `\n${u.username} used ${supplies}`;
			})
		);

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
			str += `${u.username}[Melee:${i.melee.toFixed(2)}%][Mage:${i.mage.toFixed(
				2
			)}%][Range:${i.range.toFixed(2)}%][Total:${i.total.toFixed(2)}%] `;
		}

		str += ` \n\n${debugStr}`;
		str += `\n${messages.join(', ')}`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
