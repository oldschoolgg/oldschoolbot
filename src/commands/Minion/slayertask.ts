import { MessageButton } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import { prisma } from '../../lib/settings/prisma';
import { runCommand } from '../../lib/settings/settings';
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

const returnSuccessButtons = [
	[
		new MessageButton({
			label: 'Autoslay (Saved)',
			style: 'SECONDARY',
			customID: 'assaved'
		}),
		new MessageButton({
			label: 'Autoslay (Default)',
			style: 'SECONDARY',
			customID: 'asdef'
		}),
		new MessageButton({
			label: 'Autoslay (EHP)',
			style: 'SECONDARY',
			customID: 'asehp'
		}),
		new MessageButton({
			label: 'Autoslay (Boss)',
			style: 'SECONDARY',
			customID: 'asboss'
		})
	],
	[
		new MessageButton({
			label: 'Cancel Task + New (30 points)',
			style: 'DANGER',
			customID: 'skip'
		}),
		new MessageButton({
			label: 'Block Task + New (100 points)',
			style: 'DANGER',
			customID: 'block'
		}),
		new MessageButton({
			label: 'Do Nothing',
			style: 'SECONDARY',
			customID: 'doNothing'
		})
	]
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
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
			const alternateMonsters = effectiveMonsters
				.filter(m => {
					return altMobs.includes(m.id) && m!.id !== assignedTask.monster.id;
				})
				.map(m => {
					return m!.name;
				});
			const cname = getCommonTaskName(assignedTask!.monster);
			if (
				cname !== assignedTask!.monster.name &&
				cname.substr(0, cname.length - 1) !== assignedTask!.monster.name
			) {
				alternateMonsters.unshift(assignedTask!.monster.name);
			}

			return alternateMonsters.length > 0 ? ` (**Alternate Monsters**: ${alternateMonsters.join(', ')})` : '';
		}
		return '';
	}

	public async returnSuccess(msg: KlasaMessage, message: string, autoslay: boolean) {
		const options = {
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member,
			msg
		};

		if (autoslay) {
			await msg.channel.send(message);
			return runCommand({ commandName: 'autoslay', args: [''], bypassInhibitors: true, ...options });
		}
		const sentMessage = await msg.channel.send({ content: message, components: returnSuccessButtons });

		try {
			const selection = await sentMessage.awaitMessageComponentInteraction({
				filter: i => {
					if (i.user.id !== msg.author.id) {
						i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
						return false;
					}
					return true;
				},
				time: Time.Second * 15
			});
			switch (selection.customID) {
				case 'assaved': {
					await runCommand({ commandName: 'autoslay', args: [''], bypassInhibitors: true, ...options });
					return;
				}
				case 'asdef': {
					await runCommand({
						commandName: 'autoslay',
						args: ['default'],
						bypassInhibitors: true,
						...options
					});
					return;
				}
				case 'asehp': {
					await runCommand({ commandName: 'autoslay', args: ['ehp'], bypassInhibitors: true, ...options });
					return;
				}
				case 'asboss': {
					await runCommand({ commandName: 'autoslay', args: ['boss'], bypassInhibitors: true, ...options });
					return;
				}
				case 'skip': {
					msg.flagArgs.new = 'yes';
					await runCommand({
						commandName: 'slayertask',
						args: ['skip'],
						bypassInhibitors: true,
						...options
					});
					return;
				}
				case 'block': {
					msg.flagArgs.new = 'yes';
					await runCommand({
						commandName: 'slayertask',
						args: ['block'],
						bypassInhibitors: true,
						...options
					});
					return;
				}
			}
		} catch (err: unknown) {
		} finally {
			await sentMessage.edit({ components: [] });
		}
	}

	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const { currentTask, assignedTask } = await getUsersCurrentSlayerInfo(msg.author.id);
		const myBlockList = msg.author.settings.get(UserSettings.Slayer.BlockedTasks);
		const maxBlocks = calcMaxBlockedTasks(msg.author);

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

			await msg.confirm(
				`Really unblock ${osjsMonster.name}? You will have to pay to block it again in the future.`
			);
			await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, idToRemove);
			return msg.channel.send(`${osjsMonster.name} have been unblocked`);
		}

		// Prevent any actions that affect the layer task list when minion is busy.
		if (msg.author.minionIsBusy) {
			const slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints);
			const slayerStreak = msg.author.settings.get(UserSettings.Slayer.TaskStreak);

			return msg.channel.send(
				`Your minion is busy, but you can still manage your block list: \`${msg.cmdPrefix}st blocks\`` +
					`${
						currentTask
							? `\nYour current task is to kill **${getCommonTaskName(
									assignedTask!.monster
							  )}**. You have ${currentTask.quantity_remaining.toLocaleString()} kills remaining.`
							: ''
					}` +
					`\nYou have ${slayerPoints.toLocaleString()} slayer points, and have completed ${slayerStreak} tasks in a row.`
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
						` you only have: ${slayerPoints.toLocaleString()}`
				);
			}
			await msg.confirm(
				`Really ${
					toBlock ? 'block' : 'skip'
				} task? You have ${slayerPoints.toLocaleString()} and this will cost ${
					toBlock ? 100 : 30
				} slayer points.\n\nPlease confirm you want to ${toBlock ? 'block' : 'skip'}.`
			);

			slayerPoints -= toBlock ? 100 : 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, slayerPoints);
			if (toBlock) await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, currentTask.monster_id);
			await prisma.slayerTask.update({
				where: {
					id: currentTask.id
				},
				data: {
					skipped: true,
					quantity_remaining: 0
				}
			});
			await msg.channel.send(
				`Your task has been ${
					toBlock ? 'blocked' : 'skipped'
				}. You have ${slayerPoints.toLocaleString()} slayer points.`
			);
			if (Boolean(msg.flagArgs.new)) {
				return runCommand({
					commandName: 'slayertask',
					args: [],
					bypassInhibitors: true,
					channelID: msg.channel.id,
					userID: msg.author.id,
					guildID: msg.guild?.id,
					user: msg.author,
					member: msg.member,
					msg
				});
			}
			return;
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
			if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monster_id)) {
				return msg.channel.send('You cannot skip this task because Turael assigns it.');
			}
			await msg.confirm(
				`Really cancel task? This will reset your streak to 0 and give you a new ${slayerMaster.name} task.`
			);

			await prisma.slayerTask.update({
				where: {
					id: currentTask.id
				},
				data: {
					skipped: true,
					quantity_remaining: 0
				}
			});
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
			this.returnSuccess(msg, returnMessage, Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay));
			return;
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
						currentTask.quantity_remaining
				  } kills remaining.`
				: `You have no task at the moment, you can get a task using \`${msg.cmdPrefix}slayertask ${slayerMasters
						.map(i => i.name)
						.join('/')}\``;

			returnMessage = `${warningInfo}${baseInfo}

Your current streak is ${msg.author.settings.get(UserSettings.Slayer.TaskStreak)}.`;
			if (currentTask && !warningInfo) {
				this.returnSuccess(msg, returnMessage, Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay));
				return;
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
			returnMessage = 'Ah... Tzhaar... ';
			commonName +=
				'. You can choose to kill TzTok-Jad with `/activities fight_caves `, or TzKal-Zuk with `/activities inferno action:Start Inferno Trip ` as long as you ' +
				"don't kill any regular TzHaar first.";
		}

		returnMessage += `${slayerMaster.name} has assigned you to kill ${
			newSlayerTask.currentTask.quantity
		}x ${commonName}${this.getAlternateMonsterList(newSlayerTask.assignedTask)}.${updateMsg}`;
		if (newSlayerTask.messages.length > 0) {
			returnMessage += `\n\n**Messages:** ${newSlayerTask.messages.join(', ')}.`;
		}
		this.returnSuccess(msg, returnMessage, Boolean(msg.flagArgs.as) || Boolean(msg.flagArgs.autoslay));
	}
}
