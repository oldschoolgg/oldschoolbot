import { calcWhatPercent } from 'e';
import { Bank } from 'oldschooljs';
import { TOBRooms } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';

import { Emoji } from '../../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../lib/data/CollectionsExport';
import { bareMinStats } from '../../../lib/data/cox';
import {
	baseTOBUniques,
	calculateTOBDeaths,
	calculateTOBUserGearPercents,
	createTOBTeam,
	minimumTOBSuppliesNeeded,
	TENTACLE_CHARGES_PER_RAID
} from '../../../lib/data/tob';
import { checkUserCanUseDegradeableItem, degradeItem } from '../../../lib/degradeableItems';
import { trackLoot } from '../../../lib/lootTrack';
import { blowpipeDarts } from '../../../lib/minions/functions/blowpipeCommand';
import getUserFoodFromBank from '../../../lib/minions/functions/getUserFoodFromBank';
import { setupParty } from '../../../lib/party';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { MakePartyOptions } from '../../../lib/types';
import { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable, formatDuration, formatSkillRequirements, skillsMeetRequirements } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { mahojiParseNumber, updateLegacyUserBankSetting } from '../../mahojiSettings';

export async function calcTOBInput(u: MUser) {
	const items = new Bank();
	const kc = await getMinigameScore(u.id, 'tob');
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	let brewsNeeded = Math.max(1, 6 - Math.max(1, Math.ceil((kc + 1) / 10)));
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	let healingNeeded = 60;
	if (kc < 20) {
		items.add('Cooked karambwan', 3);
		healingNeeded += 40;
	}

	items.add(getUserFoodFromBank(u, healingNeeded, u.user.favorite_food, false, 20) || new Bank().add('Shark', 5));

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	items.add('Blood rune', 110);
	items.add('Death rune', 100);
	items.add('Water rune', 800);

	if (u.gear.melee.hasEquipped('Scythe of vitur')) {
		items.add('Blood rune', 600);
		items.add('Vial of blood', 2);
	}

	return items;
}

