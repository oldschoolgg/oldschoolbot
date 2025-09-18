import type { MinigameScore } from './Player.js';

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
export type AccountType = (typeof ACCOUNT_TYPES)[number];

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

export type BossRecords = Record<(typeof mappedBossNames)[number]['0'], MinigameScore>;

export type MinigamesScore = Record<(typeof MINIGAMES)[number], MinigameScore>;
