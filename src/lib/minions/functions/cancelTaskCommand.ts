import { KlasaMessage } from 'klasa';

import { cancelTask, getActivityOfUser } from '../../settings/settings';
import { NexTaskOptions, NightmareActivityTaskOptions, RaidsOptions } from '../../types/minions';

export async function cancelTaskCommand(msg: KlasaMessage) {
	const currentTask = getActivityOfUser(msg.author.id);

	if (!currentTask) {
		return msg.channel.send(
			`${msg.author.minionName} isn't doing anything at the moment, so there's nothing to cancel.`
		);
	}

	if (currentTask.type === 'Inferno') {
		return msg.channel.send(`${msg.author.minionName} is in the Inferno, they can't leave now!`);
	}

	if (currentTask.type === 'GroupMonsterKilling') {
		return msg.channel.send(
			`${msg.author.minionName} is in a group PVM trip, their team wouldn't like it if they left!`
		);
	}

	if (currentTask.type === 'Nex') {
		const data = currentTask as NexTaskOptions;
		if (data.users.length > 1) {
			return msg.channel.send(
				`${msg.author.minionName} is fighting Nex with a team, they can't abandon the trip!`
			);
		}
	}
	if (currentTask.type === 'Nightmare') {
		const data = currentTask as NightmareActivityTaskOptions;
		if (data.users.length > 1) {
			return msg.channel.send(
				`${msg.author.minionName} is fighting the Nightmare with a team, they cant leave their team!`
			);
		}
	}

	if (currentTask.type === 'BarbarianAssault') {
		return msg.channel.send(
			`${msg.author.minionName} is currently doing Barbarian Assault, and cant leave their team!`
		);
	}

	if (currentTask.type === 'SoulWars') {
		return msg.channel.send(`${msg.author.minionName} is currently doing Soul Wars, and cant leave their team!`);
	}

	if (currentTask.type === 'Raids' || currentTask.type === 'TheatreOfBlood') {
		const data = currentTask as RaidsOptions;
		if (data.users.length > 1) {
			return msg.channel.send(
				`${msg.author.minionName} is currently doing a raid, they cannot leave their team!`
			);
		}
	}

	await msg.confirm(
		`${msg.author} ${msg.author.minionStatus}\n Please confirm if you want to call your minion back from their trip. ` +
			"They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any."
	);

	await cancelTask(msg.author.id);

	return msg.channel.send(`${msg.author.minionName}'s trip was cancelled, and they're now available.`);
}
