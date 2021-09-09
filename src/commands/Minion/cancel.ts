import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { cancelTask, getActivityOfUser } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';
import chatHeadImage from '../../lib/util/chatHeadImage';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 30,
			examples: ['+cancel'],
			description: 'Cancels your minions current task.',
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const currentTask = getActivityOfUser(msg.author.id);

		if (!currentTask) {
			return msg.channel.send(
				`${msg.author.minionName} isn't doing anything at the moment, so there's nothing to cancel.`
			);
		}

		if ((currentTask as any).users && (currentTask as any).users.length > 1) {
			return msg.channel.send('Your minion is on a group activity and cannot cancel!');
		}

		if (currentTask.type === Activity.MonkeyRumble) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: 'You no allowed to leave the arena! You finish fight!',
						head: 'marimbo'
					})
				]
			});
		}

		await msg.confirm(
			`${msg.author} ${msg.author.minionStatus}\n Please confirm if you want to call your minion back from their trip. ` +
				"They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any."
		);

		await cancelTask(msg.author.id);

		return msg.channel.send(`${msg.author.minionName}'s trip was cancelled, and they're now available.`);
	}
}
