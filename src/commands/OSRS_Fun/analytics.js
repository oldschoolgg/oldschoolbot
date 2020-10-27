const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');
const { MessageEmbed } = require('discord.js');
const { convertXPtoLVL } = require('oldschooljs/dist/util');

const { default: emoji } = require('../../../data/skill-emoji');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['a'],
			description: 'Shows analytics of the stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		const { skills } = player;

		const minMaxSkill = Object.keys(skills)
			.map(skill => skills[skill])
			.sort((a, b) => a.xp - b.xp);

		const lowestSkillXp = this.getLowestSkillXp(skills, minMaxSkill);
		const [highestSkill, lowestSkill] = this.getSkillNames(skills, minMaxSkill);

		const [
			highestRankName,
			highestRankRank,
			highestRankLevel,
			lowestRankName,
			lowestRankRank,
			lowestRankLevel
		] = this.getHighestLowestRank(skills);

		const [averageVirtualLvl, averageLvl] = this.getAverageLvl(skills);

		const combatPref = this.getCombatPref(skills);
		const skillPref = this.getSkillPref(skills);

		const embed = new MessageEmbed()
			.setColor(7981338)
			.setAuthor(username)
			.addField(
				'\u200b',
				`${emoji.total} overall
**Rank:** ${skills.overall.rank.toLocaleString()}
**Level:** ${skills.overall.level}
**XP:** ${skills.overall.xp.toLocaleString()}
**Combat Level:** ${player.combatLevel}`,
				true
			)
			.addField(
				'\u200b',
				`**Highest Stat:** ${emoji[highestSkill]} ${
					minMaxSkill[minMaxSkill.length - 2].level
				} | ${minMaxSkill[minMaxSkill.length - 2].xp.toLocaleString()} XP
**Lowest Stat:** ${emoji[lowestSkill]} ${minMaxSkill[0].level} | ${lowestSkillXp}  XP
**Highest Ranked Stat:** ${emoji[highestRankName]} ${highestRankRank} | lvl ${highestRankLevel}
**Lowest Ranked Stat:** ${emoji[lowestRankName]} ${lowestRankRank} | lvl ${lowestRankLevel}
**Average Level:** ${averageLvl}
**Average Virtual Level:** ${averageVirtualLvl}
**Average Stat XP:** ${
					this.getAverageXP(skills)
						.toLocaleString()
						.split('.')[0]
				}`,
				true
			);

		embed.addField(
			'\u200b',
			`Your Combat Class is a **${combatPref}**.
Your Skilling Type is a **${skillPref}**.`,
			true
		);
		return msg.send({ embed });
	}

	getLowestSkillXp(skills, minMaxSkill) {
		let lowestSkillXp = minMaxSkill[0].xp.toLocaleString();
		if (lowestSkillXp === '-1') {
			lowestSkillXp = '0';
		}
		return lowestSkillXp;
	}

	getHighestLowestRank(skills) {
		const lowHighRank = Object.keys(skills)
			.map(skill => skills[skill])
			.sort((a, b) => a.rank - b.rank);
		// fixes unranked issues
		let unrankedCatch = 0;
		while (lowHighRank[0].rank.toLocaleString() === '-1' && unrankedCatch < 25) {
			lowHighRank.push(lowHighRank.shift());
			unrankedCatch++;
		}
		let highestRankName = 'Error';
		const highestRankRank = lowHighRank[0].rank.toLocaleString();
		const highestRankLevel = lowHighRank[0].level;
		let lowestRankName = 'Error';
		let lowestRankRank = lowHighRank[lowHighRank.length - 1].rank.toLocaleString();
		const lowestRankLevel = lowHighRank[lowHighRank.length - 1].level;
		if (lowestRankRank === '-1') {
			lowestRankRank = 'Unranked';
		}
		for (let i = 0; i < 24; i++) {
			const skillOrder = Object.keys(skills).map(skill => skills[skill]);
			if (skillOrder[i].rank === lowHighRank[0].rank) {
				highestRankName = SKILL_NAMES[i];
			}
			if (skillOrder[i].rank === lowHighRank[lowHighRank.length - 1].rank) {
				lowestRankName = SKILL_NAMES[i];
			}
			continue;
		}
		return [
			highestRankName,
			highestRankRank,
			highestRankLevel,
			lowestRankName,
			lowestRankRank,
			lowestRankLevel
		];
	}

	getSkillNames(skills, minMaxSkill) {
		let highestSkill = 'Error';
		let lowestSkill = 'Error';
		for (let i = 0; i < 24; i++) {
			const skillOrder = Object.keys(skills).map(skill => skills[skill]);
			if (skillOrder[i].xp === minMaxSkill[minMaxSkill.length - 2].xp) {
				highestSkill = SKILL_NAMES[i];
			}
			if (skillOrder[i].xp === minMaxSkill[0].xp) {
				lowestSkill = SKILL_NAMES[i];
			}
			continue;
		}
		return [highestSkill, lowestSkill];
	}

	getAverageLvl(skills) {
		const averageVirtualLvl = convertXPtoLVL(this.getAverageXP(skills), 126);
		const averageLvl = convertXPtoLVL(this.getAverageXP(skills));
		return [averageVirtualLvl, averageLvl];
	}

	getAverageXP(skills) {
		const averageXP = skills.overall.xp / 23;
		return averageXP;
	}

	getCombatPref(skills) {
		const melee = 0.325 * (skills.attack.level + skills.strength.level);
		const range = 0.325 * (Math.floor(skills.ranged.level / 2) + skills.ranged.level);
		const mage = 0.325 * (Math.floor(skills.magic.level / 2) + skills.magic.level);
		const combatMax = Math.max(melee, range, mage);
		const skillerCheck =
			skills.attack.level +
			skills.strength.level +
			skills.defence.level +
			skills.ranged.level +
			skills.magic.level;
		let combatPref = 'Warrior';
		if (combatMax === range) {
			combatPref = 'Ranger';
		}
		if (combatMax === mage) {
			combatPref = 'Mager';
		}
		if (skillerCheck === 5) {
			combatPref = 'Skiller';
		}
		return combatPref;
	}

	getSkillPref(skills) {
		const fighter = {
			class: 'Fighter',
			avgXP:
				(skills.attack.xp +
					skills.strength.xp +
					skills.defence.xp +
					skills.ranged.xp +
					skills.magic.xp +
					skills.hitpoints.xp +
					skills.prayer.xp) /
				7
		};
		const gatherer = {
			class: 'Gatherer',
			avgXP: (skills.woodcutting.xp + skills.fishing.xp + skills.mining.xp) / 3
		};
		const artisan = {
			class: 'Artisan',
			avgXP:
				(skills.smithing.xp +
					skills.crafting.xp +
					skills.fletching.xp +
					skills.construction.xp +
					skills.firemaking.xp) /
				5
		};
		const naturalist = {
			class: 'Naturalist',
			avgXP:
				(skills.cooking.xp + skills.herblore.xp + skills.runecraft.xp + skills.farming.xp) /
				4
		};
		const survivalist = {
			class: 'Survivalist',
			avgXP:
				(skills.agility.xp + skills.thieving.xp + skills.hunter.xp + skills.slayer.xp) / 4
		};
		const skillMax = Math.max(
			fighter.avgXP,
			gatherer.avgXP,
			artisan.avgXP,
			naturalist.avgXP,
			survivalist.avgXP
		);
		let skillPref = fighter.class;
		if (skillMax === gatherer.avgXP) {
			skillPref = gatherer.class;
		}
		if (skillMax === artisan.avgXP) {
			skillPref = artisan.class;
		}
		if (skillMax === naturalist.avgXP) {
			skillPref = naturalist.class;
		}
		if (skillMax === survivalist.avgXP) {
			skillPref = survivalist.class;
		}
		return skillPref;
	}
};

const SKILL_NAMES = [
	'total',
	'attack',
	'defence',
	'strength',
	'hitpoints',
	'ranged',
	'prayer',
	'magic',
	'cooking',
	'woodcutting',
	'fletching',
	'fishing',
	'firemaking',
	'crafting',
	'smithing',
	'mining',
	'herblore',
	'agility',
	'thieving',
	'slayer',
	'farming',
	'runecraft',
	'hunter',
	'construction'
];
