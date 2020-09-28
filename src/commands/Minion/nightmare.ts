import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks } from '../../lib/constants';
import { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
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

function soloMessage(user: KlasaUser, duration: number) {
	const kc = user.settings.get(UserSettings.MonsterScores)[NightmareMonster.id] ?? 0;
	let str = `${user.minionName} is now off to kill The Nightmare.`;
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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<mass|solo>',
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

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];

		const [quantity, duration, perKillTime] = calcDurQty(users, NightmareMonster, undefined);

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
				? soloMessage(msg.author, duration)
				: `${partyOptions.leader.username}'s party (${users
						.map(u => u.username)
						.join(', ')}) is now off to kill ${quantity}x ${
						NightmareMonster.name
				  }. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
						NightmareMonster.timeToFinish
				  )} - the total trip will take ${formatDuration(duration)}`;

		return msg.channel.send(str);
	}
}
