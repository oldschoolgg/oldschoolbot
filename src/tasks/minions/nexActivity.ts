import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { userMention } from 'discord.js';

import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import type { NexContext } from '../../lib/simulation/nex';
import { handleNexKills } from '../../lib/simulation/nex';
import type { NexTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

export const nexTask: MinionTask = {
	type: 'Nex',
	async run(data: NexTaskOptions) {
		const { quantity, channelID, users, wipedKill, duration, userDetails } = data;
		const realUsers = userDetails.filter(u => !u[3]);
		const allMention = realUsers.map(t => userMention(t[0])).join(' ');
		const allMUsers = await Promise.all(users.map(id => mUserFetch(id)));

		const survivedQuantity = wipedKill ? wipedKill - 1 : quantity;
		const teamResult: NexContext['team'] = userDetails.map(u => ({
			id: u[0],
			teamID: u[1],
			deaths: u[2],
			fake: u[3]
		}));

		const loot = handleNexKills({
			quantity: survivedQuantity,
			team: teamResult
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

		const solo = users.length === 1;

		return handleTripFinish(
			allMUsers[0],
			channelID,
			{
				content:
					survivedQuantity === 0
						? `${allMention} your minion${solo ? '' : 's'} died in all kill attempts.`
						: `${allMention} Your team finished killing ${quantity}x Nex.${solo ? ` You died ${teamResult[0].deaths.length} time${teamResult[0].deaths.length === 1 ? '' : 's'}.` : ''}${
								wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''
							}
				
${loot.formatLoot()}`
			},
			users.length === 1 && loot.totalLoot().length > 0
				? (
						await makeBankImage({
							bank: loot.totalLoot(),
							title: `Loot From ${survivedQuantity}x Nex`,
							user: allMUsers[0],
							previousCL: undefined,
							spoiler: loot.purpleItems.some(i => loot.totalLoot().has(i))
						})
					).file
				: undefined,
			data,
			loot.totalLoot()
		);
	}
};
