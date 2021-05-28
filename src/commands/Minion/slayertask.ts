import { CommandStore, KlasaMessage } from 'klasa';

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
			description: 'slayer',
			examples: ['+skillcape mining'],
			usage: '[input:str]'
		});
	}

	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const { currentTask, totalTasksDone, assignedTask } = await getUsersCurrentSlayerInfo(
			msg.author.id
		);

		const slayerMaster = input
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: null;

		if (!input || currentTask || !slayerMaster) {
			let baseInfo = currentTask
				? `Your current task is to kill ${currentTask.quantity}x ${
						assignedTask!.monster.name
				  }, you have ${currentTask.quantityRemaining} kills remaining.`
				: `You have no task at the moment <:FrogBigEyes:847859910933741628> You can get a task using \`${
						msg.cmdPrefix
				  }slayertask ${slayerMasters.map(i => i.name).join('/')}}\``;

			return msg.channel.send(`${baseInfo}
		
You've done ${totalTasksDone} tasks.`);
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
		return msg.channel.send(
			`${slayerMaster.name} has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${newSlayerTask.assignedTask.monster.name}.`
		);
	}
}
