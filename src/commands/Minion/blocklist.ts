import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import { Monsters } from 'oldschooljs';
import nieveTasks from '../../lib/slayer/nieveTasks';
import { UserSettings } from '../../lib/UserSettings';
import turaelTasks from '../../lib/slayer/turaelTasks';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<taskname:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [taskname]: [string]) {
		await msg.author.settings.sync(true);
		const userBlockList = msg.author.blockList;
		const allTasks = nieveTasks.concat(turaelTasks);
		const task = allTasks.filter(task => stringMatches(taskname, task.name));
		if (taskname === Monsters.get(msg.author.slayerTaskID)?.name.toLowerCase()) {
			await msg.author.settings.update(UserSettings.Slayer.SlayerTaskQuantity, 0);
			await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, false);
			await msg.author.settings.update(UserSettings.Slayer.SlayerTaskID, 0);
			return msg.send(
				`The task **${taskname}** has been **added** to your block list. You have ${msg.author.slayerPoints} Slayer Points left. Your current task of ${taskname} has also been cancelled.`
			);
		}
		if (taskname === 'show') {
			let str = 'Your current block list: ';
			for (let i = 0; i < userBlockList.length; i++) {
				const blocked = Monsters.get(userBlockList[i]);
				const blockedName = blocked?.name;
				str += `${blockedName}, `;
			}
			str = str.replace(/,\s*$/, '');
			if (userBlockList.length === 0) {
				throw `You don't have any blocked tasks yet`;
			}
			throw str;
		}

		// Block list removal
		if (msg.flagArgs.unblock) {
			if (!userBlockList.includes(task[0].ID)) {
				throw `That task isn't on your block list.`;
			}
			msg.send(
				`Are you sure you'd like to unblock ${taskname}? Say \`confirm\` to continue.`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelling block list removal of ${taskname}.`;
			}
			await msg.author.settings.update(UserSettings.Slayer.BlockList, task[0].ID, {
				arrayAction: 'remove'
			});
			throw `The task **${taskname}** has been **removed** from your block list`;
		}

		// Add to block list
		if (typeof userBlockList === 'undefined' || userBlockList.length < 5) {
			if (task.length === 0) {
				throw `That's not a valid task to block.`;
			}
			msg.send(`Are you sure you'd like to block ${taskname}? Say \`confirm\` to continue.`);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelling block list addition of ${taskname}.`;
			}
			if (msg.author.slayerPoints < 100) {
				throw `It costs 100 slayer points to block a task and you only have ${msg.author.slayerPoints}.`;
			}
			if (userBlockList.includes(task[0].ID)) {
				throw `That task is already on your block list`;
			}
			await msg.author.settings.update(UserSettings.Slayer.BlockList, task[0].ID, {
				arrayAction: 'add'
			});
			await msg.author.removeSlayerPoints(100);
			throw `The task **${taskname}** has been **added** to your block list. You have ${msg.author.slayerPoints} Slayer Points left.`;
		}

		// If they already have a slayer task tell them what it is
		if (userBlockList.length === 5) {
			let str = 'Your current block list: ';
			for (let i = 0; i < msg.author.blockList.length; i++) {
				const monster = Monsters.get(msg.author.blockList[i])?.name;
				str += `${monster}, `;
			}
			str = str.replace(/,\s*$/, '');
			throw str;
		}
	}
}
