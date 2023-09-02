import { percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { raimentBonus } from '../../lib/skilling/functions/calcsRunecrafting';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { OuraniaAltarOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

interface RuneEntry {
	type: string;
	probability: number;
}

interface Runes {
	[key: string]: number;
}

const lootTable: RuneEntry[][] = [
	[
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
	],

	[
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
	],

	[
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
	],

	[
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
	],

	[
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
	],
	[
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
	],
	[
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
	],
	[
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
	],
	[
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
	],
	[
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
	],
	[
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
	]
];

const OuraniaAltarTask: MinionTask = {
	type: 'OuraniaAltar',
	async run(data: OuraniaAltarOptions) {
		const { quantity, userID, channelID, duration, stamina, daeyalt } = data;
		const user = await mUserFetch(userID);
		const lvl = user.skillLevel(SkillsEnum.Runecraft);

		const loot = new Bank();
		let totalXp = 0;

		const selectedLootTable = lootTable[Math.min(Math.floor(lvl / 10), 10)];

		function generateLootFromTable(lootTable: RuneEntry[], quantity: number) {
			const updatedRunes: Runes = {};
			for (const runeType of lootTable) {
				updatedRunes[runeType.type] = 0;
			}

			for (let i = 0; i < quantity; i++) {
				for (const runeType of lootTable) {
					if (percentChance(runeType.probability)) {
						updatedRunes[runeType.type] += 1;
						const rune = Runecraft.Runes.find(rune => rune.name === runeType.type);
						if (rune) {
							totalXp += rune.xp * 1.7;
							break;
						}
					}
				}
			}
		}

		generateLootFromTable(selectedLootTable, quantity);

		console.log(`Total RuneCrafting XP from loot: ${totalXp}`);

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
			amount: totalXp,
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

export default OuraniaAltarTask;
