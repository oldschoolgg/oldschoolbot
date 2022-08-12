import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches, toTitleCase } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';

export function determineKillLimit(user: KlasaUser) {
	if (globalClient.owners.has(user)) {
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

	async run(msg: KlasaMessage, [quantity, bossName]: [number, string]) {
		const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));
		const killableInCatacombs =
			msg.flagArgs.catacombs !== undefined &&
			killableMonsters.find(m => m.id === osjsMonster?.id)?.existsInCatacombs;
		const result = await Workers.kill({
			quantity,
			bossName,
			limit: determineKillLimit(msg.author),
			catacombs: killableInCatacombs !== undefined && killableInCatacombs,
			onTask: msg.flagArgs.ontask === undefined ? false : true
		});

		if (result.error) {
			return msg.channel.send(result.error);
		}

		const image = await makeBankImage({
			bank: new Bank(result.bank?.bank),
			title:
				result.title ?? `Loot from ${quantity.toLocaleString()} ${toTitleCase(osjsMonster?.name ?? bossName)}`,
			flags: msg.flagArgs,
			user: msg.author
		});

		if (!result.content) result.content = '';
		result.content +=
			'\nThis command will be removed soon, as we migrate to slash commands, start using `/kill` now! Also try out the killing simulator on the website: <https://www.oldschool.gg/monsters>';
		return msg.channel.send({
			files: [new MessageAttachment(image.file.buffer, 'osbot.png')],
			content: result.content
		});
	}
}
