import { Bank } from 'oldschooljs';

export async function getReclaimableItemsOfUser(user: MUser) {
	const totalElligible = new Bank();

	const reclaimableItems = await prisma.reclaimableItem.findMany({ where: { user_id: user.id } });

	for (const item of reclaimableItems) {
		totalElligible.add(item.item_id, item.quantity);
	}

	const totalCanClaim = totalElligible.clone().remove(user.allItemsOwned);

	return {
		totalElligible,
		totalCanClaim,
		raw: reclaimableItems
	};
}
