import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Time } from '../../lib/constants';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { GearSetupTypes } from '../../lib/gear/types';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { KillableMonster } from '../../lib/minions/types';
import { NexMonster, pernixOutfit } from '../../lib/nex';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MakePartyOptions } from '../../lib/types';
import { NexActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, resolveNameBank } from '../../lib/util';
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

			if (!user.hasItem(itemID('Frozen key'))) {
				throw `${user} doesn't have a Frozen key.`;
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

	async run(msg: KlasaMessage, [type]: [string | undefined]) {
		const userBank = msg.author.bank();
		if (!userBank.has('Frozen key')) {
			return msg.send(
				`${msg.author.minionName} attempts to enter the Ancient Prison to fight Nex, but finds a giant frozen, metal door blocking their way.`
			);
		}

		if (!type || (type !== 'mass' && type !== 'solo')) {
			return msg.send(`Specify your team setup for Nex, either solo or mass.`);
		}

		this.checkReqs([msg.author], NexMonster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 8,
			ironmanAllowed: true,
			message: `${msg.author.username} is doing a ${
				NexMonster.name
			} mass! Anyone can click the ${
				Emoji.Join
			} reaction to join, click it again to leave. The maximum size for this mass is ${8}.`,
			customDenier: user => {
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
					} catch (err) {
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
		let debug = [];
		let effectiveTime = NexMonster.timeToFinish;
		const isSolo = users.length === 1;

		if (
			isSolo &&
			(users[0].settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0) < 200
		) {
			effectiveTime *= 1.5;
		}

		for (const user of users) {
			const [data] = getNexGearStats(
				user,
				users.map(u => u.id)
			);
			debug.push(`**${user.username}** debug messages:`);

			// Special inquisitor outfit damage boost
			const rangeGear = user.settings.get(UserSettings.Gear.Range);
			const equippedWeapon = user.equippedWeapon(GearSetupTypes.Range);
			if (hasArrayOfItemsEquipped(pernixOutfit, rangeGear)) {
				const percent = isSolo ? 10 : 3;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				debug.push(`${percent}% boost for full pernix`);
			} else {
				let i = 0;
				for (const inqItem of pernixOutfit) {
					if (hasItemEquipped(inqItem, rangeGear)) {
						const percent = isSolo ? 1.4 : 0.3;
						i += percent;
					}
				}
				if (i > 0) {
					debug.push(`${i}% boost for pernix items`);
					effectiveTime = reduceNumByPercent(effectiveTime, i);
				}
			}

			if (data.gearStats.attack_ranged < 200) {
				const percent = isSolo ? 20 : 10;
				effectiveTime = increaseNumByPercent(effectiveTime, percent);
				debug.push(`-${percent}% penalty for <200 ranged attack`);
			}

			if (equippedWeapon?.id === itemID('Twisted bow')) {
				const percent = isSolo ? 10 : 5;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				debug.push(`${percent}% boost for Twisted bow`);
			} else if (equippedWeapon?.id === itemID('Zaryte bow')) {
				const percent = isSolo ? 15 : 8;
				effectiveTime = reduceNumByPercent(effectiveTime, percent);
				debug.push(`${percent}% boost for Zaryte bow`);
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
				debug.push(
					`-${rangeStrBonus}% penalty for ${data.percentRangeStrength}% range strength`
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
				debug.push(`${Math.abs(kcBonus)}% boost for KC`);
			} else {
				effectiveTime = increaseNumByPercent(effectiveTime, kcBonus);
				debug.push(`-${kcBonus}% penalty for KC`);
			}
		}

		let [quantity, duration, perKillTime] = calcDurQty(
			users,
			{ ...NexMonster, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 5,
			Time.Minute * 30
		);
		this.checkReqs(users, NexMonster, quantity);

		duration = quantity * perKillTime - NexMonster.respawnTime!;
		let foodString = 'Removed brews/restores from users: ';
		let foodRemoved = [];
		for (const user of users) {
			const [healAmountNeeded] = calculateMonsterFood(NexMonster, user);
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
			let [healAmountNeeded] = calculateMonsterFood(NexMonster, user);
			const kc = user.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0;
			if (kc > 50) healAmountNeeded *= 0.5;
			else if (kc > 30) healAmountNeeded *= 0.6;
			else if (kc > 15) healAmountNeeded *= 0.7;
			else if (kc > 10) healAmountNeeded *= 0.8;
			else if (kc > 5) healAmountNeeded *= 0.9;
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

		await addSubTaskToActivityTask<NexActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Nex,
			leader: msg.author.id,
			users: users.map(u => u.id),
			minigameID: MinigameIDsEnum.Nex
		});

		let str =
			type === 'solo'
				? `Your minion is now attempting to kill Nex. ${foodString}. The trip will take ${formatDuration(
						duration
				  )}.`
				: `${partyOptions.leader.username}'s party (${users
						.map(u => u.username)
						.join(', ')}) is now off to kill ${quantity}x ${
						NexMonster.name
				  }. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
						NexMonster.timeToFinish
				  )} - the total trip will take ${formatDuration(duration)}. ${foodString}`;

		str += ` \n\n${debug.join(', ')}`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
