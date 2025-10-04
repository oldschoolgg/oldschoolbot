import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { handleCombinedAutoFarm } from './combinedAutoFarmActivity.js';
import { executeFarmingStep } from './farmingStep.js';

export const farmingTask: MinionTask = {
	type: 'Farming',
	async run(data: FarmingActivityTaskOptions) {
		const user = await mUserFetch(data.userID);
		if (data.autoFarmCombined && data.autoFarmPlan?.length) {
			await handleCombinedAutoFarm({ user, taskData: data });
			return;
		}
		const result = await executeFarmingStep({ user, channelID: data.channelID, data });
		if (!result) {
			return;
		}
		await handleTripFinish(user, data.channelID, result.message, result.attachment, data, result.loot);
		if (data.autoFarmPlan?.length) {
			const [nextStep, ...remainingSteps] = data.autoFarmPlan;
			let nextPid = nextStep.pid;
			if (!nextPid && nextStep.planting && nextStep.plantsName) {
				const nextPlant = Farming.Plants.find(plant => plant.name === nextStep.plantsName);
				if (nextPlant) {
					const inserted = await prisma.farmedCrop.create({
						data: {
							user_id: user.id,
							date_planted: new Date(nextStep.currentDate),
							item_id: nextPlant.id,
							quantity_planted: nextStep.quantity,
							was_autofarmed: true,
							paid_for_protection: nextStep.payment ?? false,
							upgrade_type: nextStep.upgradeType
						}
					});
					nextPid = inserted.id;
				}
			}
			await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
				plantsName: nextStep.plantsName,
				patchType: nextStep.patchType,
				userID: user.id,
				channelID: data.channelID,
				quantity: nextStep.quantity,
				upgradeType: nextStep.upgradeType,
				payment: nextStep.payment,
				treeChopFeePaid: nextStep.treeChopFeePaid,
				treeChopFeePlanned: nextStep.treeChopFeePlanned,
				planting: nextStep.planting,
				duration: nextStep.duration,
				currentDate: nextStep.currentDate,
				type: 'Farming',
				autoFarmed: true,
				pid: nextPid,
				autoFarmPlan: remainingSteps
			});
		}
	}
};
