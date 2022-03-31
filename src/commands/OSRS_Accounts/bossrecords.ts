import { MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { constants, Hiscores } from 'oldschooljs';

import pets from '../../lib/data/pets';
import { BotCommand } from '../../lib/structures/BotCommand';
import { makePaginatedMessage, toTitleCase } from '../../lib/util';

// Emojis for bosses with no pets
const miscEmojis = {
	barrowsChests: '<:Dharoks_helm:403038864199122947>',
	hespori: '<:Bottomless_compost_bucket:545978484078411777>',
	bryophyta: '<:Bryophytas_essence:455835859799769108>',
	crazyArchaeologist: '<:Fedora:456179157303427092>',
	derangedArchaeologist: '<:Fedora:456179157303427092>',
	mimic: '<:Casket:365003978678730772>',
	obor: '<:Hill_giant_club:421045456194240523>'
};

type MiscEmojisKeys = keyof typeof miscEmojis;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['br'],
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			categoryFlags: ['utility'],
			description: 'Shows the boss records (boss hiscores) for an OSRS account.',
			examples: ['+br mylife212', '+bossrecords Woox']
		});
	}

	getEmojiForBoss(key: MiscEmojisKeys | string) {
		if (key in miscEmojis) {
			return miscEmojis[key as MiscEmojisKeys];
		}

		const pet = pets.find(_pet => _pet.bossKeys && _pet.bossKeys.includes(key));
		if (pet) return pet.emoji;
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		const { bossRecords } = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		const sortedEntries = Object.entries(bossRecords)
			.filter(([, { rank, score }]) => rank !== -1 && score !== -1)
			.sort(([, a], [, b]) => a.rank - b.rank);

		if (sortedEntries.length === 0) {
			return msg.channel.send('You have no boss records!. Try logging into the game, and logging out.');
		}

		const pages = [];
		for (const page of chunk(sortedEntries, 12)) {
			const embed = new MessageEmbed().setAuthor(`${toTitleCase(username)} - Boss Records`).setColor(52_224);

			for (const [name, { rank, score }] of page) {
				embed.addField(
					`${this.getEmojiForBoss(name) || ''} ${constants.bossNameMap.get(name)}`,
					`**KC:** ${score.toLocaleString()}\n**Rank:** ${rank.toLocaleString()}`,
					true
				);
			}

			pages.push({ embeds: [embed] });
		}

		await makePaginatedMessage(msg, pages);
		return null;
	}
}
