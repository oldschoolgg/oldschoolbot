import { increaseNumByPercent, reduceNumByPercent, round, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { gorajanArcherOutfit, pernixOutfit } from '../../lib/data/CollectionsExport';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { KillableMonster } from '../../lib/minions/types';
import { NexMonster } from '../../lib/nex';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { BossActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, itemID, resolveNameBank, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { getNexGearStats } from '../../lib/util/getNexGearStats';

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

			if (!user.hasItem(itemID('Frozen key'))) {
				throw `${user} doesn't have a Frozen key.`;
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

	async run(msg: KlasaMessage, [type]: [string | undefined]) {
		const userBank = msg.author.bank();
		if (!userBank.has('Frozen key')) {
			return msg.channel.send(
				`${msg.author.minionName} attempts to enter the Ancient Prison to fight Nex, but finds a giant frozen, metal door blocking their way.`
			);
		}

		if (!type || (type !== 'mass' && type !== 'solo')) {
			return msg.channel.send('Specify your team setup for Nex, either solo or mass.');
		}

		this.checkReqs([msg.author], NexMonster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 8,
			ironmanAllowed: true,
			message: `${msg.author.username} is doing a ${NexMonster.name} mass! Anyone can click the ${
				Emoji.Join
			} reaction to join, click it again to leave. The maximum size for this mass is ${8}.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = user.hasMonsterRequirements(NexMonster);
				if (!hasReqs) {
					return [true, `you don't have the requirements for this monster; ${reason}`];
				}

				if (!user.hasItemEquippedOrInBank(itemID('Frozen key'))) {
					return [true, `${user} doesn't have a Frozen key.`];
				}

				if (NexMonster.healAmountNeeded) {
					try {
						calculateMonsterFood(NexMonster, user);
					} catch (err: any) {
						return [true, err];
					}

					// Ensure people have enough food for at least 2 full KC
					// This makes it so the users will always have enough food for any amount of KC
					if (!hasEnoughFoodForMonster(NexMonster, user, 2)) {
						return [
							true,
							`You don't have enough food. You need at least ${
								NexMonster.healAmountNeeded * 2
							} HP in food to enter the mass.`
						];
					}
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];
		let debugStr = '';
		let effectiveTime = NexMonster.timeToFinish;
		if (isWeekend()) {
			effectiveTime = reduceNumByPercent(effectiveTime, 5);
			debugStr += '5% Weekend boost\n';
		}
		const isSolo = users.length === 1;

		if (isSolo && (users[0].settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0) < 200) {
			effectiveTime = increaseNumByPercent(effectiveTime, 20);
		}

		if (isSolo && (users[0].settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0) > 500) {
			effectiveTime = reduceNumByPercent(effectiveTime, 20);
		}

		for (const user of users) {
			const [data] = getNexGearStats(
				user,
				users.map(u => u.id)
			);
			debugStr += `**${user.username}**: `;
			let msgs = [];

			const rangeGear = user.getGear('range');
			if (rangeGear.hasEquipped(pernixOutfit, true, true)) {
				const percent = isSolo ? 20 : 8;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				msgs.push(`${percent}% boost for full pernix`);
			} else {
				let i = 0;
				for (const inqItem of pernixOutfit) {
					if (rangeGear.hasEquipped([inqItem], true, true)) {
						const percent = isSolo ? 2.4 : 1;
						i += percent;
					}
				}
				if (i > 0) {
					msgs.push(`${i.toFixed(2)}% boost for pernix items`);
					effectiveTime = reduceNumByPercent(effectiveTime, i);
				}
			}

			if (rangeGear.hasEquipped(gorajanArcherOutfit, true, true)) {
				const perUserPercent = round(15 / users.length, 2);
				effectiveTime = reduceNumByPercent(effectiveTime, perUserPercent);
				msgs.push(`${perUserPercent}% for Gorajan archer`);
			}

			if (data.gearStats.attack_ranged < 200) {
				const percent = isSolo ? 20 : 10;
				effectiveTime = increaseNumByPercent(effectiveTime, percent);
				msgs.push(`-${percent}% penalty for <200 ranged attack`);
			}
			if (rangeGear.hasEquipped('Zaryte bow', true, true)) {
				const percent = isSolo ? 20 : 14;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				msgs.push(`${percent}% boost for Zaryte bow`);
			} else if (rangeGear.hasEquipped('Twisted bow', true, true)) {
				const percent = isSolo ? 15 : 9;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				msgs.push(`${percent}% boost for Twisted bow`);
			}

			// Increase duration for lower melee-strength gear.
			let rangeStrBonus = 0;
			if (data.percentRangeStrength < 40) {
				rangeStrBonus = 6;
			} else if (data.percentRangeStrength < 50) {
				rangeStrBonus = 3;
			} else if (data.percentRangeStrength < 60) {
				rangeStrBonus = 2;
			}
			if (rangeStrBonus !== 0) {
				effectiveTime = increaseNumByPercent(effectiveTime, rangeStrBonus);
				msgs.push(`-${rangeStrBonus}% penalty for ${data.percentRangeStrength}% range strength`);
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

		let [quantity, duration, perKillTime] = await calcDurQty(
			users,
			{ ...NexMonster, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 2,
			Time.Minute * 30
		);
		this.checkReqs(users, NexMonster, quantity);

		let foodString = 'Removed brews/restores from users: ';
		let foodRemoved = [];
		for (const user of users) {
			let [healAmountNeeded] = calculateMonsterFood(NexMonster, user);
			const kc = user.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0;
			if (kc > 50) healAmountNeeded *= 0.5;
			else if (kc > 30) healAmountNeeded *= 0.6;
			else if (kc > 15) healAmountNeeded *= 0.7;
			else if (kc > 10) healAmountNeeded *= 0.8;
			else if (kc > 5) healAmountNeeded *= 0.9;
			if (users.length > 1) {
				healAmountNeeded /= (users.length + 1) / 1.5;
			}

			const brewsNeeded = Math.ceil(healAmountNeeded / 16) * quantity;
			const restoresNeeded = Math.ceil(brewsNeeded / 3);
			if (
				!user.bank().has(
					resolveNameBank({
						'Saradomin brew(4)': brewsNeeded,
						'Super restore(4)': restoresNeeded
					})
				)
			) {
				throw `${user.username} doesn't have enough brews or restores.`;
			}
		}
		const totalCost = new Bank();
		for (const user of users) {
			let [healAmountNeeded] = calculateMonsterFood(NexMonster, user);
			const kc = user.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0;
			if (kc > 50) healAmountNeeded *= 0.5;
			else if (kc > 30) healAmountNeeded *= 0.6;
			else if (kc > 15) healAmountNeeded *= 0.7;
			else if (kc > 10) healAmountNeeded *= 0.8;
			else if (kc > 5) healAmountNeeded *= 0.9;

			if (users.length > 1) {
				healAmountNeeded /= (users.length + 1) / 1.5;
			}

			const brewsNeeded = Math.ceil(healAmountNeeded / 16) * quantity;
			const restoresNeeded = Math.ceil(brewsNeeded / 3);
			const items = new Bank({
				'Saradomin brew(4)': brewsNeeded,
				'Super restore(4)': restoresNeeded
			});
			totalCost.add(items);
			await user.removeItemsFromBank(items);
			foodRemoved.push(`${brewsNeeded}/${restoresNeeded} from ${user.username}`);
		}

		await trackLoot({
			changeType: 'cost',
			cost: totalCost,
			id: NexMonster.name,
			type: 'Monster'
		});

		foodString += `${foodRemoved.join(', ')}.`;

		await addSubTaskToActivityTask<BossActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Nex',
			users: users.map(u => u.id)
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.NexCost, totalCost);

		let str =
			type === 'solo'
				? `Your minion is now attempting to kill ${quantity}x Nex. ${foodString}. The trip will take ${formatDuration(
						duration
				  )}.`
				: `${partyOptions.leader.username}'s party (${users
						.map(u => u.username)
						.join(', ')}) is now off to kill ${quantity}x ${
						NexMonster.name
				  }. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
						NexMonster.timeToFinish
				  )} - the total trip will take ${formatDuration(duration)}. ${foodString}`;

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str);
	}
}
