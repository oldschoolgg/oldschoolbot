import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import {
	assignNewSlayerTask,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../lib/slayer/slayerUtil';

import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import { production } from "../../config";
import killableMonsters from "../../lib/minions/data/killableMonsters";
import { SlayerTaskUnlocksEnum, SlayerRewardsShop } from "../../lib/slayer/slayerUnlocks";

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

		if (production === false) {
			if (msg.flagArgs.mal3v0lent) {
				await msg.author.settings.update(UserSettings.Slayer.SlayerUnlocks, 2);
				return msg.send('Hopefully updated');
			}
			if (msg.flagArgs.b4ws) {
				await msg.author.settings.update(
					UserSettings.Slayer.SlayerUnlocks,
					SlayerTaskUnlocksEnum.LikeABoss
				);
				return msg.send('Hopefully updated');
			}
		}
		if (currentTask && msg.flagArgs.skip) {
			let slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints) ?? 0;
			if (slayerPoints < 30) {
				return msg.send(`You need 30 points to cancel, you only have: ${slayerPoints}`);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really skip task? This will cost 30 slayer points.\n\nType **confirm** to skip.`
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
					return alchMessage.edit(`Not skipping slayer task.`);
				}
			}
			slayerPoints -= 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, slayerPoints);
			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			return msg.send('Your task has been skipped.');
		}

		let rememberedSlayerMaster: string = '';
		if (msg.flagArgs.unfav || msg.flagArgs.delete || msg.flagArgs.forget) {
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, null);
		} else {
			rememberedSlayerMaster =
				msg.author.settings.get(UserSettings.Slayer.RememberSlayerMaster) ?? '';
		}

		// Match on input slayermaster if specified, falling back to remembered.
		const slayerMaster = input
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: rememberedSlayerMaster !== ''
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m =>
						m.aliases.some(alias => stringMatches(alias, rememberedSlayerMaster))
					) ?? null
			: null;

		// TODO: Delete this
		msg.author.log(`Remembered: ${rememberedSlayerMaster}`);
		msg.author.log(`slayermaster: ${slayerMaster?.name}`);

		const matchedSlayerMaster = input
			? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: null;

		// Special handling for Turael skip
		if (currentTask && input && slayerMaster && slayerMaster.name === 'Turael') {
			// TODO: Make sure they aren't already on a Turael task.
			if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monsterID)) {
				return msg.send(`You cannot skip this task because Turael assigns it.`);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really cancel task? This will reset your streak to 0 and give you a new` +
						` ${slayerMaster.name} task.\n\nType **confirm** to skip.`
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

			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			msg.author.settings.update(UserSettings.Slayer.TaskStreak, 0);
			const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
			let commonName = getCommonTaskName(newSlayerTask.assignedTask);
			return msg.channel.send(
				`Your task has been skipped.\n\n ${slayerMaster.name}` +
					` has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}.`
			);
		}
		if (currentTask || !slayerMaster) {
			let warningInfo = '';
			if (input && !slayerMaster && matchedSlayerMaster) {
				let aRequirements : string[] = [];
				if (matchedSlayerMaster.slayerLvl)
					aRequirements.push(`Slayer Level: ${matchedSlayerMaster.slayerLvl}`);
				if (matchedSlayerMaster.combatLvl)
					aRequirements.push(`Combat Level: ${matchedSlayerMaster.combatLvl}`);
				if (matchedSlayerMaster.questPoints)
					aRequirements.push(`Quest points: ${matchedSlayerMaster.questPoints}`);
				warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
				if (aRequirements.length)
					warningInfo += `Requires: ${aRequirements.join(`\n`)}\n\n`;
			}
			let alternateMonsters : string[] = [];
			let monsterList = '';
			if (currentTask && assignedTask) {
				const altMobs = assignedTask.monsters;
				altMobs.forEach(m => {
					const monster = killableMonsters.find(
						mon => mon.id === m
					);
					alternateMonsters.push(monster!.name);
				})
				monsterList = alternateMonsters.join(`, `);
			}
			let baseInfo = currentTask
				? `Your current task is to kill ${currentTask.quantity}x ${getCommonTaskName(
						assignedTask!
				  )}, you have ${currentTask.quantityRemaining} kills remaining.\n\nOptions:\n${monsterList}`
				: `You have no task at the moment <:FrogBigEyes:847859910933741628> You can get a task using \`${
						msg.cmdPrefix
				  }slayertask ${slayerMasters.map(i => i.name).join('/')}\``;

			return msg.channel.send(`${warningInfo}${baseInfo}
	
You've done ${totalTasksDone} tasks. Your current streak is ${msg.author.settings.get(
				UserSettings.Slayer.TaskStreak
			)}.`);
		}

		// Store favorite slayer master if requested:
		if (msg.flagArgs.remember || msg.flagArgs.fav || msg.flagArgs.save) {
			await msg.author.settings.update(
				UserSettings.Slayer.RememberSlayerMaster,
				slayerMaster.name
			);
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
		const myUnlocks = await msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks) ?? undefined;
		if (myUnlocks) {
			SlayerRewardsShop.filter(srs => { return srs.extendID !== undefined; })
				.forEach(srsf => {
					if (srsf.extendID!.includes(currentTask.monsterID)) {
						console.log(`Extending... previous: ${newSlayerTask.currentTask.quantity}`);
						newSlayerTask.currentTask.quantity *= srsf.extendMult;
						console.log(`New: ${newSlayerTask.currentTask.quantity}`);
						newSlayerTask.currentTask.save();
					}
				})

			/*
			myUnlocks.forEach(u => {
				if (
					SlayerRewardsShop
						.find(srs => {
							return srs.id === u && srs.extendID !== undefined && srs.extendID.length;
						})!
						.extendID!.includes(newSlayerTask.currentTask.monsterID)
				) {
					console.log(`Extending... previous: ${newSlayerTask.currentTask.quantity}`);
					newSlayerTask.currentTask.quantity *= 1.5;
					console.log(`New: ${newSlayerTask.currentTask.quantity}`);
					newSlayerTask.currentTask.save();
				}
			})

			 */
		}

		let commonName = getCommonTaskName(newSlayerTask.assignedTask);
		return msg.channel.send(
			`${slayerMaster.name} has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}.`
		);
	}
}
