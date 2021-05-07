import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { OldSchoolBotClient } from '../../lib/structures/OldSchoolBotClient';
import {
	NexActivityTaskOptions,
	NightmareActivityTaskOptions,
	RaidsActivityTaskOptions
} from './../../lib/types/minions';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 180,
			examples: ['+cancel'],
			description: 'Cancels your minions current task.',
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const currentTask = this.client.getActivityOfUser(msg.author.id) as any;

		if (!currentTask) {
			return msg.send(
				`${msg.author.minionName} isn't doing anything at the moment, so there's nothing to cancel.`
			);
		}

		if (
			currentTask.type === Activity.GroupMonsterKilling ||
			currentTask.type === Activity.Dungeoneering
		) {
			return msg.send(
				`${msg.author.minionName} is in a group PVM trip, their team wouldn't like it if they left!`
			);
		}

		if (currentTask.type === Activity.Nightmare) {
			const data = currentTask as NightmareActivityTaskOptions;
			if (data.users.length > 1) {
				return msg.send(
					`${msg.author.minionName} is fighting the Nightmare with a team, they cant leave their team!`
				);
			}
		}

		if (currentTask.type === Activity.Nex) {
			const data = currentTask as NexActivityTaskOptions;
			if (data.users.length > 1) {
				return msg.send(
					`${msg.author.minionName} is fighting Nex with a team, they cant leave their team!`
				);
			}
		}

		if (currentTask.type === Activity.KalphiteKing) {
			return msg.send(
				`${msg.author.minionName} is fighting the Kalphite King with a team, they cant leave their team!`
			);
		}
		if (currentTask.type === Activity.BarbarianAssault) {
			return msg.send(
				`${msg.author.minionName} is currently doing Barbarian Assault, and cant leave their team!`
			);
		}

		if (currentTask.type === Activity.SoulWars) {
			return msg.send(
				`${msg.author.minionName} is currently doing Soul Wars, and cant leave their team!`
			);
		}

		if (currentTask.type === Activity.Raids) {
			const data = currentTask as RaidsActivityTaskOptions;
			if (data.users.length > 1) {
				return msg.send(
					`${msg.author.minionName} is currently doing the Chamber's of Xeric, they cannot leave their team!`
				);
			}
		}

		const cancelMsg = await msg.channel.send(
			`${msg.author} ${msg.author.minionStatus}\n Say \`confirm\` if you want to call your minion back from their trip. ` +
				`They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any.`
		);

		if (!msg.flagArgs.cf) {
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return cancelMsg.edit(`Halting cancellation of minion task.`);
			}
		}

		await (this.client as OldSchoolBotClient).cancelTask(msg.author.id);

		return msg.send(
			`${msg.author.minionName}'s trip was cancelled, and they're now available.`
		);
	}
}
