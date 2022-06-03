import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { farmingPlantCommand } from '../../../mahoji/lib/abstracted_commands/farmingCommand';
import { UserSettings } from '../../settings/types/UserSettings';
import { calcNumOfPatches } from '../../skilling/functions/calcsFarming';
import { AutoFarmFilterEnum, plants } from '../../skilling/skills/farming';
import { IPatchDataDetailed } from '../farming/types';
import { Plant } from './../../skilling/types';

export async function autoFarm(user: KlasaUser, patchesDetailed: IPatchDataDetailed[], channelID: bigint) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank();
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
	let toPlant: Plant | undefined = undefined;
	let errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	let autoFarmFilter = user.settings.get(UserSettings.Minion.AutoFarmFilterToUse);
	if (!autoFarmFilter) autoFarmFilter = AutoFarmFilterEnum.AllFarm;

	if (autoFarmFilter === AutoFarmFilterEnum.AllFarm) {
		const elligible = [...plants]
			.filter(p => {
				if (p.level > farmingLevel) return false;
				const [numOfPatches] = calcNumOfPatches(p, user, user.settings.get(UserSettings.QP));
				if (numOfPatches === 0) return false;
				const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
				if (!userBank.has(reqItems.bank)) return false;
				return true;
			})
			.sort((a, b) => b.level - a.level);

		const canPlant = elligible.find(p => {
			const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
			if (patchData.ready === false) return false;
			return true;
		});
		const canHarvest = elligible.find(p => patchesDetailed.find(_p => _p.patchName === p.seedType)!.ready);
		toPlant = canPlant ?? canHarvest;
		errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	}
	if (autoFarmFilter === AutoFarmFilterEnum.Replant) {
		const elligible = [...plants]
			.filter(p => {
				if (p.level > farmingLevel) return false;
				const [numOfPatches] = calcNumOfPatches(p, user, user.settings.get(UserSettings.QP));
				if (numOfPatches === 0) return false;
				const reqItems = new Bank(p.inputItems);
				if (!userBank.has(reqItems.bank)) return false;
				const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
				if (patchData.ready === true && p.name === patchData.plant?.name) return true;
				return false;
			})
			.sort((a, b) => b.level - a.level);

		toPlant = elligible.find(p => {
			const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
			if (patchData.ready === false) return false;
			return true;
		});
		errorString =
			"There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	}
	if (!toPlant) {
		return errorString;
	}

	return farmingPlantCommand({
		user,
		plantName: toPlant.name,
		autoFarmed: true,
		channelID,
		quantity: null,
		pay: false
	});
}
