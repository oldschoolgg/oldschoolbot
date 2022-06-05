import { calcWhatPercent, increaseNumByPercent, percentChance, reduceNumByPercent, Time } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank, MonsterKillOptions, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { BitField, Emoji, PvMMethod } from '../../lib/constants';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { MaterialBank } from '../../lib/invention/MaterialBank';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { SlayerActivityConstants } from '../../lib/minions/data/combatConstants';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { KillableMonster } from '../../lib/minions/types';
import { prisma, trackLoot } from '../../lib/settings/prisma';
import { runCommand } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { bones } from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { calculateSlayerPoints, getSlayerMasterOSJSbyID, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { assert, itemID, roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { sendToChannelID } from '../../lib/util/webhook';

async function bonecrusherEffect(user: KlasaUser, loot: Bank, duration: number, messages: string[]) {
	if (!hasItemsEquippedOrInBank(user, ['Gorajan bonecrusher', 'Superior bonecrusher'], 'one')) return;
	if (user.bitfield.includes(BitField.DisabledGorajanBoneCrusher)) return;
	let hasSuperior = user.owns('Superior bonecrusher');

	let totalXP = 0;
	for (const bone of bones) {
		const amount = loot.amount(bone.inputId);
		if (amount > 0) {
			totalXP += bone.xp * amount * 4;
			loot.remove(bone.inputId, amount);
		}
	}

	let materialCost: MaterialBank | null = null;

	if (hasSuperior) {
		const t = await inventionItemBoost({ userID: user.id, inventionID: InventionID.SuperiorBonecrusher, duration });
		if (!t.success) {
			hasSuperior = false;
		} else {
			totalXP = increaseNumByPercent(totalXP, inventionBoosts.superiorBonecrusher.xpBoostPercent);
			materialCost = t.materialCost;
		}
	}

	const xpStr = await user.addXP({
		skillName: SkillsEnum.Prayer,
		amount: totalXP,
		duration,
		minimal: true
	});
	messages.push(
		`${xpStr} Prayer XP${
			hasSuperior
				? `(${inventionBoosts.superiorBonecrusher.xpBoostPercent}% more from Superior bonecrusher, Removed ${materialCost})`
				: ''
		}`
	);
}

const hideLeatherMap = [
	[getOSItem('Green dragonhide'), getOSItem('Green dragon leather')],
	[getOSItem('Blue dragonhide'), getOSItem('Blue dragon leather')],
	[getOSItem('Red dragonhide'), getOSItem('Red dragon leather')],
	[getOSItem('Black dragonhide'), getOSItem('Black dragon leather')],
	[getOSItem('Royal dragonhide'), getOSItem('Royal dragon leather')]
] as const;

async function portableTannerEffect(user: KlasaUser, loot: Bank, duration: number, messages: string[]) {
	if (!user.owns('Portable tanner')) return;
	const boostRes = await inventionItemBoost({
		userID: BigInt(user.id),
		inventionID: InventionID.PortableTanner,
		duration
	});
	if (!boostRes.success) return;
	let triggered = false;
	for (const [hide, leather] of hideLeatherMap) {
		let qty = loot.amount(hide.id);
		if (qty > 0) {
			triggered = true;
			loot.remove(hide.id, qty);
			loot.add(leather.id, qty);
		}
	}
	if (!triggered) return;
	messages.push(`Portable Tanner turned the hides into leathers (Removed ${boostRes.materialCost})`);
}

async function clueUpgraderEffect(user: KlasaUser, loot: Bank, messages: string[]) {
	if (!user.owns('Clue upgrader')) return;
	const upgradedClues = new Bank();
	const removeBank = new Bank();
	let durationForCost = 0;
	for (let i = 0; i < 4; i++) {
		const clueTier = ClueTiers[i];
		if (!loot.has(clueTier.scrollID)) continue;
		// Lower tiers are more common to upgrade
		let chanceOfUpgradePercent = 45 - (i + 1 * 5);
		for (let t = 0; t < loot.amount(clueTier.scrollID); t++) {
			if (percentChance(chanceOfUpgradePercent)) {
				removeBank.add(clueTier.scrollID);
				upgradedClues.add(ClueTiers[i + 1].scrollID);
				durationForCost += (i + 1) * Time.Minute * 2;
			}
		}
	}
	if (upgradedClues.length === 0) return;
	const boostRes = await inventionItemBoost({
		userID: BigInt(user.id),
		inventionID: InventionID.ClueUpgrader,
		duration: durationForCost
	});
	if (!boostRes.success) return;

	loot.add(upgradedClues);
	assert(loot.has(removeBank));
	loot.remove(removeBank);
	messages.push(`Clue Upgrader got you ${upgradedClues} (Removed ${boostRes.materialCost})`);
}

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration, usingCannon, cannonMulti, burstOrBarrage } = data;
		const monster = effectiveMonsters.find(mon => mon.id === monsterID)! as KillableMonster;
		const fullMonster = Monsters.get(monsterID);
		const user = await this.client.fetchUser(userID);
		if (monster.name === 'Koschei the deathless' && !roll(5000)) {
			sendToChannelID(channelID, {
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
				boostedQuantity = Math.ceil(increaseNumByPercent(quantity, 25));
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
		const quantitySlayed = isOnTask ? Math.min(usersTask.currentTask!.quantity_remaining, quantity) : null;

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
			isDoubleLootActive(this.client, duration) ? quantity * 2 : boostedQuantity,
			killOptions
		);

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;
		if (superiorTable && isOnTask) {
			for (let i = 0; i < quantity; i++) if (roll(200)) newSuperiorCount++;
		}

		let masterCapeRolls = user.hasItemEquippedAnywhere('Slayer master cape') ? newSuperiorCount : 0;
		newSuperiorCount += masterCapeRolls;

		if (monster.specialLoot) {
			monster.specialLoot(loot, user, data);
		}

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
			minimal: true,
			usingCannon,
			cannonMulti,
			burstOrBarrage,
			superiorCount: newSuperiorCount
		});

		const superiorMessage = newSuperiorCount ? `, including **${newSuperiorCount} superiors**` : '';
		const messages: string[] = [];
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n${xpRes}\n`;

		if (masterCapeRolls > 0) {
			messages.push(`${Emoji.SlayerMasterCape} You received ${masterCapeRolls}x bonus superior rolls`);
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
			messages.push(
				'<:brock:787310793183854594> On the way to Zulrah, you found a Badger that wants to join you.'
			);
		}

		if (gotKlik) {
			messages.push(
				'<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.'
			);
		}

		if (isDoubleLootActive(this.client, duration)) {
			messages.push('**Double Loot!**');
		} else if (oriBoost) {
			messages.push('Ori has used the abyss to transmute you +25% bonus loot!');
		}

		announceLoot({ user, monsterID: monster.id, loot, notifyDrops: monster.notifyDrops });

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

		await bonecrusherEffect(user, loot, duration, messages);
		await portableTannerEffect(user, loot, duration, messages);
		await clueUpgraderEffect(user, loot, messages);

		let thisTripFinishesTask = false;

		if (isOnTask) {
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				usersTask.currentTask!.monster_id !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id && usersTask.currentTask!.monster_id !== Monsters.Kreearra.id
					? quantitySlayed! * 4
					: monsterID === Monsters.GrotesqueGuardians.id &&
					  user.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(SlayerTaskUnlocksEnum.DoubleTrouble)
					? quantitySlayed! * 2
					: quantitySlayed!;

			const quantityLeft = Math.max(0, usersTask.currentTask!.quantity_remaining - effectiveSlayed);

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
				await user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
				const points = await calculateSlayerPoints(currentStreak, usersTask.slayerMaster!, user);
				const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
				await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);
				str += `\n\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.**`;
				if (usersTask.assignedTask?.isBoss) {
					str += ` ${await user.addXP({ skillName: SkillsEnum.Slayer, amount: 5000, minimal: true })}`;
					str += ' for completing your boss task.';
				}
			} else {
				str += `\nYou killed ${effectiveSlayed}x of your ${
					usersTask.currentTask!.quantity_remaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}

			if (thisTripFinishesTask) {
				let mysteryBoxChance = 25;
				if (usersTask.slayerMaster!.id >= 4) {
					mysteryBoxChance -= 20;
				}

				mysteryBoxChance = reduceNumByPercent(
					mysteryBoxChance,
					calcWhatPercent(monster.timeToFinish, Time.Minute * 15) / 3
				);

				mysteryBoxChance = Math.floor(mysteryBoxChance);
				mysteryBoxChance = Math.max(1, mysteryBoxChance);

				if (roll(mysteryBoxChance)) {
					loot.add(MysteryBoxes.roll());
				}
			}

			await prisma.slayerTask.update({
				where: {
					id: usersTask.currentTask!.id
				},
				data: {
					quantity_remaining: quantityLeft
				}
			});
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		await trackLoot({
			loot: itemsAdded,
			id: monster.name.toString(),
			type: 'Monster',
			changeType: 'loot',
			kc: quantity,
			duration
		});

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

		if (messages.length > 0) {
			str += `\n**Messages:** ${messages.join(', ')}`;
		}

		handleTripFinish(
			user,
			channelID,
			str,
			isOnTask && thisTripFinishesTask
				? undefined
				: res => {
						let method: PvMMethod = 'none';
						if (usingCannon) method = 'cannon';
						else if (burstOrBarrage === SlayerActivityConstants.IceBarrage) method = 'barrage';
						else if (burstOrBarrage === SlayerActivityConstants.IceBurst) method = 'burst';
						return runCommand({
							message: res,
							commandName: 'k',
							args: {
								name: monster.name,
								quantity,
								method
							},
							isContinue: true
						});
				  },
			image!,
			data,
			itemsAdded
		);
	}
}
