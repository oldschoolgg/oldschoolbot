import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { cancelTask, getActivityOfUser } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { NightmareActivityTaskOptions, RaidsTaskOptions } from '../../lib/types/minions';

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
		const currentTask = getActivityOfUser(msg.author.id) as any;

		if (!currentTask) {
			return msg.channel.send(
				`${msg.author.minionName} isn't doing anything at the moment, so there's nothing to cancel.`
			);
		}

		if (currentTask.type === Activity.Lfg) {
			return msg.channel.send(
				`${msg.author.minionName} is in a group trip, their team wouldn't like it if they left!`
			);
		}

		if (currentTask.type === Activity.GroupMonsterKilling) {
			return msg.channel.send(
				`${msg.author.minionName} is in a group PVM trip, their team wouldn't like it if they left!`
			);
		}

		if (currentTask.type === Activity.Nightmare) {
			const data = currentTask as NightmareActivityTaskOptions;
			if (data.users.length > 1) {
				return msg.channel.send(
					`${msg.author.minionName} is fighting the Nightmare with a team, they cant leave their team!`
				);
			}
		}

		if (currentTask.type === Activity.BarbarianAssault) {
			return msg.channel.send(
				`${msg.author.minionName} is currently doing Barbarian Assault, and cant leave their team!`
			);
		}

		if (currentTask.type === Activity.SoulWars) {
			return msg.channel.send(
				`${msg.author.minionName} is currently doing Soul Wars, and cant leave their team!`
			);
		}

		if (currentTask.type === Activity.Raids) {
			const data = currentTask as RaidsTaskOptions;
			if (data.users.length > 1) {
				return msg.channel.send(
					`${msg.author.minionName} is currently doing the Chamber's of Xeric, they cannot leave their team!`
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
}
