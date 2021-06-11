import { Task } from 'klasa';
import { MonsterKillOptions, Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import {
	calculateSlayerPoints,
	filterLootReplace,
	getSlayerMasterOSJSbyID,
	getUsersCurrentSlayerInfo
} from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		await user.incrementMonsterScore(monsterID, quantity);

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monsterID);
		const quantitySlayed = isOnTask
			? Math.min(usersTask.currentTask!.quantityRemaining, quantity)
			: null;
		const xpRes = await addMonsterXP(
			user,
			monsterID,
			quantity,
			duration,
			isOnTask,
			quantitySlayed,
			data.usingCannon,
			data.cannonMulti
		);

		const mySlayerUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);

		const slayerMaster = isOnTask
			? getSlayerMasterOSJSbyID(usersTask.slayerMaster!.id)
			: undefined;
		// Check if superiors unlock is purchased
		const superiorsUnlocked = isOnTask
			? mySlayerUnlocks.includes(SlayerTaskUnlocksEnum.BiggerAndBadder)
			: undefined;

		const superiorTable = superiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = !data.usingCannon
			? monster.existsInCatacombs ?? undefined
			: undefined;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTask,
			slayerMaster,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs
		};
		const loot = monster.table.kill(quantity, killOptions);
		const newSuperiorCount = loot.bank[420];

		announceLoot(this.client, user, monster, loot.bank);
		if (newSuperiorCount && newSuperiorCount > 0) {
			const oldSuperiorCount = await user.settings.get(UserSettings.Slayer.SuperiorCount);
			user.settings.update(
				UserSettings.Slayer.SuperiorCount,
				oldSuperiorCount + newSuperiorCount
			);
		}
		const superiorMessage = newSuperiorCount
			? `, including **${newSuperiorCount} superiors**`
			: '';
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n${xpRes}\n`;
		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasItemEquippedAnywhere('Iron dagger') &&
			!user.hasItemEquippedOrInBank('Clue hunter cloak')
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');

			str += `\n\nWhile killing a Unicorn, you discover some strange clothing in the ground - you pick them up.`;
		}

		if (isOnTask) {
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				usersTask.currentTask!.monsterID !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id &&
					  usersTask.currentTask!.monsterID !== Monsters.Kreearra.id
					? quantitySlayed! * 4
					: monsterID === Monsters.GrotesqueGuardians.id &&
					  user.settings
							.get(UserSettings.Slayer.SlayerUnlocks)
							.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
					? quantitySlayed! * 2
					: quantitySlayed!;

			const quantityLeft = Math.max(
				0,
				usersTask.currentTask!.quantityRemaining - effectiveSlayed
			);

			const thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
				user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
				const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
				const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
				await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);

				str += `\nYou've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.`;
			} else {
				str += `\nYou killed ${effectiveSlayed}x of your ${
					usersTask.currentTask!.quantityRemaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}
			usersTask.currentTask!.quantityRemaining = quantityLeft;
			await usersTask.currentTask!.save();
		}

		filterLootReplace(user.allItemsOwned(), loot);

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
