import { calcWhatPercent, sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import {
	calcCoxDuration,
	calcCoxInput,
	calculateUserGearPercents,
	checkCoxTeam,
	createTeam,
	hasMinRaidsRequirements,
	minimumCoxSuppliesNeeded
} from '../../../lib/data/cox';
import { degradeItem } from '../../../lib/degradeableItems';
import { trackLoot } from '../../../lib/lootTrack';
import { setupParty } from '../../../lib/party';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { MakePartyOptions } from '../../../lib/types';
import type { RaidsOptions } from '../../../lib/types/minions';
import { channelIsSendable, formatDuration, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { mahojiParseNumber } from '../../mahojiSettings';

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

export async function coxStatsCommand(user: MUser) {
	const [minigameScores, stats] = await Promise.all([
		user.fetchMinigames(),
		user.fetchStats({ total_cox_points: true })
	]);
	let totalUniques = 0;
	const { cl } = user;
	for (const item of uniques) {
		totalUniques += cl.amount(item);
	}
	const totalPoints = stats.total_cox_points;
	const { melee, range, mage, total } = calculateUserGearPercents(user);
	const normalSolo = await calcCoxDuration([user], false);
	const normalTeam = await calcCoxDuration(Array(2).fill(user), false);
	const cmSolo = await calcCoxDuration([user], true);
	const cmTeam = await calcCoxDuration(Array(2).fill(user), true);
	return `<:Twisted_bow:403018312402862081> Chambers of Xeric <:Olmlet:324127376873357316>
**Normal:** ${minigameScores.raids} KC (Solo: ${Emoji.Skull} ${(await createTeam([user], false))[0].deathChance.toFixed(
		1
	)}% ${Emoji.CombatSword} ${calcWhatPercent(normalSolo.reductions[user.id], normalSolo.maxUserReduction).toFixed(
		1
	)}%, Team: ${Emoji.Skull} ${(await createTeam(Array(2).fill(user), false))[0].deathChance.toFixed(1)}% ${
		Emoji.CombatSword
	} ${calcWhatPercent(normalTeam.reductions[user.id], normalTeam.maxUserReduction).toFixed(1)}%)
**Challenge Mode:** ${minigameScores.raids_challenge_mode} KC (Solo: ${Emoji.Skull} ${(await createTeam([user], true))[0].deathChance.toFixed(1)}%  ${Emoji.CombatSword} ${calcWhatPercent(
		cmSolo.reductions[user.id],
		cmSolo.maxUserReduction
	).toFixed(1)}%, Team: ${Emoji.Skull} ${(await createTeam(Array(2).fill(user), true))[0].deathChance.toFixed(1)}% ${
		Emoji.CombatSword
	} ${calcWhatPercent(cmTeam.reductions[user.id], cmTeam.maxUserReduction).toFixed(1)}%)
**Total Points:** ${totalPoints}
**Total Uniques:** ${totalUniques} ${
		totalUniques > 0 ? `(1 unique per ${Math.floor(totalPoints / totalUniques).toLocaleString()} pts)` : ''
	}\n
**Melee:** <:Elder_maul:403018312247803906> ${melee.toFixed(1)}%
**Range:** <:Twisted_bow:403018312402862081> ${range.toFixed(1)}%
**Mage:** <:Kodai_insignia:403018312264712193> ${mage.toFixed(1)}%
**Total Gear Score:** ${Emoji.Gear} ${total.toFixed(1)}%`;
}

export async function coxCommand(
	channelID: string,
	user: MUser,
	type: 'solo' | 'mass' | 'fakemass',
	maxSizeInput: number | undefined,
	isChallengeMode: boolean,
	_quantity?: number
) {
	if (type !== 'mass' && type !== 'solo' && type !== 'fakemass') {
		return 'Specify your team setup for Chambers of Xeric, either solo, mass, or mass (4 bots teammates).';
	}

	const minigameID = isChallengeMode ? 'raids_challenge_mode' : 'raids';

	if (isChallengeMode) {
		const normalKC = await getMinigameScore(user.id, 'raids');
		if (normalKC < 200) {
			return 'You need atleast 200 completions of the Chambers of Xeric before you can attempt Challenge Mode.';
		}
	}
	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	const maxSize = mahojiParseNumber({ input: maxSizeInput, min: 2, max: 15 }) ?? 15;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 2,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a ${
			isChallengeMode ? '**Challenge mode** ' : ''
		}Chambers of Xeric mass! Use the buttons below to join/leave.`,
		customDenier: async user => {
			if (!user.user.minion_hasBought) {
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
				!user.hasEquippedOrInBank('Dragon hunter crossbow') &&
				!user.hasEquippedOrInBank('Twisted bow') &&
				!user.hasEquipped(['Bow of faerdhinen (c)', 'Crystal helm', 'Crystal legs', 'Crystal body'], true)
			) {
				return [
					true,
					'You need either a Dragon hunter crossbow, Bow of faerdhinen (c) or Twisted bow to attempt Challenge Mode Chambers of Xeric.'
				];
			}

			return [false];
		}
	};
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'No channel found.';

	let users: MUser[] = [];
	if (type === 'fakemass') {
		users = [user, user, user, user, user];
	} else if (type === 'mass') {
		users = (await setupParty(channel, user, partyOptions)).filter(u => !u.minionIsBusy);
	} else {
		users = [user];
	}

	const {
		duration: raidDuration,
		maxUserReduction,
		reductions,
		degradeables
	} = await calcCoxDuration(users, isChallengeMode);
	const maxTripLength = calcMaxTripLength(user, 'Raids');
	const maxCanDo = Math.max(Math.floor(maxTripLength / raidDuration), 1);
	const quantity = _quantity && _quantity * raidDuration <= maxTripLength ? _quantity : maxCanDo;

	const teamCheckFailure = await checkCoxTeam(users, isChallengeMode, quantity);
	if (teamCheckFailure) {
		return `Your mass failed to start because of this reason: ${teamCheckFailure}`;
	}

	// This gives a normal duration distribution. Better than (raidDuration * quantity) +/- 5%
	const duration = sumArr(
		Array(quantity)
			.fill(raidDuration)
			.map(d => randomVariation(d, 5))
	);
	let debugStr = '';
	const isSolo = users.length === 1;
	const isFakeMass = users.length > 1 && new Set(users).size === 1;
	console.log(`isSolo: ${isSolo} | isFakeMass: ${isFakeMass}`);

	await Promise.all(
		degradeables.map(async d => {
			await degradeItem(d);
		})
	);

	const totalCost = new Bank();
	const usersToCheck = isFakeMass ? [users[0]] : users;

	const costResult = await Promise.all([
		...usersToCheck.map(async u => {
			const supplies = await calcCoxInput(u, isSolo);
			await u.removeItemsFromBank(supplies);
			totalCost.add(supplies);
			const { total } = calculateUserGearPercents(u);
			debugStr += `${u.usernameOrMention} (${Emoji.Gear}${total.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(reductions[u.id], maxUserReduction).toFixed(1)}%) used ${supplies}\n **DEBUG:** reductions: ${reductions[u.id]} maxUserReuctions: ${maxUserReduction}` ;
			return {
				userID: u.id,
				itemsRemoved: supplies
			};
		})
	]);

	updateBankSetting('cox_cost', totalCost);

	await trackLoot({
		id: minigameID,
		totalCost,
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.itemsRemoved
		}))
	});

	await addSubTaskToActivityTask<RaidsOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'Raids',
		leader: user.id,
		users: users.map(u => u.id),
		challengeMode: isChallengeMode,
		quantity
	});

	let str = isSolo
		? `${user.minionName} is now doing ${quantity > 1 ? quantity : 'a'} Chambers of Xeric raid${
				quantity > 1 ? 's' : ''
			}. The total trip will take ${formatDuration(duration)}.`
		: isFakeMass ? `${partyOptions.leader.usernameOrMention} your party of (${user.minionName} & ${users.length - 1} simulated users) is now off to do ${quantity > 1 ? quantity : 'a'} Chambers of Xeric raid${
				quantity > 1 ? 's' : ''
			} - the total trip will take ${formatDuration(duration)}.` :`${partyOptions.leader.usernameOrMention}'s party (${users
				.map(u => u.usernameOrMention)
				.join(', ')}) is now off to do ${quantity > 1 ? quantity : 'a'} Chambers of Xeric raid${
				quantity > 1 ? 's' : ''
			} - the total trip will take ${formatDuration(duration)}.`;

	str += ` \n\n${debugStr}`;

	return str;
}
