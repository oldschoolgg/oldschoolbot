import { Embed, userMention } from '@discordjs/builders';

import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/settings/prisma';
import { handleNexKills } from '../../lib/simulation/nex';
import { MinionTask } from '../../lib/Task';
import { NexTaskOptions } from '../../lib/types/minions';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import { sendToChannelID } from '../../lib/util/webhook';
import { mUserFetch } from '../../mahoji/mahojiSettings';

export const nexTask: MinionTask = {
	type: 'Nex',
	async run(data: NexTaskOptions) {
		const { quantity, channelID, users, wipedKill, duration, userDetails } = data;
		const allMention = userDetails.map(t => userMention(t[0])).join(' ');

		const survivedQuantity = wipedKill ? wipedKill - 1 : quantity;
		const loot = handleNexKills({
			quantity: survivedQuantity,
			team: userDetails.map(u => ({
				id: u[0],
				contribution: u[1],
				deaths: u[2]
			}))
		});

		for (const [uID, uLoot] of loot.entries()) {
			await transactItems({ userID: uID, collectionLog: true, itemsToAdd: uLoot });
			const user = await mUserFetch(uID);
			await user.incrementKC(NEX_ID, quantity - userDetails.find(i => i[0] === uID)![2].length);
		}

		await trackLoot({
			loot: loot.totalLoot(),
			id: 'nex',
			type: 'Monster',
			changeType: 'loot',
			duration: duration * users.length,
			kc: quantity
		});

		const embed = new Embed().setThumbnail(
			'https://cdn.discordapp.com/attachments/342983479501389826/951730848426786846/Nex.webp'
		).setDescription(`
${loot.formatLoot()}`);

		sendToChannelID(channelID, {
			embed,
			content: `${allMention} Your team finished killing ${quantity}x Nex.${
				wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''
			}`
		});
	}
};
