import type { ChatInputCommandInteraction } from 'discord.js';
import { Time, increaseNumByPercent, reduceNumByPercent, round } from 'e';
import { Bank } from 'oldschooljs';

import { calcBossFood } from '../../../lib/bso/calcBossFood';
import { gorajanWarriorOutfit, torvaOutfit } from '../../../lib/data/CollectionsExport';
import { trackLoot } from '../../../lib/lootTrack';
import { KalphiteKingMonster } from '../../../lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import { calculateMonsterFood } from '../../../lib/minions/functions';
import type { KillableMonster } from '../../../lib/minions/types';
import { setupParty } from '../../../lib/party';
import { Gear } from '../../../lib/structures/Gear';
import type { MakePartyOptions } from '../../../lib/types';
import type { BossActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable, formatDuration, isWeekend } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../../lib/util/calcMassDurationQuantity';
import { getKalphiteKingGearStats } from '../../../lib/util/getKalphiteKingGearStats';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { hasMonsterRequirements } from '../../mahojiSettings';

async function checkReqs(users: MUser[], monster: KillableMonster, quantity: number): Promise<string | undefined> {
	// Check if every user has the requirements for this monster.
	for (const user of users) {
		if (!user.user.minion_hasBought) {
			return `${user.usernameOrMention} doesn't have a minion, so they can't join!`;
		}

		if (user.minionIsBusy) {
			return `${user.usernameOrMention} is busy right now and can't join!`;
		}

		const [hasReqs, reason] = hasMonsterRequirements(user, monster);
		if (!hasReqs) {
			return `${user.usernameOrMention} doesn't have the requirements for this monster: ${reason}`;
		}

		const potionReq = await calcBossFood(user, KalphiteKingMonster, users.length, quantity);
		if (!user.bank.has(potionReq)) {
			return `${
				users.length === 1 ? "You don't" : `${user.usernameOrMention} doesn't`
			} have enough brews/restores. You need at least ${potionReq} to ${
				users.length === 1 ? 'start the mass' : 'enter the mass'
			}.`;
		}
	}
}

const minimumSoloGear = new Gear({
	body: 'Torva platebody',
	legs: 'Torva platelegs',
	feet: 'Torva boots',
	hands: 'Torva gloves'
});

export async function kkCommand(
	interaction: ChatInputCommandInteraction | null,
	user: MUser,
	channelID: string,
	inputName: string,
	inputQuantity: number | undefined
) {
	if (interaction) await deferInteraction(interaction);
	const failureRes = await checkReqs([user], KalphiteKingMonster, 2);
	if (failureRes) return failureRes;

	const type = inputName.toLowerCase().includes('mass') ? 'mass' : 'solo';

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 2,
		maxSize: 8,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is doing a ${KalphiteKingMonster.name} mass! Use the buttons below to join/leave.`,
		customDenier: async user => {
			if (!user.user.minion_hasBought) {
				return [true, "you don't have a minion."];
			}
			if (user.minionIsBusy) {
				return [true, 'your minion is busy.'];
			}
			const [hasReqs, reason] = hasMonsterRequirements(user, KalphiteKingMonster);
			if (!hasReqs) {
				return [true, `you don't have the requirements for this monster; ${reason}`];
			}

			if (KalphiteKingMonster.healAmountNeeded) {
				try {
					calculateMonsterFood(KalphiteKingMonster, user);
				} catch (err: any) {
					return [true, err];
				}

				// Ensure people have enough food for at least 10 kills.
				// We don't want to overshoot, as the mass will still fail if there's not enough food
				const potionReq = await calcBossFood(user, KalphiteKingMonster, 1, 10);
				if (!user.bank.has(potionReq)) {
					return [true, `You don't have enough food. You need at least ${potionReq} to Join the mass.`];
				}
			}

			return [false];
		}
	};

	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'No channel found.';
	let users: MUser[] = [];
	if (type === 'mass') {
		const usersWhoConfirmed = await setupParty(channel, user, partyOptions);
		users = usersWhoConfirmed.filter(u => !u.minionIsBusy);
	} else {
		users = [user];
	}

	if (users.length === 1) {
		if (!user.gear.melee.meetsStatRequirements(minimumSoloGear.stats)) {
			return "Your gear isn't good enough to solo the Kalphite King.";
		}
	}

	let debugStr = '';
	let effectiveTime = KalphiteKingMonster.timeToFinish;
	if (isWeekend()) {
		effectiveTime = reduceNumByPercent(effectiveTime, 5);
		debugStr += '5% Weekend boost\n';
	}

	for (const user of users) {
		const [data] = await getKalphiteKingGearStats(
			user,
			users.map(u => u.id)
		);
		debugStr += `**${user.usernameOrMention}**: `;
		const msgs = [];

		// Special inquisitor outfit damage boost
		const meleeGear = user.gear.melee;
		const equippedWeapon = meleeGear.equippedWeapon();
		if (meleeGear.hasEquipped(torvaOutfit, true, true)) {
			const percent = 8;
			effectiveTime = reduceNumByPercent(effectiveTime, percent);
			msgs.push(`${percent}% boost for full Torva`);
		} else {
			let i = 0;
			for (const inqItem of torvaOutfit) {
				if (meleeGear.hasEquipped([inqItem], true, true)) {
					const percent = 1;
					i += percent;
				}
			}
			if (i > 0) {
				msgs.push(`${i}% boost for Torva items`);
				effectiveTime = reduceNumByPercent(effectiveTime, i);
			}
		}

		if (meleeGear.hasEquipped(gorajanWarriorOutfit, true, true)) {
			const perUserPercent = round(15 / users.length, 2);
			effectiveTime = reduceNumByPercent(effectiveTime, perUserPercent);
			msgs.push(`${perUserPercent}% for Gorajan warrior`);
		}

		if (data.gearStats.attack_crush < 200) {
			const percent = 10;
			effectiveTime = increaseNumByPercent(effectiveTime, percent);
			msgs.push(`-${percent}% penalty for 200 attack crush`);
		}

		if (!equippedWeapon || !equippedWeapon.equipment || equippedWeapon.equipment.attack_crush < 95) {
			const percent = 30;
			effectiveTime = increaseNumByPercent(effectiveTime, percent);
			msgs.push(`-${percent}% penalty for bad weapon`);
		}

		if (meleeGear.hasEquipped('Drygore mace', true, true)) {
			const percent = 14;
			effectiveTime = reduceNumByPercent(effectiveTime, percent);
			msgs.push(`${percent}% boost for Drygore mace`);
		}

		if (meleeGear.hasEquipped('Offhand drygore mace', true, true)) {
			const percent = 5;
			effectiveTime = reduceNumByPercent(effectiveTime, percent);
			msgs.push(`${percent}% boost for Offhand drygore mace`);
		}

		if (meleeGear.hasEquipped('TzKal cape', true, true)) {
			const percent = 4;
			effectiveTime = reduceNumByPercent(effectiveTime, percent);
			msgs.push(`${percent}% boost for TzKal cape`);
		}

		if (user.owns('Axe of the high sungod')) {
			const percent = 10;
			effectiveTime = reduceNumByPercent(effectiveTime, percent);
			msgs.push(`${percent}% boost for Axe of the high sungod`);
		}

		// Increase duration for lower melee-strength gear.
		let rangeStrBonus = 0;
		if (data.percentAttackStrength < 40) {
			rangeStrBonus = 6;
		} else if (data.percentAttackStrength < 50) {
			rangeStrBonus = 3;
		} else if (data.percentAttackStrength < 60) {
			rangeStrBonus = 2;
		}
		if (rangeStrBonus !== 0) {
			effectiveTime = increaseNumByPercent(effectiveTime, rangeStrBonus);
			msgs.push(`-${rangeStrBonus}% penalty for ${data.percentAttackStrength}% attack strength`);
		}

		// Increase duration for lower KC.
		let kcBonus = -4;
		if (data.kc < 10) {
			kcBonus = 15;
		} else if (data.kc < 25) {
			kcBonus = 5;
		} else if (data.kc < 50) {
			kcBonus = 2;
		} else if (data.kc < 100) {
			kcBonus = -2;
		}

		if (kcBonus < 0) {
			effectiveTime = reduceNumByPercent(effectiveTime, Math.abs(kcBonus));
			msgs.push(`${Math.abs(kcBonus)}% boost for KC`);
		} else {
			effectiveTime = increaseNumByPercent(effectiveTime, kcBonus);
			msgs.push(`-${kcBonus}% penalty for KC`);
		}

		if (data.kc > 500) {
			effectiveTime = reduceNumByPercent(effectiveTime, 15);
			msgs.push(`15% for ${user.usernameOrMention} over 500 kc`);
		} else if (data.kc > 300) {
			effectiveTime = reduceNumByPercent(effectiveTime, 13);
			msgs.push(`13% for ${user.usernameOrMention} over 300 kc`);
		} else if (data.kc > 200) {
			effectiveTime = reduceNumByPercent(effectiveTime, 10);
			msgs.push(`10% for ${user.usernameOrMention} over 200 kc`);
		} else if (data.kc > 100) {
			effectiveTime = reduceNumByPercent(effectiveTime, 7);
			msgs.push(`7% for ${user.usernameOrMention} over 100 kc`);
		} else if (data.kc > 50) {
			effectiveTime = reduceNumByPercent(effectiveTime, 5);
			msgs.push(`5% for ${user.usernameOrMention} over 50 kc`);
		}

		debugStr += `${msgs.join(', ')}. `;
	}

	if (users.length === 1) {
		effectiveTime = reduceNumByPercent(effectiveTime, 20);
	}

	let minDuration = 2;
	if (users.length === 4) minDuration = 1.5;
	if (users.length === 5) minDuration = 1.2;
	if (users.length >= 6) minDuration = 1;

	const durQtyRes = await calcDurQty(
		users,
		{ ...KalphiteKingMonster, timeToFinish: effectiveTime },
		inputQuantity,
		Time.Minute * minDuration,
		Time.Minute * 30
	);
	if (typeof durQtyRes === 'string') return durQtyRes;
	const [quantity, duration, perKillTime] = durQtyRes;
	const secondCheck = await checkReqs(users, KalphiteKingMonster, quantity);
	if (secondCheck) return secondCheck;

	let foodString = 'Removed brews/restores from users: ';
	const foodRemoved: string[] = [];
	for (const user of users) {
		const food = await calcBossFood(user, KalphiteKingMonster, users.length, quantity);
		if (!user.bank.has(food.bank)) {
			return `${user.usernameOrMention} doesn't have enough brews or restores.`;
		}
	}

	const removeResult = await Promise.all(
		users.map(async user => {
			const cost = await calcBossFood(user, KalphiteKingMonster, users.length, quantity);
			foodRemoved.push(`${cost} from ${user.usernameOrMention}`);
			await user.removeItemsFromBank(cost);
			return {
				id: user.id,
				cost
			};
		})
	);

	const totalCost = new Bank();
	for (const u of removeResult) totalCost.add(u.cost);

	foodString += `${foodRemoved.join(', ')}.`;

	await trackLoot({
		changeType: 'cost',
		totalCost,
		id: KalphiteKingMonster.name,
		type: 'Monster',
		users: removeResult.map(i => ({
			id: i.id,
			cost: i.cost
		}))
	});

	await addSubTaskToActivityTask<BossActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'KalphiteKing',
		users: users.map(u => u.id)
	});

	updateBankSetting('kk_cost', totalCost);

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to kill ${quantity}x ${KalphiteKingMonster.name}. Each kill takes ${formatDuration(
		perKillTime
	)} instead of ${formatDuration(KalphiteKingMonster.timeToFinish)} - the total trip will take ${formatDuration(
		duration
	)}. ${foodString}`;

	str += ` \n\n${debugStr}`;

	return str;
}
