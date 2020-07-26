import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[action:string] [task:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [action = '', taskname = '']: [string, string]) {
		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}
		const slayerInfo = msg.author.settings.get(UserSettings.Slayer.SlayerInfo);
		const userBlockList = msg.author.settings.get(UserSettings.Slayer.BlockList);

		// If the task theyre trying to block is an actual task, continue
		if (action.toLowerCase() === 'block') {
			if (!slayerInfo.hasTask) {
				throw `You currently don't have a task to block. Visit a Slayer Master.`;
			}
			if (userBlockList.length >= 5) {
				throw `You already have a full block list`;
			}
			if (slayerInfo.slayerPoints < 100) {
				throw `You need 100 slayer points to block that task and you only have ${slayerInfo.slayerPoints}`;
			}
			msg.send(
				`Are you sure you'd like to block ${slayerInfo.currentTask?.name}? Say \`confirm\` to continue.`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelling block list addition of ${slayerInfo.currentTask?.name}.`;
			}
			await msg.author.settings.update(
				UserSettings.Slayer.BlockList,
				slayerInfo.currentTask,
				{
					arrayAction: 'add'
				}
			);
			const newSlayerInfo = {
				...slayerInfo,
				hasTask: false,
				currentTask: null,
				quantityTask: null,
				remainingQuantity: null,
				currentMaster: null,
				slayerPoints: slayerInfo.slayerPoints - 100
			};
			await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			return msg.send(
				`The task has been **added** to your block list. You have ${slayerInfo.slayerPoints -
					100} Slayer Points left. Your current task has also been cancelled.`
			);
		}

		// Show them their block list if requested
		if (action === 'show') {
			let str = 'Your current block list: ';
			if (userBlockList.length === 0) {
				throw `You don't have any blocked tasks yet`;
			}
			for (let i = 0; i < userBlockList.length; i++) {
				const blockedName = userBlockList[i].name;
				str += `${blockedName}, `;
			}
			str = str.replace(/,\s*$/, '');
			throw str;
		}

		// Block list removal
		if (action === 'unblock') {
			for (const task of userBlockList) {
				if (task.name === taskname) {
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
			}
			throw `That task isn't on your block list. Tasks on your block list are: ${userBlockList
				.map(blocked => blocked.name)
				.join(`, `)}.`;
		}

		throw `The valid blocklist commands are \`${msg.cmdPrefix}blocklist block\`, \`${msg.cmdPrefix}blocklist show\` and \`${msg.cmdPrefix}blocklist unblock\`.`;
	}
}
