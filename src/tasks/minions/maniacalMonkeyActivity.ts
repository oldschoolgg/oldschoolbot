import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';

export const maniacalMonkeyTask: MinionTask = {
	type: 'ManiacalMonkey',
	async run(data: ManiacalMonkeyActivityTaskOptions) {
		const { userID, channelID, quantity, method, duration } = data;
		const user = await mUserFetch(userID);

		const xpStr = await user.addXP({ skillName: SkillsEnum.Fishing, amount: fXPtoGive, duration });

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `${rewardTokens} reward pool rolls`,
			user,
			previousCL
		});

		let output = `${user}, ${
			user.minionName
		} finished fighting Tempoross ${quantity}x times. ${xpStr.toLocaleString()}`;

		handleTripFinish(user, channelID, output, image.file.attachment, data, itemsAdded);
	}
};
