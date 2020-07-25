import { CommandStore, KlasaMessage } from 'klasa';
import slayerMasters from '../../lib/skilling/skills/slayer/slayerMasters';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, rand /* ,determineCombatLevel*/ } from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';
// import bossTasks from '../../lib/skilling/skills/slayer/tasks/bossTasks';
import { SkillsEnum } from '../../lib/skilling/types';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<slayermaster:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [slayermaster]: [string]) {
		await msg.author.settings.sync(true);
		if (!msg.author.hasMinion) {
			throw `You don't have a minion yet. You can buy one by typing \`${msg.cmdPrefix}minion buy\`.`;
		}
		const slayerInfo = msg.author.settings.get(UserSettings.Slayer.SlayerInfo);
		const { settings } = msg.author;
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

		// Figure out what master they're using
		const master = slayerMasters.find(master =>
			master.aliases.some(alias => stringMatches(alias, slayermaster))
		);
		if (!master) {
			throw `That's not a valid slayer master. Valid masters are ${slayerMasters
				.map(master => master.name)
				.join(', ')}.`;
		}
		// Get that masters list of tasks
		const listOfTasks = master.tasks;
		if (!listOfTasks) {
			throw `WTF`;
		}
		/* For future
		const userCombatLevel = determineCombatLevel(
			msg.author.skillLevel(SkillsEnum.Prayer),
			msg.author.skillLevel(SkillsEnum.Hitpoints),
			msg.author.skillLevel(SkillsEnum.Defence),
			msg.author.skillLevel(SkillsEnum.Strength),
			msg.author.skillLevel(SkillsEnum.Attack),
			msg.author.skillLevel(SkillsEnum.Magic),
			msg.author.skillLevel(SkillsEnum.Range)
		);
		*/
		const userCombatLevel = 126;
		if (
			(master.combatLvl && master.combatLvl > userCombatLevel) ||
			(master.slayerLvl && master.slayerLvl > msg.author.skillLevel(SkillsEnum.Slayer)) ||
			(master.questPoints && master.questPoints > settings.get(UserSettings.QP))
		) {
			throw `You need a combat level of ${master.combatLvl}, a slayer level of ${
				master.slayerLvl
			} and ${master.questPoints} quest points to use this master! 
You're only ${userCombatLevel} combat, ${msg.author.skillLevel(
				SkillsEnum.Slayer
			)} slayer and ${settings.get(UserSettings.QP)} questpoints.`;
		}
		let filteredTaskList;
		// Filter by slayer level
		filteredTaskList = listOfTasks.filter(
			task => task.slayerLvl && task.slayerLvl <= msg.author.skillLevel(SkillsEnum.Slayer)
		);
		// Filter by combat level
		filteredTaskList = filteredTaskList.filter(
			task => task.combatLvl && task.combatLvl <= userCombatLevel
		);
		// Filter by questpoints, not implemented
		/*
		filteredTaskList = filteredTaskList.filter(
			task =>
				task.QP && task.QP <= msg.author.settings.get(UserSettings.QP)
				
		);
		*/
		// Filter by default unlock
		filteredTaskList = filteredTaskList.filter(task => task.unlocked === true);
		// Filter by block list (Make Task based)
		/*
		filteredTaskList = filteredTaskList.filter(task => !msg.author.blockList.includes(task));
		*/
		// Filter by unlocks (Make Task based)
		/*
		const filteredByUnlocked = listOfTasks.filter(task => msg.author.unlockedList.includes(task));
		filteredTasks = filteredTasks.concat(filteredByUnlocked);
		*/

		let totalweight = 0;
		for (let i = 0; i < filteredTaskList.length; i++) {
			totalweight += filteredTaskList[i].weight;
		}
		if (filteredTaskList.length === 0) {
			throw `You don't have a high enough Slayer level to get a task from that Master.`;
		}
		let number = rand(1, totalweight);
		for (let i = 0; i < filteredTaskList.length; i++) {
			number -= filteredTaskList[i].weight;
			if (number <= 0) {
				const slayerMonster = filteredTaskList[i];
				/*
				if (slayerMonster.name === 'Boss') {
					const filteredBossTasks = bossTasks.filter(
						task =>
							task.slayerLvl &&
							task.slayerLvl <= msg.author.skillLevel(SkillsEnum.Slayer)
					);
					slayerMonster = filteredBossTasks[rand(0, filteredBossTasks.length)];
				}
				*/
				const minQuantity = slayerMonster.amount[0];
				const maxQuantity = slayerMonster.amount[1];
				const quantity = Math.floor(rand(minQuantity, maxQuantity));
				const newSlayerInfo = {
					...slayerInfo,
					hasTask: true,
					currentTask: slayerMonster,
					quantityTask: quantity,
					remainingQuantity: quantity,
					currentMaster: master.masterId
				};
				await settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
					arrayAction: 'overwrite'
				});
				return msg.send(`Your new slayer task is ${quantity}x ${slayerMonster.name}`);
			}
		}
	}
}
