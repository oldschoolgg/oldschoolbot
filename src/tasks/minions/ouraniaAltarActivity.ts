import { percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { trackLoot } from '../../lib/lootTrack';
import { raimentBonus } from '../../lib/skilling/functions/calcsRunecrafting';
import Runecraft, { ouraniaAltarTables } from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import type { OuraniaAltarOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

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
			}
			totalXp += runeXp * 1.7;
			if (roll(petDropRate)) {
				loot.add('Rift guardian');
			}
			loot.add(essenceLoot);
		}

		if (daeyalt) totalXp *= 1.5;

		let diaryQuantity = 0;
		let raimentQuantity = 0;
		for (const [rune, qty] of loot.items()) {
			const rRune = Runecraft.Runes.find(r => r.id === rune.id);
			let dBonus = 0;
			const rBonus = raimentBonus(user, qty);
			if (hasArdyMedium) {
				for (let i = 0; i < qty; i++) {
					if (!rRune && percentChance(10)) dBonus++;
					else if (rRune?.ardyDiaryChance && percentChance(rRune.ardyDiaryChance)) dBonus++;
				}
				diaryQuantity += dBonus;
			}
			raimentQuantity += rBonus;
			loot.add(rune, dBonus + rBonus);
		}

		const xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXp,
			duration,
			source: 'OuraniaAltar'
		})}`;

		let str = `${user}, ${user.minionName} finished runecrafting at the Ourania altar, you received ${loot}.${
			diaryQuantity > 0 ? `\n${diaryQuantity} bonus runes for completing the medium Ardougne diary.` : ''
		}${
			raimentQuantity > 0 ? `\n${raimentQuantity} bonus runes from the Raiments of the eye outfit.` : ''
		} ${xpRes}`;

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

		updateBankSetting('ourania_loot', loot);
		await trackLoot({
			id: 'ourania_altar',
			type: 'Skilling',
			duration,
			kc: quantity,
			totalLoot: loot,
			changeType: 'loot',
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};

export default ouraniaAltarTask;
