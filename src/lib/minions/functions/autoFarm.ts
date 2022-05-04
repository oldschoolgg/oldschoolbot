import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { farmingPlantCommand } from '../../../mahoji/lib/abstracted_commands/farmingCommand';
import { UserSettings } from '../../settings/types/UserSettings';
import { calcNumOfPatches } from '../../skilling/functions/calcsFarming';
import { plants } from '../../skilling/skills/farming';
import { IPatchDataDetailed } from '../farming/types';

export async function autoFarm(
	interaction: SlashCommandInteraction,
	user: KlasaUser,
	patchesDetailed: IPatchDataDetailed[]
) {
	const userBank = user.bank();
	let possiblePlants = plants.sort((a, b) => b.level - a.level);

	const toPlant = possiblePlants.find(p => {
		if (user.skillLevel(SkillsEnum.Farming) < p.level) return false;
		const patchData = patchesDetailed.find(_p => (_p.patchName = p.seedType))!;
		// Still growing
		if (patchData.ready === false) return false;
		const [numOfPatches] = calcNumOfPatches(p, user, user.settings.get(UserSettings.QP));
		const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
		if (!userBank.has(reqItems.bank)) return false;
		return true;
	});
	if (!toPlant) {
		return "There's no Farming crops that you have the requirements to plant.";
	}
	return farmingPlantCommand({
		user,
		plantName: toPlant.name,
		autoFarmed: true,
		channelID: interaction.channelID,
		quantity: null
	});
}
