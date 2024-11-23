import type { BossRecords } from './meta/types';

export const BASE_API_URL = 'https://services.runescape.com';

export const SKILLS = [
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

export const MINIGAMES = [
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

export const CLUES = ['all', 'beginner', 'easy', 'medium', 'hard', 'elite', 'master'] as const;

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

// Hiscores

function hiscoreURL(type: string): string {
	return `${BASE_API_URL}/m=${type}/index_lite.ws?player=`;
}

export const hiscoreURLs = {
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

export const ACCOUNT_TYPES: (keyof typeof hiscoreURLs)[] = [
	'normal',
	'ironman',
	'ultimate',
	'hardcore',
	'deadman',
	'seasonal',
	'tournament',
	'skiller',
	'skiller_defence'
];

// Errors

export enum Errors {
	INVALID_USERNAME = 'INVALID_USERNAME',
	INVALID_ACCOUNT_TYPE = 'INVALID_ACCOUNT_TYPE',
	ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
	FAILED_REQUEST = 'FAILED_REQUEST'
}

export const ErrorDescriptions: Record<string, string> = {
	INVALID_USERNAME: 'A malformed, invalid or incorrect username was passed and rejected.',
	INVALID_ACCOUNT_TYPE: 'A invalid account type (normal, ironman, etc) was passed.',
	ACCOUNT_NOT_FOUND: 'Could not find a RuneScape account with the provided username.',
	FAILED_REQUEST: 'A request to an API/External resource failed unexpectedly.',
	ITEM_NOT_FOUND: 'No item with the provided ID/Name could be found.'
};

export const EMPTY_BIRD_NEST_ID = 5075;

export enum SkillsEnum {
	Agility = 'agility',
	Cooking = 'cooking',
	Fishing = 'fishing',
	Mining = 'mining',
	Smithing = 'smithing',
	Woodcutting = 'woodcutting',
	Firemaking = 'firemaking',
	Runecraft = 'runecraft',
	Crafting = 'crafting',
	Prayer = 'prayer',
	Fletching = 'fletching',
	Farming = 'farming',
	Herblore = 'herblore',
	Thieving = 'thieving',
	Hunter = 'hunter',
	Construction = 'construction',
	Attack = 'attack',
	Defence = 'defence',
	Strength = 'strength',
	Ranged = 'ranged',
	Magic = 'magic',
	Hitpoints = 'hitpoints',
	Slayer = 'slayer'
}
