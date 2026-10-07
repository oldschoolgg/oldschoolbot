import { calcWhatPercent, Emoji, formatDuration } from '@oldschoolgg/toolkit';
import { Bank, Items, itemID, TOBRooms } from 'oldschooljs';

import { getSimilarItems } from '@/lib/data/similarItems.js';
import {
	baseTOBUniques,
	calcTOBBaseDuration,
	calculateTOBDeaths,
	calculateTOBUserGearPercents,
	createTOBRaid,
	FAKE_TOB_HOST_ID,
	minimumTOBSuppliesNeeded,
	TENTACLE_CHARGES_PER_RAID,
	TOBMaxMageGear,
	TOBMaxMeleeGear,
	TOBMaxRangeGear,
	type TobTeam
} from '@/lib/data/tob.js';
import { checkUserCanUseDegradeableItem, degradeItem } from '@/lib/degradeableItems.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { blowpipeDarts } from '@/lib/minions/functions/blowpipeCommand.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
import type { TheatreOfBloodTaskOptions } from '@/lib/types/minions.js';
import { determineRunes } from '@/lib/util/determineRunes.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

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
	const kc = await u.fetchMinigameScore('tob');
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
		u.calculateUsableFood({
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

export async function checkTOBUser(
	user: MUser,
	isHardMode: boolean,
	teamSize?: number,
	quantity = 1,
	skipDuoKCRequirement = false
): Promise<[false] | [true, string]> {
	if (!user.hasMinion) {
		return [true, `${user.usernameOrMention} doesn't have a minion`];
	}

	if (!user.hasSkillReqs(minStats)) {
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
			item: Items.getOrThrow('Abyssal tentacle'),
			chargesToDegrade: TENTACLE_CHARGES_PER_RAID * quantity,
			user
		});
		if (!tentacleResult.hasEnough) {
			return [true, tentacleResult.userMessage];
		}
	}

	if (meleeGear.hasEquipped('Scythe of Vitur')) {
		const scytheResult = checkUserCanUseDegradeableItem({
			item: Items.getOrThrow('Scythe of Vitur'),
			chargesToDegrade: SCYTHE_CHARGES_PER_RAID * quantity,
			user
		});
		if (!scytheResult.hasEnough) {
			return [true, scytheResult.userMessage];
		}
	}

	// Range
	const blowpipeData = user.getBlowpipe();
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
	const dartIndex = blowpipeDarts.indexOf(Items.getOrThrow(blowpipeData.dartID));
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
	if (rangeGear.get('ammo')!.quantity < arrowsRequired) {
		return [
			true,
			`${user.usernameOrMention}, you need at least ${arrowsRequired} arrows equipped in your range setup.`
		];
	}

	if (isHardMode) {
		const kc = await user.fetchMinigameScore('tob');

		if (kc < 250) {
			return [true, `${user.usernameOrMention} needs at least 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
			return [true, `${user.usernameOrMention} needs an Infernal cape to do Hard mode.`];
		}
	}

	if (teamSize === 2 && !skipDuoKCRequirement) {
		const kc = await user.fetchMinigameScore(isHardMode ? 'tob_hard' : 'tob');
		if (kc < 150) {
			return [true, `${user.usernameOrMention} needs at least 150 KC before doing duo's.`];
		}
	}

	return [false];
}

async function checkTOBTeam(
	users: MUser[],
	isHardMode: boolean,
	solo: boolean,
	quantity = 1,
	isFakeMass = false
): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumTOBSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies`;
	}
	const effectiveTeamSize = solo ? 3 : isFakeMass ? users.length + 1 : users.length;
	if ((!solo && effectiveTeamSize < 2) || effectiveTeamSize > 5) {
		return 'TOB team must be 2-5 users';
	}

	for (const user of users) {
		if (await user.minionIsBusy()) return `${user.usernameOrMention}'s minion is busy.`;
		const checkResult = await checkTOBUser(user, isHardMode, effectiveTeamSize, quantity, isFakeMass);
		if (checkResult[1]) {
			return checkResult[1];
		}
	}

	if (!isFakeMass && effectiveTeamSize === 2) {
		const user = users[0];
		const kc = await user.fetchMinigameScore(isHardMode ? 'tob_hard' : 'tob');
		if (kc < 150) {
			return `${user.usernameOrMention} needs at least 150 KC before doing duo's.`;
		}
	}

	return null;
}

