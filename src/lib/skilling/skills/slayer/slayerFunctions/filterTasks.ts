import { SlayerMaster } from '../../../types';
import { UserSettings } from '../../../../../lib/settings/types/UserSettings';
import { KlasaMessage } from 'klasa';
// import {determineCombatLevel} '../../../../util';
import { SkillsEnum } from '../../../../skilling/types';

// Filters out the tasks the user can be assigned from a certain slayermaster.
export default function filterTasks(msg: KlasaMessage, master: SlayerMaster) {
	const { settings, skillLevel } = msg.author;
	const blockList = settings.get(UserSettings.Slayer.BlockList);
	const unlockedList = settings.get(UserSettings.Slayer.UnlockedList);

	/* For future
    const userCombatLevel = determineCombatLevel(
        skillLevel(SkillsEnum.Prayer),
        skillLevel(SkillsEnum.Hitpoints),
        skillLevel(SkillsEnum.Defence),
        skillLevel(SkillsEnum.Strength),
        skillLevel(SkillsEnum.Attack),
        skillLevel(SkillsEnum.Magic),
        skillLevel(SkillsEnum.Range)
    );
    */
	// Temp maxed combat stats
	const userCombatLevel = 126;
	const userMagicLvl = 99;
	const userDefenceLvl = 99;

	// Filter by default unlocked
	let filteredTaskList = master.tasks.filter(task => task.unlocked === true);

	// Adds unlockedTasks to filteredTasks if current SlayerMaster can assign that task.
	for (const unlockedTask of unlockedList) {
		if (master.tasks.some(task => task.name === unlockedTask.name)) {
			filteredTaskList.concat(unlockedTask);
		}
	}

	// Removes blocked tasks 
	for (const blockedTask of blockList) {
		filteredTaskList = filteredTaskList.filter(task => task.name !== blockedTask.name);
	}

	// Filter by combat level
	filteredTaskList = filteredTaskList.filter(task => task.combatLvl! <= userCombatLevel);

	// Filter by slayer level
	filteredTaskList = filteredTaskList.filter(
		task => task.slayerLvl! <= skillLevel(SkillsEnum.Slayer)
	);

	// Filter by agility/strength level
	filteredTaskList = filteredTaskList.filter(
		task =>
			task.agiStrLvl! <=
			skillLevel(SkillsEnum.Agility) /* || skillLevel(SkillsEnum.Strength)*/
	);

	// Filter by defence level
	filteredTaskList = filteredTaskList.filter(task => task.defenceLvl! <= userDefenceLvl);

	// Filter by magic level
	filteredTaskList = filteredTaskList.filter(task => task.magicLvl! <= userMagicLvl);

	// Filter by firemaking level
	filteredTaskList = filteredTaskList.filter(
		task => task.firemakingLvl! <= skillLevel(SkillsEnum.Firemaking)
	);

	// Filter by questpoints
	filteredTaskList = filteredTaskList.filter(
		task => task.questPoints! <= settings.get(UserSettings.QP)
	);

	return filteredTaskList;
}
