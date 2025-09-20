import { notEmpty, randInt, removeFromArr } from '@oldschoolgg/toolkit';
import { stringMatches } from '@oldschoolgg/toolkit/string-util';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { EItem, Monsters } from 'oldschooljs';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { slayerActionButtons } from '@/lib/slayer/slayerButtons.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { SlayerRewardsShop } from '@/lib/slayer/slayerUnlocks.js';
import {
	assignNewSlayerTask,
	calcMaxBlockedTasks,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '@/lib/slayer/slayerUtil.js';
import type { AssignableSlayerTask } from '@/lib/slayer/types.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { interactionReply } from '@/lib/util/interactionReply.js';
import { logError } from '@/lib/util/logError.js';
import { userStatsUpdate } from '../../mahojiSettings.js';

function getAlternateMonsterList(assignedTask: AssignableSlayerTask | null) {
	if (assignedTask) {
		const altMobs = assignedTask.monsters;
		const alternateMonsters = killableMonsters
			.filter(m => {
				return altMobs.includes(m.id) && m.id !== assignedTask.monster.id;
			})
			.map(m => {
				return m?.name;
			});
		const cname = getCommonTaskName(assignedTask?.monster);
		if (cname !== assignedTask?.monster.name && cname.substr(0, cname.length - 1) !== assignedTask?.monster.name) {
			alternateMonsters.unshift(assignedTask?.monster.name);
		}

		return alternateMonsters.length > 0 ? ` (**Alternate Monsters**: ${alternateMonsters.join(', ')})` : '';
	}
	return '';
}

export async function slayerListBlocksCommand(mahojiUser: MUser) {
	const maxBlocks = await calcMaxBlockedTasks(mahojiUser);
	const myBlockList = mahojiUser.user.slayer_blocked_ids;

	let outstr =
		`You have a maximum of ${maxBlocks} task blocks. You are using ${myBlockList.length}` +
		` and have ${maxBlocks - myBlockList.length} remaining\n\n**Blocked Tasks:**\n`;
	const myBlockedMonsters = Monsters.filter(m => myBlockList.includes(m.id));
	outstr += `${myBlockedMonsters.map(getCommonTaskName).join('\n')}`;
	return `${outstr}\n\nTry: \`/slayer manage block\` to block a task.`;
}

export async function slayerStatusCommand(mahojiUser: MUser) {
	const { currentTask, assignedTask, slayerMaster } = await getUsersCurrentSlayerInfo(mahojiUser.id);
	const { slayer_points: slayerPoints } = mahojiUser.user;
	const slayer_streaks = await mahojiUser.fetchStats({ slayer_task_streak: true, slayer_wildy_task_streak: true });

	return (
		`${
			currentTask
				? `\nYour current task from ${slayerMaster.name} is to kill **${getCommonTaskName(
						assignedTask.monster
					)}**${getAlternateMonsterList(
						assignedTask
					)}. You have ${currentTask.quantity_remaining.toLocaleString()} kills remaining.`
				: ''
		}` +
		`\nYou have ${slayerPoints.toLocaleString()} slayer points, and have completed ${
			slayer_streaks.slayer_task_streak
		} tasks in a row and ${slayer_streaks.slayer_wildy_task_streak} wilderness tasks in a row.`
	);
}

export async function slayerNewTaskCommand({
	userID,
	interaction,
	extraContent,
	slayerMasterOverride,
	saveDefaultSlayerMaster,
	showButtons
}: {
	userID: string;
	interaction: ChatInputCommandInteraction;
	extraContent?: string;
	slayerMasterOverride?: string | undefined;
	saveDefaultSlayerMaster?: boolean;
	showButtons?: boolean;
}): Promise<void> {
	const user = await mUserFetch(userID);
	const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
	const { slayer_remember_master: rememberedSlayerMaster } = user.user;

	if (user.minionIsBusy) {
		await interactionReply(
			interaction,
			`Your minion is busy, but you can still manage your block list: \`/slayer manage list_blocks\`${await slayerStatusCommand(
				user
			)}`
		);
		return;
	}

	const has99SlayerCape = user.skillsAsLevels.slayer >= 99 && user.hasEquippedOrInBank(EItem.SLAYER_CAPE);

	// Chooses a default slayer master (excluding Krystilia):
	const proposedDefaultMaster = slayerMasters
		.filter(sm => sm.id !== 8) // Exclude Krystilia
		.sort((a, b) => b.basePoints - a.basePoints)
		.find(sm => userCanUseMaster(user, sm));

	// Contains (if matched) the slayer master requested, falling back on saved default, if they have requirements
	const slayerMaster =
		slayerMasterOverride && has99SlayerCape
			? (slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))) ?? null)
			: slayerMasterOverride
				? (slayerMasters
						.filter(m => userCanUseMaster(user, m))
						.find(m => m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))) ?? null)
				: rememberedSlayerMaster
					? (slayerMasters
							.filter(m => userCanUseMaster(user, m))
							.find(m => m.aliases.some(alias => stringMatches(alias, rememberedSlayerMaster))) ??
						proposedDefaultMaster)
					: proposedDefaultMaster;

	// Contains (if matched) the requested Slayer Master regardless of requirements.
	const matchedSlayerMaster = slayerMasterOverride
		? (slayerMasters.find(
				m =>
					stringMatches(m.name, slayerMasterOverride) ||
					m.aliases.some(alias => stringMatches(alias, slayerMasterOverride))
			) ?? null)
		: null;

	// Special handling for Turael skip
	if (currentTask && slayerMasterOverride && slayerMaster && slayerMaster.name === 'Turael') {
		if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monster_id)) {
			await interactionReply(interaction, 'You cannot skip this task because Turael assigns it.');
			return;
		}
		const isUsingKrystilia = Boolean(currentTask?.slayer_master_id === 8);
		const taskStreakKey = isUsingKrystilia ? 'slayer_wildy_task_streak' : 'slayer_task_streak';
		const warning = `Really cancel task? This will reset your${
			isUsingKrystilia ? ' wilderness' : ''
		} streak to 0 and give you a new ${slayerMaster.name} task.`;

		await handleMahojiConfirmation(interaction, warning);
		await prisma.slayerTask.update({
			where: {
				id: currentTask.id
			},
			data: {
				skipped: true,
				quantity_remaining: 0
			}
		});
		await userStatsUpdate(user.id, { [taskStreakKey]: 0 }, {});

		const newSlayerTask = await assignNewSlayerTask(user, slayerMaster);
		const commonName = getCommonTaskName(newSlayerTask.assignedTask.monster);
		const returnMessage =
			`Your task has been skipped.\n\n ${slayerMaster.name}` +
			` has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}${getAlternateMonsterList(
				newSlayerTask.assignedTask
			)}.`;

		if (showButtons) {
			await interactionReply(interaction, {
				content: `${extraContent ?? ''}\n\n${returnMessage}`,
				flags: MessageFlags.Ephemeral,
				components: slayerActionButtons
			});
			return;
		}
		await interactionReply(interaction, `${extraContent ?? ''}\n\n${returnMessage}`);
		return;
	}

	let resultMessage = '';
	// Store favorite slayer master if requested:
	if (saveDefaultSlayerMaster && slayerMaster) {
		await user.update({ slayer_remember_master: slayerMaster.name });
		resultMessage = `**Saved ${slayerMaster?.name} as default slayer master.**\n\n`;
	}

	if (currentTask || !slayerMaster) {
		let warningInfo = '';
		if (slayerMasterOverride && !slayerMaster && matchedSlayerMaster) {
			const aRequirements: string[] = [];
			if (matchedSlayerMaster.slayerLvl) aRequirements.push(`Slayer Level: ${matchedSlayerMaster.slayerLvl}`);
			if (matchedSlayerMaster.combatLvl) aRequirements.push(`Combat Level: ${matchedSlayerMaster.combatLvl}`);
			if (matchedSlayerMaster.questPoints) aRequirements.push(`Quest points: ${matchedSlayerMaster.questPoints}`);
			warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
			if (aRequirements.length > 0) warningInfo += `**Requires**:\n${aRequirements.join('\n')}\n\n`;
		}

		const baseInfo = currentTask
			? await slayerStatusCommand(user)
			: `You have no task at the moment, you can get a task using \`/slayer task master:Turael\`All slayer Masters: ${slayerMasters.map(i => i.name).join(', ')}`;

		resultMessage += `${warningInfo}${baseInfo}`;
		if (currentTask && !warningInfo) {
			if (showButtons) {
				await interactionReply(interaction, {
					content: `You already have a slayer task: ${resultMessage}`,
					flags: MessageFlags.Ephemeral,
					components: slayerActionButtons
				});
				return;
			}
		}
		await interactionReply(interaction, resultMessage);
		return;
	}

	const newSlayerTask = await assignNewSlayerTask(user, slayerMaster);
	const myUnlocks = user.user.slayer_unlocks ?? [];
	const extendReward = SlayerRewardsShop.find(srs => srs.extendID?.includes(newSlayerTask.currentTask.monster_id));
	if (extendReward && myUnlocks.includes(extendReward.id)) {
		const quantity = newSlayerTask.assignedTask.extendedAmount
			? randInt(newSlayerTask.assignedTask.extendedAmount[0], newSlayerTask.assignedTask.extendedAmount[1])
			: Math.ceil(newSlayerTask.currentTask.quantity * extendReward.extendMult!);
		newSlayerTask.currentTask.quantity = quantity;
		await prisma.slayerTask.update({
			where: {
				id: newSlayerTask.currentTask.id
			},
			data: {
				quantity: newSlayerTask.currentTask.quantity,
				quantity_remaining: newSlayerTask.currentTask.quantity
			}
		});
	}

	let commonName = getCommonTaskName(newSlayerTask.assignedTask.monster);
	if (commonName === 'TzHaar') {
		resultMessage += 'Ah... Tzhaar... ';
		commonName +=
			'. You can choose to kill TzTok-Jad with `/activities fight_caves `, or TzKal-Zuk with `/activities inferno action:Start Inferno Trip ` as long as you ' +
			"don't kill any regular TzHaar first.";
	}

	resultMessage += `${slayerMaster.name} has assigned you to kill ${
		newSlayerTask.currentTask.quantity
	}x ${commonName}${getAlternateMonsterList(newSlayerTask.assignedTask)}.`;
	if (showButtons) {
		await interactionReply(interaction, {
			content: resultMessage,
			flags: MessageFlags.Ephemeral,
			components: slayerActionButtons
		});
		return;
	}

	await interactionReply(interaction, resultMessage);
}

