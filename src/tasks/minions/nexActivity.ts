import { Embed, userMention } from '@discordjs/builders';
import { ButtonBuilder } from 'discord.js';

import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import { handleNexKills } from '../../lib/simulation/nex';
import { NexTaskOptions } from '../../lib/types/minions';
import { makeComponents } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import { makeRepeatTripButton } from '../../lib/util/globalInteractions';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../lib/util/webhook';

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

		const embed = new Embed().setThumbnail(
			'https://cdn.discordapp.com/attachments/342983479501389826/951730848426786846/Nex.webp'
		).setDescription(`
${loot.formatLoot()}`);

		const components: ButtonBuilder[] = [];
		components.push(makeRepeatTripButton());

		sendToChannelID(channelID, {
			embed,
			content: `${allMention} Your team finished killing ${quantity}x Nex.${
				wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''
			}`,
			components: components.length > 0 ? makeComponents(components) : undefined
		});
	}
};
