import { CommandStore, KlasaMessage } from 'klasa';
import { table } from 'table';

import { Activity, Emoji } from '../../lib/constants';
import {
	calcCoxDuration,
	calcCoxInput,
	calculateUserGearPercents,
	checkCoxTeam,
	createTeam,
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
							`${(await createTeam(ar, true))[0].deathChance}%`
						];
					})
				))
			]);
			return msg.channel.sendFile(Buffer.from(normalTable), `cox-sim.txt`);
		}

		if (!type) {
			const [normal, cm] = await Promise.all([
				msg.author.getMinigameScore('Raids'),
				msg.author.getMinigameScore('RaidsChallengeMode')
			]);
			return msg.channel
				.send(`<:Twisted_bow:403018312402862081> Chamber's of Xeric <:Olmlet:324127376873357316>
**Normal:** ${normal} KC
**Challenge Mode:** ${cm} KC`);
		}

		if (!type || (type !== 'mass' && type !== 'solo')) {
			return msg.send(`Specify your team setup for Chamber's of Xeric, either solo or mass.`);
		}

		const isChallengeMode = Boolean(msg.flagArgs.cm);

		const userKC = await msg.author.getMinigameScore(
			isChallengeMode ? 'RaidsChallengeMode' : 'Raids'
		);
		if (!isChallengeMode && userKC < 50 && type === 'solo') {
			return msg.channel.send(`You need atleast 50 KC before you can attempt a solo raid.`);
		}

		if (isChallengeMode) {
			const normalKC = await msg.author.getMinigameScore('RaidsChallengeMode');
			if (normalKC < 200) {
				return msg.channel.send(
					`You need atleast 200 completions of the Chamber's of Xeric before you can attempt Challenge Mode.`
				);
			}
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 15,
			ironmanAllowed: true,
			message: `${msg.author.username} is hosting a Chamber's of Xeric mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
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
						`Your gear is terrible! You do not stand a chance in the Chamber's of Xeric`
					];
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];

		const teamCheckFailure = await checkCoxTeam(users, isChallengeMode);
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
				const supplies = await calcCoxInput(u, isSolo);
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
			challengeMode: isChallengeMode
		});

		let str = isSolo
			? `${
					msg.author.minionName
			  } is now doing a Chamber's of Xeric raid. The total trip will take ${formatDuration(
					duration
			  )}`
			: `${partyOptions.leader.username}'s party (${users
					.map(u => u.username)
					.join(
						', '
					)}) is now off to do a Chamber's of Xeric raid - the total trip will take ${formatDuration(
					duration
			  )}.`;

		str += '\n\nGearStats: ';
		for (const u of users) {
			const i = calculateUserGearPercents(u);
			str += `${u.username}[Melee:${i.melee.toFixed(2)}%][Mage:${i.mage.toFixed(
				2
			)}%][Range:${i.range.toFixed(2)}%][Total:${i.total.toFixed(2)}%]\n`;
		}

		str += ` \n\n${debugStr}`;
		str += `\n${messages.join(', ')}`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
