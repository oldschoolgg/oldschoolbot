import { CommandStore, KlasaMessage } from 'klasa';
import slayerMasters from '../../lib/skilling/skills/slayer/slayerMasters';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, rand /* ,determineCombatLevel*/ } from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import filterTasks from '../../lib/skilling/skills/slayer/slayerFunctions/filterTasks';
import taskPicker from '../../lib/skilling/skills/slayer/slayerFunctions/taskPicker';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[slayermaster:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [slayermaster = '']: [string]) {
		await msg.author.settings.sync(true);
		// Temp maxed combat stats
		const userCombatLevel = 126;
		if (!msg.author.hasMinion) {
			throw `You don't have a minion yet. You can buy one by typing \`${msg.cmdPrefix}minion buy\`.`;
		}
		const { settings } = msg.author;
		const slayerInfo = settings.get(UserSettings.Slayer.SlayerInfo);
		const extendList = settings.get(UserSettings.Slayer.ExtendList);

		if (slayerInfo.hasTask && slayermaster === 'cancel') {
			if (msg.author.minionIsBusy) {
				return msg.send(msg.author.minionStatus);
			}
			if (slayerInfo.slayerPoints < 30) {
				return msg.send(`You need 30 Slayer Points to cancel your task.`);
			}
			msg.send(
				`Are you sure you'd like to cancel your current task of ${slayerInfo.currentTask?.name}x ${slayerInfo.quantityTask}? It will cost 30 slayer points and your current total is ${slayerInfo.slayerPoints}. Say \`confirm\` to continue.`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelled request to cancel ${slayerInfo.currentTask?.name} slayer task.`;
			}
			const newSlayerInfo = {
				...slayerInfo,
				hasTask: false,
				currentTask: null,
				quantityTask: null,
				remainingQuantity: null,
				slayerPoints: slayerInfo.slayerPoints - 30
			};
			if (slayerInfo.currentMaster === 2) {
				newSlayerInfo.wildyStreak = 0;
			} else {
				newSlayerInfo.streak = 0;
			}
			newSlayerInfo.currentMaster = null;
			await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			return msg.send(`Successfully cancelled task`);
		}

		// Figure out what master they're using
		const master = slayerMasters.find(master =>
			master.aliases.some(alias => stringMatches(alias, slayermaster))
		);
		if (!master) {
			if (slayerInfo.hasTask) {
				if (!slayerInfo.currentTask) throw `WTF`;
				let str = `You already have a slayer task of ${slayerInfo.quantityTask}x ${slayerInfo.currentTask.name}.\nIf you like to cancel a task do \`${msg.cmdPrefix}slayertask cancel\` or visit Turael for a easier task.\n`;
				if (slayerInfo.currentTask?.alternatives) {
					str += `You can also kill these monsters: ${slayerInfo.currentTask?.alternatives}!`;
					const re = /\,/gi;
					return msg.send(str.replace(re, `, `));
				}
				throw str;
			}
			throw `That's not a valid slayer master. Valid masters are ${slayerMasters
				.map(master => master.name)
				.join(', ')}.`;
		}

		if (slayerInfo.hasTask && master.masterId === 1 && slayerInfo.currentMaster !== 2) {
			if (master.tasks.some(task => task.name === slayerInfo.currentTask?.name)) {
				throw `I'm not gonna replace my own tasks.`;
			}
			msg.send(
				`Are you sure you'd like to replace your current task of ${slayerInfo.currentTask?.name} x ${slayerInfo.quantityTask}? It will be replaced with a easier task from Turael, WARNING: Your task streak will also end. Current streak is ${slayerInfo.streak}. Say \`confirm\` to continue.`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelled request to replace ${slayerInfo.currentTask?.name} slayer task.`;
			}
			const filteredTasks = filterTasks(msg, master);
			const randomedTask = taskPicker(msg, filteredTasks);
			let minQuantity = randomedTask.amount[0];
			let maxQuantity = randomedTask.amount[1];

			// Check if the task is extended
			for (const extendedTask of extendList) {
				if (randomedTask.name === extendedTask.alias) {
					[minQuantity, maxQuantity] = randomedTask.extendedAmount!;
				}
			}
			const quantity = Math.floor(rand(minQuantity, maxQuantity));
			const newSlayerInfo = {
				...slayerInfo,
				hasTask: true,
				currentTask: randomedTask,
				quantityTask: quantity,
				remainingQuantity: quantity,
				currentMaster: master.masterId,
				streak: 0
			};
			await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
				arrayAction: 'overwrite'
			});
			return msg.send(
				`Your new slayer task is ${quantity} x ${randomedTask.name} and the previous task got canceled.`
			);
		}

		// If they already have a slayer task tell them what it is
		if (slayerInfo.hasTask) {
			if (!slayerInfo.currentTask) throw `WTF`;
			let str = `You already have a slayer task of ${slayerInfo.quantityTask}x ${slayerInfo.currentTask.name}.\n`;
			if (slayerInfo.currentTask?.alternatives) {
				str += `You can also kill these monsters: ${slayerInfo.currentTask?.alternatives}!`;
				const re = /\,/gi;
				return msg.send(str.replace(re, `, `));
			}
			throw str;
		}
		if (
			master.combatLvl! > userCombatLevel ||
			master.slayerLvl! > msg.author.skillLevel(SkillsEnum.Slayer) ||
			master.questPoints! > settings.get(UserSettings.QP)
		) {
			throw `You need a combat level of ${master.combatLvl}, a slayer level of ${
				master.slayerLvl
			} and ${master.questPoints} quest points to use this master! 
You're only ${userCombatLevel} combat, ${msg.author.skillLevel(
				SkillsEnum.Slayer
			)} slayer and ${settings.get(UserSettings.QP)} questpoints.`;
		}

		const filteredTasks = filterTasks(msg, master);
		const randomedTask = taskPicker(msg, filteredTasks);
		let minQuantity = randomedTask.amount[0];
		let maxQuantity = randomedTask.amount[1];

		// Check if the task is extended
		for (const extendedTask of extendList) {
			if (randomedTask.name === extendedTask.alias) {
				[minQuantity, maxQuantity] = randomedTask.extendedAmount!;
			}
		}
		const quantity = Math.floor(rand(minQuantity, maxQuantity));
		const newSlayerInfo = {
			...slayerInfo,
			hasTask: true,
			currentTask: randomedTask,
			quantityTask: quantity,
			remainingQuantity: quantity,
			currentMaster: master.masterId
		};

		await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
			arrayAction: 'overwrite'
		});
		return msg.send(`Your new slayer task is ${quantity}x ${randomedTask.name}`);
	}
}
