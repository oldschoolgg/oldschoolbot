import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { userMention } from 'discord.js';

import { Bank, type ItemBank } from 'oldschooljs/dist/meta/types';
import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import announceLoot from '../../lib/minions/functions/announceLoot';
import type { NexContext } from '../../lib/simulation/nex';
import { handleNexKills, purpleNexItems } from '../../lib/simulation/nex';
import type { NexTaskOptions } from '../../lib/types/minions';
import { getKCByName } from '../../lib/util/getKCByName';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

export const nexTask: MinionTask = {
	type: 'Nex',
	async run(data: NexTaskOptions) {
		const { quantity, channelID, users, wipedKill, duration, teamDetails } = data;
		const realUsers = teamDetails.filter(u => !u[3]);
		const allMention = realUsers.map(t => userMention(t[0])).join(' ');
		const allMUsers = await Promise.all(users.map(id => mUserFetch(id)));
		const solo = users.length === 1;
		const previousCL = solo ? new Bank(allMUsers[0].user.collectionLogBank as ItemBank) : undefined;

		const survivedQuantity = wipedKill ? wipedKill - 1 : quantity;
		const teamResult: NexContext['team'] = teamDetails.map(u => ({
			id: u[0],
			teamID: u[1],
			contribution: u[2],
			deaths: u[3],
			fake: u[4]
		}));

		const loot = handleNexKills({
			quantity: survivedQuantity,
			team: teamResult
		});

		const kc = teamResult.map(u => ({ id: u.id, quantity: quantity - u.deaths.length }));

		for (const [uID, uLoot] of loot.entries()) {
			await transactItems({ userID: uID, collectionLog: true, itemsToAdd: uLoot });
			const user = allMUsers.find(i => i.id === uID)!;
			await user.incrementKC(NEX_ID, kc.find(u => u.id === uID)!.quantity);

			await announceLoot({
				user,
				monsterID: NEX_ID,
				loot: uLoot,
				notifyDrops: purpleNexItems,
				team: {
					leader: allMUsers[0],
					lootRecipient: user,
					size: users.length
				}
			});
		}

		await trackLoot({
			totalLoot: loot.totalLoot(),
			id: 'nex',
			type: 'Monster',
			changeType: 'loot',
			duration: duration * users.length,
			kc: quantity,
			users: teamResult
				.filter(i => !i.fake)
				.map(i => ({
					id: i.id,
					loot: loot.get(i.id),
					duration
				}))
		});

		await updateBankSetting('nex_loot', loot.totalLoot());

		return handleTripFinish(
			allMUsers[0],
			channelID,
			{
				content:
					survivedQuantity === 0
						? `${allMention} your minion${solo ? '' : 's'} died in all kill attempts.`
						: `${allMention} Your team finished killing ${quantity}x Nex.${solo ? ` You died ${teamResult[0].deaths.length} time${teamResult[0].deaths.length === 1 ? '' : 's'}, your KC is now ${(await getKCByName(await mUserFetch(teamResult[0].id), 'Nex'))[1]}.` : ''}${wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''}
${loot.formatLoot(kc)}`
			},
			users.length === 1 && loot.totalLoot().length > 0
				? (
						await makeBankImage({
							bank: loot.totalLoot(),
							title: `Loot From ${survivedQuantity}x Nex`,
							user: allMUsers[0],
							previousCL,
							spoiler: loot.purpleItems.some(i => loot.totalLoot().has(i))
						})
					).file
				: undefined,
			data,
			loot.totalLoot()
		);
	}
};
