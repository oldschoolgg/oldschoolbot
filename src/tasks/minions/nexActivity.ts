import { EmbedBuilder, userMention } from '@discordjs/builders';
import { formatOrdinal } from '@oldschoolgg/toolkit';

import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import { handleNexKills } from '../../lib/simulation/nex';
import { NexTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

export const nexTask: MinionTask = {
	type: 'Nex',
	async run(data: NexTaskOptions) {
		const { quantity, channelID, users, wipedKill, duration, userDetails } = data;
		const allMention = userDetails.map(t => userMention(t[0])).join(' ');
		const allMUsers = await Promise.all(users.map(id => mUserFetch(id)));

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
			const user = allMUsers.find(i => i.id === uID)!;
			await user.incrementKC(NEX_ID, quantity - userDetails.find(i => i[0] === uID)![2].length);
		}

		await trackLoot({
			totalLoot: loot.totalLoot(),
			id: 'nex',
			type: 'Monster',
			changeType: 'loot',
			duration: duration * users.length,
			kc: quantity,
			users: userDetails.map(i => ({
				id: i[0],
				loot: loot.get(i[0]),
				duration
			}))
		});
		await updateBankSetting('nex_loot', loot.totalLoot());

		const embed = new EmbedBuilder().setThumbnail(
			'https://cdn.discordapp.com/attachments/342983479501389826/951730848426786846/Nex.webp'
		).setDescription(`
${loot.formatLoot()}`);

		handleTripFinish(
			allMUsers[0],
			channelID,
			{
				content: `${allMention} Your team finished killing ${quantity}x Nex.${
					wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''
				}`,
				embeds: [embed]
			},
			undefined,
			data,
			loot.totalLoot()
		);
	}
};
