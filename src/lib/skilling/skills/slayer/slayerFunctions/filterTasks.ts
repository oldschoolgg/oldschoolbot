import { SlayerMaster } from '../../../types';
import { UserSettings } from '../../../../../lib/settings/types/UserSettings';
import { KlasaMessage } from 'klasa';
// import {determineCombatLevel} '../../../../util';
import { SkillsEnum } from '../../../../skilling/types';

// Filters out the tasks the user can be assigned from a certain slayermaster.
export default function filterTasks(msg: KlasaMessage, master: SlayerMaster) {
	const { settings } = msg.author;
	const blockList = settings.get(UserSettings.Slayer.BlockList);
	const unlockedList = settings.get(UserSettings.Slayer.UnlockedList);

	/* For future
    const userCombatLevel = determineCombatLevel(
        msg.author.skillLevel(SkillsEnum.Prayer),
        msg.author.skillLevel(SkillsEnum.Hitpoints),
        msg.author.skillLevel(SkillsEnum.Defence),
        msg.author.skillLevel(SkillsEnum.Strength),
        msg.author.skillLevel(SkillsEnum.Attack),
        msg.author.skillLevel(SkillsEnum.Magic),
        msg.author.skillLevel(SkillsEnum.Range)
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
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);

	// Removes blocked tasks
	for (const blockedTask of blockList) {
		filteredTaskList = filteredTaskList.filter(task => task.name !== blockedTask.name);
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);

	// Filter by combat level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].combatLvl! > userCombatLevel) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	//	filteredTaskList = filteredTaskList.filter(task => task.combatLvl! <= userCombatLevel);

	// Filter by slayer level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].slayerLvl! > msg.author.skillLevel(SkillsEnum.Slayer)) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	/*
	filteredTaskList = filteredTaskList.filter(
		task => task.slayerLvl! <= msg.author.skillLevel(SkillsEnum.Slayer)
	);
	*/

	// Filter by agility/strength level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (
			filteredTaskList[i].agiStrLvl! >
			msg.author.skillLevel(
				SkillsEnum.Agility
			) /* || msg.author.skillLevel(SkillsEnum.Strength)*/
		) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	/*
	filteredTaskList = filteredTaskList.filter(
		task =>
			task.agiStrLvl! <=
			msg.author.skillLevel(SkillsEnum.Agility) || msg.author.skillLevel(SkillsEnum.Strength)
	);
	*/
	// Filter by defence level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].defenceLvl! > userDefenceLvl) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	//	filteredTaskList = filteredTaskList.filter(task => task.defenceLvl! <= userDefenceLvl);

	// Filter by magic level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].magicLvl! > userMagicLvl) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	//	filteredTaskList = filteredTaskList.filter(task => task.magicLvl! <= userMagicLvl);

	// Filter by firemaking level
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].firemakingLvl! > msg.author.skillLevel(SkillsEnum.Firemaking)) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	/*
	filteredTaskList = filteredTaskList.filter(
		task => task.firemakingLvl! <= msg.author.skillLevel(SkillsEnum.Firemaking)
	);
	*/

	// Filter by questpoints
	for (let i = 0; i < filteredTaskList.length; i++) {
		if (filteredTaskList[i].questPoints! > settings.get(UserSettings.QP)) {
			delete filteredTaskList[i];
		}
	}
	filteredTaskList = filteredTaskList.filter(task => task !== undefined);
	/*
	filteredTaskList = filteredTaskList.filter(
		task => task.questPoints! <= settings.get(UserSettings.QP)
	);
	*/

	filteredTaskList = filteredTaskList.filter(task => task !== undefined);

	return filteredTaskList;
}
