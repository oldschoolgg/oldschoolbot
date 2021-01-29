import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

function renderVal(num: number) {
	return num !== -1 ? num.toLocaleString() : 0;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows the BH & LMS scores of an account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+pvp d3adscene'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const { minigames: pvp } = await Hiscores.fetch(username);
			const { bountyHunter, bountyHunterRogue, LMS } = pvp;

			const embed = new MessageEmbed()
				.setAuthor(username)
				.setColor(52224)
				.setThumbnail('https://i.imgur.com/8hPO17o.png')
				.addField(
					'<:BH_Hunter:365046748022046723> Bounty Hunter - Hunter',
					`**Rank:** ${renderVal(bountyHunter.rank)}\n**Score:** ${renderVal(
						bountyHunter.score
					)}`,
					true
				)
				.addField(
					'<:BH_Rogue:365046748495740928> Bounty Hunter - Rogue',
					`**Rank:** ${renderVal(bountyHunterRogue.rank)}\n**Score:** ${renderVal(
						bountyHunterRogue.score
					)}`,
					true
				)
				.addField(
					'<:LMS:365046749993107456> Last Man Standing',
					`**Rank:** ${renderVal(LMS.rank)}\n**Score:** ${renderVal(LMS.score)}`,
					true
				);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
