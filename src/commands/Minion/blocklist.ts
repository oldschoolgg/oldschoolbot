import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import nieveTasks from '../../lib/skilling/skills/slayer/tasks/nieveTasks';
import { UserSettings } from '../../lib/UserSettings';
import turaelTasks from '../../lib/skilling/skills/slayer/tasks/turaelTasks';

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
		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}
		const userBlockList = msg.author.blockList;
		const allTasks = nieveTasks.concat(turaelTasks);

		// Block if their current task matches the block request
		const task = allTasks.filter(task => stringMatches(taskname, task.name));
		// If the task theyre trying to block is an actual task, continue
		if (taskname.toLowerCase() === Monsters.get(msg.author.slayerInfo[1])?.name.toLowerCase()) {
			if (userBlockList.length >= 5) {
				throw `You already have a full block list`;
			}
			if (msg.author.slayerInfo[4] < 100) {
				throw `You need 100 slayer points to block that task and you only have ${msg.author.slayerInfo[4]}`;
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
			const newSlayerPoints = msg.author.slayerInfo[4] - 100;
			// Has task, Slayer task ID, Slayer task quantity, Current slayer master, Slayer points, Streak
			const newInfo = [0, 0, 0, 0, newSlayerPoints, msg.author.slayerInfo[5]];
			await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newInfo, {
				arrayAction: 'overwrite'
			});
			await msg.author.settings.update(UserSettings.Slayer.BlockList, task[0].Id, {
				arrayAction: 'add'
			});
			return msg.send(
				`The task **${taskname}** has been **added** to your block list. You have ${msg.author.slayerInfo[4]} Slayer Points left. Your current task of ${taskname} has also been cancelled.`
			);
		}

		// Show them their block list if requested
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
			if (!userBlockList.includes(task[0].Id)) {
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

			await msg.author.settings.update(UserSettings.Slayer.BlockList, task[0].Id, {
				arrayAction: 'remove'
			});
			throw `The task **${taskname}** has been **removed** from your block list`;
		}

		// Add to block list
		if (typeof userBlockList === 'undefined' || userBlockList.length < 5) {
			if (msg.author.slayerInfo[4] < 100) {
				throw `You need 100 slayer points to block that task and you only have ${msg.author.slayerInfo[4]}`;
			}
			if (task.length === 0) {
				throw `That's not a valid task to block.`;
			}
			msg.send(
				`Are you sure you'd like to block ${taskname} for 100 slayer points? Say \`confirm\` to continue.`
			);
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
			if (msg.author.slayerInfo[4] < 100) {
				throw `It costs 100 slayer points to block a task and you only have ${msg.author.slayerInfo[4]}.`;
			}
			if (userBlockList.includes(task[0].Id)) {
				throw `That task is already on your block list`;
			}
			await msg.author.settings.update(UserSettings.Slayer.BlockList, task[0].Id, {
				arrayAction: 'add'
			});
			const newSlayerPoints = msg.author.slayerInfo[4] - 100;
			const newInfo = [
				msg.author.slayerInfo[0],
				msg.author.slayerInfo[1],
				msg.author.slayerInfo[2],
				msg.author.slayerInfo[3],
				newSlayerPoints,
				msg.author.slayerInfo[5]
			];
			await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newInfo, {
				arrayAction: 'overwrite'
			});
			throw `The task **${taskname}** has been **added** to your block list. You have ${msg.author.slayerInfo[4]} Slayer Points left.`;
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
