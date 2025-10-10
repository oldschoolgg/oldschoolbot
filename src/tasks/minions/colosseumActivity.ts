import { randArrItem } from '@oldschoolgg/rng';
import { Bank, type ItemBank, resolveItems } from 'oldschooljs';

import { ColosseumWaveBank, colosseumWaves } from '@/lib/colosseum.js';
import { refundChargeBank } from '@/lib/degradeableItems.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import type { ColoTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const sunfireItems = resolveItems(['Sunfire fanatic helm', 'Sunfire fanatic cuirass', 'Sunfire fanatic chausses']);

export const colosseumTask: MinionTask = {
	type: 'Colosseum',
	async run(data: ColoTaskOptions, { user, handleTripFinish }) {
		const {
			channelID,
			loot: possibleLoot,
			diedAt,
			maxGlory,
			scytheCharges,
			venatorBowCharges,
			bloodFuryCharges
		} = data;

		const newKCs = new ColosseumWaveBank();
		for (let i = 0; i < (diedAt ? diedAt - 1 : 12); i++) {
			newKCs.add(i + 1);
		}
		const stats = await user.fetchStats();
		for (const [key, value] of Object.entries(stats.colo_kc_bank as ItemBank))
			newKCs.add(Number.parseInt(key), value);
		await user.statsUpdate({ colo_kc_bank: newKCs._bank });
		const newKCsStr = `${newKCs
			.entries()
			.map(([kc, amount]) => `Wave ${kc}: ${amount} KC`)
			.join(', ')}`;

		let scytheRefund = 0;
		let venatorBowRefund = 0;
		let bloodFuryRefund = 0;

		const newWaveKcStr = !diedAt || diedAt > 1 ? `New wave KCs: ${newKCsStr}.` : 'No new KCs.';
		if (diedAt) {
			const wave = colosseumWaves.find(i => i.waveNumber === diedAt)!;

			let str = `${user}, you died on wave ${diedAt} to ${randArrItem([
				...(wave?.reinforcements ?? []),
				...wave.enemies
			])}, and received no loot. ${newWaveKcStr}`;

			// Calculate refund for unused charges
			const completionPercentage = (diedAt - 1) / 12;
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
					.join('\n');

				str += `\n${refundMessages}`;
			}

			return handleTripFinish(user, channelID, str, undefined, data, null);
		}

		await user.incrementMinigameScore('colosseum');

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

		await ClientSettings.updateBankSetting('colo_loot', loot);
		await user.statsBankUpdate('colo_loot', loot);
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

		let str = `${user}, you completed the Colosseum! You received: ${loot}. ${newWaveKcStr}`;

		if (!stats.colo_max_glory || maxGlory > stats.colo_max_glory) {
			user.statsUpdate({ colo_max_glory: maxGlory });
			str += ` Your new max glory is ${maxGlory}!`;
		}

		const image = await makeBankImage({ bank: loot, title: 'Colosseum Loot', user, previousCL });

		return handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
