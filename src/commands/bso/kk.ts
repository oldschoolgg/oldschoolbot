import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji, Time } from '../../lib/constants';
import { hasArrayOfItemsEquipped, hasItemEquipped } from '../../lib/gear';
import { GearSetupTypes } from '../../lib/gear/types';
import { KalphiteKingMonster } from '../../lib/kalphiteking';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { KillableMonster } from '../../lib/minions/types';
import { torvaOutfit } from '../../lib/nex';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { KalphiteKingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, resolveNameBank } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { getKalphiteKingGearStats } from '../../lib/util/getKalphiteKingGearStats';

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
					users.length === 1 ? `You don't` : `${user.username} doesn't`
				} have enough brews/restores. You need at least ${
					monster.healAmountNeeded! * quantity
				} HP in food to ${users.length === 1 ? 'start the mass' : 'enter the mass'}.`;
			}
		}
	}

	async run(msg: KlasaMessage) {
		this.checkReqs([msg.author], KalphiteKingMonster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 8,
			ironmanAllowed: true,
			message: `${msg.author.username} is doing a ${KalphiteKingMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
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
					} catch (err) {
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

		const users = await msg.makePartyAwaiter(partyOptions);
		let debugStr = '';
		let effectiveTime = KalphiteKingMonster.timeToFinish;

		for (const user of users) {
			const [data] = getKalphiteKingGearStats(
				user,
				users.map(u => u.id)
			);
			debugStr += `**${user.username}**: `;
			let msgs = [];

			// Special inquisitor outfit damage boost
			const rangeGear = user.getGear('melee');
			const equippedWeapon = user.equippedWeapon(GearSetupTypes.Melee);
			if (hasArrayOfItemsEquipped(torvaOutfit, rangeGear)) {
				const percent = 8;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				msgs.push(`${percent}% boost for full Torva`);
			} else {
				let i = 0;
				for (const inqItem of torvaOutfit) {
					if (hasItemEquipped(inqItem, rangeGear)) {
						const percent = 1;
						i += percent;
					}
				}
				if (i > 0) {
					msgs.push(`${i}% boost for Torva items`);
					effectiveTime = reduceNumByPercent(effectiveTime, i);
				}
			}

			if (data.gearStats.attack_crush < 200) {
				const percent = 10;
				effectiveTime = increaseNumByPercent(effectiveTime, percent);
				msgs.push(`-${percent}% penalty for 140 attack crush`);
			}

			if (!equippedWeapon || !equippedWeapon.equipment || equippedWeapon.equipment.attack_crush < 95) {
				const percent = 30;
				effectiveTime = increaseNumByPercent(effectiveTime, percent);
				msgs.push(`-${percent}% penalty for bad weapon`);
			}

			if (equippedWeapon?.id === itemID('Drygore mace')) {
				const percent = 14;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				msgs.push(`${percent}% boost for Drygore mace`);
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
				msgs.push(
					`-${rangeStrBonus}% penalty for ${data.percentAttackStrength}% attack strength`
				);
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
				msgs.push(`7% for ${user.username} over 200 kc`);
			} else if (data.kc > 50) {
				effectiveTime = reduceNumByPercent(effectiveTime, 5);
				msgs.push(`5% for ${user.username} over 200 kc`);
			}

			debugStr += `${msgs.join(', ')}. `;
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
			let [healAmountNeeded] = calculateMonsterFood(KalphiteKingMonster, user);
			const kc = user.settings.get(UserSettings.MonsterScores)[KalphiteKingMonster.id] ?? 0;
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
		for (const user of users) {
			let [healAmountNeeded] = calculateMonsterFood(KalphiteKingMonster, user);
			const kc = user.settings.get(UserSettings.MonsterScores)[KalphiteKingMonster.id] ?? 0;
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
			await user.removeItemsFromBank(
				resolveNameBank({
					'Saradomin brew(4)': brewsNeeded,
					'Super restore(4)': restoresNeeded
				})
			);
			foodRemoved.push(`${brewsNeeded}/${restoresNeeded} from ${user.username}`);
		}
		foodString += `${foodRemoved.join(', ')}.`;

		await addSubTaskToActivityTask<KalphiteKingActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.KalphiteKing,
			leader: msg.author.id,
			users: users.map(u => u.id)
		});

		let str = `${partyOptions.leader.username}'s party (${users
			.map(u => u.username)
			.join(', ')}) is now off to kill ${quantity}x ${
			KalphiteKingMonster.name
		}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
			KalphiteKingMonster.timeToFinish
		)} - the total trip will take ${formatDuration(duration)}. ${foodString}`;

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
