const { Command } = require('klasa');
const { Hiscores, constants } = require('oldschooljs');

const { toTitleCase, cleanString } = require('../../../config/util');

const aliasNameMap = {
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

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			usage: '<boss:string> (username:rsn)',
			usageDelim: ',',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [bossName, username]) {
		const { bossRecords } = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		const alias = aliasNameMap[bossName.toLowerCase()];

		if (alias) bossName = alias;

		for (const [boss, { rank, score }] of Object.entries(bossRecords)) {
			if (cleanString(boss) === cleanString(bossName)) {
				if (score === -1 || rank === -1) {
					return msg.send(`${toTitleCase(username)}'s has no recorded KC for that boss.`);
				}
				return msg.send(
					`${toTitleCase(username)}'s ${constants.bossNameMap.get(
						boss
					)} KC is **${score.toLocaleString()}** (Rank ${rank.toLocaleString()})`
				);
			}
		}

		return msg.send(`${toTitleCase(username)} doesn't have any records kills for that boss.`);
	}
};
