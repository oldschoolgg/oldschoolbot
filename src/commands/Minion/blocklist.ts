import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Slayer from '../../lib/skilling/skills/slayer/slayer';

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

	async run(msg: KlasaMessage, [taskname = '']: [string]) {
		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}
		const userBlockList = msg.author.blockList;

		// Block if their current task matches the block request
		const task = Slayer.AllTasks.find(task => stringMatches(task.name, taskname));
		// If the task theyre trying to block is an actual task, continue
		if (taskname.toLowerCase() === msg.author.slayerInfo.currentTask?.name) {
			if (userBlockList.length >= 5) {
				throw `You already have a full block list`;
			}
			if (msg.author.slayerInfo.slayerPoints < 100) {
				throw `You need 100 slayer points to block that task and you only have ${msg.author.slayerInfo.slayerPoints}`;
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
			const newSlayerInfo = {
					...slayerInfo,
					hasTask: false,
					currentTask: null,
					quantityTask: null,
					remainingQuantity: null,
					currentMaster: null,
					slayerPoints: slayerInfo.slayerPoints - 100,
			};
			await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			await msg.author.settings.update(UserSettings.Slayer.BlockList, task, {
				arrayAction: 'add'
			});
			return msg.send(
				`The task **${taskname}** has been **added** to your block list. You have ${msg.author.slayerInfo.slayerPoints} Slayer Points left. Your current task of ${taskname} has also been cancelled.`
			);
		}

		// Show them their block list if requested
		if (taskname === 'show') {
			let str = 'Your current block list: ';
			for (let i = 0; i < userBlockList.length; i++) {
				const blockedName = userBlockList[i].name;
				str += `${blockedName}, `;
			}
			str = str.replace(/,\s*$/, '');
			if (userBlockList.length === 0) {
				throw `You don't have any blocked tasks yet`;
			}
			throw str;
		}
		/* Look over
		// Block list removal
		if (msg.flagArgs.unblock) {
			if (!userBlockList.includes(task)) {
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

			await msg.author.settings.update(UserSettings.Slayer.BlockList, task, {
				arrayAction: 'remove'
			});
			throw `The task **${taskname}** has been **removed** from your block list`;
		}
		*/
	}
}