export async function slayerSkipTaskCommand({
	userID,
	block,
	newTask,
	interaction
}: {
	userID: string;
	block: boolean;
	newTask: boolean;
	interaction: ChatInputCommandInteraction;
}): Promise<void> {
	const user = await mUserFetch(userID);
	const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
	const myBlockList = user.user.slayer_blocked_ids;
	const maxBlocks = await calcMaxBlockedTasks(user);
	if (user.minionIsBusy) {
		await interactionReply(interaction, 'You cannot change your task while your minion is busy.');
		return;
	}
	if (!currentTask) {
		if (newTask) {
			return slayerNewTaskCommand({
				userID: user.id,
				interaction,
				showButtons: true
			});
		}
		await interactionReply(interaction, "You don't have an active task!");
		return;
	}

	if (block && myBlockList.length >= maxBlocks) {
		await interactionReply(
			interaction,
			`You cannot have more than ${maxBlocks} slayer blocks!\n\nUse:\n\`/slayer rewards unblock assignment:kalphite\`\n to remove a blocked monster.\n\`/slayer manage command:list_blocks\` for your list of blocked monsters.`
		);
		return;
	}
	const slayerPoints = user.user.slayer_points;
	const cost = block ? 100 : 30;
	if (slayerPoints < cost) {
		await interactionReply(
			interaction,
			`You need ${cost} points to ${block ? 'block' : 'cancel'}, you only have: ${slayerPoints.toLocaleString()}.`
		);
		return;
	}
	const updateData: Parameters<typeof user.update>[0] = {
		slayer_points: {
			decrement: cost
		}
	};
	if (block) {
		updateData.slayer_blocked_ids = [...removeFromArr(myBlockList, currentTask.monster_id), currentTask.monster_id];
	}
	try {
		await user.update(updateData);
		await prisma.slayerTask.update({
			where: {
				id: currentTask.id
			},
			data: {
				skipped: true,
				quantity_remaining: 0
			}
		});
		const resultMessage = `Your task has been ${block ? 'blocked' : 'skipped'}. You now have ${user.user.slayer_points.toLocaleString()} slayer points.`;

		if (newTask) {
			return slayerNewTaskCommand({
				userID: user.id,
				interaction,
				extraContent: resultMessage,
				showButtons: true
			});
		}
		await interactionReply(interaction, resultMessage);
	} catch (e) {
		logError(e, {
			user_id: user.id.toString(),
			command: 'slayerSkipTaskCommand',
			current_task_id: currentTask.id.toString(),
			current_task: currentTask.monster_id.toString()
		});
		await interactionReply(
			interaction,
			'An error occurred while performing this action. Please try again, or contact #help-and-support if the issue persists.'
		);
	}
}

