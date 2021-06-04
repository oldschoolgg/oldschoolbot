import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import {
	assignNewSlayerTask,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			aliases: ['st'],
			description: 'slayer',
			examples: ['+skillcape mining'],
			usage: '[input:str]'
		});
	}

	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const { currentTask, totalTasksDone, assignedTask } = await getUsersCurrentSlayerInfo(
			msg.author.id
		);

		let rememberedSlayerMaster : string = '';
		if (msg.flagArgs.unfav || msg.flagArgs.delete || msg.flagArgs.forget) {
			await msg.author.settings.update(UserSettings.Minion.RememberSlayerMaster, null);
		} else {
			rememberedSlayerMaster = msg.author.settings.get(UserSettings.Minion.RememberSlayerMaster) ?? '';
		}

		// Match on input slayermaster if specified, falling back to remembered.
		const slayerMaster = input
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: rememberedSlayerMaster !== ''
				? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, rememberedSlayerMaster))) ?? null
				: null;

		const matchedSlayerMaster = input
			? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: null;

		if (!input || currentTask || !slayerMaster) {
			let warningInfo = '';
			if (input && !slayerMaster && matchedSlayerMaster) {
				warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
			}
			let baseInfo = currentTask
				? `Your current task is to kill ${currentTask.quantity}x ${
						assignedTask!.monster.name
				  }, you have ${currentTask.quantityRemaining} kills remaining.`
				: `You have no task at the moment <:FrogBigEyes:847859910933741628> You can get a task using \`${
						msg.cmdPrefix
				  }slayertask ${slayerMasters.map(i => i.name).join('/')}}\``;

			return msg.channel.send(`${warningInfo}${baseInfo}
		
You've done ${totalTasksDone} tasks. Your current streak is ${msg.author.settings.get(
				UserSettings.Slayer.TaskStreak
			)}.`);
		}

		// Store favorite slayer master if requested:
		if (msg.flagArgs.remember || msg.flagArgs.fav || msg.flagArgs.save) {
			await msg.author.settings.update(UserSettings.Minion.RememberSlayerMaster, slayerMaster.name);
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
		return msg.channel.send(
			`${slayerMaster.name} has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${newSlayerTask.assignedTask.monster.name}.`
		);
	}
}
