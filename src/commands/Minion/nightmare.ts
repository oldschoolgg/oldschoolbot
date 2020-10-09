import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks, Time } from '../../lib/constants';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MakePartyOptions } from '../../lib/types';
import { NightmareActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { getNightmareGearStats } from '../../lib/util/getNightmareGearStats';
import resolveItems from '../../lib/util/resolveItems';
import { ZAM_HASTA_CRUSH } from './../../lib/constants';
import { NightmareMonster } from './../../lib/minions/data/killableMonsters/index';

function soloMessage(user: KlasaUser, duration: number, quantity: number) {
	const kc = user.settings.get(UserSettings.MonsterScores)[NightmareMonster.id] ?? 0;
	let str = `${user.minionName} is now off to kill The Nightmare ${quantity} times.`;
	if (kc < 5) {
		str += ` They are terrified to face The Nightmare, and set off to fight it with great fear.`;
	} else if (kc < 10) {
		str += ` They are scared to face The Nightmare, but set off with great courage.`;
	} else if (kc < 50) {
		str += ` They are confident in killing The Nightmare, and prepared for battle.`;
	} else {
		str += ` They are not scared of The Nightmare anymore, and ready to fight!`;
	}

	return `${str} The trip will take approximately ${formatDuration(duration)}.`;
}

const inquisitorItems = resolveItems([
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	"Inquisitor's mace"
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<mass|solo> [maximumSize:int{2,10}]',
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
				} have enough food. You need at least ${monster.healAmountNeeded! *
					quantity} HP in food to ${
					users.length === 1 ? 'start the mass' : 'enter the mass'
				}.`;
			}
		}
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [type, maximumSizeForParty]: ['mass' | 'solo', number]) {
		this.checkReqs([msg.author], NightmareMonster, 2);

		let maximumSize = 10;
		if (type === 'mass' && maximumSizeForParty) maximumSize = maximumSizeForParty;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: maximumSize - 1,
			message: `${msg.author.username} is doing a ${NightmareMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave. The maximum size for this mass is ${maximumSize}.`,
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

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];

		let effectiveTime = NightmareMonster.timeToFinish;
		for (const user of users) {
			const [data] = getNightmareGearStats(
				user,
				users.map(u => u.id)
			);

			// Special inquisitor outfit damage boost
			const meleeGear = user.settings.get(UserSettings.Gear.Melee);
			if (hasArrayOfItemsEquipped(inquisitorItems, meleeGear)) {
				effectiveTime *= users.length === 1 ? 0.9 : 0.97;
			} else {
				for (const inqItem of inquisitorItems) {
					if (hasItemEquipped(inqItem, meleeGear)) {
						effectiveTime *= users.length === 1 ? 0.98 : 0.995;
					}
				}
			}

			// Increase duration for each bad weapon.
			if (data.attackCrushStat < ZAM_HASTA_CRUSH) {
				effectiveTime *= 1.05;
			}

			// Increase duration for lower melee-strength gear.
			if (data.percentMeleeStrength < 40) {
				effectiveTime *= 1.06;
			} else if (data.percentMeleeStrength < 50) {
				effectiveTime *= 1.03;
			} else if (data.percentMeleeStrength < 60) {
				effectiveTime *= 1.02;
			}

			// Increase duration for lower KC.
			if (data.kc < 10) {
				effectiveTime *= 1.15;
			} else if (data.kc < 25) {
				effectiveTime *= 1.05;
			} else if (data.kc < 50) {
				effectiveTime *= 1.02;
			} else if (data.kc < 100) {
				effectiveTime *= 0.98;
			} else {
				effectiveTime *= 0.96;
			}
		}

		let [quantity, duration, perKillTime] = calcDurQty(
			users,
			{ ...NightmareMonster, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 5,
			Time.Minute * 30
		);
		this.checkReqs(users, NightmareMonster, quantity);

		duration = quantity * perKillTime - NightmareMonster.respawnTime!;

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

		const str =
			type === 'solo'
				? `${soloMessage(msg.author, duration, quantity)}`
				: `${partyOptions.leader.username}'s party (${users
						.map(u => u.username)
						.join(', ')}) is now off to kill ${quantity}x ${
						NightmareMonster.name
				  }. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
						NightmareMonster.timeToFinish
				  )} - the total trip will take ${formatDuration(duration)}.`;

		return msg.channel.send(str, {
			split: true
		});
	}
}
