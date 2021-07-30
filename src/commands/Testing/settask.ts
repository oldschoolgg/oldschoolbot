import { CommandStore, KlasaMessage } from 'klasa';
import { MoreThan } from 'typeorm';

import { getNewUser } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import { getCommonTaskName } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SlayerTaskTable } from '../../lib/typeorm/SlayerTaskTable.entity';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[master:string] [task:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [master, task]: [string, string]) {
		const slayerMaster = slayerMasters.find(
			s => stringMatches(s.name, master) || s.aliases.some(a => stringMatches(a, master))
		);
		if (!slayerMaster) return msg.channel.send(`${master} is not a valid slayer master`);
		const selectedTask = [...slayerMaster.tasks].find(
			b => stringMatches(b.monster.name, task) || b.monster.aliases.some(a => stringMatches(a, task))
		);
		if (!selectedTask) return msg.channel.send(`${task} is not a valid task from ${slayerMaster.name}`);
		const newUser = await getNewUser(msg.author.id);
		await SlayerTaskTable.update(
			{
				user: newUser,
				quantityRemaining: MoreThan(0)
			},
			{
				quantityRemaining: 0,
				skipped: true
			}
		);
		const currentTask = new SlayerTaskTable();
		currentTask.user = newUser;
		// eslint-disable-next-line prefer-destructuring
		currentTask.quantity = selectedTask.amount[1];
		currentTask.quantityRemaining = currentTask.quantity;
		currentTask.slayerMasterID = slayerMaster.id;
		currentTask.monsterID = selectedTask.monster.id;
		currentTask.skipped = false;
		await currentTask.save();
		await msg.author.settings.update(UserSettings.Slayer.LastTask, selectedTask.monster.id);
		return msg.channel.send(
			`Your new slayer task is to kill ${selectedTask.amount[1].toLocaleString()}x ${
				selectedTask.monster.name
			} (${getCommonTaskName(selectedTask.monster)})`
		);
	}
}
