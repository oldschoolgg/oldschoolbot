import { formatDuration, getNextUTCReset, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { BERT_SAND_BUCKETS, BERT_SAND_ID, bertResetStart, isManualEligible } from '@/lib/minions/data/bertSand.js';
import type { CollectingOptions } from '@/lib/types/minions.js';
import { collectables } from '@/mahoji/lib/collectables.js';

export const collectingTask: MinionTask = {
	type: 'Collecting',
	async run(data: CollectingOptions, { user, handleTripFinish }) {
		const { collectableID, quantity, channelID, duration, lootQuantityOverride, metadata } = data;
		const isBertSandTrip = metadata?.activityID === BERT_SAND_ID;

		if (isBertSandTrip) {
			const sendResult = (message: string, loot: Bank | null = null) =>
				handleTripFinish(user, channelID, `${user}, ${message}`, undefined, data, loot);

			const requirementError = isManualEligible(user);
			if (requirementError) {
				sendResult(requirementError);
				return;
			}

			const now = Date.now();
			const updated = await prisma.userStats.updateMany({
				where: {
					user_id: BigInt(user.id),
					last_bert_sand_timestamp: { lt: BigInt(bertResetStart(now)) }
				},
				data: { last_bert_sand_timestamp: BigInt(now) }
			});

			if (updated.count === 0) {
				const nextReset = getNextUTCReset(now, Time.Day);
				sendResult(
					`Bert already delivered today. You can collect again in ${formatDuration(nextReset - now)}.`
				);
				return;
			}

			const loot = new Bank({ 'Bucket of sand': BERT_SAND_BUCKETS });
			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});
			await ClientSettings.updateBankSetting('collecting_loot', loot);

			sendResult(`Bert hands you ${BERT_SAND_BUCKETS.toLocaleString()} Buckets of sand.`, loot);
			return;
		}

		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const hasMoryHard = user.hasDiary('morytania.hard');
		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard;
		if (moryHardBoost) {
			colQuantity *= 2;
		}
		let totalQuantity = quantity * colQuantity;
		if (typeof lootQuantityOverride === 'number') {
			totalQuantity = lootQuantityOverride;
		}
		const loot = new Bank().add(collectable.item.id, totalQuantity);

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${user.minionName} finished collecting ${totalQuantity}x ${
			collectable.item.name
		}. (${Math.round((totalQuantity / (duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
		if (moryHardBoost) {
			str += '\n\n**Boosts:** 2x for Morytania Hard diary';
		}

		await ClientSettings.updateBankSetting('collecting_loot', loot);

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
