const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');
const Crystalmethlabs = require('crystalmethlabs');
const cml = new Crystalmethlabs();

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['a'],
			description: 'Shows analytics of the stats of a OSRS account',
			usage: '[username:rsn]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const { emoji } = this.client;
		const { Skills } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.catch(() => { throw this.client.notFound; });

		const minMaxSkill = Object.keys(Skills)
			.map(skill => Skills[skill])
			.sort((a, b) => a.xp - b.xp);

		const lowestSkillXp = this.getLowestSkillXp(Skills, minMaxSkill);
		const [highestSkill, lowestSkill] = this.getSkillNames(Skills, minMaxSkill);

		const [
			highestRankName,
			highestRankRank,
			highestRankLevel,
			lowestRankName,
			lowestRankRank,
			lowestRankLevel
		] = this.getHighestLowestRank(Skills);

		const [averageVirtualLvl, averageLvl] = this.getAverageLvl(Skills);

		const combatPref = this.getCombatPref(Skills);
		const skillPref = this.getSkillPref(Skills);

		const embed = new MessageEmbed()
			.setColor(7981338)
			.setAuthor(username)
			.addField(
				'\u200b',
				`${emoji.total} Overall
**Rank:** ${Skills.Overall.rank.toLocaleString()}
**Level:** ${Skills.Overall.level}
**XP:** ${Skills.Overall.xp.toLocaleString()}
**Combat Level:** ${await this.combatLevel(Skills)}`,
				true
			)
			.addField(
				'\u200b',
				`**Highest Stat:** ${emoji[highestSkill]} ${minMaxSkill[minMaxSkill.length - 2].level} | ${minMaxSkill[
					minMaxSkill.length - 2
				].xp.toLocaleString()} XP
**Lowest Stat:** ${emoji[lowestSkill]} ${minMaxSkill[0].level} | ${lowestSkillXp}  XP
**Highest Ranked Stat:** ${emoji[highestRankName]} ${highestRankRank} | lvl ${highestRankLevel}
**Lowest Ranked Stat:** ${emoji[lowestRankName]} ${lowestRankRank} | lvl ${lowestRankLevel}
**Average Level:** ${averageLvl}
**Average Virtual Level:** ${averageVirtualLvl}
**Average Stat XP:** ${
	this.getAverageXP(Skills)
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

	getLowestSkillXp(Skills, minMaxSkill) {
		let lowestSkillXp = minMaxSkill[0].xp.toLocaleString();
		if (lowestSkillXp === '-1') {
			lowestSkillXp = '0';
		}
		return lowestSkillXp;
	}

	getHighestLowestRank(Skills) {
		const lowHighRank = Object.keys(Skills)
			.map(skill => Skills[skill])
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
			const skillOrder = Object.keys(Skills).map(skill => Skills[skill]);
			if (skillOrder[i].rank === lowHighRank[0].rank) {
				highestRankName = SKILL_NAMES[i];
			}
			if (skillOrder[i].rank === lowHighRank[lowHighRank.length - 1].rank) {
				lowestRankName = SKILL_NAMES[i];
			}
			continue;
		}
		return [highestRankName, highestRankRank, highestRankLevel, lowestRankName, lowestRankRank, lowestRankLevel];
	}

	getSkillNames(Skills, minMaxSkill) {
		let highestSkill = 'Error';
		let lowestSkill = 'Error';
		for (let i = 0; i < 24; i++) {
			const skillOrder = Object.keys(Skills).map(skill => Skills[skill]);
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

	getAverageLvl(Skills) {
		const averageVirtualLvl = cml.convertXPtoLVL(this.getAverageXP(Skills), 126);
		const averageLvl = cml.convertXPtoLVL(this.getAverageXP(Skills));
		return [averageVirtualLvl, averageLvl];
	}

	getAverageXP(Skills) {
		const averageXP = Skills.Overall.xp / 23;
		return averageXP;
	}

	getCombatPref(Skills) {
		const melee = 0.325 * (Skills.Attack.level + Skills.Strength.level);
		const range = 0.325 * (Math.floor(Skills.Ranged.level / 2) + Skills.Ranged.level);
		const mage = 0.325 * (Math.floor(Skills.Magic.level / 2) + Skills.Magic.level);
		const combatMax = Math.max(melee, range, mage);
		const skillerCheck =
			Skills.Attack.level + Skills.Strength.level + Skills.Defence.level + Skills.Ranged.level + Skills.Magic.level;
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

	getSkillPref(Skills) {
		const fighter = {
			class: 'Fighter',
			avgXP:
				(Skills.Attack.xp +
					Skills.Strength.xp +
					Skills.Defence.xp +
					Skills.Ranged.xp +
					Skills.Magic.xp +
					Skills.Hitpoints.xp +
					Skills.Prayer.xp) /
				7
		};
		const gatherer = { class: 'Gatherer', avgXP: (Skills.Woodcutting.xp + Skills.Fishing.xp + Skills.Mining.xp) / 3 };
		const artisan = {
			class: 'Artisan',
			avgXP:
				(Skills.Smithing.xp +
					Skills.Crafting.xp +
					Skills.Fletching.xp +
					Skills.Construction.xp +
					Skills.Firemaking.xp) /
				5
		};
		const naturalist = {
			class: 'Naturalist',
			avgXP: (Skills.Cooking.xp + Skills.Herblore.xp + Skills.Runecrafting.xp + Skills.Farming.xp) / 4
		};
		const survivalist = {
			class: 'Survivalist',
			avgXP: (Skills.Agility.xp + Skills.Thieving.xp + Skills.Hunter.xp + Skills.Slayer.xp) / 4
		};
		const skillMax = Math.max(fighter.avgXP, gatherer.avgXP, artisan.avgXP, naturalist.avgXP, survivalist.avgXP);
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
