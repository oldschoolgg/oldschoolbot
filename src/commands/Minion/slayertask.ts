import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import {
	assignNewSlayerTask,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import {formatDuration, stringMatches} from '../../lib/util';
import { Monsters } from 'oldschooljs';

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

		if (currentTask && msg.flagArgs.skip) {
			let slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints) ?? 0;
			if (slayerPoints < 30) {
				return msg.send(`You need 30 points to cancel, you only have: ${slayerPoints}`);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really skip task? This will cost 30 slayer points.`
				);

				try {
					await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id &&
							_msg.content.toLowerCase() === 'confirm',
						{
							max: 1,
							time: 10_000,
							errors: ['time']
						}
					);
				} catch (err) {
					return alchMessage.edit(`Not cancelling slayer task.`);
				}
			}
			slayerPoints -= 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, slayerPoints);
		}

		let rememberedSlayerMaster : string = '';
		if (msg.flagArgs.unfav || msg.flagArgs.delete || msg.flagArgs.forget) {
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, null);
		} else {
			rememberedSlayerMaster = msg.author.settings.get(UserSettings.Slayer.RememberSlayerMaster) ?? '';
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

		msg.author.log(`Remembered: ${rememberedSlayerMaster}`);
		msg.author.log(`slayermaster: ${slayerMaster?.name}`);

		const matchedSlayerMaster = input
			? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: null;

		if (currentTask || !slayerMaster) {
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
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, slayerMaster.name);
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
		let commonName = newSlayerTask.assignedTask.monster.name;
		switch (newSlayerTask.assignedTask.monster.id) {
			case Monsters.KaphiteWorker:
				commonName = 'Kalphite';
				break;
			case Monsters.MountainTroll:
				commonName = 'Trolls';
				break;
			case Monsters.FossilIslandWyvernSpitting:
				commonName = 'Fossil Island Wyverns';
				break;
			case Monsters.FeralVampyre:
				commonName = 'Vampyres';
				break;

			default:
		}
		return msg.channel.send(
			`${slayerMaster.name} has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${newSlayerTask.assignedTask.monster.name}.`
		);
	}
}
