import type { AccountType, BossRecords, MinigamesScore } from './constants.js';

export interface SkillScore {
	rank: number;
	level: number;
	xp: number;
}

export interface SkillsScore {
	overall: SkillScore;
	attack: SkillScore;
	defence: SkillScore;
	strength: SkillScore;
	hitpoints: SkillScore;
	ranged: SkillScore;
	prayer: SkillScore;
	magic: SkillScore;
	cooking: SkillScore;
	woodcutting: SkillScore;
	fletching: SkillScore;
	fishing: SkillScore;
	firemaking: SkillScore;
	crafting: SkillScore;
	smithing: SkillScore;
	mining: SkillScore;
	herblore: SkillScore;
	agility: SkillScore;
	thieving: SkillScore;
	slayer: SkillScore;
	farming: SkillScore;
	runecraft: SkillScore;
	hunter: SkillScore;
	construction: SkillScore;
}
export interface CluesScore {
	all: MinigameScore;
	beginner: MinigameScore;
	easy: MinigameScore;
	medium: MinigameScore;
	hard: MinigameScore;
	elite: MinigameScore;
	master: MinigameScore;
}

export interface MinigameScore {
	rank: number;
	score: number;
}

interface IPlayer {
	bossRecords: BossRecords;
	username: string;
	type: AccountType;
	skills: SkillsScore;
	minigames: MinigamesScore;
	clues: CluesScore;
	leaguePoints?: { rank: number; points: number };
}

export class Player {
	public username: string;
	public skills: SkillsScore;
	public minigames: MinigamesScore;
	public bossRecords: BossRecords;
	public type: AccountType;
	public clues: CluesScore;
	public leaguePoints?: { rank: number; points: number };

	public constructor(player: IPlayer) {
		this.username = player.username;
		this.skills = player.skills;
		this.minigames = player.minigames;
		this.bossRecords = player.bossRecords;
		this.type = player.type;
		this.clues = player.clues;
		this.leaguePoints = player.leaguePoints;
	}

	public get combatLevel(): number {
		const { defence, ranged, hitpoints, magic, prayer, attack, strength } = this.skills;
		const base = 0.25 * (defence.level + hitpoints.level + Math.floor(prayer.level / 2));
		const melee = 0.325 * (attack.level + strength.level);
		const range = 0.325 * (Math.floor(ranged.level / 2) + ranged.level);
		const mage = 0.325 * (Math.floor(magic.level / 2) + magic.level);
		return Math.floor(base + Math.max(melee, range, mage));
	}
}
