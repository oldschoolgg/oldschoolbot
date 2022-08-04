import { randInt, reduceNumByPercent, roll, Time } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { implings, puroImplings, puroImpNormalTable, puroImpSpellTable } from '../../../lib/implings';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { minionName } from '../../../lib/util/minionUtils';

function singleImpHunt(minutes: number, user: KlasaUser) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) {
		let qty = randInt(5, 6);
		totalQty += qty;
	}
	if (!user.hasGracefulEquipped()) {
		totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	}
	return totalQty;
}

function allImpHunt(minutes: number, user: KlasaUser) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) {
		let qty = randInt(1, 3);
		totalQty += qty;
	}
	if (!user.hasGracefulEquipped()) {
		totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	}
	return totalQty;
}

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run(data: PuroPuroActivityTaskOptions) {
		const { channelID, userID, quantity, impling, darkLure } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'puro_puro', quantity);

		const minutes = Math.floor(data.duration / Time.Minute);

		const bank = new Bank();
		const missed = new Bank();
		const itemCost = new Bank();
		let hunterXP = 0;

		const hunterLevel = user.skillLevel(SkillsEnum.Hunter);

		const allImpQty = allImpHunt(minutes, user);
		const singleImpQty = singleImpHunt(minutes, user);
		switch (impling) {
			case 'Dragon Implings': {
				const dragonOdds = darkLure ? 25 : 45;
				const luckyOdds = darkLure ? 200 : 360;
				for (let i = 0; i < minutes; i++) {
					if (roll(dragonOdds)) {
						bank.add('Dragon Impling Jar');
						hunterXP += 65;
					}
				}
				if (hunterLevel >= 89) {
					for (let i = 0; i < minutes; i++) {
						if (roll(luckyOdds)) {
							bank.add('Lucky Impling Jar');
							hunterXP += 80;
						}
					}
				}
				break;
			}
			case 'Eclectic Implings':
				bank.add('Eclectic Impling Jar', singleImpQty);
				hunterXP += 30 * singleImpQty;
				break;
			case 'Essence Implings':
				bank.add('Essence Impling Jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case 'Earth Implings':
				bank.add('Earth Impling Jar', singleImpQty);
				hunterXP += 25 * singleImpQty;
				break;
			case 'Gourmet Implings':
				bank.add('Gourmet Impling Jar', singleImpQty);
				hunterXP += 22 * singleImpQty;
				break;
			case 'Young Implings':
				bank.add('Young Impling Jar', singleImpQty);
				hunterXP += 20 * singleImpQty;
				break;
			case 'Baby Implings':
				bank.add('Baby Impling Jar', singleImpQty);
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

		let str = `<@${userID}>, ${minionName(user)} finished hunting in Puro-Puro. `;

		const xpStr = await user.addXP({ skillName: SkillsEnum.Hunter, amount: hunterXP });

		const hunterXpHr = `${Math.round(
			(hunterXP / (data.duration / Time.Minute)) * 60
		).toLocaleString()} Hunter XP/Hr`;

		if (hunterXP > 0) {
			str += `\n${xpStr}. You are getting ${hunterXpHr}.`;
		} else {
			str += `\n${minionName(user)} failed to spot any ${impling} this trip.`;
			handleTripFinish(
				user,
				channelID,
				str,
				['activities', { puro_puro: { impling, dark_lure: darkLure } }, true],
				undefined,
				data,
				bank
			);
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
			if (user.hasItemEquippedAnywhere(bryophytasStaffId)) {
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

			if (impling === 'Dragon Implings') {
				str += `\n**Boosts:** You have an increased chance of getting ${impling} due to using Dark Lure. You used: ${itemCost}. ${saved}`;
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

		await user.addItemsToBank({ items: bank, collectionLog: true });
		await user.removeItemsFromBank(itemCost);

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { puro_puro: { impling, dark_lure: darkLure } }, true],
			undefined,
			data,
			bank
		);
	}
}
