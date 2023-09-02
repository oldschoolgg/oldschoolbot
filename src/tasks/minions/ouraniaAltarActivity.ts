import { percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
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
		{ type: 'Air rune', probability: 50 },
		{ type: 'Mind rune', probability: 25 },
		{ type: 'Water rune', probability: 12 },
		{ type: 'Earth rune', probability: 6 },
		{ type: 'Fire rune', probability: 3 },
		{ type: 'Body rune', probability: 1.5 },
		{ type: 'Cosmic rune', probability: 0.85 },
		{ type: 'Chaos rune', probability: 0.6 },
		{ type: 'Astral rune', probability: 0.45 },
		{ type: 'Nature rune', probability: 0.3 },
		{ type: 'Law rune', probability: 0.15 },
		{ type: 'Death rune', probability: 0.08 },
		{ type: 'Blood rune', probability: 0.05 },
		{ type: 'Soul rune', probability: 0.02 }
	],

	[
		{ type: 'Air rune', probability: 15 },
		{ type: 'Mind rune', probability: 18 },
		{ type: 'Water rune', probability: 21 },
		{ type: 'Earth rune', probability: 24 },
		{ type: 'Fire rune', probability: 12 },
		{ type: 'Body rune', probability: 6 },
		{ type: 'Cosmic rune', probability: 1.75 },
		{ type: 'Chaos rune', probability: 0.8 },
		{ type: 'Astral rune', probability: 0.6 },
		{ type: 'Nature rune', probability: 0.4 },
		{ type: 'Law rune', probability: 0.24 },
		{ type: 'Death rune', probability: 0.12 },
		{ type: 'Blood rune', probability: 0.06 },
		{ type: 'Soul rune', probability: 0.03 }
	],

	[
		{ type: 'Air rune', probability: 12 },
		{ type: 'Mind rune', probability: 13 },
		{ type: 'Water rune', probability: 13.5 },
		{ type: 'Earth rune', probability: 14 },
		{ type: 'Fire rune', probability: 15 },
		{ type: 'Body rune', probability: 16 },
		{ type: 'Cosmic rune', probability: 8 },
		{ type: 'Chaos rune', probability: 4.2 },
		{ type: 'Astral rune', probability: 2.1 },
		{ type: 'Nature rune', probability: 1.1 },
		{ type: 'Law rune', probability: 0.55 },
		{ type: 'Death rune', probability: 0.32 },
		{ type: 'Blood rune', probability: 0.15 },
		{ type: 'Soul rune', probability: 0.08 }
	],

	[
		{ type: 'Air rune', probability: 7 },
		{ type: 'Mind rune', probability: 8 },
		{ type: 'Water rune', probability: 9 },
		{ type: 'Earth rune', probability: 11 },
		{ type: 'Fire rune', probability: 12 },
		{ type: 'Body rune', probability: 13 },
		{ type: 'Cosmic rune', probability: 20 },
		{ type: 'Chaos rune', probability: 10 },
		{ type: 'Astral rune', probability: 5 },
		{ type: 'Nature rune', probability: 2.5 },
		{ type: 'Law rune', probability: 1.3 },
		{ type: 'Death rune', probability: 0.6 },
		{ type: 'Blood rune', probability: 0.4 },
		{ type: 'Soul rune', probability: 0.2 }
	],

	[
		{ type: 'Air rune', probability: 6 },
		{ type: 'Mind rune', probability: 6.5 },
		{ type: 'Water rune', probability: 7 },
		{ type: 'Earth rune', probability: 7.5 },
		{ type: 'Fire rune', probability: 8 },
		{ type: 'Body rune', probability: 10 },
		{ type: 'Cosmic rune', probability: 15 },
		{ type: 'Chaos rune', probability: 20 },
		{ type: 'Astral rune', probability: 10 },
		{ type: 'Nature rune', probability: 5 },
		{ type: 'Law rune', probability: 2.6 },
		{ type: 'Death rune', probability: 1.2 },
		{ type: 'Blood rune', probability: 0.8 },
		{ type: 'Soul rune', probability: 0.4 }
	],
	[
		{ type: 'Air rune', probability: 5 },
		{ type: 'Mind rune', probability: 5.5 },
		{ type: 'Water rune', probability: 6 },
		{ type: 'Earth rune', probability: 6.5 },
		{ type: 'Fire rune', probability: 7 },
		{ type: 'Body rune', probability: 7.5 },
		{ type: 'Cosmic rune', probability: 10 },
		{ type: 'Chaos rune', probability: 11 },
		{ type: 'Astral rune', probability: 15 },
		{ type: 'Nature rune', probability: 13.5 },
		{ type: 'Law rune', probability: 7 },
		{ type: 'Death rune', probability: 3.5 },
		{ type: 'Blood rune', probability: 1.7 },
		{ type: 'Soul rune', probability: 0.8 }
	],
	[
		{ type: 'Air rune', probability: 4.5 },
		{ type: 'Mind rune', probability: 5 },
		{ type: 'Water rune', probability: 5.5 },
		{ type: 'Earth rune', probability: 6 },
		{ type: 'Fire rune', probability: 7 },
		{ type: 'Body rune', probability: 7.5 },
		{ type: 'Cosmic rune', probability: 9.5 },
		{ type: 'Chaos rune', probability: 10.5 },
		{ type: 'Astral rune', probability: 14 },
		{ type: 'Nature rune', probability: 15.5 },
		{ type: 'Law rune', probability: 8 },
		{ type: 'Death rune', probability: 4 },
		{ type: 'Blood rune', probability: 2 },
		{ type: 'Soul rune', probability: 1 }
	],
	[
		{ type: 'Air rune', probability: 3 },
		{ type: 'Mind rune', probability: 3 },
		{ type: 'Water rune', probability: 3 },
		{ type: 'Earth rune', probability: 4 },
		{ type: 'Fire rune', probability: 4 },
		{ type: 'Body rune', probability: 5 },
		{ type: 'Cosmic rune', probability: 7 },
		{ type: 'Chaos rune', probability: 9 },
		{ type: 'Astral rune', probability: 12 },
		{ type: 'Nature rune', probability: 15 },
		{ type: 'Law rune', probability: 18 },
		{ type: 'Death rune', probability: 10 },
		{ type: 'Blood rune', probability: 5 },
		{ type: 'Soul rune', probability: 2 }
	],
	[
		{ type: 'Air rune', probability: 2 },
		{ type: 'Mind rune', probability: 2 },
		{ type: 'Water rune', probability: 3 },
		{ type: 'Earth rune', probability: 4 },
		{ type: 'Fire rune', probability: 5 },
		{ type: 'Body rune', probability: 6 },
		{ type: 'Cosmic rune', probability: 7 },
		{ type: 'Chaos rune', probability: 8 },
		{ type: 'Astral rune', probability: 10.5 },
		{ type: 'Nature rune', probability: 13.5 },
		{ type: 'Law rune', probability: 14.5 },
		{ type: 'Death rune', probability: 14.5 },
		{ type: 'Blood rune', probability: 6 },
		{ type: 'Soul rune', probability: 4 }
	],
	[
		{ type: 'Air rune', probability: 1 },
		{ type: 'Mind rune', probability: 1 },
		{ type: 'Water rune', probability: 2 },
		{ type: 'Earth rune', probability: 3 },
		{ type: 'Fire rune', probability: 4 },
		{ type: 'Body rune', probability: 5 },
		{ type: 'Cosmic rune', probability: 6 },
		{ type: 'Chaos rune', probability: 7 },
		{ type: 'Astral rune', probability: 10 },
		{ type: 'Nature rune', probability: 13.5 },
		{ type: 'Law rune', probability: 14.5 },
		{ type: 'Death rune', probability: 16.5 },
		{ type: 'Blood rune', probability: 10 },
		{ type: 'Soul rune', probability: 6.5 }
	],
	[
		{ type: 'Air rune', probability: 1 },
		{ type: 'Mind rune', probability: 1 },
		{ type: 'Water rune', probability: 2 },
		{ type: 'Earth rune', probability: 3 },
		{ type: 'Fire rune', probability: 3 },
		{ type: 'Body rune', probability: 4 },
		{ type: 'Cosmic rune', probability: 5 },
		{ type: 'Chaos rune', probability: 6 },
		{ type: 'Astral rune', probability: 9.5 },
		{ type: 'Nature rune', probability: 13.5 },
		{ type: 'Law rune', probability: 14.5 },
		{ type: 'Death rune', probability: 15.5 },
		{ type: 'Blood rune', probability: 13 },
		{ type: 'Soul rune', probability: 9 }
	]
];

const ouraniaAltarTask: MinionTask = {
	type: 'OuraniaAltar',
	async run(data: OuraniaAltarOptions) {
		const { quantity, userID, channelID, duration, daeyalt } = data;
		const user = await mUserFetch(userID);
		const lvl = user.skillLevel(SkillsEnum.Runecraft);
		const loot = new Bank();
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, 1_487_213);
		const selectedLootTable = lootTable[Math.min(Math.floor(lvl / 10), 10)];
		let totalXp = 0;

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
							loot.add(runeType.type, 1); // Add the obtained rune to the loot Bank
							break;
						}
					}
				}
				if (roll(petDropRate)) {
					loot.add('Rift guardian');
				}
			}
		}
		generateLootFromTable(selectedLootTable, quantity);

		if (daeyalt) totalXp *= 1.5;

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXp,
			duration,
			source: 'OuraniaAltar'
		})}`;

		let str = `${user}, ${user.minionName} finished runecrafting at the Ourania altar, you received ${loot}. ${xpRes}`;

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

export default ouraniaAltarTask;
