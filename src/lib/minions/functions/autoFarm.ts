import { Time } from 'e';
import { KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { runCommand } from '../../settings/settings';
import { UserSettings } from '../../settings/types/UserSettings';
import { calcNumOfPatches } from '../../skilling/functions/calcsFarming';
import Farming, { plants } from '../../skilling/skills/farming';
import { stringMatches } from '../../util';
import { defaultPatches, resolvePatchTypeSetting } from '../farming';

export async function autoFarm(msg: KlasaMessage) {
	const currentDate = new Date().getTime();
	const userBank = msg.author.bank();
	let possiblePlants = plants.sort((a, b) => b.level - a.level);
	const toPlant = possiblePlants.find(p => {
		if (msg.author.skillLevel(SkillsEnum.Farming) < p.level) return false;
		const getPatchType = resolvePatchTypeSetting(p.seedType)!;
		const patchData = msg.author.settings.get(getPatchType) ?? defaultPatches;
		const lastPlantTime: number = patchData.plantTime;
		const difference = currentDate - lastPlantTime;
		const planted =
			patchData.lastPlanted !== null
				? Farming.Plants.find(
						plants =>
							stringMatches(plants.name, patchData.lastPlanted ?? '') ||
							stringMatches(plants.name.split(' ')[0], patchData.lastPlanted ?? '')
				  ) ?? null
				: null;

		if (planted && difference < planted.growthTime * Time.Minute) return false;
		const [numOfPatches] = calcNumOfPatches(p, msg.author, msg.author.settings.get(UserSettings.QP));
		const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
		if (!userBank.has(reqItems.bank)) {
			return false;
		}
		return true;
	});
	if (!toPlant) {
		return msg.channel.send("There's no Farming crops that you have the requirements to plant.");
	}
	return runCommand({ message: msg, commandName: 'farm', args: [toPlant.name, true], bypassInhibitors: true });
}
