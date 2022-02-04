import { increaseNumByPercent, reduceNumByPercent, round, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { gorajanWarriorOutfit, torvaOutfit } from '../../lib/data/CollectionsExport';
import { KalphiteKingMonster } from '../../lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { KillableMonster } from '../../lib/minions/types';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { MakePartyOptions } from '../../lib/types';
import { BossActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { getKalphiteKingGearStats } from '../../lib/util/getKalphiteKingGearStats';

const minimumSoloGear = new Gear({
	body: 'Torva platebody',
	legs: 'Torva platelegs',
	feet: 'Torva boots',
	hands: 'Torva gloves'
});

function calcFood(user: KlasaUser, teamSize: number, quantity: number) {
	let [healAmountNeeded] = calculateMonsterFood(KalphiteKingMonster, user);
	const kc = user.settings.get(UserSettings.MonsterScores)[KalphiteKingMonster.id] ?? 0;
	if (kc > 50) healAmountNeeded *= 0.5;
	else if (kc > 30) healAmountNeeded *= 0.6;
	else if (kc > 15) healAmountNeeded *= 0.7;
	else if (kc > 10) healAmountNeeded *= 0.8;
	else if (kc > 5) healAmountNeeded *= 0.9;
	healAmountNeeded /= (teamSize + 1) / 1.5;
	let brewsNeeded = Math.ceil(healAmountNeeded / 16) * quantity;
	if (teamSize === 1) brewsNeeded += 2;
	const restoresNeeded = Math.ceil(brewsNeeded / 3);
	const items = new Bank({
		'Saradomin brew(4)': brewsNeeded,
		'Super restore(4)': restoresNeeded
	});
	return items;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[mass|solo]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	checkReqs(users: KlasaUser[], monster: KillableMonster, quantity: number) {
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} doesn't have a minion, so they can't join!`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy right now and can't join!`;
			}

			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}

			if (!hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
				throw `${
					users.length === 1 ? "You don't" : `${user.username} doesn't`
				} have enough brews/restores. You need at least ${monster.healAmountNeeded! * quantity} HP in food to ${
					users.length === 1 ? 'start the mass' : 'enter the mass'
				}.`;
			}
		}
	}

	async run(msg: KlasaMessage, [type = 'mass']: ['mass' | 'solo' | undefined]) {
		this.checkReqs([msg.author], KalphiteKingMonster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 8,
			ironmanAllowed: true,
			message: `${msg.author.username} is doing a ${KalphiteKingMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = user.hasMonsterRequirements(KalphiteKingMonster);
				if (!hasReqs) {
					return [true, `you don't have the requirements for this monster; ${reason}`];
				}

				if (KalphiteKingMonster.healAmountNeeded) {
					try {
						calculateMonsterFood(KalphiteKingMonster, user);
					} catch (err: any) {
						return [true, err];
					}

					// Ensure people have enough food for at least 2 full KC
					// This makes it so the users will always have enough food for any amount of KC
					if (!hasEnoughFoodForMonster(KalphiteKingMonster, user, 2)) {
						return [
							true,
							`You don't have enough food. You need at least ${
								KalphiteKingMonster.healAmountNeeded * 2
							} HP in food to enter the mass.`
						];
					}
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];

		if (users.length === 1) {
			if (!msg.author.getGear('melee').meetsStatRequirements(minimumSoloGear.stats)) {
				return msg.channel.send("Your gear isn't good enough to solo the Kalphite King.");
			}
		}

		let debugStr = '';
		let effectiveTime = KalphiteKingMonster.timeToFinish;
		if (isWeekend()) {
			effectiveTime = reduceNumByPercent(effectiveTime, 5);
			debugStr += '5% Weekend boost\n';
		}

		for (const user of users) {
			const [data] = getKalphiteKingGearStats(
				user,
				users.map(u => u.id)
			);
			debugStr += `**${user.username}**: `;
			let msgs = [];

			// Special inquisitor outfit damage boost
			const meleeGear = user.getGear('melee');
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
				msgs.push(`15% for ${user.username} over 500 kc`);
			} else if (data.kc > 300) {
				effectiveTime = reduceNumByPercent(effectiveTime, 13);
				msgs.push(`13% for ${user.username} over 300 kc`);
			} else if (data.kc > 200) {
				effectiveTime = reduceNumByPercent(effectiveTime, 10);
				msgs.push(`10% for ${user.username} over 200 kc`);
			} else if (data.kc > 100) {
				effectiveTime = reduceNumByPercent(effectiveTime, 7);
				msgs.push(`7% for ${user.username} over 100 kc`);
			} else if (data.kc > 50) {
				effectiveTime = reduceNumByPercent(effectiveTime, 5);
				msgs.push(`5% for ${user.username} over 50 kc`);
			}

			debugStr += `${msgs.join(', ')}. `;
		}

		if (users.length === 1) {
			effectiveTime = reduceNumByPercent(effectiveTime, 20);
		}

		let [quantity, duration, perKillTime] = await calcDurQty(
			users,
			{ ...KalphiteKingMonster, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 2,
			Time.Minute * 30
		);
		this.checkReqs(users, KalphiteKingMonster, quantity);

		let foodString = 'Removed brews/restores from users: ';
		let foodRemoved = [];
		for (const user of users) {
			const food = calcFood(user, users.length, quantity);
			if (!user.bank().has(food.bank)) {
				throw `${user.username} doesn't have enough brews or restores.`;
			}
		}
		const totalCost = new Bank();
		for (const user of users) {
			const food = calcFood(user, users.length, quantity);
			await user.removeItemsFromBank(food.bank);
			totalCost.add(food);
			foodRemoved.push(`${food} from ${user.username}`);
		}
		foodString += `${foodRemoved.join(', ')}.`;

		await trackLoot({
			changeType: 'cost',
			cost: totalCost,
			id: KalphiteKingMonster.name,
			type: 'Monster'
		});

		await addSubTaskToActivityTask<BossActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'KalphiteKing',
			users: users.map(u => u.id)
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.KalphiteKingCost, totalCost);

		let str = `${partyOptions.leader.username}'s party (${users
			.map(u => u.username)
			.join(', ')}) is now off to kill ${quantity}x ${KalphiteKingMonster.name}. Each kill takes ${formatDuration(
			perKillTime
		)} instead of ${formatDuration(KalphiteKingMonster.timeToFinish)} - the total trip will take ${formatDuration(
			duration
		)}. ${foodString}`;

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str);
	}
}
