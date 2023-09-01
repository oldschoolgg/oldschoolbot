import { percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { raimentBonus } from '../../lib/skilling/functions/calcsRunecrafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { OuraniaAltarOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

interface Runes {
	[key: string]: number;
}

interface RuneEntry {
	type: string;
	probability: number;
}

interface Runes {
	airRune: number;
	mindRune: number;
	waterRune: number;
	earthRune: number;
	fireRune: number;
	bodyRune: number;
	cosmicRune: number;
	chaosRune: number;
	astralRune: number;
	natureRune: number;
	lawRune: number;
	deathRune: number;
	bloodRune: number;
	soulRune: number;
}

const runes: Runes = {
	airRune: 0,
	mindRune: 0,
	waterRune: 0,
	earthRune: 0,
	fireRune: 0,
	bodyRune: 0,
	cosmicRune: 0,
	chaosRune: 0,
	astralRune: 0,
	natureRune: 0,
	lawRune: 0,
	deathRune: 0,
	bloodRune: 0,
	soulRune: 0
};

export const OuraniaAltarTask: MinionTask = {
	type: 'OuraniaAltar',
	async run(data: OuraniaAltarOptions) {
		const { quantity, userID, channelID, duration, stamina, daeyalt } = data;
		const user = await mUserFetch(userID);
		const lvl = user.skillLevel(SkillsEnum.Runecraft);

		let loot = new Bank();

		const firstLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 50 },
			{ type: 'mindRune', probability: 25 },
			{ type: 'waterRune', probability: 12 },
			{ type: 'earthRune', probability: 6 },
			{ type: 'fireRune', probability: 3 },
			{ type: 'bodyRune', probability: 1.5 },
			{ type: 'cosmicRune', probability: 0.85 },
			{ type: 'chaosRune', probability: 0.6 },
			{ type: 'astralRune', probability: 0.45 },
			{ type: 'natureRune', probability: 0.3 },
			{ type: 'lawRune', probability: 0.15 },
			{ type: 'deathRune', probability: 0.08 },
			{ type: 'bloodRune', probability: 0.05 },
			{ type: 'soulRune', probability: 0.02 }
		];

		const secondLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 15 },
			{ type: 'mindRune', probability: 18 },
			{ type: 'waterRune', probability: 21 },
			{ type: 'earthRune', probability: 24 },
			{ type: 'fireRune', probability: 12 },
			{ type: 'bodyRune', probability: 6 },
			{ type: 'cosmicRune', probability: 1.75 },
			{ type: 'chaosRune', probability: 0.8 },
			{ type: 'astralRune', probability: 0.6 },
			{ type: 'natureRune', probability: 0.4 },
			{ type: 'lawRune', probability: 0.24 },
			{ type: 'deathRune', probability: 0.12 },
			{ type: 'bloodRune', probability: 0.06 },
			{ type: 'soulRune', probability: 0.03 }
		];

		const thirdLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 12 },
			{ type: 'mindRune', probability: 13 },
			{ type: 'waterRune', probability: 13.5 },
			{ type: 'earthRune', probability: 14 },
			{ type: 'fireRune', probability: 15 },
			{ type: 'bodyRune', probability: 16 },
			{ type: 'cosmicRune', probability: 8 },
			{ type: 'chaosRune', probability: 4.2 },
			{ type: 'astralRune', probability: 2.1 },
			{ type: 'natureRune', probability: 1.1 },
			{ type: 'lawRune', probability: 0.55 },
			{ type: 'deathRune', probability: 0.32 },
			{ type: 'bloodRune', probability: 0.15 },
			{ type: 'soulRune', probability: 0.08 }
		];

		const forthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 7 },
			{ type: 'mindRune', probability: 8 },
			{ type: 'waterRune', probability: 9 },
			{ type: 'earthRune', probability: 11 },
			{ type: 'fireRune', probability: 12 },
			{ type: 'bodyRune', probability: 13 },
			{ type: 'cosmicRune', probability: 20 },
			{ type: 'chaosRune', probability: 10 },
			{ type: 'astralRune', probability: 5 },
			{ type: 'natureRune', probability: 2.5 },
			{ type: 'lawRune', probability: 1.3 },
			{ type: 'deathRune', probability: 0.6 },
			{ type: 'bloodRune', probability: 0.4 },
			{ type: 'soulRune', probability: 0.2 }
		];

		const fifthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 6 },
			{ type: 'mindRune', probability: 6.5 },
			{ type: 'waterRune', probability: 7 },
			{ type: 'earthRune', probability: 7.5 },
			{ type: 'fireRune', probability: 8 },
			{ type: 'bodyRune', probability: 10 },
			{ type: 'cosmicRune', probability: 15 },
			{ type: 'chaosRune', probability: 20 },
			{ type: 'astralRune', probability: 10 },
			{ type: 'natureRune', probability: 5 },
			{ type: 'lawRune', probability: 2.6 },
			{ type: 'deathRune', probability: 1.2 },
			{ type: 'bloodRune', probability: 0.8 },
			{ type: 'soulRune', probability: 0.4 }
		];

		const sixthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 5 },
			{ type: 'mindRune', probability: 5.5 },
			{ type: 'waterRune', probability: 6 },
			{ type: 'earthRune', probability: 6.5 },
			{ type: 'fireRune', probability: 7 },
			{ type: 'bodyRune', probability: 7.5 },
			{ type: 'cosmicRune', probability: 10 },
			{ type: 'chaosRune', probability: 11 },
			{ type: 'astralRune', probability: 15 },
			{ type: 'natureRune', probability: 13.5 },
			{ type: 'lawRune', probability: 7 },
			{ type: 'deathRune', probability: 3.5 },
			{ type: 'bloodRune', probability: 1.7 },
			{ type: 'soulRune', probability: 0.8 }
		];

		const seventhLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 4.5 },
			{ type: 'mindRune', probability: 5 },
			{ type: 'waterRune', probability: 5.5 },
			{ type: 'earthRune', probability: 6 },
			{ type: 'fireRune', probability: 7 },
			{ type: 'bodyRune', probability: 7.5 },
			{ type: 'cosmicRune', probability: 9.5 },
			{ type: 'chaosRune', probability: 10.5 },
			{ type: 'astralRune', probability: 14 },
			{ type: 'natureRune', probability: 15.5 },
			{ type: 'lawRune', probability: 8 },
			{ type: 'deathRune', probability: 4 },
			{ type: 'bloodRune', probability: 2 },
			{ type: 'soulRune', probability: 1 }
		];

		const eighthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 3 },
			{ type: 'mindRune', probability: 3 },
			{ type: 'waterRune', probability: 3 },
			{ type: 'earthRune', probability: 4 },
			{ type: 'fireRune', probability: 4 },
			{ type: 'bodyRune', probability: 5 },
			{ type: 'cosmicRune', probability: 7 },
			{ type: 'chaosRune', probability: 9 },
			{ type: 'astralRune', probability: 12 },
			{ type: 'natureRune', probability: 15 },
			{ type: 'lawRune', probability: 18 },
			{ type: 'deathRune', probability: 10 },
			{ type: 'bloodRune', probability: 5 },
			{ type: 'soulRune', probability: 2 }
		];

		const ninthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 2 },
			{ type: 'mindRune', probability: 2 },
			{ type: 'waterRune', probability: 3 },
			{ type: 'earthRune', probability: 4 },
			{ type: 'fireRune', probability: 5 },
			{ type: 'bodyRune', probability: 6 },
			{ type: 'cosmicRune', probability: 7 },
			{ type: 'chaosRune', probability: 8 },
			{ type: 'astralRune', probability: 10.5 },
			{ type: 'natureRune', probability: 13.5 },
			{ type: 'lawRune', probability: 14.5 },
			{ type: 'deathRune', probability: 14.5 },
			{ type: 'bloodRune', probability: 6 },
			{ type: 'soulRune', probability: 4 }
		];

		const tenthLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 1 },
			{ type: 'mindRune', probability: 1 },
			{ type: 'waterRune', probability: 2 },
			{ type: 'earthRune', probability: 3 },
			{ type: 'fireRune', probability: 4 },
			{ type: 'bodyRune', probability: 5 },
			{ type: 'cosmicRune', probability: 6 },
			{ type: 'chaosRune', probability: 7 },
			{ type: 'astralRune', probability: 10 },
			{ type: 'natureRune', probability: 13.5 },
			{ type: 'lawRune', probability: 14.5 },
			{ type: 'deathRune', probability: 16.5 },
			{ type: 'bloodRune', probability: 10 },
			{ type: 'soulRune', probability: 6.5 }
		];

		const eleventhLoot: RuneEntry[] = [
			{ type: 'airRune', probability: 1 },
			{ type: 'mindRune', probability: 1 },
			{ type: 'waterRune', probability: 2 },
			{ type: 'earthRune', probability: 3 },
			{ type: 'fireRune', probability: 3 },
			{ type: 'bodyRune', probability: 4 },
			{ type: 'cosmicRune', probability: 5 },
			{ type: 'chaosRune', probability: 6 },
			{ type: 'astralRune', probability: 9.5 },
			{ type: 'natureRune', probability: 13.5 },
			{ type: 'lawRune', probability: 14.5 },
			{ type: 'deathRune', probability: 15.5 },
			{ type: 'bloodRune', probability: 13 },
			{ type: 'soulRune', probability: 9 }
		];

		function generateLootFromTable(lootTable: RuneEntry[], runes: Runes, quantity: number) {
			for (let i = 0; i < quantity; i++) {
				for (const runeType of lootTable) {
					if (percentChance(runeType.probability)) {
						runes[runeType.type] += 1;
						break; // Break the loop after finding the first matching rune
					}
				}
			}
		}

		let selectedLootTable: RuneEntry[];
		if (lvl < 10) {
			selectedLootTable = firstLoot;
		} else if (lvl < 20) {
			selectedLootTable = secondLoot;
		} else if (lvl < 30) {
			selectedLootTable = thirdLoot;
		} else if (lvl < 40) {
			selectedLootTable = forthLoot;
		} else if (lvl < 50) {
			selectedLootTable = fifthLoot;
		} else if (lvl < 60) {
			selectedLootTable = sixthLoot;
		} else if (lvl < 70) {
			selectedLootTable = seventhLoot;
		} else if (lvl < 80) {
			selectedLootTable = eighthLoot;
		} else if (lvl < 90) {
			selectedLootTable = ninthLoot;
		} else if (lvl < 99) {
			selectedLootTable = tenthLoot;
		} else {
			selectedLootTable = eleventhLoot;
		}

		generateLootFromTable(selectedLootTable, runes, quantity);

		let xpReceived = 0;
		let runeQuantity = quantity;
		let bonusQuantity = 0;

		const raimentQuantity = raimentBonus(user, quantity);
		runeQuantity += raimentQuantity;
		bonusQuantity += raimentQuantity;

		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, 1_487_213);
		for (let i = 0; i < quantity; i++) {
			if (roll(petDropRate)) {
				loot.add('Rift guardian');
			}
		}

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: xpReceived,
			duration
		})}`;

		let str = `${user}, ${user.minionName} finished runecrafting at the Ourania altar, you received ${loot}. ${xpRes}`;

		if (bonusQuantity > 0) {
			str += ` **Bonus Quantity:** ${bonusQuantity.toLocaleString()}`;
		}

		if (loot.amount('Rift guardian') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while runecrafting at the Ourania Altar at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting!`
			);
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
