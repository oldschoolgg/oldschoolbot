import { Bank } from 'oldschooljs';

import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { ManiacalMonkeyTable } from './../../lib/simulation/maniacalMonkey';

const maniacalMonkeyID = 6803;

export const maniacalMonkeyTask: MinionTask = {
	type: 'ManiacalMonkey',
	async run(data: ManiacalMonkeyActivityTaskOptions) {
		const { userID, channelID, quantity, method, duration } = data;
		const user = await mUserFetch(userID);

		const userBank = user.bank;

		let loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(ManiacalMonkeyTable.roll());
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${
			user.minionName
		} finished killing ${quantity} Maniacal monkey. Your Maniacal monkey KC is now ${
			user.getKC(maniacalMonkeyID) + quantity
		}.`;

		await user.incrementKC(maniacalMonkeyID, quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Maniacal Monkey`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
