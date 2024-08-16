import { Time, randInt, reduceNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import {
	implings,
	puroImpHighTierTable,
	puroImpNormalTable,
	puroImpSpellTable,
	puroImplings
} from '../../../lib/implings';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import type { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { userHasGracefulEquipped, userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

function hunt(minutes: number, user: MUser, min: number, max: number) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) totalQty += randInt(min, max);
	if (!userHasGracefulEquipped(user)) totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	return totalQty;
}

const bryophytasStaffId = itemID("Bryophyta's staff");

export const puroPuroTask: MinionTask = {
	type: 'PuroPuro',
	async run(data: PuroPuroActivityTaskOptions) {
		const { channelID, userID, quantity, darkLure, implingTier } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'puro_puro', quantity);
		const minutes = Math.floor(data.duration / Time.Minute);
		const bank = new Bank();
		const missed = new Bank();
		const itemCost = new Bank();
		let hunterXP = 0;
		const hunterLevel = user.skillLevel(SkillsEnum.Hunter);
		const allImpQty = hunt(minutes, user, 1, 3);
		const highTierImpQty = hunt(minutes, user, 0.75, 1) * (darkLure ? 1.2 : 1);
		const singleImpQty = hunt(minutes, user, 5, 6);
		switch (implingTier) {
			case 2:
				for (let j = 0; j < highTierImpQty; j++) {
					const loot = puroImpHighTierTable.roll();
					if (loot.length === 0) continue;
					const implingReceived = implings[loot.items()[0][0].id]!;
					if (hunterLevel < implingReceived.level) missed.add(loot);
					else {
						bank.add(loot);
						const implingReceivedXP = puroImplings[loot.items()[0][0].id]!;
						hunterXP += Number(implingReceivedXP.catchXP);
					}
				}
				break;
			case 3:
				bank.add('Eclectic impling jar', singleImpQty);
				hunterXP += 30 * singleImpQty;
				break;
			case 4:
				bank.add('Essence impling jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case 5:
				bank.add('Earth impling jar', singleImpQty);
				hunterXP += 25 * singleImpQty;
				break;
			case 6:
				bank.add('Gourmet impling jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case 7:
				bank.add('Young impling jar', singleImpQty);
				hunterXP += 20 * singleImpQty;
				break;
			case 8:
				bank.add('Baby impling jar', singleImpQty);
				hunterXP += 18 * singleImpQty;
				break;
			default:
				for (let j = 0; j < allImpQty; j++) {
					const loot = darkLure ? puroImpSpellTable.roll() : puroImpNormalTable.roll();
					if (loot.length === 0) continue;
					const implingReceived = implings[loot.items()[0][0].id]!;
					if (hunterLevel < implingReceived.level) missed.add(loot);
					else {
						bank.add(loot);
						const implingReceivedXP = puroImplings[loot.items()[0][0].id]!;
						hunterXP += Number(implingReceivedXP.catchXP);
					}
				}

				break;
		}

		let str = `<@${userID}>, ${user.minionName} finished hunting in Puro-Puro. `;

		const xpStr = await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: hunterXP,
			duration: data.duration,
			source: 'PuroPuro'
		});

		if (hunterXP > 0) {
			str += `\n${xpStr}.`;
		}

		if (darkLure) {
			const spellsUsed = bank.items().reduce((prev, curr) => {
				let previousVal = prev;
				const huntLevel = implings[curr[0].id].level;
				if (huntLevel >= 58) previousVal += curr[1];
				return previousVal;
			}, 0);

			let savedRunes = 0;
			if (user.hasEquipped(bryophytasStaffId)) {
				for (let i = 0; i < spellsUsed; i++) {
					if (roll(15)) savedRunes++;
				}
			}

			itemCost.add('Nature Rune', spellsUsed - savedRunes);
			itemCost.add('Death Rune', spellsUsed);

			const saved = savedRunes > 0 ? `\nYour Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
			let magicXP = 0;
			magicXP += spellsUsed * 60;

			const magicXpStr = await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: magicXP,
				duration: data.duration,
				source: 'PuroPuro'
			});

			if (magicXP > 0) str += `\n${magicXpStr}.`;
			if (implingTier === 2) {
				str += `\n**Boosts:** Due to using Dark Lure, you are catching 20% more implings. You used: ${itemCost}. ${saved}`;
			} else {
				str += `\n**Boosts:** Due to using Dark Lure, you have an increased chance at getting Nature Implings and above. You used: ${itemCost}. ${saved}`;
			}
		}

		str += `\nYou received: **${bank
			.items()
			.sort((curr, next) => {
				const currHunterLevel = implings[curr[0].id].level;
				const nextHunterLevel = implings[next[0].id].level;
				return nextHunterLevel - currHunterLevel;
			})
			.map(item => {
				return `${item[1]}x ${item[0].name}`;
			})
			.join(', ')}**.`;

		if (missed.length > 0) str += `\nYou missed out on ${missed} due to your hunter level being too low.`;

		await transactItems({
			userID: user.id,
			itemsToAdd: bank,
			collectionLog: true,
			itemsToRemove: itemCost
		});

		userStatsBankUpdate(user, 'puropuro_implings_bank', bank);

		handleTripFinish(user, channelID, str, undefined, data, bank);
	}
};
