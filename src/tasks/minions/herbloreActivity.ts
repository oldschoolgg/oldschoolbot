import { percentChance, randInt } from '@oldschoolgg/rng';
import { Bank, EItem, type Item, Items } from 'oldschooljs';

import { checkDegradeableItemCharges, degradeItem } from '@/lib/degradeableItems.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';

interface ApplyChemistryArgs {
	user: MUser;
	mixableItem: { item: Item };
	quantity: number;
	zahur: boolean;
	wesley: boolean;
}

async function applyAmuletOfChemistry({
	user,
	mixableItem,
	quantity,
	zahur,
	wesley
}: ApplyChemistryArgs): Promise<null | {
	fourDoseItem: Item;
	fourDoseCount: number;
	messages: string[];
}> {
	if (zahur || wesley) return null;
	if (!mixableItem.item.name.includes('(3)')) return null;

	const chemistryItem = Items.getOrThrow('Amulet of chemistry');
	if (!user.gear.skilling.hasEquipped(chemistryItem.id, false, false)) return null;

	const potentialFourDoseName = mixableItem.item.name.replace(/\(3\)/g, '(4)');
	const fourDoseItem = Items.getItem(potentialFourDoseName);
	if (!fourDoseItem) return null;

	const chemistryCharges = await checkDegradeableItemCharges({ item: chemistryItem, user });
	let available = chemistryCharges;

	if (available <= 0) return null;
	let fourDoseCount = 0;

	for (let i = 0; i < quantity && available > 0; i++) {
		if (percentChance(5)) {
			fourDoseCount++;
			available--;
		}
	}

	const messages: string[] = [];

	if (fourDoseCount > 0) {
		const degradeResult = await degradeItem({
			item: chemistryItem,
			chargesToDegrade: fourDoseCount,
			user
		});

		messages.push(`${fourDoseCount}x ${fourDoseItem.name} were made thanks to your Amulet of chemistry.`);

		const used = degradeResult.chargesToDegrade ?? 0;
		const remaining = degradeResult.chargesRemaining;

		if (typeof used === 'number' && used > 0 && typeof remaining === 'number') {
			messages.push(
				`Your Amulet of chemistry glows and loses ${used === 1 ? 'a charge' : `${used} charges`} (${remaining} left).`
			);
		}

		if (typeof degradeResult.userMessage === 'string' && degradeResult.userMessage.includes('broke')) {
			messages.push(degradeResult.userMessage);
		}
	}

	return {
		fourDoseCount,
		fourDoseItem,
		messages
	};
}

export const herbloreTask: MinionTask = {
	type: 'Herblore',

	async run(data: HerbloreActivityTaskOptions, { user, handleTripFinish }) {
		const { mixableID, quantity, zahur, wesley, channelId, duration } = data;

		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const hasWildyDiary = user.hasDiary('wilderness.hard');
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to receive the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((percentChance(maxShardChance) ? 6 : randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		// Amulet of chemistry logic: only for hand-mixed (no Zahur/Wesley) 3-dose outputs
		const aocResult = await applyAmuletOfChemistry({ user, mixableItem, quantity, zahur, wesley });
		const fourDoseItem = aocResult?.fourDoseItem ?? null;
		const fourDoseCount = aocResult?.fourDoseCount ?? 0;
		const chemistryMessages = aocResult?.messages ?? [];

		const xpRes = await user.addXP({ skillName: 'herblore', amount: xpReceived, duration });
		const loot = new Bank();

		if (fourDoseCount > 0 && fourDoseItem) {
			const threeDoseCount = Math.max(outputQuantity - fourDoseCount, 0);
			if (threeDoseCount > 0) {
				loot.add(mixableItem.item.id, threeDoseCount);
			}
			loot.add(fourDoseItem.id, fourDoseCount);
		} else {
			loot.add(mixableItem.item.id, outputQuantity);
		}

		await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		let completionMessage: string;
		if (fourDoseCount > 0 && fourDoseItem) {
			const threeDoseCount = Math.max(outputQuantity - fourDoseCount, 0);
			completionMessage = `${user}, ${user.minionName} finished making ${threeDoseCount}x ${mixableItem.item.name} and ${fourDoseCount}x ${fourDoseItem.name}.`;
		} else {
			completionMessage = `${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}.`;
		}

		if (chemistryMessages.length > 0) {
			completionMessage = `${completionMessage} ${chemistryMessages.join(' ')}`;
		}

		completionMessage = `${completionMessage} ${xpRes}`;

		handleTripFinish(user, channelId, completionMessage, data, loot);
	}
};
