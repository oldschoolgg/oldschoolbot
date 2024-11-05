import { calcWhatPercent } from 'e';
import { Bank } from 'oldschooljs';
import { TOBRooms } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';
import { randomVariation } from 'oldschooljs/dist/util';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Emoji } from '../../../lib/constants';
import { getSimilarItems } from '../../../lib/data/similarItems';
import {
	TENTACLE_CHARGES_PER_RAID,
	baseTOBUniques,
	calcTOBBaseDuration,
	calculateTOBDeaths,
	calculateTOBUserGearPercents,
	createTOBRaid,
	minimumTOBSuppliesNeeded
} from '../../../lib/data/tob';
import { checkUserCanUseDegradeableItem, degradeItem } from '../../../lib/degradeableItems';
import { trackLoot } from '../../../lib/lootTrack';
import { blowpipeDarts } from '../../../lib/minions/functions/blowpipeCommand';
import getUserFoodFromBank from '../../../lib/minions/functions/getUserFoodFromBank';
import { setupParty } from '../../../lib/party';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { MakePartyOptions } from '../../../lib/types';
import type { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable, formatSkillRequirements, skillsMeetRequirements } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import getOSItem from '../../../lib/util/getOSItem';
import itemID from '../../../lib/util/itemID';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { mahojiParseNumber, userStatsBankUpdate } from '../../mahojiSettings';

const minStats = {
	attack: 90,
	strength: 90,
	defence: 90,
	ranged: 90,
	magic: 94,
	prayer: 77
};

const SCYTHE_CHARGES_PER_RAID = 200;

async function calcTOBInput(u: MUser) {
	const items = new Bank();
	const kc = await getMinigameScore(u.id, 'tob');
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	const brewsNeeded = Math.max(1, 6 - Math.max(1, Math.ceil((kc + 1) / 10)));
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	let healingNeeded = 60;
	if (kc < 20) {
		items.add('Cooked karambwan', 3);
		healingNeeded += 40;
	}

	items.add(
		getUserFoodFromBank({
			gearBank: u.gearBank,
			totalHealingNeeded: healingNeeded,
			favoriteFood: u.user.favorite_food,
			minimumHealAmount: 20
		}) || new Bank().add('Shark', 5)
	);

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	const runeCost = new Bank().add('Blood rune', 110).add('Death rune', 100).add('Water rune', 800);
	items.add(determineRunes(u, runeCost));

	return items;
}

