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
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);
		const { emoji } = this.client;
		const { Skills } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(player => player)
			.catch(() => { throw this.client.notFound; });
		const minMaxSkill = Object.keys(Skills).map(skill => Skills[skill]).sort((a, b) => a.xp - b.xp);
		const lowHighRank = Object.keys(Skills).map(skill => Skills[skill]).sort((a, b) => a.rank - b.rank);
		// const highestRanked = this.getUnrankedRank(lowHighRank)[0];
		// const lowestRankedRank = this.getUnrankedRank(lowHighRank)[1];
		// const lowestRankedLevel = this.getUnrankedRank(lowHighRank)[2];
		const combatPref = this.getCombatPref(Skills);
		const skillPref = this.getSkillPref(Skills);
		const showExtra = true;
		console.log(minMaxSkill);
		console.log(lowHighRank);
		console.log(combatPref);
		console.log(skillPref);
		console.log(emoji.firemaking);
		console.log(emoji.agility);
		console.log(emoji['12']);
		console.log(emoji[Skills[minMaxSkill[0]]]);
		// console.log(emoji.minMaxSkill[0]);
		// console.log(minMaxSkill[0].emote);
		console.log(`**Highest Stat:** ${minMaxSkill[minMaxSkill.length - 2].level} | ${minMaxSkill[minMaxSkill.length - 2].xp.toLocaleString()}`);
		console.log(`**Lowest Stat:** ${minMaxSkill[0].level} | ${minMaxSkill[0].xp.toLocaleString()}`);
		console.log(`**Highest Ranked Stat:** ${lowHighRank[0].rank.toLocaleString()} | ${lowHighRank[0].level}`);
		console.log(`**Lowest Ranked Stat:** ${lowHighRank[lowHighRank.length - 1].rank.toLocaleString()} | ${lowHighRank[lowHighRank.length - 1].level}`);
		console.log(`**Average Level:** ${this.getAverageLvl(Skills)}`);
		console.log(`**Average XP:** ${this.getAverageXP(Skills).toLocaleString().split('.')[0]}`);
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
				`**Highest Stat:** ${minMaxSkill[minMaxSkill.length - 2].level} | ${minMaxSkill[minMaxSkill.length - 2].xp.toLocaleString()}
**Lowest Stat:** ${minMaxSkill[0].level} | ${minMaxSkill[0].xp.toLocaleString()}
**Highest Ranked Stat:** ${lowHighRank[0].rank.toLocaleString()} | ${lowHighRank[0].level}
**Lowest Ranked Stat:** ${lowHighRank[lowHighRank.length - 1].rank.toLocaleString()} | ${lowHighRank[lowHighRank.length - 1].level}
**Average Level:** ${this.getAverageLvl(Skills)}
**Average Stat XP:** ${this.getAverageXP(Skills).toLocaleString().split('.')[0]}`,
				true
			);
		if (showExtra) {
			embed
				.addField(
					'\u200b',
					`Your Combat Class is a **${combatPref}**.
Your Skilling Type is a **${skillPref}**.`,
					true
				);
			return msg.send({ embed });
		}

		return msg.send({ embed });
	}

	// getUnrankedRank(lowHighRank) {
	// 	let highestRank = lowHighRank[0].rank.toLocaleString();
	// 	let lowestRank = lowHighRank[lowHighRank.length - 1].rank.toLocaleString();
	// 	let lowestLevel = lowHighRank[lowHighRank.length - 1].level;
	// 	const highest = 0;
	// 	if (highestRank === '-1') {
	// 		lowestRank = 'Unranked';
	// 		lowestLevel = lowHighRank[0].level;
	// 		for (let i = 1; i < lowHighRank.length - 1; i++) {
	// 			if (highestRank === '-1') {
	// 				continue;
	// 			}
	// 			highestRank = lowHighRank[i].rank.toLocaleString();
	// 		}
	// 	}
	// 	return [highest, lowestRank, lowestLevel];
	// }

	getAverageLvl(Skills) {
		const averageLvl = cml.convertXPtoLVL(this.getAverageXP(Skills), 126);
		return averageLvl;
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
		const skillerCheck = Skills.Attack.level + Skills.Strength.level + Skills.Defence.level + Skills.Ranged.level + Skills.Magic.level;
		let combatPref = 'Meleer';
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
		const fighter = { class: 'Fighter', avgXP: (Skills.Attack.xp + Skills.Strength.xp + Skills.Defence.xp + Skills.Ranged.xp + Skills.Magic.xp + Skills.Hitpoints.xp + Skills.Prayer.xp) / 7 };
		const gatherer = { class: 'Gatherer', avgXP: (Skills.Woodcutting.xp + Skills.Fishing.xp + Skills.Mining.xp) / 3 };
		const artisan = { class: 'Artisan', avgXP: (Skills.Smithing.xp + Skills.Crafting.xp + Skills.Fletching.xp + Skills.Construction.xp + Skills.Firemaking.xp) / 5 };
		const naturalist = { class: 'Naturalist', avgXP: (Skills.Cooking.xp + Skills.Herblore.xp + Skills.Runecrafting.xp + Skills.Farming.xp) / 4 };
		const survivalist = { class: 'Survivalist', avgXP: (Skills.Agility.xp + Skills.Thieving.xp + Skills.Hunter.xp + Skills.Slayer.xp) / 4 };
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
