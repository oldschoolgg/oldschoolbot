import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import {
	assignNewSlayerTask,
	calcMaxBlockedTasks,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../lib/slayer/slayerUtil';
import { AssignableSlayerTask } from '../../lib/slayer/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 2,
			altProtection: true,
			categoryFlags: ['minion'],
			aliases: ['st'],
			description: 'Gets a slayer task from the master of your choice.',
			examples: ['+slayertask turael', '+st duradel --save', '+st konar --forget'],
			usage: '[input:str]'
		});
	}

	public getAlternateMonsterList(assignedTask: AssignableSlayerTask | null) {
		if (assignedTask) {
			const altMobs = assignedTask.monsters;
			const alternateMonsters = killableMonsters
				.filter(m => {
					return altMobs.includes(m.id) && m!.id !== assignedTask.monster.id;
				})
				.map(m => {
					return m!.name;
				});
			return alternateMonsters.length > 0 ? ` (**Alternate Monsters**: ${alternateMonsters.join(', ')})` : '';
		}
		return '';
	}

	public async returnSuccess(msg: KlasaMessage, message: string, autoslay: boolean) {
		if (autoslay) {
			await msg.channel.send(message);
			try {
				return this.client.commands.get('autoslay')!.run(msg, ['']);
			} catch (e) {
				return msg.channel.send('It was not possible to auto-slay this task. Please, try again.');
			}
		}
		return msg.channel.send(message);
	}

	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const { currentTask, totalTasksDone, assignedTask } = await getUsersCurrentSlayerInfo(msg.author.id);
		const myBlockList = msg.author.settings.get(UserSettings.Slayer.BlockedTasks);
		const myQPs = msg.author.settings.get(UserSettings.QP);
		const maxBlocks = calcMaxBlockedTasks(myQPs);

		let returnMessage = '';

		if (
			msg.flagArgs.listblocks ||
			msg.flagArgs.blocks ||
			msg.flagArgs.blocklist ||
			msg.flagArgs.list ||
			(input && input === 'listblocks') ||
			(input && input === 'list') ||
			(input && input === 'blocks') ||
			(input && input === 'blocklist')
		) {
			let outstr =
				`You have a maximum of ${maxBlocks} task blocks. You are using ${myBlockList.length}` +
				` and have ${maxBlocks - myBlockList.length} remaining\n\n**Blocked Tasks:**\n`;
			const myBlockedMonsters = Monsters.filter(m => {
				return myBlockList.includes(m.id);
			});
			outstr += `${myBlockedMonsters
				.map(mbm => {
					return `${getCommonTaskName(mbm)}`;
				})
				.join('\n')}`;
			return msg.channel.send(`${outstr}\n\nTry: \`${msg.cmdPrefix}st --block\` to block a task.`);
		}
		const inputArray = input ? input.split(' ') : undefined;
		const inputUnblock = inputArray?.slice(0, 1)[0] === 'unblock';
		if (msg.flagArgs.unblock || inputUnblock) {
			const monToBlock = inputUnblock ? inputArray!.slice(1).join(' ') : input;
			if (!monToBlock) {
				return msg.channel.send('You must specify a monster to unblock!');
			}

			let idToRemove = parseInt(monToBlock);
			const osjsMonster = isNaN(idToRemove)
				? Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monToBlock)))
				: Monsters.find(mon => mon.id === idToRemove);
			if (!osjsMonster) {
				return msg.channel.send('Failed to find a monster with that name or id!');
			}
			idToRemove = osjsMonster.id;

			// Now we can remove based on ID.
			if (!myBlockList.includes(idToRemove)) {
				return msg.channel.send(`${idToRemove}: ${osjsMonster.name} is not on the block list!`);
			}
			if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
				const alchMessage = await msg.channel.send(
					`Really unblock ${osjsMonster.name}? You will have to pay to block it again ` +
						'in the future.\n\nType **confirm** to unblock.'
				);
				try {
					await msg.channel.awaitMessages({
						max: 1,
						time: 10_000,
						errors: ['time'],
						filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
					});
				} catch (err) {
					return alchMessage.edit(`Not unblocking ${osjsMonster.name}.`);
				}
			}
			await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, idToRemove);
			return msg.channel.send(`${osjsMonster.name} have been unblocked`);
		}

		// Prevent any actions that affect the layer task list when minion is busy.
		if (msg.author.minionIsBusy) {
			const slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints);
			const slayerStreak = msg.author.settings.get(UserSettings.Slayer.TaskStreak);
			return msg.channel.send(
				`Your minion is busy, but you can still manage your block list: \`${msg.cmdPrefix}st blocks\`` +
					`\nYou have ${slayerPoints} slayer points, and have completed ${slayerStreak} tasks in a row.`
			);
		}
		if (input && (input === 'skip' || input === 'block')) msg.flagArgs[input] = 'yes';
		if (currentTask && (msg.flagArgs.skip || msg.flagArgs.block)) {
			const toBlock = msg.flagArgs.block ? true : false;
			if (toBlock && myBlockList.length >= maxBlocks) {
				return msg.channel.send(
					`You cannot have more than ${maxBlocks} slayer blocks!\n\nUse:\n` +
						`\`${msg.cmdPrefix}st --unblock kalphite\`\n to remove a block.\n` +
						`\`${msg.cmdPrefix}st --list\` for list of blocked monsters and their IDs.`
				);
			}
			let slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints) ?? 0;
			if (slayerPoints < (toBlock ? 100 : 30)) {
				return msg.channel.send(
					`You need ${toBlock ? 100 : 30} points to ${toBlock ? 'block' : 'cancel'},` +
						` you only have: ${slayerPoints}`
				);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really ${toBlock ? 'block' : 'skip'} task? You have ${slayerPoints} and this will cost ${
						toBlock ? 100 : 30
					} slayer points.\n\nType **confirm** to ${toBlock ? 'block' : 'skip'}.`
				);

				try {
					await msg.channel.awaitMessages({
						max: 1,
						time: 10_000,
						errors: ['time'],
						filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
					});
				} catch (err) {
					return alchMessage.edit(`Not ${toBlock ? 'blocking' : 'skipping'} slayer task.`);
				}
			}
			slayerPoints -= toBlock ? 100 : 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, slayerPoints);
			if (toBlock) await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, currentTask.monsterID);
			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			return msg.channel.send(
				`Your task has been ${toBlock ? 'blocked' : 'skipped'}. You have ${slayerPoints} slayer points.`
			);
		}

		let rememberedSlayerMaster: string = '';
		if (msg.flagArgs.unfav || msg.flagArgs.delete || msg.flagArgs.forget) {
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, null);
		} else {
			rememberedSlayerMaster = msg.author.settings.get(UserSettings.Slayer.RememberSlayerMaster) ?? '';
		}

		// Match on input slayermaster if specified, falling back to remembered.
		const has99SlayerCape =
			msg.author.skillLevel(SkillsEnum.Slayer) >= 99 && msg.author.hasItemEquippedOrInBank(itemID('Slayer cape'));

		const slayerMaster =
			input && has99SlayerCape
				? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
				: input
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

		// Special handling for Turael skip
		if (currentTask && input && slayerMaster && slayerMaster.name === 'Turael') {
			if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monsterID)) {
				return msg.channel.send('You cannot skip this task because Turael assigns it.');
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					'Really cancel task? This will reset your streak to 0 and give you a new' +
						` ${slayerMaster.name} task.\n\nType **confirm** to skip.`
				);

				try {
					await msg.channel.awaitMessages({
						max: 1,
						time: 10_000,
						errors: ['time'],
						filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
					});
				} catch (err) {
					return alchMessage.edit('Not cancelling slayer task.');
				}
			}

			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			msg.author.settings.update(UserSettings.Slayer.TaskStreak, 0);
			const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
			let commonName = getCommonTaskName(newSlayerTask.assignedTask!.monster);
			returnMessage =
				`Your task has been skipped.\n\n ${slayerMaster.name}` +
				` has assigned you to kill ${
					newSlayerTask.currentTask.quantity
				}x ${commonName}${this.getAlternateMonsterList(newSlayerTask.assignedTask)}.`;
			if (newSlayerTask.messages.length > 0) {
				returnMessage += `\n\n**Messages:** ${newSlayerTask.messages.join(', ')}.`;
			}
			return this.returnSuccess(msg, returnMessage, Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay));
		}

		if (currentTask || !slayerMaster) {
			let warningInfo = '';
			if (input && !slayerMaster && matchedSlayerMaster) {
				let aRequirements: string[] = [];
				if (matchedSlayerMaster.slayerLvl) aRequirements.push(`Slayer Level: ${matchedSlayerMaster.slayerLvl}`);
				if (matchedSlayerMaster.combatLvl) aRequirements.push(`Combat Level: ${matchedSlayerMaster.combatLvl}`);
				if (matchedSlayerMaster.questPoints)
					aRequirements.push(`Quest points: ${matchedSlayerMaster.questPoints}`);
				warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
				if (aRequirements.length) warningInfo += `**Requires**:\n${aRequirements.join('\n')}\n\n`;
			}

			let baseInfo = currentTask
				? `Your current task is to kill ${currentTask.quantity}x ${getCommonTaskName(
						assignedTask!.monster
				  )}${this.getAlternateMonsterList(assignedTask)}, you have ${
						currentTask.quantityRemaining
				  } kills remaining.`
				: `You have no task at the moment, you can get a task using \`${msg.cmdPrefix}slayertask ${slayerMasters
						.map(i => i.name)
						.join('/')}\``;

			returnMessage = `${warningInfo}${baseInfo}

You've done ${totalTasksDone} tasks. Your current streak is ${msg.author.settings.get(
				UserSettings.Slayer.TaskStreak
			)}.`;
			if (currentTask && !warningInfo) {
				return this.returnSuccess(
					msg,
					returnMessage,
					Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay)
				);
			}
			return msg.channel.send(returnMessage);
		}

		// Store favorite slayer master if requested:
		let updateMsg = '';
		if (msg.flagArgs.remember || msg.flagArgs.fav || msg.flagArgs.save) {
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, slayerMaster.name);
			updateMsg = `\n\n**Saved ${slayerMaster!.name} as default slayer master.**`;
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);

		let commonName = getCommonTaskName(newSlayerTask.assignedTask!.monster);
		if (commonName === 'TzHaar') {
			commonName +=
				`. You can choose to kill TzTok-Jad with ${msg.cmdPrefix}fightcaves as long as you ` +
				"don't kill any regular TzHaar first.";
		}

		returnMessage = `${slayerMaster.name} has assigned you to kill ${
			newSlayerTask.currentTask.quantity
		}x ${commonName}${this.getAlternateMonsterList(newSlayerTask.assignedTask)}.${updateMsg}`;
		if (newSlayerTask.messages.length > 0) {
			returnMessage += `\n\n**Messages:** ${newSlayerTask.messages.join(', ')}.`;
		}
		return this.returnSuccess(msg, returnMessage, Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay));
	}
}