async function checkTOBUser(
	user: MUser,
	isHardMode: boolean,
	teamSize?: number,
	quantity = 1
): Promise<[false] | [true, string]> {
	if (!user.user.minion_hasBought) {
		return [true, `${user.usernameOrMention} doesn't have a minion`];
	}

	if (!skillsMeetRequirements(user.skillsAsXP, minStats)) {
		return [
			true,
			`${
				user.usernameOrMention
			} doesn't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				minStats
			)}.`
		];
	}

	if (!user.owns(minimumTOBSuppliesNeeded.clone().multiply(quantity))) {
		return [
			true,
			`${user.usernameOrMention} doesn't have enough items, you need a minimum of this amount of items: ${minimumTOBSuppliesNeeded}.`
		];
	}
	const { total } = calculateTOBUserGearPercents(user);
	if (total < 20) {
		return [
			true,
			`${user.usernameOrMention}'s gear is terrible! You do not stand a chance in the Theatre of Blood.`
		];
	}

	const similarItems = getSimilarItems(itemID('Rune pouch'));
	if (similarItems.every(item => !user.owns(item))) {
		return [true, `${user.usernameOrMention}'s doesn't have a Rune pouch.`];
	}

	const cost = await calcTOBInput(user);
	cost.add('Coins', 100_000);
	cost.multiply(quantity);
	if (!user.owns(cost)) {
		return [true, `${user.usernameOrMention} doesn't own ${cost.remove(user.bankWithGP)}`];
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */

	// Melee
	const meleeGear = user.gear.melee;
	if (
		!meleeGear.hasEquipped([
			'Abyssal tentacle',
			'Blade of saeldor (c)',
			'Scythe of vitur (uncharged)',
			'Scythe of vitur'
		]) ||
		!meleeGear.hasEquipped(['Fire cape', 'Infernal cape'])
	) {
		return [
			true,
			`${user.usernameOrMention} needs an Abyssal tentacle/Blade of saeldor(c)/Scythe of vitur and Fire/Infernal cape in their melee setup!`
		];
	}

	if (meleeGear.hasEquipped('Abyssal tentacle')) {
		const tentacleResult = checkUserCanUseDegradeableItem({
			item: getOSItem('Abyssal tentacle'),
			chargesToDegrade: TENTACLE_CHARGES_PER_RAID * quantity,
			user
		});
		if (!tentacleResult.hasEnough) {
			return [true, tentacleResult.userMessage];
		}
	}

	if (meleeGear.hasEquipped('Scythe of Vitur')) {
		const scytheResult = checkUserCanUseDegradeableItem({
			item: getOSItem('Scythe of Vitur'),
			chargesToDegrade: SCYTHE_CHARGES_PER_RAID * quantity,
			user
		});
		if (!scytheResult.hasEnough) {
			return [true, scytheResult.userMessage];
		}
	}

	// Range
	const blowpipeData = user.blowpipe;
	if (!user.owns('Toxic blowpipe') || !blowpipeData.scales || !blowpipeData.dartID || !blowpipeData.dartQuantity) {
		return [
			true,
			`${user.usernameOrMention} needs a Toxic blowpipe (with darts and scales equipped) in their bank to do the Theatre of Blood.`
		];
	}
	const dartsNeeded = 150 * quantity;
	if (blowpipeData.dartQuantity < dartsNeeded) {
		return [true, `${user.usernameOrMention}, you need at least ${dartsNeeded} darts in your blowpipe.`];
	}
	const scalesNeeded = 1000 * quantity;
	if (blowpipeData.scales < scalesNeeded) {
		return [true, `${user.usernameOrMention}, you need at least ${scalesNeeded} scales in your blowpipe.`];
	}
	const dartIndex = blowpipeDarts.indexOf(getOSItem(blowpipeData.dartID));
	if (dartIndex < 5) {
		return [true, `${user.usernameOrMention}'s darts are too weak`];
	}

	const rangeGear = user.gear.range;
	if (
		!rangeGear.hasEquipped(['Magic shortbow', 'Twisted bow']) ||
		!rangeGear.hasEquipped(['Amethyst arrow', 'Rune arrow', 'Dragon arrow'])
	) {
		return [
			true,
			`${user.usernameOrMention} needs a Magic shortbow or Twisted bow, and rune/dragon arrows, in their range setup!`
		];
	}
	if (rangeGear.hasEquipped(['Dragon arrow', 'Magic shortbow'], true)) {
		return [true, `${user.usernameOrMention}, you can't use Dragon arrows with a Magic shortbow 🤨`];
	}

	const arrowsRequired = 150 * quantity;
	if (rangeGear.ammo!.quantity < arrowsRequired) {
		return [
			true,
			`${user.usernameOrMention}, you need at least ${arrowsRequired} arrows equipped in your range setup.`
		];
	}

	if (isHardMode) {
		const kc = await getMinigameScore(user.id, 'tob');

		if (kc < 250) {
			return [true, `${user.usernameOrMention} needs at least 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
			return [true, `${user.usernameOrMention} needs an Infernal cape to do Hard mode.`];
		}
	}

	if (teamSize === 2) {
		const kc = await getMinigameScore(user.id, isHardMode ? 'tob_hard' : 'tob');
		if (kc < 150) {
			return [true, `${user.usernameOrMention} needs at least 150 KC before doing duo's.`];
		}
	}

	return [false];
}

async function checkTOBTeam(users: MUser[], isHardMode: boolean, solo: boolean, quantity = 1): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumTOBSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies`;
	}
	if ((!solo && users.length < 2) || users.length > 5) {
		return 'TOB team must be 2-5 users';
	}

	for (const user of users) {
		if (user.minionIsBusy) return `${user.usernameOrMention}'s minion is busy.`;
		const checkResult = await checkTOBUser(user, isHardMode, users.length, quantity);
		if (checkResult[1]) {
			return checkResult[1];
		}
	}

	return null;
}

