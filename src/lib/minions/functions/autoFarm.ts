import { autoFarm_filter_enum } from '@prisma/client';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { farmingPlantCommand } from '../../../mahoji/lib/abstracted_commands/farmingCommand';
import { mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';
import { plants } from '../../skilling/skills/farming';
import { IPatchDataDetailed } from '../farming/types';
import { Plant } from './../../skilling/types';
import { allFarm, replant } from './autoFarmFilters';

autoFarm_filter_enum;

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
	let fetchAutoFarmFilter = await mahojiUsersSettingsFetch(user.id, {
		minion_autoFarmFilterToUse: true
	});
	let autoFarmFilter = fetchAutoFarmFilter.minion_autoFarmFilterToUse as autoFarm_filter_enum;

	if (!autoFarmFilter) {
		autoFarmFilter = autoFarm_filter_enum.allfarm;
	}

	const autoFarmFilterString = autoFarmFilter.toString().toLowerCase();

	elligible = [...plants]
		.filter(p => {
			switch (autoFarmFilterString) {
				case autoFarm_filter_enum.allfarm: {
					return allFarm(p, farmingLevel, user, userBank);
				}
				case autoFarm_filter_enum.replant: {
					return replant(p, farmingLevel, user, userBank, patchesDetailed);
				}
				default: {
					return allFarm(p, farmingLevel, user, userBank);
				}
			}
		})
		.sort((a, b) => b.level - a.level);

	if (autoFarmFilterString === autoFarm_filter_enum.allfarm) {
		canHarvest = elligible.find(p => patchesDetailed.find(_p => _p.patchName === p.seedType)!.ready);
		errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	}
	if (autoFarmFilterString === autoFarm_filter_enum.replant) {
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
