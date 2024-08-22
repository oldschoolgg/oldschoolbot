import { AutoFarmFilterEnum } from '@prisma/client';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { farmingPlantCommand } from '../../../mahoji/lib/abstracted_commands/farmingCommand';
import { plants } from '../../skilling/skills/farming';
import type { IPatchDataDetailed } from '../farming/types';
import type { Plant } from './../../skilling/types';
import { allFarm, replant } from './autoFarmFilters';

export async function autoFarm(user: MUser, patchesDetailed: IPatchDataDetailed[], channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank;
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
	let toPlant: Plant | undefined = undefined;
	let canPlant: Plant | undefined = undefined;
	let canHarvest: Plant | undefined = undefined;
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
		userID: user.id,
		plantName: toPlant.name,
		autoFarmed: true,
		channelID,
		quantity: null,
		pay: false
	});
}
