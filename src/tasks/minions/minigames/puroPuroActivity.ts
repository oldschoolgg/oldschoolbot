import { randFloat, randInt, reduceNumByPercent, roll, Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import {
	implings,
	puroImpHighTierTable,
	puroImplings,
	puroImpNormalTable,
	puroImpSpellTable
} from '../../../lib/implings';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import puroOptions from '../../../mahoji/lib/abstracted_commands/puroPuroCommand';
import { userHasGracefulEquipped, userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

function singleImpHunt(minutes: number, user: MUser) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) {
		let qty = randInt(5, 6);
		totalQty += qty;
	}
	if (!userHasGracefulEquipped(user)) {
		totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	}
	return totalQty;
}

function allImpHunt(minutes: number, user: MUser) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) {
		let qty = randInt(1, 3);
		totalQty += qty;
	}
	if (!userHasGracefulEquipped(user)) {
		totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	}
	return totalQty;
}

function highTierImpHunt(minutes: number, user: MUser) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) {
		let qty = randFloat(0.75, 1);
		totalQty += qty;
	}
	totalQty = Math.floor(totalQty);
	if (!userHasGracefulEquipped(user)) {
		totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	}
	return totalQty;
}

const bryophytasStaffId = itemID("Bryophyta's staff");

export const puroPuroTask: MinionTask = {
	type: 'PuroPuro',
	async run(data: PuroPuroActivityTaskOptions) {
		const { channelID, userID, quantity, implingID, darkLure } = data;
		const user = await mUserFetch(userID);

		await incrementMinigameScore(userID, 'puro_puro', quantity);

		const minutes = Math.floor(data.duration / Time.Minute);

		const bank = new Bank();
		const missed = new Bank();
		const itemCost = new Bank();
		let hunterXP = 0;

		const hunterLevel = user.skillLevel(SkillsEnum.Hunter);

		const allImpQty = allImpHunt(minutes, user);
		let highTierImpQty = highTierImpHunt(minutes, user);
		const singleImpQty = singleImpHunt(minutes, user);
		switch (implingID) {
			case itemID('Eclectic impling jar'):
				bank.add('Eclectic impling jar', singleImpQty);
				hunterXP += 30 * singleImpQty;
				break;
			case itemID('Essence impling jar'):
				bank.add('Essence impling jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case itemID('Earth impling jar'):
				bank.add('Earth impling jar', singleImpQty);
				hunterXP += 25 * singleImpQty;
				break;
			case itemID('Gourmet impling jar'):
				bank.add('Gourmet impling jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case itemID('Young impling jar'):
				bank.add('Young impling jar', singleImpQty);
				hunterXP += 20 * singleImpQty;
				break;
			case itemID('Baby impling jar'):
				bank.add('Baby impling jar', singleImpQty);
				hunterXP += 18 * singleImpQty;
				break;
			case itemID('Nature impling jar'): {
				if (darkLure) highTierImpQty *= 1.2;
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
			}
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

		const xpStr = await user.addXP({ skillName: SkillsEnum.Hunter, amount: hunterXP });

		const hunterXpHr = `${Math.round(
			(hunterXP / (data.duration / Time.Minute)) * 60
		).toLocaleString()} Hunter XP/Hr`;

		const huntedImplingName = puroOptions.find(i => (i.item?.id ?? null) === implingID)!.name;

		if (hunterXP > 0) {
			str += `\n${xpStr}. You are getting ${hunterXpHr}.`;
		} else {
			str += `\n${user.minionName} failed to spot any ${huntedImplingName} this trip.`;
			handleTripFinish(user, channelID, str, undefined, data, bank);
			return;
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

			const magicXpStr = await user.addXP({ skillName: SkillsEnum.Magic, amount: magicXP });

			const magicXpHr = `${Math.round(
				(magicXP / (data.duration / Time.Minute)) * 60
			).toLocaleString()} Magic XP/Hr`;

			if (magicXP > 0) str += `\n${magicXpStr}. You are getting ${magicXpHr}.`;

			if (implingID === itemID('Nature impling jar')) {
				str += `\n**Boosts:** Due to using Dark Lure, you have are catching 20% more implings. You used: ${itemCost}. ${saved}`;
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

		userStatsBankUpdate(user.id, 'puropuro_implings_bank', bank);

		handleTripFinish(user, channelID, str, undefined, data, bank);
	}
};
