import { CommandStore, KlasaMessage } from 'klasa';

import slayerMasters from '../../lib/slayer/slayerMasters';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, rand, determineCombatLevel } from '../../lib/util';
import nieveTasks from '../../lib/slayer/nieveTasks';
import { UserSettings } from '../../lib/UserSettings';
import { Monsters } from 'oldschooljs';
import { SkillsEnum } from '../../lib/types';
import bossTasks from '../../lib/slayer/bossTasks';
import turaelTasks from '../../lib/slayer/turaelTasks';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

const taskList = [
	{
		name: 'Nieve',
		tasks: nieveTasks
	},
	{
		name: 'Turael',
		tasks: turaelTasks
	}
];

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

		if (msg.author.hasSlayerTask && slayermaster === 'cancel') {
			msg.send(
				`Are you sure you'd like to cancel your current task of ${
					msg.author.slayerTaskQuantity
				}x ${
					Monsters.get(msg.author.slayerTaskID)?.name
				}? It will cost 30 slayer points and your current total is ${
					msg.author.slayerPoints
				}. Say \`confirm\` to continue.`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				throw `Cancelled request to cancel ${
					Monsters.get(msg.author.slayerTaskID)?.name
				} slayer task.`;
			}
			const newSlayerPoints = msg.author.slayerPoints - 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerTaskQuantity, 0);
			await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, false);
			await msg.author.settings.update(UserSettings.Slayer.SlayerTaskID, 0);
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, newSlayerPoints);
			await msg.author.settings.update(UserSettings.Slayer.CurrentSlayerMaster, 0);
			return msg.send(`Successfully cancelled task`);
		}

		// If they already have a slayer task tell them what it is
		if (msg.author.hasSlayerTask) {
			const mon = Monsters.get(msg.author.slayerTaskID);
			if (!mon) throw `WTF`;
			let str = `You already have a slayer task of ${msg.author.slayerTaskQuantity}x ${mon.name}.\n`;
			const allTasks = nieveTasks.concat(turaelTasks);
			const currentTask = allTasks.find(monster =>
				stringMatches(Monsters.get(msg.author.slayerTaskID)!.name, monster.name)
			);
			if (currentTask?.alternatives) {
				str += `You can also kill these monsters: ${currentTask?.alternatives}!`;
				const re = /\,/gi;
				return msg.send(str.replace(re, `, `));
			}
			throw str;
		}

		// Figure out what master they're using
		const master = slayerMasters.find(person => stringMatches(slayermaster, person.name));
		if (!master) {
			throw `That's not a valid slayer master. Valid masters are ${slayerMasters
				.map(person => person.name)
				.join(', ')}.`;
		}
		// Get that masters list of tasks
		const listOfTasks = taskList.find(task => stringMatches(slayermaster, task.name));
		if (!listOfTasks) {
			throw `WTF`;
		}

		const userCombatLevel = determineCombatLevel(
			msg.author.skillLevel(SkillsEnum.Prayer),
			msg.author.skillLevel(SkillsEnum.Hitpoints),
			msg.author.skillLevel(SkillsEnum.Defence),
			msg.author.skillLevel(SkillsEnum.Strength),
			msg.author.skillLevel(SkillsEnum.Attack),
			msg.author.skillLevel(SkillsEnum.Magic),
			msg.author.skillLevel(SkillsEnum.Range)
		);
		if (
			master.requirements.combatLevel > userCombatLevel! ||
			master.requirements.slayerLevel > msg.author.skillLevel(SkillsEnum.Slayer)
		) {
			throw `You need a combat level of ${
				master.requirements.combatLevel
			}, and a slayer level of ${master.requirements.slayerLevel} to use this master! 
You're only ${userCombatLevel} combat, and ${msg.author.skillLevel(SkillsEnum.Slayer)} slayer.`;
		}

		// Filter by slayer level
		const filteredByLevel = listOfTasks.tasks.filter(
			task =>
				Monsters.get(task.ID)?.data.slayerLevelRequired! <=
				msg.author.skillLevel(SkillsEnum.Slayer)
		);

		// Filter by default unlock
		const filteredLockedTasks = filteredByLevel.filter(task => task.unlocked === true);

		// Filter by block list
		let filteredTasks = filteredLockedTasks.filter(
			task => !msg.author.blockList.includes(task.ID)
		);

		// Filter by quest point requirements
		/*
		const currentQP = msg.author.settings.get(UserSettings.QP);
		if(filteredBlockedTasks) {
		let filteredTasks = filteredBlockedTasks.filter(
			task => task.requirements!.questPoints <= currentQP
		);
		}
*/
		// Filter by unlocks -- Theres probably an easier way to do this but I can't figure it out
		if (slayermaster === 'Nieve') {
			if (msg.author.unlockedAviansie) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Aviansie')
				);
			}
			if (msg.author.unlockedBasilisk) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Basilisk')
				);
			}
			if (msg.author.unlockedBoss) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Boss')
				);
			}
			if (msg.author.unlockedLizardman) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Lizardman brute')
				);
			}
			if (msg.author.unlockedMithrilDragon) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Mithril dragon')
				);
			}
			if (msg.author.unlockedRedDragon) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'Red dragon')
				);
			}
			if (msg.author.unlockedTzHaar) {
				filteredTasks = filteredTasks.concat(
					nieveTasks.filter(monster => monster.name === 'TzHaar')
				);
			}
		}
		let totalweight = 0;
		for (let i = 0; i < filteredTasks.length; i++) {
			totalweight += filteredTasks[i].weight;
		}
		if (filteredTasks.length === 0) {
			throw `You don't have a high enough Slayer level to get a task from that Master.`;
		}
		let number = rand(1, totalweight);
		for (let i = 0; i < filteredTasks.length; i++) {
			number -= filteredTasks[i].weight;
			if (number <= 0) {
				const slayerMonster = filteredTasks[i];
				if (slayerMonster.name === 'Boss') {
					const filteredBossTasks = bossTasks.filter(
						task =>
							Monsters.get(task.ID)?.data.slayerLevelRequired! <=
							msg.author.skillLevel(SkillsEnum.Slayer)
					);
					const monsterNumber = rand(0, filteredBossTasks.length);
					const monster = filteredBossTasks[monsterNumber];
					const minQuantity = monster.amount[0];
					const maxQuantity = monster.amount[1];
					const quantity = rand(minQuantity, maxQuantity);
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerTaskQuantity,
						quantity
					);
					await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, true);
					await msg.author.settings.update(UserSettings.Slayer.SlayerTaskID, monster.ID);
					await msg.author.settings.update(
						UserSettings.Slayer.CurrentSlayerMaster,
						master.masterID
					);

					return msg.send(
						`Your new slayer task is a boss task of ${quantity}x ${monster.name}`
					);
				}
				const minQuantity = slayerMonster.amount[0];
				const maxQuantity = slayerMonster.amount[1];
				const quantity = rand(minQuantity, maxQuantity);
				await msg.author.settings.update(UserSettings.Slayer.SlayerTaskQuantity, quantity);
				await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, true);
				await msg.author.settings.update(
					UserSettings.Slayer.SlayerTaskID,
					slayerMonster.ID
				);
				await msg.author.settings.update(
					UserSettings.Slayer.CurrentSlayerMaster,
					master.masterID
				);
				return msg.send(`Your new slayer task is ${quantity}x ${slayerMonster.name}`);
			}
		}
	}
}
