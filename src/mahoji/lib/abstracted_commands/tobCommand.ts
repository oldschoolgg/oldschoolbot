import { calcWhatPercent } from 'e';
import { Bank } from 'oldschooljs';
import { TOBRooms } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';

import { setupParty } from '../../../extendables/Message/Party';
import { Emoji } from '../../../lib/constants';
import {
	baseTOBUniques,
	calcTOBInput,
	calculateTOBDeaths,
	calculateTOBUserGearPercents,
	checkTOBTeam,
	checkTOBUser,
	createTOBTeam,
	TENTACLE_CHARGES_PER_RAID
} from '../../../lib/data/tob';
import { degradeItem } from '../../../lib/degradeableItems';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { trackLoot } from '../../../lib/settings/prisma';
import { MakePartyOptions } from '../../../lib/types';
import { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable, formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';
import { mahojiParseNumber, updateBankSetting, updateLegacyUserBankSetting } from '../../mahojiSettings';

export async function tobStatsCommand(user: MUser) {
	const hardKC = await getMinigameScore(user.id, 'tob_hard');
	const kc = await getMinigameScore(user.id, 'tob');
	const attempts = user.user.tob_attempts;
	const hardAttempts = user.user.tob_hard_attempts;
	const gear = calculateTOBUserGearPercents(user);
	const deathChances = calculateTOBDeaths(kc, hardKC, attempts, hardAttempts, false, gear);
	const hardDeathChances = calculateTOBDeaths(kc, hardKC, attempts, hardAttempts, true, gear);
	let totalUniques = 0;
	const { cl } = user;
	for (const item of baseTOBUniques) {
		totalUniques += cl.amount(item);
	}
	return `**Theatre of Blood**
**Normal:** ${kc} KC, ${attempts} attempts
**Hard Mode:** ${hardKC} KC, ${hardAttempts} attempts
**Total Uniques:** ${totalUniques}\n
**Melee:** <:Elder_maul:403018312247803906> ${gear.melee.toFixed(1)}%
**Range:** <:Twisted_bow:403018312402862081> ${gear.range.toFixed(1)}%
**Mage:** <:Kodai_insignia:403018312264712193> ${gear.mage.toFixed(1)}%
**Total Gear Score:** ${Emoji.Gear} ${gear.total.toFixed(1)}%\n
**Death Chances:** ${deathChances.deathChances.map(i => `${i.name} ${i.deathChance.toFixed(2)}%`).join(', ')}
**Wipe Chances:** ${deathChances.wipeDeathChances.map(i => `${i.name} ${i.deathChance.toFixed(2)}%`).join(', ')}
**Hard Mode Death Chances:** ${hardDeathChances.deathChances
		.map(i => `${i.name} ${i.deathChance.toFixed(2)}%`)
		.join(', ')}
**Hard Mode Wipe Chances:** ${hardDeathChances.wipeDeathChances
		.map(i => `${i.name} ${i.deathChance.toFixed(2)}%`)
		.join(', ')}`;
}

export async function tobStartCommand(user: MUser, channelID: bigint, isHardMode: boolean, maxSizeInput?: number) {
	if (user.minionIsBusy) {
		return `${user.usernameOrMention} minion is busy`;
	}
	const initialCheck = await checkTOBUser(user, isHardMode);
	if (initialCheck[0]) {
		return initialCheck[1];
	}

	if (isHardMode) {
		const normalKC = await getMinigameScore(user.id, 'tob');
		if (normalKC < 250) {
			return 'You need atleast 250 completions of the Theatre of Blood before you can attempt Hard Mode.';
		}
	}
	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	let maxSize = mahojiParseNumber({ input: maxSizeInput, min: 2, max: 5 }) ?? 5;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 2,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a ${
			isHardMode ? '**Hard mode** ' : ''
		}Theatre of Blood mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
		customDenier: async user => {
			if (user.minionIsBusy) {
				return [true, `${user.usernameOrMention} minion is busy`];
			}

			return checkTOBUser(user, isHardMode);
		}
	};

	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'No channel found.';
	const reactionAwaiter = await setupParty(channel, user, partyOptions);
	const usersWhoConfirmed = await reactionAwaiter;
	const users = usersWhoConfirmed.filter(u => !u.minionIsBusy).slice(0, maxSize);

	const teamCheckFailure = await checkTOBTeam(users, isHardMode);
	if (teamCheckFailure) {
		return `Your mass failed to start because of this reason: ${teamCheckFailure} ${users}`;
	}

	const {
		duration,
		totalReduction,
		reductions,
		wipedRoom: _wipedRoom,
		deathDuration,
		parsedTeam
	} = createTOBTeam({
		team: await Promise.all(
			users.map(async u => ({
				user: u,
				bank: u.bank,
				gear: u.gear,
				attempts: u.user.tob_attempts,
				hardAttempts: u.user.tob_hard_attempts,
				kc: await getMinigameScore(u.id, 'tob'),
				hardKC: await getMinigameScore(u.id, 'tob_hard')
			}))
		),
		hardMode: isHardMode
	});
	const wipedRoom = _wipedRoom ? TOBRooms.find(room => _wipedRoom.name === room.name)! : null;
	let debugStr = '';

	const totalCost = new Bank();

	await Promise.all(
		users.map(async u => {
			const supplies = await calcTOBInput(u);
			const { total } = calculateTOBUserGearPercents(u);
			const blowpipeData = u.blowpipe;
			const { realCost } = await u.specialRemoveItems(
				supplies
					.clone()
					.add('Coins', 100_000)
					.add(blowpipeData.dartID!, Math.floor(Math.min(blowpipeData.dartQuantity, 156)))
					.add(u.gear.range.ammo!.item, 100)
			);
			await updateLegacyUserBankSetting(u.id, 'tob_cost', realCost);
			totalCost.add(realCost.clone().remove('Coins', realCost.amount('Coins')));
			if (u.gear.melee.hasEquipped('Abyssal tentacle')) {
				await degradeItem({
					item: getOSItem('Abyssal tentacle'),
					user: u,
					chargesToDegrade: TENTACLE_CHARGES_PER_RAID
				});
			}
			debugStr += `**- ${u.usernameOrMention}** (${Emoji.Gear}${total.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(reductions[u.id], totalReduction).toFixed(1)}%) used ${realCost}\n\n`;
		})
	);

	updateBankSetting('tob_cost', totalCost);
	await trackLoot({
		cost: totalCost,
		id: isHardMode ? 'tob_hard' : 'tob',
		type: 'Minigame',
		changeType: 'cost'
	});

	await addSubTaskToActivityTask<TheatreOfBloodTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: deathDuration ?? duration,
		type: 'TheatreOfBlood',
		leader: user.id,
		users: parsedTeam.map(u => u.id),
		hardMode: isHardMode,
		wipedRoom: wipedRoom === null ? null : TOBRooms.indexOf(wipedRoom),
		fakeDuration: duration,
		deaths: parsedTeam.map(i => i.deaths)
	});

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to do a Theatre of Blood raid - the total trip will take ${formatDuration(duration)}.`;

	str += ` \n\n${debugStr}`;

	return str;
}

export async function tobCheckCommand(user: MUser, hardMode: boolean) {
	const result = await checkTOBUser(user, hardMode, 5);
	if (result[0]) {
		return `You aren't able to join a Theatre of Blood raid, address these issues first: ${result[1]}`;
	}
	return 'You are ready to do the Theatre of Blood!';
}
