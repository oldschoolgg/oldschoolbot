import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { ColosseumWaveBank, colosseumWaves } from '../../lib/colosseum';
import { refundChargeBank } from '../../lib/degradeableItems';
import { trackLoot } from '../../lib/lootTrack';
import { incrementMinigameScore } from '../../lib/settings/minigames';
import { ChargeBank } from '../../lib/structures/Bank';
import type { ColoTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';
import { Emoji } from '../../lib/constants';

const sunfireItems = resolveItems(['Sunfire fanatic helm', 'Sunfire fanatic cuirass', 'Sunfire fanatic chausses']);

export const colosseumTask: MinionTask = {
	type: 'Colosseum',
	async run(data: ColoTaskOptions) {
		const {
			channelID,
			userID,
			loot: possibleLoot,
			quantity,
			diedAt,
			maxGlory,
			scytheCharges,
			venatorBowCharges,
			bloodFuryCharges
		} = data;
		const user = await mUserFetch(userID);

		const deathCount = diedAt?.filter(value => value !== null).length || 0;
		const successfulKills = quantity - deathCount;

		// Increment wave KCs
		for (let i = 0; i < quantity; i++) {
			const newKCs = new ColosseumWaveBank();
			const waves = diedAt?.[i] ? diedAt?.[i]! - 1 : 12;
			for (let j = 0; j < waves; j++) {
				newKCs.add(j + 1);
			}
			const kcBank = await user.fetchStats({ colo_kc_bank: true });
			for (const [key, value] of Object.entries(kcBank.colo_kc_bank as ItemBank))
				newKCs.add(Number.parseInt(key), value);
			await userStatsUpdate(user.id, { colo_kc_bank: newKCs._bank });
		}

		const stats = await user.fetchStats({ colo_kc_bank: true, colo_max_glory: true });
		const coloWaveKCs = stats.colo_kc_bank;
		const newKCsStr = coloWaveKCs 
			? Object.entries(coloWaveKCs)
				.map(([kc, amount]) => `Wave ${kc}: ${amount} KC`)
				.join(', ')
			: 'No KCs recorded';
		const newWaveKcStr = `**Colosseum Wave KCs:** ${newKCsStr}`;
		
		// Generate death message & calculate refund
		const finalDeathStr: string[] = [];
		const deathStr: string[] = [];
		finalDeathStr.push(`${Emoji.Skull.repeat(deathCount)}**Deaths: **\n`)
		for (let i = 0; i < quantity; i++) {
			if (diedAt?.[i] !== null) {
				const waveNumber = diedAt?.[i]
				const wave = colosseumWaves.find(i => i.waveNumber === waveNumber)!;
				if (quantity > 1) {
				deathStr.push(`attempt #${i + 1} wave #${diedAt?.[i]} to ${randArrItem([
				...(wave?.reinforcements ?? []),
				...wave.enemies
			])}. `);
		} else {
			deathStr.push(`You died on wave ${waveNumber} to ${randArrItem([
				...(wave?.reinforcements ?? []),
				...wave.enemies
			])}. `);
		}

				let scytheRefund = 0;
				let venatorBowRefund = 0;
				let bloodFuryRefund = 0;

				// Calculate refund for unused charges
				const completionPercentage = (diedAt?.[i]! - 1) / 12;
				if (scytheCharges > 0) scytheRefund = Math.ceil(scytheCharges * (1 - completionPercentage));
				if (venatorBowCharges > 0) venatorBowRefund = Math.ceil(venatorBowCharges * (1 - completionPercentage));
				if (bloodFuryCharges > 0) bloodFuryRefund = Math.ceil(bloodFuryCharges * (1 - completionPercentage));

				const chargeBank = new ChargeBank();
				if (scytheRefund > 0) chargeBank.add('scythe_of_vitur_charges', scytheRefund);
				if (venatorBowRefund > 0) chargeBank.add('venator_bow_charges', venatorBowRefund);
				if (bloodFuryRefund > 0) chargeBank.add('blood_fury_charges', bloodFuryRefund);

				if (chargeBank.length() > 0) {
					const refundResults = await refundChargeBank(user, chargeBank);

				const refundMessages = refundResults
						.map(result => `${result.userMessage} Total charges: ${result.totalCharges}.`)
						.join('');
						deathStr.push(`${refundMessages}`);
				}
				deathStr.push('\n');
			}
		}

		await incrementMinigameScore(user.id, 'colosseum', successfulKills);

		const loot = new Bank().add(possibleLoot);

		const missingItems = sunfireItems.filter(id => !user.cl.has(id));
		const itemsTheyHave = sunfireItems.filter(id => user.cl.has(id));
		if (missingItems.length > 0) {
			for (const item of sunfireItems) {
				if (loot.has(item) && itemsTheyHave.includes(item)) {
					loot.remove(item);
					loot.add(randArrItem(missingItems));
				}
			}
		}

		const { previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });

		await updateBankSetting('colo_loot', loot);
		await userStatsBankUpdate(user, 'colo_loot', loot);
		await trackLoot({
			totalLoot: loot,
			id: 'colo',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: 1,
			users: [
				{
					id: user.id,
					loot,
					duration: data.duration
				}
			]
		});

		let gloryStr = null;
		if (!stats.colo_max_glory || maxGlory > stats.colo_max_glory) {
			await userStatsUpdate(user.id, { colo_max_glory: maxGlory });
			gloryStr = `**Your new max glory is:** ${maxGlory}!`;
		}
		
		finalDeathStr.push(deathStr.join(''))
		const str = `${user} your minion has returned from the Colosseum! ` +
		`${user.minionName} killed Sol Heredit ${successfulKills} ${successfulKills === 1 ? 'time' : 'times'}. ` +
		`${gloryStr !== null ? gloryStr : ''}` +
		`${deathCount > 0 ? `\n${finalDeathStr.join('')}` : ''}` +
		`\n${newWaveKcStr}`;
	
		const image = await makeBankImage({ bank: loot, title: 'Colosseum Loot', user, previousCL });

		return handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
