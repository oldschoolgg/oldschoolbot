import { CommandStore, KlasaMessage } from 'klasa';
import { constants, Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanString, toTitleCase } from '../../lib/util';

const aliasNameMap: Record<string, string> = {
	corp: 'corporealBeast',
	mole: 'giantMole',
	kbd: 'kingBlackDragon',
	bandos: 'generalGraardor',
	sire: 'abyssalSire',
	arma: 'kreeArra',
	kree: 'kreeArra',
	zammy: 'krilTsutsaroth',
	kril: 'krilTsutsaroth',
	jad: 'tzTokJad',
	zuk: 'tzKalZuk',
	inferno: 'tzKalZuk',
	thermy: 'thermonuclearSmokeDevil',
	tob: 'theatreofBlood',
	gauntlet: 'theGauntlet',
	barrows: 'barrowsChests',
	hydra: 'alchemicalHydra'
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			usage: '<boss:string> (username:rsn)',
			usageDelim: ',',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+osrskc giant mole, Magnaboy', '+osrskc giant mole'],
			categoryFlags: ['utility'],
			description: 'Shows the KC for a boss for an OSRS account.'
		});
	}

	async run(msg: KlasaMessage, [bossName, username]: [string, string]) {
		try {
			const { bossRecords } = await Hiscores.fetch(username);

			const alias = aliasNameMap[bossName.toLowerCase()];

			if (alias) bossName = alias;

			for (const [boss, { rank, score }] of Object.entries(bossRecords)) {
				if (cleanString(boss) === cleanString(bossName)) {
					if (score === -1 || rank === -1) {
						return msg.channel.send(`${toTitleCase(username)}'s has no recorded KC for that boss.`);
					}
					return msg.channel.send(
						`${toTitleCase(username)}'s ${constants.bossNameMap.get(
							boss
						)} KC is **${score.toLocaleString()}** (Rank ${rank.toLocaleString()})`
					);
				}
			}

			return msg.channel.send(`${toTitleCase(username)} doesn't have any recorded kills for that boss.`);
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
