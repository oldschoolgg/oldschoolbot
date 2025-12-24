import { convertXPtoLVL } from '../util/util.js';

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

export const mappedBossNames = [
	['abyssalSire', 'Abyssal Sire'],
	['alchemicalHydra', 'Alchemical Hydra'],
	['amoxliatl', 'Amoxliatl'],
	['araxxor', 'Araxxor'],
	['artio', 'Artio'],
	['barrowsChests', 'Barrows Chests'],
	['bryophyta', 'Bryophyta'],
	['callisto', 'Callisto'],
	['calvarion', "Calvar'ion"],
	['cerberus', 'Cerberus'],
	['chambersofXeric', 'Chambers of Xeric'],
	['chambersofXericChallengeMode', 'Chambers of Xeric: Challenge Mode'],
	['chaosElemental', 'Chaos Elemental'],
	['chaosFanatic', 'Chaos Fanatic'],
	['commanderZilyana', 'Commander Zilyana'],
	['corporealBeast', 'Corporeal Beast'],
	['crazyArchaeologist', 'Crazy Archaeologist'],
	['dagannothPrime', 'Dagannoth Prime'],
	['dagannothRex', 'Dagannoth Rex'],
	['dagannothSupreme', 'Dagannoth Supreme'],
	['derangedArchaeologist', 'Deranged Archaeologist'],
	['dukeSucellus', 'Duke Sucellus'],
	['generalGraardor', 'General Graardor'],
	['giantMole', 'Giant Mole'],
	['grotesqueGuardians', 'Grotesque Guardians'],
	['hespori', 'Hespori'],
	['kalphiteQueen', 'Kalphite Queen'],
	['kingBlackDragon', 'King Black Dragon'],
	['kraken', 'Kraken'],
	['kreeArra', "Kree'Arra"],
	['krilTsutsaroth', "K'ril Tsutsaroth"],
	['lunarChests', 'Lunar Chests'],
	['mimic', 'Mimic'],
	['nex', 'Nex'],
	['nightmare', 'The Nightmare'],
	['phosanisNightmare', "Phosani's Nightmare"],
	['obor', 'Obor'],
	['phantomMuspah', 'Phantom Muspah'],
	['sarachnis', 'Sarachnis'],
	['scorpia', 'Scorpia'],
	['scurrius', 'Scurrius'],
	['skotizo', 'Skotizo'],
	['solHeredit', 'Sol Heredit'],
	['spindel', 'Spindel'],
	['tempoross', 'Tempoross'],
	['theGauntlet', 'The Gauntlet'],
	['theCorruptedGauntlet', 'The Corrupted Gauntlet'],
	['theHueycoatl', 'The Hueycoatl'],
	['theLeviathan', 'The Leviathan'],
	['theWhisperer', 'The Whisperer'],
	['theatreofBlood', 'Theatre of Blood'],
	['theatreofBloodHard', 'Theatre of Blood: Hard Mode'],
	['thermonuclearSmokeDevil', 'Thermonuclear Smoke Devil'],
	['tombsofAmascut', 'Tombs of Amascut'],
	['tombsofAmascutExpert', 'Tombs of Amascut: Expert Mode'],
	['tzKalZuk', 'TzKal-Zuk'],
	['tzTokJad', 'TzTok-Jad'],
	['vardorvis', 'Vardorvis'],
	['venenatis', 'Venenatis'],
	['vetion', "Vet'ion"],
	['vorkath', 'Vorkath'],
	['wintertodt', 'Wintertodt'],
	['zalcano', 'Zalcano'],
	['zulrah', 'Zulrah']
] as const;

export const bossNameMap: Map<keyof BossRecords, string> = new Map(mappedBossNames);

export const ACCOUNT_TYPES = [
	'normal',
	'ironman',
	'ultimate',
	'hardcore',
	'deadman',
	'seasonal',
	'tournament',
	'skiller',
	'skiller_defence'
] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

const MINIGAMES = [
	'bountyHunter',
	'bountyHunterRogue',
	'bountyHunterLegacy',
	'bountyHunterLegacyRogue',
	'LMS',
	'pvpArena',
	'soulWars',
	'riftsClosed',
	'colosseumGlory'
] as const;

export type BossRecords = Record<(typeof mappedBossNames)[number]['0'], MinigameScore>;

export type MinigamesScore = Record<(typeof MINIGAMES)[number], MinigameScore>;

const BASE_API_URL = 'https://services.runescape.com';

const SKILLS = [
	'overall',
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
] as const;

const CLUES = ['all', 'beginner', 'easy', 'medium', 'hard', 'elite', 'master'] as const;

