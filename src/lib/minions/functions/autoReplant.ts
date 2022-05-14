import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { farmingPlantCommand } from '../../../mahoji/lib/abstracted_commands/farmingCommand';
import { UserSettings } from '../../settings/types/UserSettings';
import { calcNumOfPatches } from '../../skilling/functions/calcsFarming';
import { plants } from '../../skilling/skills/farming';
import { IPatchDataDetailed } from '../farming/types';

export async function autoReplant(user: KlasaUser, patchesDetailed: IPatchDataDetailed[], channelID: bigint) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank();
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
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

	const toPlant = elligible.find(p => {
		const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
		if (patchData.ready === false) return false;
		return true;
	});

	if (!toPlant) {
		return "There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	}

	return farmingPlantCommand({
		user,
		plantName: toPlant.name,
		autoReplanted: true,
		autoFarmed: false,
		channelID,
		quantity: null,
		pay: false
	});
}
