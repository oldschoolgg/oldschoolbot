import { TextChannel } from 'discord.js';
import { Task } from 'klasa';

import { Activity, Events } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { randomItemFromArray, roll } from '../../lib/util';

const deathMessages = [
	"{name} just died while killing {monster}, however they're on their back to continue the trip.",
	'{name} informs you that they accidentally died while trying to kill {monster}, they apologize profusely and get back on the trip as soon as they can.',
	'{name} has just died while trying to kill {monster}, however they promise to get back and finish the trip.',
	'{monster} just sent {name} to lumbridge, however they return back to the trip.',
	'{name} was viciously killed by {monster}, they are scared to return but nevertheless return to finish the finish.',
	'{name} died to {monster}.',
	'{name} died to {monster}, and is beat up and tired, but picks up the courage to return to finish the trip.',
	"{name} nervously messages you to inform you they just died fighting {monster}, but assure you they'll finish the trip"
];

const pvpDeathMessages = [
	'{name} was just PKed in the middle of their trip.',
	'{name} got PKed while killing {monster}, but is coming back to finish the trip.',
	'{name} got teleblocked, and then specced out with dragon claws, unfortunately they died.',
	'{name} hopes it doesnt anger you, but they were just PKed.'
];

const randomDeathMessage = (minionName: string, monsterName: string) =>
	randomItemFromArray(deathMessages)
		.replace('{name}', minionName)
		.replace('{monster}', monsterName);

const randomPVPDeathMessage = (minionName: string, monsterName: string) =>
	randomItemFromArray(pvpDeathMessages)
		.replace('{name}', minionName)
		.replace('{monster}', monsterName);

export default class extends Task {
	async run() {
		const currentTasks = this.client.schedule.tasks.filter(
			task => task.data.type === Activity.MonsterKilling
		);

		for (const task of currentTasks) {
			const monster = killableMonsters.find(mon => mon.id === task.data.monsterID);
			if (task.data.quantity < 2) continue;
			if (!monster) {
				this.client.emit(Events.Wtf, `Non-existant monster: ${JSON.stringify(task.data)}`);
				return;
			}

			if (!monster.canBeKilled) return;

			let deathChance = 30;

			// Base chance of death is (30 * (10 - difficulyRating))
			// So if the rating is higher, the number is lower = higher chance.
			deathChance *= 10 - monster.difficultyRating;

			// If its a wildy monster, the chance is 10x higher!
			if (monster.wildy) deathChance /= 10;
			if (!roll(deathChance)) return;
			const user = await this.client.users.fetch(task.data.userID).catch(() => null);
			const channel = await this.client.channels.fetch(task.data.channelID).catch(() => null);

			if (user) {
				user.log(
					`[MinionDeath] Minion died killing ${task.data.quantity}x ${monster.name} at a chance of 1 in ${deathChance}`
				);
				const deaths = user.settings.get(UserSettings.Stats.Deaths);
				user.settings.update(UserSettings.Stats.Deaths, deaths + 1);

				if (channel && channel instanceof TextChannel) {
					// If the monster is in the wilderness, 50/50 chance it was a PK death.
					if (monster.wildy && roll(2)) {
						await channel.send(randomPVPDeathMessage(user.minionName, monster.name));
					} else {
						await channel.send(randomDeathMessage(user.minionName, monster.name));
					}
				}
			}

			task.update({
				data: { ...task.data, quantity: task.data.quantity - 1 }
			});

			break;
		}
	}
}
