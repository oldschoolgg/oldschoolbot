import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches, toTitleCase } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Workers } from '../../lib/workers';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Simulate killing OSRS monsters and shows the loot.',
			usage: '<quantity:int{1}> <BossName:...str>',
			usageDelim: ' ',
			requiredPermissionsForBot: ['ATTACH_FILES'],
			examples: ['+kill 100 vorkath', 'kill 100k bandos'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	determineKillLimit(user: KlasaUser) {
		if (this.client.owners.has(user)) {
			return Infinity;
		}

		const perkTier = getUsersPerkTier(user);

		if (perkTier >= PerkTier.Six) {
			return 1_000_000;
		}

		if (perkTier >= PerkTier.Five) {
			return 600_000;
		}

		if (perkTier >= PerkTier.Four) {
			return 400_000;
		}

		if (perkTier === PerkTier.Three) {
			return 250_000;
		}

		if (perkTier === PerkTier.Two) {
			return 100_000;
		}

		if (perkTier === PerkTier.One) {
			return 50_000;
		}

		return 10_000;
	}

	async run(msg: KlasaMessage, [quantity, bossName]: [number, string]) {
		const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));
		const killableInCatacombs =
			msg.flagArgs.catacombs !== undefined &&
			killableMonsters.find(m => m.id === osjsMonster?.id)?.existsInCatacombs;
		const result = await Workers.kill({
			quantity,
			bossName,
			limit: this.determineKillLimit(msg.author),
			catacombs: killableInCatacombs !== undefined && killableInCatacombs,
			onTask: msg.flagArgs.ontask === undefined ? false : true
		});

		if (result.error) {
			return msg.channel.send(result.error);
		}

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				new Bank(result.bank?.bank),
				result.title ?? `Loot from ${quantity.toLocaleString()} ${toTitleCase(osjsMonster?.name ?? bossName)}`,
				true,
				msg.flagArgs,
				msg.author
			);

		return msg.channel.send({ files: [new MessageAttachment(image!, 'osbot.png')], content: result.content });
	}
}