export async function checkTOBUser(
	user: MUser,
	isHardMode: boolean,
	teamSize?: number
): Promise<[false] | [true, string]> {
	if (!user.user.minion_hasBought) {
		return [true, `${user.usernameOrMention} doesn't have a minion`];
	}

	if (!skillsMeetRequirements(user.skillsAsXP, bareMinStats)) {
		return [
			true,
			`${
				user.usernameOrMention
			} doesn't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				bareMinStats
			)}.`
		];
	}

	if (!user.owns(minimumTOBSuppliesNeeded)) {
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

	const cost = await calcTOBInput(user);
	cost.add('Coins', 100_000).add('Rune pouch');
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
	const requiredMeleeWeapons = [
		'Abyssal tentacle',
		'Blade of saeldor (c)',
		'Scythe of vitur (uncharged)',
		'Scythe of vitur',
		'Drygore longsword'
	];
	const requiredMeleeCapes = ['Fire cape', 'Infernal cape', 'TzKal cape'];
	if (!meleeGear.hasEquipped(requiredMeleeWeapons) || !meleeGear.hasEquipped(requiredMeleeCapes)) {
		return [
			true,
			`${user.usernameOrMention} needs one of the following weapons: ${requiredMeleeWeapons.join(
				'/'
			)} and one of the following capes: ${requiredMeleeCapes.join('/')} equipped in their melee setup!`
		];
	}

	if (meleeGear.hasEquipped('Abyssal tentacle')) {
		const tentacleResult = checkUserCanUseDegradeableItem({
			item: getOSItem('Abyssal tentacle'),
			chargesToDegrade: TENTACLE_CHARGES_PER_RAID,
			user
		});
		if (!tentacleResult.hasEnough) {
			return [true, tentacleResult.userMessage];
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
	if (blowpipeData.dartQuantity < 150) {
		return [true, `${user.usernameOrMention}, you need atleast 150 darts in your blowpipe.`];
	}
	if (blowpipeData.scales < 1000) {
		return [true, `${user.usernameOrMention}, you need atleast 1000 scales in your blowpipe.`];
	}
	const dartIndex = blowpipeDarts.indexOf(getOSItem(blowpipeData.dartID));
	if (dartIndex < 5) {
		return [true, `${user.usernameOrMention}'s darts are too weak`];
	}

	const requiredRangeWeapons = ['Magic shortbow', 'Twisted bow', 'Zaryte bow', 'Hellfire bow'];
	const requiredRangeAmmo = ['Amethyst arrow', 'Rune arrow', 'Dragon arrow', 'Hellfire arrow'];
	const rangeGear = user.gear.range;
	if (!rangeGear.hasEquipped(requiredRangeWeapons) || !rangeGear.hasEquipped(requiredRangeAmmo)) {
		return [
			true,
			`${user.usernameOrMention} needs one of the following weapons: ${requiredRangeWeapons.join(
				'/'
			)} and one of the following ammo types: ${requiredRangeAmmo.join('/')} equipped in their range setup!`
		];
	}
	if (rangeGear.hasEquipped(['Hellfire arrow']) && !rangeGear.hasEquipped('Hellfire bow')) {
		return [true, `${user.usernameOrMention}, you can't use Hellfire arrows without a Hellfire bow 🤨`];
	}
	if (rangeGear.hasEquipped(['Dragon arrow', 'Magic shortbow'], true)) {
		return [true, `${user.usernameOrMention}, you can't use Dragon arrows with a Magic shortbow 🤨`];
	}

	if (rangeGear.ammo!.quantity < 150) {
		return [true, `${user.usernameOrMention}, you need atleast 150 arrows equipped in your range setup.`];
	}

	if (isHardMode) {
		const kc = await getMinigameScore(user.id, 'tob');

		if (kc < 250) {
			return [true, `${user.usernameOrMention} needs atleast 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
			return [true, `${user.usernameOrMention} needs at least an Infernal cape to do Hard mode.`];
		}
	}
	if (teamSize === 1) {
		if (
			!meleeGear.hasEquipped(['Drygore longsword', 'Offhand drygore longsword'], true) &&
			!meleeGear.hasEquipped('Scythe of vitur')
		) {
			return [true, 'You must either have a charged Scythe of vitur, or dual Drygore longswords to solo ToB'];
		}
		const minRangeSoloGear = ['Hellfire bow', 'Hellfire arrow'];
		if (!rangeGear.hasEquipped(minRangeSoloGear, true)) {
			return [true, 'You must either have a Hellfire bow and Hellfire arrows equipped to solo ToB'];
		}
		const mageGear = user.gear.mage;
		if (
			!meleeGear.hasEquipped(gorajanWarriorOutfit, true) &&
			!rangeGear.hasEquipped(gorajanArcherOutfit, true) &&
			!mageGear.hasEquipped(gorajanOccultOutfit, true)
		) {
			return [true, 'You must either have at least one complete set of Gorajan armour to solo ToB'];
		}
	}

	return [false];
}

export async function checkTOBTeam(users: MUser[], isHardMode: boolean): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumTOBSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies`;
	}
	if (users.length < 2 || users.length > 5) {
		return 'TOB team must be 2-5 users';
	}

	for (const user of users) {
		if (user.minionIsBusy) return `${user.usernameOrMention}'s minion is busy.`;
		const checkResult = await checkTOBUser(user, isHardMode, users.length);
		if (!checkResult[0]) {
			continue;
		} else {
			return checkResult[1];
		}
	}

	return null;
}

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

export async function tobStartCommand(
	user: MUser,
	channelID: string,
	isHardMode: boolean,
	maxSizeInput?: number,
	solo?: boolean
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
			return 'You need atleast 250 completions of the Theatre of Blood before you can attempt Hard Mode.';
		}
	}
	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	let maxSize = mahojiParseNumber({ input: maxSizeInput, min: 2, max: 5 }) ?? 5;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 1,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a ${
			isHardMode ? '**Hard mode** ' : ''
		}Theatre of Blood mass! Use the buttons below to join/leave.`,
		customDenier: async user => {
			if (user.minionIsBusy) {
				return [true, `${user.usernameOrMention} minion is busy`];
			}

			return checkTOBUser(user, isHardMode);
		}
	};

	let users: MUser[] = [];
	if (solo) {
		users = [user];
	} else {
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'No channel found.';
		users = await setupParty(channel, user, partyOptions);
	}

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
					.add(u.gear.range.ammo!.item, 100)
			);
			await updateLegacyUserBankSetting(u.id, 'tob_cost', realCost);
			const effectiveCost = realCost.clone().remove('Coins', realCost.amount('Coins'));
			totalCost.add(effectiveCost);
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
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	updateBankSetting('tob_cost', totalCost);
	await trackLoot({
		totalCost,
		id: isHardMode ? 'tob_hard' : 'tob',
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.effectiveCost,
			duration
		}))
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
