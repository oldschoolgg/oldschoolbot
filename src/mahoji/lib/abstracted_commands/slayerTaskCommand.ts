import { User } from '@prisma/client';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { MessageButton } from 'discord.js';
import { notEmpty, Time } from 'e';
import { MessageFlags } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Monsters } from 'oldschooljs';

import killableMonsters from '../../../lib/minions/data/killableMonsters';
import { prisma } from '../../../lib/settings/prisma';
import { runCommand } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { slayerMasters } from '../../../lib/slayer/slayerMasters';
import {
	assignNewSlayerTask,
	calcMaxBlockedTasks,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../../lib/slayer/slayerUtil';
import { AssignableSlayerTask } from '../../../lib/slayer/types';
import { channelIsSendable, removeFromArr } from '../../../lib/util';
import { stringMatches } from '../../../lib/util/cleanString';
import { logError } from '../../../lib/util/logError';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../../mahojiSettings';

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

function getAlternateMonsterList(assignedTask: AssignableSlayerTask | null) {
	if (assignedTask) {
		const altMobs = assignedTask.monsters;
		const alternateMonsters = killableMonsters
			.filter(m => {
				return altMobs.includes(m.id) && m!.id !== assignedTask.monster.id;
			})
			.map(m => {
				return m!.name;
			});
		const cname = getCommonTaskName(assignedTask!.monster);
		if (cname !== assignedTask!.monster.name && cname.substr(0, cname.length - 1) !== assignedTask!.monster.name) {
			alternateMonsters.unshift(assignedTask!.monster.name);
		}

		return alternateMonsters.length > 0 ? ` (**Alternate Monsters**: ${alternateMonsters.join(', ')})` : '';
	}
	return '';
}

export function slayerListBlocksCommand(mahojiUser: User) {
	const maxBlocks = calcMaxBlockedTasks(mahojiUser);
	const myBlockList = mahojiUser.slayer_blocked_ids;

	let outstr =
		`You have a maximum of ${maxBlocks} task blocks. You are using ${myBlockList.length}` +
		` and have ${maxBlocks - myBlockList.length} remaining\n\n**Blocked Tasks:**\n`;
	const myBlockedMonsters = Monsters.filter(m => myBlockList.includes(m.id));
	outstr += `${myBlockedMonsters.map(getCommonTaskName).join('\n')}`;
	return `${outstr}\n\nTry: \`/slayer manage block\` to block a task.`;
}

export async function slayerStatusCommand(mahojiUser: User) {
	const { currentTask, assignedTask, slayerMaster } = await getUsersCurrentSlayerInfo(mahojiUser.id);
	const { slayer_points: slayerPoints, slayer_task_streak: slayerStreak } = mahojiUser;
	return (
		`${
			currentTask
				? `\nYour current task from ${slayerMaster!.name} is to kill **${getCommonTaskName(
						assignedTask!.monster
				  )}**${getAlternateMonsterList(
						assignedTask
				  )}. You have ${currentTask.quantity_remaining.toLocaleString()} kills remaining.`
				: ''
		}` +
		`\nYou have ${slayerPoints.toLocaleString()} slayer points, and have completed ${slayerStreak} tasks in a row.`
	);
}

async function returnSuccess(channelID: bigint | string, mahojiUser: User, content: string) {
	const channel = globalClient.channels.cache.get(String(channelID));
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');

	const sentMessage = await channel.send({ content, components: returnSuccessButtons });

	const options = {
		channelID: channel.id,
		userID: mahojiUser.id,
		guildID: isGuildBasedChannel(channel) && channel.guild ? channel.guild.id : undefined,
		user: mahojiUser,
		member: null
	};

	try {
		const selection = await sentMessage.awaitMessageComponentInteraction({
			filter: i => {
				if (i.user.id !== mahojiUser.id) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 15
		});
		switch (selection.customID) {
			case 'assaved': {
				await runCommand({
					commandName: 'slayer',
					args: { autoslay: {} },
					bypassInhibitors: true,
					...options
				});
				return;
			}
			case 'asdef': {
				await runCommand({
					commandName: 'slayer',
					args: { autoslay: { mode: 'default' } },
					bypassInhibitors: true,
					...options
				});
				return;
			}
			case 'asehp': {
				await runCommand({
					commandName: 'slayer',
					args: { autoslay: { mode: 'ehp' } },
					bypassInhibitors: true,
					...options
				});
				return;
			}
			case 'asboss': {
				await runCommand({
					commandName: 'slayer',
					args: { autoslay: { mode: 'boss' } },
					bypassInhibitors: true,
					...options
				});
				return;
			}
			case 'skip': {
				await runCommand({
					commandName: 'slayer',
					args: { manage: { command: 'skip', new: true } },
					bypassInhibitors: true,
					...options
				});
				return;
			}
			case 'block': {
				await runCommand({
					commandName: 'slayer',
					args: { manage: { command: 'block', new: true } },
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
export async function slayerNewTaskCommand({
	mahojiUser,
	interaction,
	channelID,
	extraContent,
	slayerMasterOverride,
	saveDefaultSlayerMaster,
	showButtons
}: {
	mahojiUser: User;
	interaction: SlashCommandInteraction;
	channelID: string | bigint;
	extraContent?: string;
	slayerMasterOverride?: string | undefined;
	saveDefaultSlayerMaster?: boolean;
	showButtons?: boolean;
}) {
	const klasaUser = await globalClient.fetchUser(mahojiUser.id);
	const { currentTask } = await getUsersCurrentSlayerInfo(mahojiUser.id);
	const { slayer_remember_master: rememberedSlayerMaster } = mahojiUser;

	if (klasaUser.minionIsBusy) {
		return `Your minion is busy, but you can still manage your block list: \`/slayer manage list_blocks\`${await slayerStatusCommand(
			mahojiUser
		)}`;
	}

	const has99SlayerCape =
		klasaUser.skillLevel(SkillsEnum.Slayer) >= 99 && klasaUser.hasItemEquippedOrInBank('Slayer cape');

	// Chooses a default slayer master:
	const proposedDefaultMaster = slayerMasters
		.sort((a, b) => b.basePoints - a.basePoints)
		.find(sm => userCanUseMaster(klasaUser, sm));

	// Contains (if matched) the slayer master requested, falling back on saved default, if they have requirements
	const slayerMaster =
		slayerMasterOverride && has99SlayerCape
			? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))) ?? null
			: slayerMasterOverride
			? slayerMasters
					.filter(m => userCanUseMaster(klasaUser, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))) ?? null
			: rememberedSlayerMaster
			? slayerMasters
					.filter(m => userCanUseMaster(klasaUser, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, rememberedSlayerMaster))) ??
			  proposedDefaultMaster
			: proposedDefaultMaster;

	// Contains (if matched) the requested Slayer Master regardless of requirements.
	const matchedSlayerMaster = slayerMasterOverride
		? slayerMasters.find(
				m =>
					stringMatches(m.name, slayerMasterOverride) ||
					m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))
		  ) ?? null
		: null;

	// Special handling for Turael skip
	if (currentTask && slayerMasterOverride && slayerMaster && slayerMaster.name === 'Turael') {
		if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monster_id)) {
			return 'You cannot skip this task because Turael assigns it.';
		}

		await handleMahojiConfirmation(
			interaction,
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
		const { newUser: updatedMahojiUser } = await mahojiUserSettingsUpdate(mahojiUser.id, { slayer_task_streak: 0 });
		const newSlayerTask = await assignNewSlayerTask(klasaUser, slayerMaster);
		let commonName = getCommonTaskName(newSlayerTask.assignedTask!.monster);
		const returnMessage =
			`Your task has been skipped.\n\n ${slayerMaster.name}` +
			` has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}${getAlternateMonsterList(
				newSlayerTask.assignedTask
			)}.${newSlayerTask.messages.length > 0 ? `\n\n${newSlayerTask.messages.join('\n')}` : ''}`;

		if (showButtons) {
			returnSuccess(channelID, updatedMahojiUser, `${extraContent ?? ''}\n\n${returnMessage}`);
			return { content: 'Slayer task assigned.', flags: MessageFlags.Ephemeral };
		}
		return `${extraContent ?? ''}\n\n${returnMessage}`;
	}
	let resultMessage = '';
	// Store favorite slayer master if requested:
	if (saveDefaultSlayerMaster && slayerMaster) {
		mahojiUser.slayer_remember_master = slayerMaster.name;
		await mahojiUserSettingsUpdate(mahojiUser.id, { slayer_remember_master: slayerMaster.name });
		resultMessage = `**Saved ${slayerMaster!.name} as default slayer master.**\n\n`;
	}

	if (currentTask || !slayerMaster) {
		let warningInfo = '';
		if (slayerMasterOverride && !slayerMaster && matchedSlayerMaster) {
			let aRequirements: string[] = [];
			if (matchedSlayerMaster.slayerLvl) aRequirements.push(`Slayer Level: ${matchedSlayerMaster.slayerLvl}`);
			if (matchedSlayerMaster.combatLvl) aRequirements.push(`Combat Level: ${matchedSlayerMaster.combatLvl}`);
			if (matchedSlayerMaster.questPoints) aRequirements.push(`Quest points: ${matchedSlayerMaster.questPoints}`);
			warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
			if (aRequirements.length) warningInfo += `**Requires**:\n${aRequirements.join('\n')}\n\n`;
		}

		let baseInfo = currentTask
			? await slayerStatusCommand(mahojiUser)
			: 'You have no task at the moment, you can get a task using `/slayer task master:Turael`' +
			  `All slayer Masters: ${slayerMasters.map(i => i.name).join(', ')}`;

		resultMessage += `${warningInfo}${baseInfo}`;
		if (currentTask && !warningInfo) {
			if (showButtons) {
				returnSuccess(channelID, mahojiUser, resultMessage);
				return { content: 'Here is your current slayer task', flags: MessageFlags.Ephemeral };
			}
		}
		return resultMessage;
	}

	const newSlayerTask = await assignNewSlayerTask(klasaUser, slayerMaster);

	let commonName = getCommonTaskName(newSlayerTask.assignedTask!.monster);
	if (commonName === 'TzHaar') {
		resultMessage += 'Ah... Tzhaar... ';
		commonName +=
			'. You can choose to kill TzTok-Jad with `/activities fight_caves `, or TzKal-Zuk with `/activities inferno action:Start Inferno Trip ` as long as you ' +
			"don't kill any regular TzHaar first.";
	}

	resultMessage += `${slayerMaster.name} has assigned you to kill ${
		newSlayerTask.currentTask.quantity
	}x ${commonName}${getAlternateMonsterList(newSlayerTask.assignedTask)}.${
		newSlayerTask.messages.length > 0 ? `\n\n${newSlayerTask.messages.join('\n')}` : ''
	}`;
	if (showButtons) {
		returnSuccess(channelID, mahojiUser, resultMessage);
		return { content: 'Slayer task assigned.', flags: MessageFlags.Ephemeral };
	}
	return resultMessage;
}