export async function tobStatsCommand(user: MUser) {
	const [minigameScores, { tob_attempts: attempts, tob_hard_attempts: hardAttempts }] = await Promise.all([
		user.fetchMinigames(),
		user.fetchStats({ tob_attempts: true, tob_hard_attempts: true })
	]);
	const hardKC = minigameScores.tob_hard;
	const kc = minigameScores.tob;
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

export async function tobStartCommand(
	user: MUser,
	channelID: string,
	isHardMode: boolean,
	maxSizeInput: number | undefined,
	solo: boolean,
	quantity: number | undefined
) {
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
			return 'You need at least 250 completions of the Theatre of Blood before you can attempt Hard Mode.';
		}
	}
	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	const maxSize = mahojiParseNumber({ input: maxSizeInput, min: 2, max: 5 }) ?? 5;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 2,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a ${
			isHardMode ? '**Hard mode** ' : ''
		}Theatre of Blood mass! Use the buttons below to join/leave.`,
		customDenier: async _user => {
			if (_user.minionIsBusy) {
				return [true, `${_user.usernameOrMention} minion is busy`];
			}

			return checkTOBUser(_user, isHardMode);
		}
	};

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return 'No channel found.';
	let usersWhoConfirmed = [];
	try {
		if (solo) {
			usersWhoConfirmed = [user, user, user];
		} else {
			usersWhoConfirmed = await setupParty(channel, user, partyOptions);
		}
	} catch (err: any) {
		return {
			content: typeof err === 'string' ? err : 'Your mass failed to start.',
			ephemeral: true
		};
	}
	const users = usersWhoConfirmed.filter(u => !u.minionIsBusy).slice(0, maxSize);

	const team = await Promise.all(
		users.map(async u => {
			const [minigameScores, { tob_attempts, tob_hard_attempts }] = await Promise.all([
				u.fetchMinigames(),
				u.fetchStats({ tob_attempts: true, tob_hard_attempts: true })
			]);
			return {
				user: u,
				bank: u.bank,
				gear: u.gear,
				attempts: tob_attempts,
				hardAttempts: tob_hard_attempts,
				kc: minigameScores.tob,
				hardKC: minigameScores.tob_hard
			};
		})
	);
	const { baseDuration, reductions, maxUserReduction } = calcTOBBaseDuration({ team, hardMode: isHardMode });
	const maxTripLength = calcMaxTripLength(user, 'TheatreOfBlood');

	const maxTripsCanFit = Math.max(1, Math.floor(maxTripLength / baseDuration));

	const qty = quantity ?? maxTripsCanFit;
	if (qty > maxTripsCanFit) {
		return `Your minion cannot go on trips longer than ${formatDuration(
			maxTripLength
		)}. The most you can do with your teams setup is ${maxTripsCanFit}.`;
	}

	const teamCheckFailure = await checkTOBTeam(users, isHardMode, solo, qty);
	if (teamCheckFailure) {
		return `Your mass failed to start because of this reason: ${teamCheckFailure} ${users}`;
	}

	let totalDuration = 0;
	let totalFakeDuration = 0;
	const deaths: number[][][] = [];

	const wipedRooms: (number | null)[] = [];
	for (let i = 0; i < qty; i++) {
		const {
			duration,
			wipedRoom: _wipedRoom,
			deathDuration,
			parsedTeam
		} = createTOBRaid({
			team,
			hardMode: isHardMode,
			baseDuration
		});
		const wipedRoom = _wipedRoom ? TOBRooms.indexOf(TOBRooms.find(room => _wipedRoom.name === room.name)!) : null;
		wipedRooms.push(wipedRoom);
		totalFakeDuration += duration;
		totalDuration += deathDuration === null ? duration : deathDuration;
		if (solo) parsedTeam.length = 1;
		deaths.push(parsedTeam.map(i => i.deaths));
	}
	if (solo) {
		users.length = 1;
		team.length = 1;
	}
	let debugStr = '';

	const totalCost = new Bank();

	const costResult = await Promise.all(
		users.map(async u => {
			const supplies = await calcTOBInput(u);
			const { total } = calculateTOBUserGearPercents(u);
			const blowpipeData = u.blowpipe;
			const { realCost } = await u.specialRemoveItems(
				supplies
					.clone()
					.add('Coins', 100_000)
					.add(blowpipeData.dartID!, Math.floor(Math.min(blowpipeData.dartQuantity, 156)))
					.add(u.gear.range.ammo?.item, 100)
					.multiply(qty)
			);
			await userStatsBankUpdate(u, 'tob_cost', realCost);
			const effectiveCost = realCost.clone().remove('Coins', realCost.amount('Coins'));
			totalCost.add(effectiveCost);
			if (u.gear.melee.hasEquipped('Abyssal tentacle')) {
				await degradeItem({
					item: getOSItem('Abyssal tentacle'),
					user: u,
					chargesToDegrade: TENTACLE_CHARGES_PER_RAID * qty
				});
			} else if (u.gear.melee.hasEquipped('Scythe of Vitur')) {
				let usedCharges = 0;
				for (let x = 0; x < qty; x++) {
					usedCharges += randomVariation(0.8 * SCYTHE_CHARGES_PER_RAID, 20);
				}
				await degradeItem({
					item: getOSItem('Scythe of Vitur'),
					user: u,
					chargesToDegrade: usedCharges
				});
			}
			debugStr += `**- ${u.usernameOrMention}** (${Emoji.Gear}${total.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(reductions[u.id], maxUserReduction).toFixed(1)}%) used ${realCost}\n\n`;
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	await updateBankSetting('tob_cost', totalCost);
	await trackLoot({
		totalCost,
		id: isHardMode ? 'tob_hard' : 'tob',
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.effectiveCost,
			totalDuration
		}))
	});

	await addSubTaskToActivityTask<TheatreOfBloodTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: totalDuration,
		type: 'TheatreOfBlood',
		leader: user.id,
		users: team.map(u => u.user.id),
		hardMode: isHardMode,
		wipedRooms,
		fakeDuration: totalFakeDuration,
		quantity: qty,
		deaths,
		solo
	});

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to do ${qty}x Theatre of Blood raid${
		qty > 1 ? 's' : ''
	} - the total trip will take ${formatDuration(totalFakeDuration)}.${solo ? " You're in a team of 3." : ''}`;

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
