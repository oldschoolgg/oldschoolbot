import { Bank } from 'oldschooljs/dist/meta/types';
import { refundChargeBank } from '../../lib/degradeableItems';
import { ChargeBank } from '../../lib/structures/Bank';
import type { RefundOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const RefundTask: MinionTask = {
	type: 'Refund',
	async run(data: RefundOptions) {
		const user = await mUserFetch(data.userID);
		let str = `${user}, ${user.minionName}'s trip has been cancelled, and they're now available. `;

		const items = new Bank(data.refundItems);
		const charges = new ChargeBank(data.refundCharges);

		if (data.refundItems && items.length > 0) {
			await user.addItemsToBank({ items: data.refundItems });
			str += `They have returned with the following supplies: ${items.toString()}. `;
		}

		if (data.refundCharges && charges.length() > 0) {
			const results = await refundChargeBank(user, charges);
			str += results.map(r => r.userMessage).join(' ');
		}

		return handleTripFinish(user, data.channelID, str, undefined, data, null);
	}
};
