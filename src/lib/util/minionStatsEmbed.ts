import { MessageEmbed } from 'discord.js';
import { shuffleArr } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsScore } from 'oldschooljs/dist/meta/types';
import { convertXPtoLVL, toKMB } from 'oldschooljs/dist/util';

import { badges, skillEmoji } from '../constants';
import ClueTiers from '../minions/data/clueTiers';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import { UserSettings } from '../settings/types/UserSettings';
import { courses } from '../skilling/skills/agility';
import creatures from '../skilling/skills/hunter/creatures';
import { Skills } from '../types';
import { addArrayOfNumbers, toTitleCase } from '../util';

export async function minionStatsEmbed(user: KlasaUser) {
	const { rawSkills } = user;
	const QP = user.settings.get(UserSettings.QP);

	const xp = addArrayOfNumbers(Object.values(rawSkills) as number[]);
	const totalLevel = user.totalLevel();
	const skillCell = (skill: string) => {
		if (skill === 'overall') {
			return `${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${totalLevel}\n${
				skillEmoji.combat
			} ${user.combatLevel}`;
		}

		const skillXP = rawSkills[skill as keyof Skills] ?? 1;
		return `${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${convertXPtoLVL(
			skillXP
		).toLocaleString()} (${toKMB(skillXP)})`;
	};

	const clueEntries = Object.entries(user.settings.get(UserSettings.ClueScores));
	const minigameScores = (await user.getAllMinigameScores())
		.filter(i => i.score > 0)
		.sort((a, b) => b.score - a.score);

	const rawBadges = user.settings.get(UserSettings.Badges);
	const badgesStr = rawBadges.map(num => badges[num]).join(' ');

	const embed = new MessageEmbed()
		.setTitle(`${badgesStr}${user.minionName}`)
		.addField(
			'\u200b',
			['attack', 'strength', 'defence', 'ranged', 'prayer', 'magic', 'runecraft', 'construction']
				.map(skillCell)
				.join('\n'),
			true
		)
		.addField(
			'\u200b',
			['hitpoints', 'agility', 'herblore', 'thieving', 'crafting', 'fletching', 'slayer', 'hunter']
				.map(skillCell)
				.join('\n'),
			true
		)
		.addField(
			'\u200b',
			['mining', 'smithing', 'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming', 'overall']
				.map(skillCell)
				.join('\n'),
			true
		);

	if (user.isIronman) {
		embed.setColor(5_460_819);
	}

	const { percent } = user.completion();
	embed.addField(
		`${skillEmoji.total} Overall`,
		`**Level:** ${totalLevel}
**XP:** ${xp.toLocaleString()}
**QP** ${QP}
**CL Completion:** ${percent.toFixed(1)}%`,
		true
	);

	if (clueEntries.length > 0) {
		embed.addField(
			'<:Clue_scroll:365003979840552960> Clue Scores',
			clueEntries
				.map(([id, qty]) => {
					const clueTier = ClueTiers.find(t => t.id === parseInt(id));
					if (!clueTier) {
						console.error(`No clueTier: ${id}`);
						return;
					}
					return `**${toTitleCase(clueTier.name)}:** ${qty.toLocaleString()}`;
				})
				.join('\n'),
			true
		);
	}

	if (minigameScores.length > 0) {
		embed.addField(
			'<:minigameIcon:630400565070921761> Minigames',
			minigameScores
				.slice(0, 4)
				.map(minigame => {
					return `**${toTitleCase(minigame.minigame.name)}:** ${minigame.score.toLocaleString()}`;
				})
				.join('\n'),
			true
		);
	}

	const otherStats: [string, number | string][] = [
		['Fight Caves Attempts', user.settings.get(UserSettings.Stats.FightCavesAttempts)],
		['Fire Capes Sacrificed', user.settings.get(UserSettings.Stats.FireCapesSacrificed)],
		['Tithe Farm Score', user.settings.get(UserSettings.Stats.TitheFarmsCompleted)],
		['Dice Wins', user.settings.get(UserSettings.Stats.DiceWins)],
		['Dice Losses', user.settings.get(UserSettings.Stats.DiceLosses)],
		['Duel Wins', user.settings.get(UserSettings.Stats.DuelWins)],
		['Duel Losses', user.settings.get(UserSettings.Stats.DuelLosses)],
		['High Gambles', user.settings.get(UserSettings.HighGambles)],
		['Carpenter Points', user.settings.get(UserSettings.CarpenterPoints)],
		['Honour Level', user.settings.get(UserSettings.HonourLevel)],
		['Sacrificed', toKMB(user.settings.get(UserSettings.SacrificedValue))]
	];

	const lapCounts = Object.entries(user.settings.get(UserSettings.LapsScores)).sort((a, b) => a[1] - b[1]);
	if (lapCounts.length > 0) {
		const [id, score] = lapCounts[0];
		const res = courses.find(c => c.id === parseInt(id))!;
		otherStats.push([`${res.name} Laps`, score]);
	}

	const monsterScores = Object.entries(user.settings.get(UserSettings.MonsterScores)).sort((a, b) => a[1] - b[1]);
	if (monsterScores.length > 0) {
		const [id, score] = monsterScores[0];
		const res = effectiveMonsters.find(c => c.id === parseInt(id))!;
		if (!res) {
			console.error(`No monster found with id ${id} for stats embed`);
		} else {
			otherStats.push([`${res.name} KC`, score]);
		}
	}

	const hunterScores = Object.entries(user.settings.get(UserSettings.CreatureScores)).sort((a, b) => a[1] - b[1]);
	if (hunterScores.length > 0) {
		const [id, score] = hunterScores[0];
		const res = creatures.find(c => c.id === parseInt(id))!;
		if (!res) {
			console.error(`No creature found with id ${id} for stats embed`);
		} else {
			otherStats.push([`${res.name}'s Caught`, score]);
		}
	}

	embed.addField(
		'Other',
		shuffleArr(otherStats)
			.slice(0, 4)
			.map(([name, text]) => {
				return `**${name}:** ${text}`;
			})
			.join('\n'),
		true
	);

	return embed;
}