function resolvePlayerFromHiscores(csvData: string, accountType: AccountType): Player {
	const data: string[][] = csvData
		.trim()
		.split('\n')
		.map((str): string[] => str.split(','));

	const resolvedPlayer: Player = {
		skills: {},
		minigames: {},
		clues: {},
		bossRecords: {}
	} as Player;

	let accumulativeIndex = 0;

	for (let i = 0; i < SKILLS.length; i++) {
		resolvedPlayer.skills[SKILLS[i]] = {
			rank: Number(data[i][0]),
			level: Number(data[i][1]),
			xp: Number(data[i][2])
		};
	}

	if (accountType === 'seasonal') {
		resolvedPlayer.leaguePoints = {
			rank: Number(data[accumulativeIndex + SKILLS.length][0]),
			points: Number(data[accumulativeIndex + SKILLS.length][1])
		};
	}

	accumulativeIndex += SKILLS.length + 2;

	for (let i = 0; i < 4; i++) {
		resolvedPlayer.minigames[MINIGAMES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += 4;

	for (let i = 0; i < CLUES.length; i++) {
		resolvedPlayer.clues[CLUES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += CLUES.length;

	for (let i = 0; i < 5; i++) {
		const minigameKey = MINIGAMES[i + 4];
		const minigameData = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
		resolvedPlayer.minigames[minigameKey] = minigameData;
	}

	accumulativeIndex += 5;

	for (let i = 0; i < mappedBossNames.length; i++) {
		if (!data[i + accumulativeIndex]) continue;
		const bossName = mappedBossNames[i][0];
		resolvedPlayer.bossRecords[bossName] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	return resolvedPlayer;
}

export interface GetOptions {
	type?: keyof typeof hiscoreURLs;
	virtualLevels?: boolean;
}

function hiscoreURL(type: string): string {
	return `${BASE_API_URL}/m=${type}/index_lite.ws?player=`;
}

const hiscoreURLs: Record<AccountType, string> = {
	normal: hiscoreURL('hiscore_oldschool'),
	ironman: hiscoreURL('hiscore_oldschool_ironman'),
	ultimate: hiscoreURL('hiscore_oldschool_ultimate'),
	hardcore: hiscoreURL('hiscore_oldschool_hardcore_ironman'),
	deadman: hiscoreURL('hiscore_oldschool_deadman'),
	seasonal: hiscoreURL('hiscore_oldschool_seasonal'),
	tournament: hiscoreURL('hiscore_oldschool_tournament'),
	skiller: hiscoreURL('hiscore_oldschool_skiller'),
	skiller_defence: hiscoreURL('hiscore_oldschool_skiller_defence')
} as const;

const defaultGetOptions: GetOptions = {
	type: 'normal',
	virtualLevels: false
};

/**
 * Determines whether a string is a valid RuneScape username.
 * @param username The username to check.
 */
function isValidUsername(username: string): boolean {
	return Boolean(username.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$'));
}

export const Hiscores = {
	async fetch(
		username: string,
		options: GetOptions = { type: 'normal', virtualLevels: false }
	): Promise<{ player: Player; error: null } | { player: null; error: string }> {
		const mergedOptions = { ...defaultGetOptions, ...options };
		const accountType = mergedOptions.type ?? 'normal';
		if (!isValidUsername(username)) {
			return { player: null, error: `That is not a valid account username.` };
		}
		if (!ACCOUNT_TYPES.includes(accountType)) {
			return { player: null, error: `That is not a valid account type.` };
		}

		const rawResponse = await fetch(hiscoreURLs[accountType] + username);
		if (rawResponse.status === 404) {
			return { player: null, error: `That username does not exist on the ${accountType} hiscores.` };
		}
		if (!rawResponse.ok) {
			return { player: null, error: `Failed to fetch hiscores. The hiscores may be down.` };
		}
		const text = await rawResponse.text();
		// If the text response is HTML, it means the hiscores are down.
		if (text.trim().startsWith('<')) {
			return { player: null, error: `Failed to fetch hiscores. The hiscores may be down.` };
		}

		const data: Player = resolvePlayerFromHiscores(text, accountType);

		if (mergedOptions.virtualLevels) {
			let overall = 0;
			for (const skill in data.skills) {
				if (skill === 'overall') continue;
				const lvl = convertXPtoLVL(data.skills[skill as keyof SkillsScore].xp, 126);
				overall += lvl;
				data.skills[skill as keyof SkillsScore].level = lvl;
			}
			data.skills.overall.level = overall;
		}

		const player = new Player({
			username,
			type: options.type ?? 'normal',
			skills: data.skills,
			minigames: data.minigames,
			clues: data.clues,
			bossRecords: data.bossRecords,
			leaguePoints: data.leaguePoints
		});
		return { player, error: null };
	}
};
