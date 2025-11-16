import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { raimentBonus } from '@/lib/skilling/functions/calcsRunecrafting.js';
import Runecraft, { ouraniaAltarTables } from '@/lib/skilling/skills/runecraft.js';
import type { OuraniaAltarOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';

const ouraniaAltarTask: MinionTask = {
	type: 'OuraniaAltar',
	async run(data: OuraniaAltarOptions, { user, handleTripFinish, rng }) {
		const { quantity, channelId, duration, daeyalt } = data;

		const lvl = user.skillsAsLevels.runecraft;
		const loot = new Bank();
		const hasArdyMedium = user.hasDiary('ardougne.medium');
		const { petDropRate } = skillingPetDropRate(user, 'runecraft', 1_487_213);
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
			if (rng.roll(petDropRate)) {
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
					if (!rRune && rng.percentChance(10)) dBonus++;
					else if (rRune?.ardyDiaryChance && rng.percentChance(rRune.ardyDiaryChance)) dBonus++;
				}
				diaryQuantity += dBonus;
			}
			raimentQuantity += rBonus;
			loot.add(rune, dBonus + rBonus);
		}

		const xpRes = `\n${await user.addXP({
			skillName: 'runecraft',
			amount: totalXp,
			duration,
			source: 'OuraniaAltar'
		})}`;

		const str = `${user}, ${user.minionName} finished runecrafting at the Ourania altar, you received ${loot}.${
			diaryQuantity > 0 ? `\n${diaryQuantity} bonus runes for completing the medium Ardougne diary.` : ''
		}${
			raimentQuantity > 0 ? `\n${raimentQuantity} bonus runes from the Raiments of the eye outfit.` : ''
		} ${xpRes}`;

		if (loot.has('Rift guardian')) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while runecrafting at the Ourania Altar at level ${user.skillLevel(
					'runecraft'
				)} Runecrafting!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		await ClientSettings.updateBankSetting('ourania_loot', loot);
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

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};

export default ouraniaAltarTask;
