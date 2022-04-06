import { userMention } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Task } from 'klasa';

import { NEX_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/settings/prisma';
import { handleNexKills } from '../../lib/simulation/nex';
import { NexTaskOptions } from '../../lib/types/minions';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import { sendToChannelID } from '../../lib/util/webhook';

export default class extends Task {
	async run(data: NexTaskOptions) {
		const { quantity, channelID, users, wipedKill, duration, userDetails } = data;
		const allMention = userDetails.map(t => userMention(t[0])).join(' ');

		const loot = handleNexKills({
			quantity,
			team: userDetails.map(u => ({
				id: u[0],
				contribution: u[1],
				deaths: u[2]
			}))
		});

		for (const [uID, uLoot] of loot.entries()) {
			const user = await this.client.users.fetch(uID);
			await user.addItemsToBank({ items: uLoot, collectionLog: true });
			await user.incrementMonsterScore(NEX_ID, quantity - userDetails.find(i => i[0] === uID)![2].length);
		}

		await trackLoot({
			loot: loot.totalLoot(),
			id: 'nex',
			type: 'Monster',
			changeType: 'loot',
			duration: duration * users.length,
			kc: quantity
		});

		const embed = new MessageEmbed().setThumbnail(
			'https://cdn.discordapp.com/attachments/342983479501389826/951730848426786846/Nex.webp'
		).setDescription(`
${loot.formatLoot()}`);

		sendToChannelID(this.client, channelID, {
			embed,
			content: `${allMention} Your team finished killing ${quantity}x Nex.${
				wipedKill ? ` Your team wiped on the ${formatOrdinal(wipedKill)} kill.` : ''
			}`
		});
	}
}
