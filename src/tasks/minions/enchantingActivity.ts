import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import type { EnchantingActivityTaskOptions } from '@/lib/types/minions.js';

export const enchantingTask: MinionTask = {
	type: 'Enchanting',
	async run(data: EnchantingActivityTaskOptions, { user, handleTripFinish }) {
		const { itemID, quantity, channelId, duration } = data;

		const enchantable = Enchantables.find(fletchable => fletchable.id === itemID)!;

		const xpReceived = quantity * enchantable.xp;
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xpReceived,
			duration
		});

		const loot = enchantable.output.clone().multiply(quantity);
		let str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, you received ${loot}. ${xpRes}`;

		if (loot.has('Dodgy necklace')) {
			const existingDodgyNecklaceCharges =
				user.user.dodgy_necklace_charges || (user.hasEquippedOrInBank('Dodgy necklace') ? 10 : 0);
			const dodgyNecklaceChargesAdded = loot.amount('Dodgy necklace') * 10;
			const itemsToAdd = user.hasEquippedOrInBank('Dodgy necklace')
				? loot.clone().remove('Dodgy necklace', loot.amount('Dodgy necklace'))
				: loot.clone().remove('Dodgy necklace', loot.amount('Dodgy necklace')).add('Dodgy necklace');

			await user.transactItems({
				collectionLog: true,
				itemsToAdd,
				otherUpdates: {
					dodgy_necklace_charges: existingDodgyNecklaceCharges + dodgyNecklaceChargesAdded
				}
			});

			str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, adding ${dodgyNecklaceChargesAdded.toLocaleString()} charges to your Dodgy necklace. It now has ${(
				existingDodgyNecklaceCharges + dodgyNecklaceChargesAdded
			).toLocaleString()} charges. ${xpRes}`;

			handleTripFinish({ user, channelId, message: str, data, loot: itemsToAdd });
			return;
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
