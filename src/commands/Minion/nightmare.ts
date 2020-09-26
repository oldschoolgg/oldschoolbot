import { calcWhatPercent } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear/types';
import { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { reducedTimeForGroup } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../lib/minions/types';
import { MakePartyOptions } from '../../lib/types';
import { NightmareActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { maxOffenceStats, maxOtherStats } from './../../lib/gear/data/maxGearStats';

const NIGHTMARES_HP = 2400;
const ZAM_HASTA_CRUSH = 65;

/**
 * get mass changes from bso
 * You need a crush weapon
 * chance of death
 * must use hasta
 * make hasta creatable
 * sarachnis https://github.com/oldschoolgg/oldschooljs/blob/811075e427d9d064a1269a4872aada3ed135334b/src/simulation/monsters/bosses/Sarachnis.ts
 * deply some bso changes
 */

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int] <monster:string>',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			aliases: ['mass']
		});
	}

	calcDurQty(users: KlasaUser[], monster: KillableMonster) {
		const perKillTime = reducedTimeForGroup(users, monster);
		const maxQty = Math.floor(users[0].maxTripLength / perKillTime);
		const duration = maxQty * perKillTime - monster.respawnTime!;
		return [maxQty, duration, perKillTime];
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

			if (user.isIronman) {
				throw `${user.username} is an ironman, so they can't join!`;
			}

			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}

			if (!hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
				throw `${
					users.length === 1 ? `You don't` : `${user.username} doesn't`
				} have enough food. You need at least ${monster?.healAmountNeeded! *
					quantity} HP in food to ${
					users.length === 1 ? 'start the mass' : 'enter the mass'
				}.`;
			}
		}
	}

	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage, [type]: ['mass' | 'solo']) {
		this.checkReqs([msg.author], NightmareMonster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 50,
			message: `${msg.author.username} is doing a ${NightmareMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = user.hasMonsterRequirements(NightmareMonster);
				if (!hasReqs) {
					return [true, `you don't have the requirements for this monster; ${reason}`];
				}

				if (NightmareMonster.healAmountNeeded) {
					try {
						calculateMonsterFood(NightmareMonster, user);
					} catch (err) {
						return [true, err];
					}

					// Ensure people have enough food for at least 2 full KC
					// This makes it so the users will always have enough food for any amount of KC
					if (!hasEnoughFoodForMonster(NightmareMonster, user, 2)) {
						return [
							true,
							`You don't have enough food. You need at least ${NightmareMonster.healAmountNeeded *
								2} HP in food to enter the mass.`
						];
					}
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const [quantity, duration, perKillTime] = this.calcDurQty(users, NightmareMonster);

		this.checkReqs(users, NightmareMonster, quantity);

		if (NightmareMonster.healAmountNeeded) {
			for (const user of users) {
				const [healAmountNeeded] = calculateMonsterFood(NightmareMonster, user);
				await removeFoodFromUser(
					this.client,
					user,
					Math.ceil(healAmountNeeded / users.length) * quantity,
					Math.ceil(healAmountNeeded / quantity),
					NightmareMonster.name
				);
			}
		}

		interface NightmareUser {
			id: string;
			chanceOfDeath: number;
			damageDone: number;
		}
		const parsedUsers = [];

		const hpRemaining = NIGHTMARES_HP;

		for (const user of users) {
			const kc = user.getMinigameScore(MinigameIDsEnum.Nightmare);
			const weapon = user.equippedWeapon(GearSetupTypes.Melee);
			const gearStats = user.setupStats(GearSetupTypes.Melee);
			const percentMeleeStrength = calcWhatPercent(
				gearStats.melee_strength,
				maxOtherStats.melee_strength
			);
			const attackCrushStat = weapon?.equipment?.attack_crush ?? 0;
			const percentWeaponAttackCrush = calcWhatPercent(attackCrushStat, 95);
			const totalGearPercent = (percentMeleeStrength + percentWeaponAttackCrush) / 2;

			let percentChanceOfDeath = Math.floor(
				100 - (Math.log(kc) / Math.log(Math.sqrt(15))) * 50
			);

			// If they have 50% best gear, -12.5% chance of death
			percentChanceOfDeath -= totalGearPercent / 4;

			// Chance of death cannot be 100% or <2%.
			percentChanceOfDeath = Math.max(Math.min(percentChanceOfDeath, 99), 2);

			let damageDone = NIGHTMARES_HP / users.length;
			if (attackCrushStat < ZAM_HASTA_CRUSH) {
			}

			damageDone = parsedUsers.push({
				id: user.id,
				chanceOfDeath: percentChanceOfDeath
			});
		}

		await addSubTaskToActivityTask<NightmareActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Nightmare,
				leader: msg.author.id,
				users: users.map(u => u.id),
				minigameID: MinigameIDsEnum.Nightmare
			}
		);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${
				NightmareMonster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				NightmareMonster.timeToFinish
			)}- the total trip will take ${formatDuration(duration)}`
		);
	}
}
