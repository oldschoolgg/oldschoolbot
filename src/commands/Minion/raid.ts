import { MessageAttachment } from 'discord.js';
import { calcWhatPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { Emoji } from '../../lib/constants';
import {
	calcCoxDuration,
	calcCoxInput,
	calculateUserGearPercents,
	checkCoxTeam,
	createTeam,
	hasMinRaidsRequirements,
	minimumCoxSuppliesNeeded
} from '../../lib/data/cox';
import { degradeItem } from '../../lib/degradeableItems';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { RaidsOptions } from '../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

const uniques = [
	'Dexterous prayer scroll',
	'Arcane prayer scroll',
	'Twisted buckler',
	'Dragon hunter crossbow',
	"Dinh's bulwark",
	'Ancestral hat',
	'Ancestral robe top',
	'Ancestral robe bottom',
	'Dragon claws',
	'Elder maul',
	'Kodai insignia',
	'Twisted bow'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[mass|solo]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ADD_REACTIONS', 'ATTACH_FILES'],
			description: 'Sends your minion to do the Chambers of Xeric.',
			examples: ['+raid solo', '+raid mass']
		});
	}

	async run(msg: KlasaMessage, [type]: [string | undefined]) {
		if (msg.flagArgs.simulate) {
			const arr = Array(15).fill(msg.author);
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
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 15].map(async i => {
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
			return msg.channel.send({ files: [new MessageAttachment(Buffer.from(normalTable), 'cox-sim.txt')] });
		}

		if (!type) {
			const [normal, cm] = await Promise.all([
				msg.author.getMinigameScore('raids'),
				msg.author.getMinigameScore('raids_challenge_mode')
			]);
			let totalUniques = 0;
			const cl = msg.author.cl();
			for (const item of uniques) {
				totalUniques += cl.amount(item);
			}
			const totalPoints = msg.author.settings.get(UserSettings.TotalCoxPoints);
			const { melee, range, mage, total } = calculateUserGearPercents(msg.author);
			const normalSolo = await calcCoxDuration([msg.author], false);
			const normalTeam = await calcCoxDuration(Array(2).fill(msg.author), false);
			const cmSolo = await calcCoxDuration([msg.author], true);
			const cmTeam = await calcCoxDuration(Array(2).fill(msg.author), true);
			return msg.channel.send(`<:Twisted_bow:403018312402862081> Chambers of Xeric <:Olmlet:324127376873357316>
**Normal:** ${normal} KC (Solo: ${Emoji.Skull} ${(await createTeam([msg.author], false))[0].deathChance.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(normalSolo.reductions[msg.author.id], normalSolo.totalReduction).toFixed(1)}%, Team: ${
				Emoji.Skull
			} ${(await createTeam(Array(2).fill(msg.author), false))[0].deathChance.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(normalTeam.reductions[msg.author.id], normalTeam.totalReduction).toFixed(1)}%)
**Challenge Mode:** ${cm} KC (Solo: ${Emoji.Skull} ${(await createTeam([msg.author], true))[0].deathChance.toFixed(
				1
			)}%  ${Emoji.CombatSword} ${calcWhatPercent(
				cmSolo.reductions[msg.author.id],
				cmSolo.totalReduction
			).toFixed(1)}%, Team: ${Emoji.Skull} ${(
				await createTeam(Array(2).fill(msg.author), true)
			)[0].deathChance.toFixed(1)}% ${Emoji.CombatSword} ${calcWhatPercent(
				cmTeam.reductions[msg.author.id],
				cmTeam.totalReduction
			).toFixed(1)}%)
**Total Points:** ${totalPoints}
**Total Uniques:** ${totalUniques} ${
				totalUniques > 0 ? `(1 unique per ${Math.floor(totalPoints / totalUniques).toLocaleString()} pts)` : ''
			}\n
**Melee:** <:Elder_maul:403018312247803906> ${melee.toFixed(1)}%
**Range:** <:Twisted_bow:403018312402862081> ${range.toFixed(1)}%
**Mage:** <:Kodai_insignia:403018312264712193> ${mage.toFixed(1)}%
**Total Gear Score:** ${Emoji.Gear} ${total.toFixed(1)}%`);
		}

		if (type !== 'mass' && type !== 'solo') {
			return msg.channel.send('Specify your team setup for Chambers of Xeric, either solo or mass.');
		}

		const isChallengeMode = Boolean(msg.flagArgs.cm);
		const minigameID = isChallengeMode ? 'raids_challenge_mode' : 'raids';

		if (isChallengeMode) {
			const normalKC = await msg.author.getMinigameScore('raids');
			if (normalKC < 200) {
				return msg.channel.send(
					'You need atleast 200 completions of the Chambers of Xeric before you can attempt Challenge Mode.'
				);
			}
		}
		if (msg.author.minionIsBusy) {
			return msg.channel.send("Your minion is busy, so you can't start a raid.");
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 15,
			ironmanAllowed: true,
			message: `${msg.author.username} is hosting a ${
				isChallengeMode ? '**Challenge mode** ' : ''
			}Chambers of Xeric mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				if (!hasMinRaidsRequirements(user)) {
					return [true, "You don't meet the stat requirements to do the Chambers of Xeric."];
				}

				if (!user.owns(minimumCoxSuppliesNeeded)) {
					return [
						true,
						`You don't have enough items, you need a minimum of this amount of items: ${minimumCoxSuppliesNeeded}.`
					];
				}

				const { total } = calculateUserGearPercents(user);
				if (total < 20) {
					return [true, 'Your gear is terrible! You do not stand a chance in the Chambers of Xeric'];
				}

				if (
					isChallengeMode &&
					!user.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
					resolveItems(['Twisted bow', 'Hellfire bow', 'Zaryte bow']).every(
						i => !user.hasItemEquippedAnywhere(i) && user.owns(i)
					)
				) {
					return [
						true,
						'You need either a Dragon hunter crossbow or Twisted bow to attempt Challenge Mode Chambers of Xeric.'
					];
				}

				return [false];
			}
		};

		const users =
			type === 'mass' ? (await msg.makePartyAwaiter(partyOptions)).filter(u => !u.minionIsBusy) : [msg.author];

		const teamCheckFailure = await checkCoxTeam(users, isChallengeMode);
		if (teamCheckFailure) {
			return msg.channel.send(`Your mass failed to start because of this reason: ${teamCheckFailure}`);
		}

		const { duration, totalReduction, reductions, degradeables } = await calcCoxDuration(users, isChallengeMode);

		let debugStr = '';
		const isSolo = users.length === 1;

		const totalCost = new Bank();

		await Promise.all([
			degradeables.map(async d => {
				await degradeItem(d);
			}),
			...users.map(async u => {
				const supplies = await calcCoxInput(u, isSolo);
				await u.removeItemsFromBank(supplies);
				totalCost.add(supplies);
				const { total } = calculateUserGearPercents(u);
				debugStr += `${u.username} (${Emoji.Gear}${total.toFixed(1)}% ${Emoji.CombatSword} ${calcWhatPercent(
					reductions[u.id],
					totalReduction
				).toFixed(1)}%) used ${supplies}\n`;
			})
		]);

		updateBankSetting(this.client, ClientSettings.EconomyStats.CoxCost, totalCost);

		await trackLoot({
			id: minigameID,
			cost: totalCost,
			type: 'Minigame',
			changeType: 'cost'
		});

		await addSubTaskToActivityTask<RaidsOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: 'Raids',
			leader: msg.author.id,
			users: users.map(u => u.id),
			challengeMode: isChallengeMode
		});

		let str = isSolo
			? `${
					msg.author.minionName
			  } is now doing a Chambers of Xeric raid. The total trip will take ${formatDuration(duration)}.`
			: `${partyOptions.leader.username}'s party (${users
					.map(u => u.username)
					.join(', ')}) is now off to do a Chambers of Xeric raid - the total trip will take ${formatDuration(
					duration
			  )}.`;

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str);
	}
}
