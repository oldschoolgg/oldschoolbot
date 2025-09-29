import { Bank } from 'oldschooljs';

import type { FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { executeFarmingStep, type FarmingStepAttachment } from './farmingStep.js';

interface HandleCombinedAutoFarmOptions {
	user: MUser;
	taskData: FarmingActivityTaskOptions;
}

export async function handleCombinedAutoFarm({ user, taskData }: HandleCombinedAutoFarmOptions) {
	const plan = taskData.autoFarmPlan;
	const steps =
		plan && plan.length > 0
			? plan
			: [
					{
						plantsName: taskData.plantsName,
						quantity: taskData.quantity,
						upgradeType: taskData.upgradeType,
						payment: taskData.payment,
						treeChopFeePaid: taskData.treeChopFeePaid,
						treeChopFeePlanned: taskData.treeChopFeePlanned,
						patchType: taskData.patchType,
						planting: taskData.planting,
						currentDate: taskData.currentDate,
						pid: taskData.pid,
						duration: taskData.duration
					}
				];

	const messages: string[] = [];
	const attachments: FarmingStepAttachment[] = [];
	const totalLoot = new Bank();
	let handledAny = false;

	for (const step of steps) {
		const stepData: FarmingActivityTaskOptions = {
			...taskData,
			plantsName: step.plantsName,
			quantity: step.quantity,
			upgradeType: step.upgradeType,
			payment: step.payment,
			treeChopFeePaid: step.treeChopFeePaid,
			treeChopFeePlanned: step.treeChopFeePlanned,
			patchType: step.patchType,
			planting: step.planting,
			currentDate: step.currentDate,
			duration: step.duration,
			pid: step.pid,
			autoFarmPlan: undefined,
			autoFarmCombined: false
		};

		const result = await executeFarmingStep({ user, channelID: taskData.channelID, data: stepData });
		if (!result) {
			break;
		}

		handledAny = true;
		messages.push(result.message);
		if (result.attachment) {
			attachments.push(result.attachment);
		}
		if (result.loot) {
			totalLoot.add(result.loot);
		}
	}

	if (!handledAny) {
		return;
	}

	const content = messages.join('\n\n');
	let message: string | { content: string; files: FarmingStepAttachment[] } = content;
	if (attachments.length > 0) {
		message = {
			content,
			files: attachments
		};
	}

	const loot = totalLoot.length > 0 ? totalLoot : null;

	await handleTripFinish(user, taskData.channelID, message, undefined, taskData, loot);
}