export async function slayerUnblockCommand(mahojiUser: MUser, monsterName: string) {
	const osjsMonster = Monsters.find(
		m => stringMatches(m.name, monsterName) || m.aliases.some(alias => stringMatches(alias, monsterName))
	);
	if (!osjsMonster) {
		return `Cannot find Monster with name **${monsterName}**`;
	}
	const blockedMonsters = mahojiUser.user.slayer_blocked_ids
		.map(mId => Monsters.find(m => m.id === mId))
		.filter(notEmpty);
	if (blockedMonsters.length === 0) {
		return "You don't currently have any monsters blocked.";
	}
	const monsterToUnblock = blockedMonsters.find(m => m.id === osjsMonster.id);
	if (!monsterToUnblock) {
		return `You don't currently have ${getCommonTaskName(osjsMonster)} blocked.`;
	}
	try {
		await mahojiUser.update({
			slayer_blocked_ids: removeFromArr(mahojiUser.user.slayer_blocked_ids, monsterToUnblock.id)
		});
		return `**${getCommonTaskName(monsterToUnblock)}** has been unblocked`;
	} catch (e) {
		logError(e, { user_id: mahojiUser.id.toString(), command: 'slayerUnblockCommand', assignment: monsterName });
		return 'An error occurred while trying to remove task. Please try again, or ask #help-and-support if the issue persists.';
	}
}
