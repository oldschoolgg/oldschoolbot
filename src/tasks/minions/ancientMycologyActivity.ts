import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { Emoji, Events, Time } from '@oldschoolgg/toolkit';
import { LootTable } from 'oldschooljs';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { skillingPetDropRate } from '@/lib/util.js';

interface AncientWood {
	id: number;
	name: string;
	level: number;
	xp: number;
	petChance: number;
	clueScrollChance?: number;
}

const ancientMycologyWoods: AncientWood[] = [
	{ id: 75026, name: 'Verdant logs', level: 95, xp: 300, petChance: 100000, clueScrollChance: 500000 },
	{ id: 75028, name: 'Ancient cap', level: 100, xp: 350, petChance: 100000 },
	{ id: 75029, name: 'Colossal stem', level: 105, xp: 400, petChance: 100000 },
	{ id: 75027, name: 'Living bark', level: 110, xp: 600, petChance: 100000 },
	{ id: 75026, name: 'Ancient verdant logs', level: 950, xp: 180, petChance: 100000 }
];

const verdantLogs = ancientMycologyWoods.find((w: AncientWood) => w.name === 'Verdant logs')!;
const ancientCap = ancientMycologyWoods.find((w: AncientWood) => w.name === 'Ancient cap')!;
const colossalStem = ancientMycologyWoods.find((w: AncientWood) => w.name === 'Colossal stem')!;
const livingBark = ancientMycologyWoods.find((w: AncientWood) => w.name === 'Living bark')!;
const ancientVerdantLogs = ancientMycologyWoods.find((w: AncientWood) => w.name === 'Ancient verdant logs')!;

function generateAncientMycologyTable(currentWcLevel: number): LootTable {
	const mycologyTable = new LootTable().add(verdantLogs.id, 1, 5);

	if (currentWcLevel >= ancientCap.level) {
		mycologyTable.add(ancientCap.id, 1, 4);
	}
	if (currentWcLevel >= colossalStem.level) {
		mycologyTable.add(colossalStem.id, 1, 3);
	}
	if (currentWcLevel >= livingBark.level) {
		mycologyTable.add(livingBark.id, 1, 2);
	}
	if (currentWcLevel >= ancientVerdantLogs.level) {
		mycologyTable.add(ancientVerdantLogs.id, 1, 1);
	}

	return mycologyTable;
}

export const ancientMycologyTask: MinionTask = {
	type: 'AncientMycology',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration } = data;
		const currentWcLevel = user.skillsAsLevels.woodcutting;

		const mycologyTable = generateAncientMycologyTable(currentWcLevel);

		let woodcuttingXP = 0;
		const loot = mycologyTable.roll(quantity);

		for (const wood of ancientMycologyWoods) {
			woodcuttingXP += loot.amount(wood.id) * wood.xp;
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

		if (user.hasEquippedOrInBank('Woodcutting master cape')) {
			loot.multiply(2);
		}

		const xpRes = await user.addXP({
			skillName: 'woodcutting',
			amount: Math.ceil(woodcuttingXP),
			duration,
			source: 'AncientMycology'
		});

		let str = `${user}, ${user.minionName} finished harvesting Ancient Myconid growths! ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		const clueScrollChance = verdantLogs.clueScrollChance;
		if (clueScrollChance) {
			const strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
			addSkillingClueToLoot(user, 'woodcutting', quantity, clueScrollChance, loot, false, strungRabbitFoot);

			if (strungRabbitFoot) {
				str +=
					'\nYour Strung rabbit foot necklace increases the chance of receiving bird egg nests and ring nests.';
			}
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

		const { petDropRate } = skillingPetDropRate(user, 'woodcutting', verdantLogs.petChance);
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
			title: `Loot From ${quantity}x Ancient Myconid growths`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot });
	}
};
