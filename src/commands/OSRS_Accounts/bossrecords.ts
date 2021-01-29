import { MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage, RichDisplay } from 'klasa';
import { constants, Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import pets from '../../lib/data/pets';
import { toTitleCase } from '../../lib/util';

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
			cooldown: 2,
			aliases: ['br'],
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
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
			return msg.send(
				'You have no boss records!. Try logging into the game, and logging out.'
			);
		}

		const loadingMsg = msg.send(new MessageEmbed().setDescription('Loading...'));

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of chunk(sortedEntries, 12)) {
			const embed = new MessageEmbed()
				.setAuthor(`${toTitleCase(username)} - Boss Records`)
				.setColor(52224);

			for (const [name, { rank, score }] of page) {
				embed.addField(
					`${this.getEmojiForBoss(name) || ''} ${constants.bossNameMap.get(name)}`,
					`**KC:** ${score.toLocaleString()}\n**Rank:** ${rank.toLocaleString()}`,
					true
				);
			}

			display.addPage(embed);
		}

		display.run(await loadingMsg, { jump: false, stop: false });
		return null;
	}
}