export async function slayerSkipTaskCommand({
	mahojiUser,
	block,
	newTask,
	interaction,
	channelID
}: {
	mahojiUser: User;
	block: boolean;
	newTask: boolean;
	interaction: SlashCommandInteraction;
	channelID: bigint | string;
}) {
	const { currentTask } = await getUsersCurrentSlayerInfo(mahojiUser.id);
	const myBlockList = mahojiUser.slayer_blocked_ids;
	const klasaUser = await globalClient.fetchUser(mahojiUser.id);
	const maxBlocks = calcMaxBlockedTasks(mahojiUser);
	if (klasaUser.minionIsBusy) {
		return 'You cannot change your task while your minion is busy.';
	}
	if (!currentTask) {
		if (newTask) {
			return slayerNewTaskCommand({
				mahojiUser,
				interaction,
				channelID,
				showButtons: true
			});
		}
		return "You don't have an active task!";
	}

	if (block && myBlockList.length >= maxBlocks) {
		return (
			`You cannot have more than ${maxBlocks} slayer blocks!\n\nUse:\n` +
			'`st --unblock kalphite`\n to remove a block.\n' +
			'`st --list` for list of blocked monsters and their IDs.'
		);
	}
	let slayerPoints = mahojiUser.slayer_points ?? 0;
	if (slayerPoints < (block ? 100 : 30)) {
		return (
			`You need ${block ? 100 : 30} points to ${block ? 'block' : 'cancel'},` +
			` you only have: ${slayerPoints.toLocaleString()}`
		);
	}

	slayerPoints -= block ? 100 : 30;
	const updateData: { slayer_points: number; slayer_blocked_ids?: number[] } = { slayer_points: slayerPoints };

	try {
		if (block)
			updateData.slayer_blocked_ids = [
				...removeFromArr(myBlockList, currentTask.monster_id),
				currentTask.monster_id
			];
		const { newUser: updatedMahojiUser } = await mahojiUserSettingsUpdate(mahojiUser.id, updateData);
		await prisma.slayerTask.update({
			where: {
				id: currentTask.id
			},
			data: {
				skipped: true,
				quantity_remaining: 0
			}
		});
		const resultMessage = `Your task has been ${
			block ? 'blocked' : 'skipped'
		}. You have ${slayerPoints.toLocaleString()} slayer points.`;

		if (newTask) {
			return slayerNewTaskCommand({
				mahojiUser: updatedMahojiUser,
				interaction,
				channelID,
				extraContent: resultMessage,
				showButtons: true
			});
		}
		return resultMessage;
	} catch (e) {
		logError(e, {
			user_id: mahojiUser.id.toString(),
			command: 'slayerSkipTaskCommand',
			current_task_id: currentTask.id.toString(),
			current_task: currentTask.monster_id.toString()
		});
		return 'An error occurred while performing this action. Please try again, or contact #help-and-support if the issue persists.';
	}
}

