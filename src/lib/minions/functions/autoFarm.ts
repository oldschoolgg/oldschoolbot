import { AutoFarmFilterEnum } from '@/prisma/main.js';
import { allFarm, replant } from '@/lib/minions/functions/autoFarmFilters.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import type { IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';
import { farmingPlantCommand } from '@/mahoji/lib/abstracted_commands/farmingCommand.js';

export async function autoFarm(interaction: MInteraction, user: MUser, patchesDetailed: IPatchDataDetailed[]) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank;
	const farmingLevel = user.skillsAsLevels.farming;
	let toPlant: Plant | undefined;
	let canPlant: Plant | undefined;
	let canHarvest: Plant | undefined;
	let elligible: Plant[] = [];
	let errorString = '';
	let { autoFarmFilter } = user;

	if (!autoFarmFilter) {
		autoFarmFilter = AutoFarmFilterEnum.AllFarm;
	}

	elligible = [...plants]
		.filter(p => {
			switch (autoFarmFilter) {
				case AutoFarmFilterEnum.AllFarm: {
					return allFarm(p, farmingLevel, user, userBank);
				}
				case AutoFarmFilterEnum.Replant: {
					return replant(p, farmingLevel, user, userBank, patchesDetailed);
				}
				default: {
					return allFarm(p, farmingLevel, user, userBank);
				}
			}
		})
		.sort((a, b) => b.level - a.level);

	if (autoFarmFilter === AutoFarmFilterEnum.AllFarm) {
		canHarvest = elligible.find(p => patchesDetailed.find(_p => _p.patchName === p.seedType)?.ready);
		errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	}
	if (autoFarmFilter === AutoFarmFilterEnum.Replant) {
		errorString =
			"There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	}

	canPlant = elligible.find(p => {
		const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
		if (patchData.ready === false) return false;
		return true;
	});
	toPlant = canPlant ?? canHarvest;
	if (!toPlant) {
		return errorString;
	}

	return farmingPlantCommand({
		user,
		interaction,
		plantName: toPlant.name,
		autoFarmed: true,
		quantity: null,
		pay: false
	});
}