function createFakeTOBHost(): TobTeam {
	const fakeUser = {
		id: FAKE_TOB_HOST_ID,
		usernameOrMention: 'a maxed fake ToB host',
		minionName: 'maxed fake ToB host',
		gear: {
			melee: TOBMaxMeleeGear,
			range: TOBMaxRangeGear,
			mage: TOBMaxMageGear
		},
		getBlowpipe: () => ({
			dartID: itemID('Dragon dart'),
			dartQuantity: 1000,
			scales: 1000
		}),
		hasEquipped: () => true,
		hasEquippedOrInBank: () => true
	} as unknown as MUser;

	return {
		user: fakeUser,
		bank: new Bank(),
		gear: {
			melee: TOBMaxMeleeGear,
			range: TOBMaxRangeGear,
			mage: TOBMaxMageGear
		},
		kc: 1000,
		hardKC: 1000,
		attempts: 1000,
		hardAttempts: 1000
	};
}

export async function startTheatreOfBloodTrip(
	rng: RNGProvider,
	channelId: string,
	leader: MUser,
	users: MUser[],
	isHardMode: boolean,
	quantity: number | undefined,
	solo: boolean,
	isFakeMass: boolean
) {
	const team = await Promise.all(
		users.map(async u => {
			const [minigameScores, { tob_attempts, tob_hard_attempts }] = await Promise.all([
				u.fetchMinigames(),
				u.fetchStats()
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

	const teamForCalculations = solo ? [team[0], team[0], team[0]] : isFakeMass ? [...team, createFakeTOBHost()] : team;

	const { baseDuration, reductions, maxUserReduction } = calcTOBBaseDuration({
		team: teamForCalculations,
		hardMode: isHardMode
	});
	const maxTripLength = await leader.calcMaxTripLength('TheatreOfBlood');

	const maxTripsCanFit = Math.max(1, Math.floor(maxTripLength / baseDuration));

	const qty = quantity ?? maxTripsCanFit;
	if (qty > maxTripsCanFit) {
		return `Your minion cannot go on trips longer than ${formatDuration(
			maxTripLength
		)}. The most you can do with your teams setup is ${maxTripsCanFit}.`;
	}

	const teamCheckFailure = await checkTOBTeam(users, isHardMode, solo, qty, isFakeMass);
	if (teamCheckFailure) {
		return `Your mass failed to start because of this reason: ${teamCheckFailure} ${users}`;
	}

	let totalDuration = 0;
	let totalFakeDuration = 0;
	const deaths: number[][][] = [];

	const wipedRooms: (number | null)[] = [];
	for (let tripIndex = 0; tripIndex < qty; tripIndex++) {
		const {
			duration,
			wipedRoom: _wipedRoom,
			deathDuration,
			parsedTeam
		} = createTOBRaid({
			team: teamForCalculations,
			hardMode: isHardMode,
			baseDuration,
			rng
		});
		const wipedRoom = _wipedRoom ? TOBRooms.indexOf(TOBRooms.find(room => _wipedRoom.name === room.name)!) : null;
		wipedRooms.push(wipedRoom);
		totalFakeDuration += duration;
		totalDuration += deathDuration === null ? duration : deathDuration;
		deaths.push(parsedTeam.map(member => member.deaths));
	}

	let debugStr = '';

	const totalCost = new Bank();

	const costResult = await Promise.all(
		users.map(async u => {
			const supplies = await calcTOBInput(u);
			const { total } = calculateTOBUserGearPercents(u);
			const blowpipeData = u.getBlowpipe();
			const { realCost } = await u.specialRemoveItems(
				supplies
					.clone()
					.add('Coins', 100_000)
					.add(blowpipeData.dartID!, Math.floor(Math.min(blowpipeData.dartQuantity, 156)))
					.add(u.gear.range.get('ammo')?.item, 100)
					.multiply(qty)
			);
			await leader.statsBankUpdate('tob_cost', realCost);
			const effectiveCost = realCost.clone().remove('Coins', realCost.amount('Coins'));
			totalCost.add(effectiveCost);
			if (u.gear.melee.hasEquipped('Abyssal tentacle')) {
				await degradeItem({
					item: Items.getOrThrow('Abyssal tentacle'),
					user: u,
					chargesToDegrade: TENTACLE_CHARGES_PER_RAID * qty
				});
			} else if (u.gear.melee.hasEquipped('Scythe of Vitur')) {
				let usedCharges = 0;
				for (let x = 0; x < qty; x++) {
					usedCharges += rng.randomVariation(0.8 * SCYTHE_CHARGES_PER_RAID, 20);
				}
				await degradeItem({
					item: Items.getOrThrow('Scythe of Vitur'),
					user: u,
					chargesToDegrade: usedCharges
				});
			}
			debugStr += `**- ${u.usernameOrMention}** (${Emoji.Gear}${total.toFixed(1)}% ${
				Emoji.CombatSword
			}	${calcWhatPercent(reductions[u.id], maxUserReduction).toFixed(1)}%) used ${realCost}\n\n`;
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	await ClientSettings.updateBankSetting('tob_cost', totalCost);
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

	await ActivityManager.startTrip<TheatreOfBloodTaskOptions>({
		userID: leader.id,
		channelId,
		duration: totalDuration,
		type: 'TheatreOfBlood',
		leader: leader.id,
		users: users.map(u => u.id),
		isFakeMass,
		hardMode: isHardMode,
		wipedRooms,
		fakeDuration: totalFakeDuration,
		quantity: qty,
		deaths,
		solo
	});

	let str = '';
	if (solo) {
		str = `${leader.usernameOrMention}'s party (${users
			.map(u => u.usernameOrMention)
			.join(
				', '
			)}) is now off to do ${qty}x Theatre of Blood raid${qty > 1 ? 's' : ''} - the total trip will return in about ${formatTripDuration(
			leader,
			totalFakeDuration
		)}. You're in a team of 3.`;
	} else if (isFakeMass) {
		const participantIds = users.map(u => u.usernameOrMention).join(', ');
		str = `${leader.usernameOrMention}'s party (${participantIds}${
			participantIds.length > 0 ? ', ' : ''
		}simulated host) is now off to do ${qty}x Theatre of Blood raid${qty > 1 ? 's' : ''} - the total trip will return in about ${formatTripDuration(
			leader,
			totalFakeDuration
		)}.`;
	} else {
		str = `${leader.usernameOrMention}'s party (${users
			.map(u => u.usernameOrMention)
			.join(
				', '
			)}) is now off to do ${qty}x Theatre of Blood raid${qty > 1 ? 's' : ''} - the total trip will return in about ${formatTripDuration(
			leader,
			totalFakeDuration
		)}.`;
	}

	str += ` \n\n${debugStr}`;

	return str;
}

export async function tobStatsCommand({ user, rng }: OSInteraction) {
	const [minigameScores, { tob_attempts: attempts, tob_hard_attempts: hardAttempts }] = await Promise.all([
		user.fetchMinigames(),
		user.fetchStats()
	]);
	const hardKC = minigameScores.tob_hard;
	const kc = minigameScores.tob;
	const gear = calculateTOBUserGearPercents(user);
	const deathChances = calculateTOBDeaths(kc, hardKC, attempts, hardAttempts, false, gear, rng);
	const hardDeathChances = calculateTOBDeaths(kc, hardKC, attempts, hardAttempts, true, gear, rng);
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
	rng: RNGProvider,
	interaction: MInteraction,
	user: MUser,
	channelId: string,
	isHardMode: boolean,
	maxSizeInput: number | undefined,
	solo: boolean,
	quantity: number | undefined
) {
	if (await user.minionIsBusy()) {
		return `${user.usernameOrMention} minion is busy`;
	}
	const initialCheck = await checkTOBUser(user, isHardMode);
	if (initialCheck[0]) {
		return initialCheck[1];
	}

	if (isHardMode) {
		const normalKC = await user.fetchMinigameScore('tob');
		if (normalKC < 250) {
			return 'You need at least 250 completions of the Theatre of Blood before you can attempt Hard Mode.';
		}
	}
	if (await user.minionIsBusy()) {
		return "Your minion is busy, so you can't start a raid.";
	}

	const isSolo = solo;
	const maxSize = mahojiParseNumber({ input: maxSizeInput, min: 2, max: 5 }) ?? 5;

	const partyOptions: MakePartyOptions = {
		interaction,
		leader: user,
		minSize: 2,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a ${
			isHardMode ? '**Hard mode** ' : ''
		}Theatre of Blood mass! Use the buttons below to join/leave.`,
		customDenier: async _user => {
			if (await _user.minionIsBusy()) {
				return [true, `${_user.usernameOrMention} minion is busy`];
			}

			return checkTOBUser(_user, isHardMode);
		}
	};

	const users = isSolo ? [user] : await globalClient.makeParty(partyOptions);
	if (await ActivityManager.anyMinionIsBusy(users)) {
		return `All team members must have their minions free.`;
	}

	return startTheatreOfBloodTrip(rng, channelId, user, users, isHardMode, quantity, isSolo, false);
}

export async function tobCheckCommand(user: MUser, hardMode: boolean) {
	const result = await checkTOBUser(user, hardMode, 5);
	if (result[0]) {
		return `You aren't able to join a Theatre of Blood raid, address these issues first: ${result[1]}`;
	}
	return 'You are ready to do the Theatre of Blood!';
}
