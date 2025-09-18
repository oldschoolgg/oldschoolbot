import type { MinigamesScore, BossRecords, AccountType, Player as PlayerType, } from "@/meta/smalltypes.js";
import type { SkillsScore, CluesScore } from "@/meta/types.js";

class Player {
	public username: string;
	public skills: SkillsScore;
	public minigames: MinigamesScore;
	public bossRecords: BossRecords;
	public type: AccountType;
	public clues: CluesScore;
	public leaguePoints?: { rank: number; points: number };

	public constructor(player: PlayerType) {
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

export default Player;
