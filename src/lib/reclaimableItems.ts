import { Bank } from 'oldschooljs';

export async function getReclaimableItemsOfUser(user: MUser) {
	const totalEligible = new Bank();

	const reclaimableItems = await prisma.reclaimableItem.findMany({ where: { user_id: user.id } });

	for (const item of reclaimableItems) {
		totalEligible.add(item.item_id, item.quantity);
	}

	const totalCanClaim = totalEligible.clone().remove(user.allItemsOwned);

	return {
		totalEligible,
		totalCanClaim,
		raw: reclaimableItems
	};
}
