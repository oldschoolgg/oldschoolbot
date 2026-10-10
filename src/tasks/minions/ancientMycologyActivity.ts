import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { Emoji, Events, Time } from '@oldschoolgg/toolkit';
import { LootTable } from 'oldschooljs';

import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';
import type { AncientMycologyActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { skillingPetDropRate } from '@/lib/util.js';
import {
	type AncientWood,
	ancientMycologyWoods,
	findAncientWood
} from '@/mahoji/lib/abstracted_commands/ancientMycologyCommand.js';

function generateAllTiersMycologyTable(currentWcLevel: number): LootTable {
	const mycologyTable = new LootTable();
	const availableWoods = ancientMycologyWoods.filter(w => currentWcLevel >= w.level);

	for (const wood of availableWoods) {
		switch (wood.name) {
			case 'Ancient verdant logs':
				mycologyTable.add(wood.id, 1, 1);
				break;
			case 'Living bark':
				mycologyTable.add(wood.id, 1, 2);
				break;
			case 'Colossal stem':
				mycologyTable.add(wood.id, 1, 3);
				break;
			case 'Ancient cap':
				mycologyTable.add(wood.id, 1, 4);
				break;
			case 'Verdant logs':
			default:
				mycologyTable.add(wood.id, 1, 5);
				break;
		}
	}

	return mycologyTable;
}

function generateSpecificMycologyTable(targetWood: AncientWood): LootTable {
	const mycologyTable = new LootTable();

	switch (targetWood.name) {
		case 'Ancient verdant logs':
			mycologyTable.add(targetWood.id, 1, 1).add(new LootTable(), 1, 8);
			break;
		case 'Living bark':
			mycologyTable.add(targetWood.id, 1, 1).add(new LootTable(), 1, 4);
			break;
		case 'Colossal stem':
			mycologyTable.add(targetWood.id, 1, 1).add(new LootTable(), 1, 2);
			break;
		case 'Ancient cap':
			mycologyTable.add(targetWood.id, 1, 1).add(new LootTable(), 1, 1);
			break;
		case 'Verdant logs':
		default:
			mycologyTable.add(targetWood.id, 1, 3).add(new LootTable(), 1, 1);
			break;
	}

	return mycologyTable;
}

export const ancientMycologyTask: MinionTask = {
	type: 'AncientMycology',
	async run(data: AncientMycologyActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, woodName } = data;
		const currentWcLevel = user.skillsAsLevels.woodcutting;

		const availableWoods = ancientMycologyWoods.filter(w => currentWcLevel >= w.level);
		const targetWood = (woodName ? findAncientWood(woodName) : null) ?? availableWoods[availableWoods.length - 1];

		const mycologyTable = woodName
			? generateSpecificMycologyTable(targetWood)
			: generateAllTiersMycologyTable(currentWcLevel);

		let woodcuttingXP = quantity * targetWood.xp;
		const loot = mycologyTable.roll(quantity);

		if (woodName) {
			loot.multiply(3.5);
		}

		const sporeRate = woodName ? 10 : 33;
		let spores = 0;
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(sporeRate)) {
				spores++;
			}
		}
		if (spores > 0) {
			loot.add('Brimstone spore', spores);
		}

		let bonusXP = 0;

		if (
			user.hasEquippedOrInBank(
				Object.keys(Woodcutting.lumberjackItems).map(i => Number.parseInt(i)),
				'every'
			)
		) {
			const amountToAdd = Math.floor(woodcuttingXP * (2.5 / 100));
			woodcuttingXP += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			for (const [itemID, bonus] of Object.entries(Woodcutting.lumberjackItems)) {
				if (user.hasEquippedOrInBank(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(woodcuttingXP * (Number(bonus) / 100));
					woodcuttingXP += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const hasWcMasterCape =
			user.hasEquippedOrInBank('Woodcutting master cape') ||
			user.hasEquippedOrInBank('Woodcutting master cape (inverted)');

		let lootMultiplier = 1;
		if (hasWcMasterCape) lootMultiplier *= 2;

		if (lootMultiplier > 1) {
			loot.multiply(lootMultiplier);
		}

		const xpRes = await user.addXP({
			skillName: 'woodcutting',
			amount: Math.ceil(woodcuttingXP),
			duration,
			source: 'AncientMycology'
		});

		let str = `${user}, ${user.minionName} finished harvesting Ancient Myconid growths${woodName ? ` (${targetWood.name})` : ''}! ${xpRes}`;

		if (hasWcMasterCape) {
			str += '\n**2x loot for Woodcutting master cape.**';
		}

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			const droprate = clAdjustedDroprate(user, 'Peky', Math.floor(4000 / minutes), 1.5);
			if (rng.roll(droprate)) {
				loot.add('Peky');
				str +=
					'\n<:peky:787028037031559168> A small pigeon has taken a liking to you, and hides itself in your bank.';
			}
		}

		const { petDropRate } = skillingPetDropRate(user, 'woodcutting', targetWood.petChance);
		if (rng.roll(Math.ceil(petDropRate / quantity))) {
			loot.add('Beaver');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Beaver while harvesting Ancient Myconid growths at level ${currentWcLevel} Woodcutting!`
			);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x ${woodName ? targetWood.name : 'Ancient Mycology'}`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot });
	}
};
