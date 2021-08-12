import { randArrItem, Time } from 'e';
import { Task } from 'klasa';
import { MonsterKillOptions, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { Emoji } from '../../lib/constants';
import { frozenKeyPieces } from '../../lib/data/CollectionsExport';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import { SlayerActivityConstants } from '../../lib/minions/data/combatConstants';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { KillableMonster } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { bones } from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { calculateSlayerPoints, getSlayerMasterOSJSbyID, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../lib/util/webhook';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration, usingCannon, cannonMulti, burstOrBarrage } = data;
		const monster = effectiveMonsters.find(mon => mon.id === monsterID)! as KillableMonster;
		const fullMonster = Monsters.get(monsterID);
		const user = await this.client.users.fetch(userID);
		if (monster.name === 'Koschei the deathless' && !roll(5000)) {
			sendToChannelID(this.client, channelID, {
				content: `${user}, ${user.minionName} failed to defeat Koschei the deathless.`
			});
		}

		await user.incrementMonsterScore(monsterID, quantity);

		// Abyssal set bonuses -- grants the user a few extra kills
		let boostedQuantity = quantity;
		let oriBoost = false;
		if (user.equippedPet() === itemID('Ori')) {
			oriBoost = true;
			if (duration > Time.Minute * 5) {
				// Original boost for 5+ minute task:
				boostedQuantity = Math.ceil(quantity * 1.25);
			} else {
				// 25% chance at extra kill otherwise:
				for (let i = 0; i < quantity; i++) {
					if (roll(4)) boostedQuantity++;
				}
			}
		}

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monsterID);
		const quantitySlayed = isOnTask ? Math.min(usersTask.currentTask!.quantityRemaining, quantity) : null;

		const mySlayerUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);

		const slayerMaster = isOnTask ? getSlayerMasterOSJSbyID(usersTask.slayerMaster!.id) : undefined;
		// Check if superiors unlock is purchased
		const superiorsUnlocked = isOnTask
			? mySlayerUnlocks.includes(SlayerTaskUnlocksEnum.BiggerAndBadder)
			: undefined;

		const superiorTable = superiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = !usingCannon ? monster.existsInCatacombs ?? undefined : undefined;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTask,
			slayerMaster,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs
		};
		// Regular loot
		const loot = (monster as KillableMonster).table.kill(
			isDoubleLootActive(this.client) ? quantity * 2 : boostedQuantity,
			killOptions
		);

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;
		if (superiorTable && isOnTask) {
			for (let i = 0; i < quantity; i++) if (roll(200)) newSuperiorCount++;
		}

		let masterCapeRolls = user.hasItemEquippedAnywhere('Slayer master cape') ? newSuperiorCount : 0;
		newSuperiorCount += masterCapeRolls;

		if (newSuperiorCount) {
			// Superior loot and totems if in catacombs
			loot.add(superiorTable!.kill(newSuperiorCount));
			if (isInCatacombs) loot.add('Dark totem base', newSuperiorCount);
		}

		const xpRes = await addMonsterXP(user, {
			monsterID,
			quantity,
			duration,
			isOnTask,
			taskQuantity: quantitySlayed,
			minimal: false,
			usingCannon,
			cannonMulti,
			burstOrBarrage,
			superiorCount: newSuperiorCount
		});

		const superiorMessage = newSuperiorCount ? `, including **${newSuperiorCount} superiors**` : '';
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n${xpRes}\n`;

		if (masterCapeRolls > 0) {
			str += `${Emoji.SlayerMasterCape} You received ${masterCapeRolls}x bonus superior rolls `;
		}

		if ([3129, 2205, 2215, 3162].includes(monster.id)) {
			for (let i = 0; i < quantity; i++) {
				if (roll(20)) {
					loot.add(randArrItem(frozenKeyPieces));
				}
			}
		}

		if (monster.id === Monsters.Vorkath.id && roll(6000)) {
			loot.add(23_941);
		}

		let gotKlik = false;
		const minutes = Math.ceil(duration / Time.Minute);
		if (fullMonster?.data.attributes.includes(MonsterAttribute.Dragon)) {
			for (let i = 0; i < minutes; i++) {
				if (roll(8500)) {
					gotKlik = true;
					loot.add('Klik');
					break;
				}
			}
		}

		if (monster.id === 290) {
			for (let i = 0; i < minutes; i++) {
				if (roll(6000)) {
					loot.add('Dwarven ore');
					break;
				}
			}
		}

		let gotBrock = false;
		if (monster.name.toLowerCase() === 'zulrah') {
			for (let i = 0; i < minutes; i++) {
				if (roll(5500)) {
					gotBrock = true;
					loot.add('Brock');
					break;
				}
			}
		}

		if (gotBrock) {
			str += '\n<:brock:787310793183854594> On the way to Zulrah, you found a Badger that wants to join you.';
		}

		if (gotKlik) {
			str += '\n\n<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.';
		}

		if (isDoubleLootActive(this.client)) {
			str += '\n\n**Double Loot!**';
		} else if (oriBoost) {
			str += '\n\nOri has used the abyss to transmute you +25% bonus loot!';
		}

		announceLoot(this.client, user, monster, loot.bank);
		if (newSuperiorCount && newSuperiorCount > 0) {
			const oldSuperiorCount = await user.settings.get(UserSettings.Slayer.SuperiorCount);
			user.settings.update(UserSettings.Slayer.SuperiorCount, oldSuperiorCount + newSuperiorCount);
		}

		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasItemEquippedAnywhere('Iron dagger') &&
			!user.hasItemEquippedOrInBank('Clue hunter cloak')
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');
		}

		if (user.settings.get(UserSettings.Bank)[itemID('Gorajan bonecrusher')]) {
			let totalXP = 0;
			for (const bone of bones) {
				const amount = loot.amount(bone.inputId);
				if (amount > 0) {
					totalXP += bone.xp * amount * 4;
					loot.remove(bone.inputId, amount);
				}
			}
			str += await user.addXP({
				skillName: SkillsEnum.Prayer,
				amount: totalXP,
				duration
			});
		}

		let thisTripFinishesTask = false;

		if (isOnTask) {
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				usersTask.currentTask!.monsterID !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id && usersTask.currentTask!.monsterID !== Monsters.Kreearra.id
					? quantitySlayed! * 4
					: monsterID === Monsters.GrotesqueGuardians.id &&
					  user.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(SlayerTaskUnlocksEnum.DoubleTrouble)
					? quantitySlayed! * 2
					: quantitySlayed!;

			const quantityLeft = Math.max(0, usersTask.currentTask!.quantityRemaining - effectiveSlayed);

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
				await user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
				const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
				const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
				await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);
				str += `\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.**`;
				if (usersTask.assignedTask?.isBoss) {
					str += ` ${await user.addXP({ skillName: SkillsEnum.Slayer, amount: 5000 })}`;
					str += ' for completing your boss task.';
				}
			} else {
				str += `\nYou killed ${effectiveSlayed}x of your ${
					usersTask.currentTask!.quantityRemaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}
			usersTask.currentTask!.quantityRemaining = quantityLeft;
			await usersTask.currentTask!.save();
		}

		if (thisTripFinishesTask && roll(10)) {
			loot.add(getRandomMysteryBox());
		}

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
			isOnTask && thisTripFinishesTask
				? undefined
				: res => {
						user.log(`continued trip of killing ${monster.name}`);
						let method = 'none';
						if (usingCannon) method = 'cannon';
						else if (burstOrBarrage === SlayerActivityConstants.IceBarrage) method = 'barrage';
						else if (burstOrBarrage === SlayerActivityConstants.IceBurst) method = 'burst';
						return this.client.commands.get('k')!.run(res, [quantity, monster.name, method]);
				  },
			image!,
			data,
			itemsAdded
		);
	}
}