export async function slayerUnblockCommand(mahojiUser: User, monsterName: string) {
	const osjsMonster = Monsters.find(
		m => stringMatches(m.name, monsterName) || m.aliases.some(alias => stringMatches(alias, monsterName))
	);
	if (!osjsMonster) {
		return `Cannot find Monster with name **${monsterName}**`;
	}
	const blockedMonsters = mahojiUser.slayer_blocked_ids.map(mId => Monsters.find(m => m.id === mId)).filter(notEmpty);
	if (blockedMonsters.length === 0) {
		return "You don't currently have any monsters blocked.";
	}
	const monsterToUnblock = blockedMonsters.find(m => m.id === osjsMonster.id);
	if (!monsterToUnblock) {
		return `You don't currently have ${getCommonTaskName(osjsMonster)} blocked.`;
	}
	try {
		await mahojiUserSettingsUpdate(mahojiUser.id, {
			slayer_blocked_ids: removeFromArr(mahojiUser.slayer_blocked_ids, monsterToUnblock.id)
		});
		return `**${getCommonTaskName(monsterToUnblock)}** has been unblocked`;
	} catch (e) {
		logError(e, { user_id: mahojiUser.id.toString(), command: 'slayerUnblockCommand', assignment: monsterName });
		return 'An error occurred while trying to remove task. Please try again, or ask #help-and-support if the issue persists.';
	}
}
