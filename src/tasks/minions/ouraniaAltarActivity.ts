import { percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import Runecraft, { ouraniaAltarTables } from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { OuraniaAltarOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

const ouraniaAltarTask: MinionTask = {
	type: 'OuraniaAltar',
	async run(data: OuraniaAltarOptions) {
		const { quantity, userID, channelID, duration, daeyalt } = data;
		const user = await mUserFetch(userID);
		const lvl = user.skillLevel(SkillsEnum.Runecraft);
		const loot = new Bank();
		const [hasArdyMedium] = await userhasDiaryTier(user, ArdougneDiary.medium);
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, 1_487_213);
		const selectedLootTable = ouraniaAltarTables[Math.min(Math.floor(lvl / 10), 10)];
		let totalXp = 0;

		for (let i = 0; i < quantity; i++) {
			const essenceLoot = selectedLootTable.roll();
			const rune = Runecraft.Runes.find(r => essenceLoot.has(r.id));
			let runeXp = rune?.xp || 0;
			if (!rune) {
				// Soul Rune
				runeXp = 29.7;
				if (hasArdyMedium && percentChance(10)) essenceLoot.multiply(2);
			} else if (hasArdyMedium && rune.ardyDiaryChance && percentChance(rune.ardyDiaryChance)) {
				essenceLoot.multiply(2);
			}
			totalXp += runeXp * 1.7;
			if (roll(petDropRate)) {
				loot.add('Rift guardian');
			}
			loot.add(essenceLoot);
		}

		if (daeyalt) totalXp *= 1.5;

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXp,
			duration,
			source: 'OuraniaAltar'
		})}`;

		let str = `${user}, ${user.minionName} finished runecrafting at the Ourania altar, you received ${loot}. ${xpRes}`;

		if (hasArdyMedium) str += '\nThe Medium Ardougne Diary is giving you a chance of crafting extra runes.';

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
