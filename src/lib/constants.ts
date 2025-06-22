import { execSync } from 'node:child_process';
import path from 'node:path';
import { isMainThread } from 'node:worker_threads';
import { type CommandOptions, PerkTier, StoreBitfield, dateFm } from '@oldschoolgg/toolkit/util';
import type { Prisma } from '@prisma/client';
import type { APIInteractionDataResolvedChannel, APIRole } from 'discord.js';
import * as dotenv from 'dotenv';
import { Time } from 'e';
import { Items, convertLVLtoXP, getItemOrThrow, resolveItems } from 'oldschooljs';
import { z } from 'zod';

import type { AbstractCommand } from '../mahoji/lib/inhibitors';
import { customItems } from './customItems/util';
import { SkillsEnum } from './skilling/types';
import type { ActivityTaskData } from './types/minions';
import type { CanvasImage } from './util/canvasUtil';

export { PerkTier };

type BotType = 'OSB' | 'BSO';
export const BOT_TYPE: BotType = 'BSO' as 'BSO' | 'OSB';
export const BOT_TYPE_LOWERCASE: 'bso' | 'osb' = BOT_TYPE.toLowerCase() as 'bso' | 'osb';
const isProduction = process.env.NODE_ENV === 'production';
const GENERAL_CHANNEL_ID =
	BOT_TYPE === 'OSB'
		? isProduction
			? '346304390858145792'
			: '1154056119019393035'
		: isProduction
			? '792691343284764693'
			: '1154056119019393035';
const OLDSCHOOLGG_TESTING_SERVER_ID = '940758552425955348';
const TEST_SERVER_LOG_CHANNEL = '1042760447830536212';

interface ChannelConfig {
	ServerGeneral: string;
	Notifications: string;
	GrandExchange: string;
	EconomyLogs: string;
	HelpAndSupport: string;
	BotLogs: string;
	GeneralChannel: string;
}

const OSBChannelConfig: ChannelConfig = {
	ServerGeneral: '342983479501389826',
	Notifications: '469523207691436042',
	GrandExchange: '682996313209831435',
	EconomyLogs: '802029843712573510',
	HelpAndSupport: '668073484731154462',
	BotLogs: '1051725977320964197',
	GeneralChannel: GENERAL_CHANNEL_ID
};

const BSOChannelConfig: ChannelConfig = {
	ServerGeneral: '342983479501389826',
	Notifications: '811589869314899980',
	GrandExchange: '738780181946171493',
	EconomyLogs: '802029843712573510',
	HelpAndSupport: '970752140324790384',
	BotLogs: '1051725977320964197',
	GeneralChannel: GENERAL_CHANNEL_ID
};

const TestChannelConfig: ChannelConfig = {
	ServerGeneral: TEST_SERVER_LOG_CHANNEL,
	Notifications: TEST_SERVER_LOG_CHANNEL,
	GrandExchange: TEST_SERVER_LOG_CHANNEL,
	EconomyLogs: TEST_SERVER_LOG_CHANNEL,
	HelpAndSupport: TEST_SERVER_LOG_CHANNEL,
	BotLogs: TEST_SERVER_LOG_CHANNEL,
	GeneralChannel: TEST_SERVER_LOG_CHANNEL
};

export const Channel = isProduction ? (BOT_TYPE === 'OSB' ? OSBChannelConfig : BSOChannelConfig) : TestChannelConfig;

export const Roles = {
	Booster: '665908237152813057',
	Contributor: '456181501437018112',
	Moderator: '622806157563527178',
	Patron: '679620175838183424',
	EventOrganizer: '1149907536749801542',

	// Top Roles
	OSBTopSkiller: '795266465329709076',
	OSBTopCollector: '795271210141351947',
	OSBTopSacrificer: '795933981715464192',
	OSBTopMinigamer: '832798997033779220',
	OSBTopClueHunter: '839135887467610123',
	OSBTopSlayer: '856080958247010324',
	OSBTopFarmer: '894194027363205150',
	OSBTopGlobalCL: '1072426869028294747',

	BSOMassHoster: '759572886364225558',
	BSOTopSkiller: '848966830617788427',
	BSOTopCollector: '848966773885763586',
	BSOTopSacrificer: '848966732265160775',
	BSOTopMinigamer: '867967884515770419',
	BSOTopClueHunter: '848967350120218636',
	BSOTopSlayer: '867967551819358219',
	BSOTopInventor: '992799099801833582',
	BSOTopLeagues: '1005417171112972349',
	BSOTopTamer: '1054356709222666240',
	BSOTopMysterious: '1074592096968785960',
	BSOTopGlobalCL: '848966773885763586',
	BSOTopFarmer: '894194259731828786'
};

export enum DefaultPingableRoles {
	// Tester roles:
	Tester = '682052620809928718',
	BSOTester = '829368646182371419',
	// Mass roles:
	BSOMass = '759573020464906242'
}

export enum Emoji {
	MoneyBag = '<:MoneyBag:493286312854683654>',
	OSBot = '<:OSBot:601768469905801226>',
	Joy = '😂',
	Bpaptu = '<:bpaptu:660333438292983818>',
	Diamond = '💎',
	Dice = '<:dice:660128887111548957>',
	Fireworks = '🎆',
	Tick = '✅',
	RedX = '❌',
	Search = '🔎',
	FancyLoveheart = '💝',
	Gift = '🎁',
	Sad = '<:RSSad:380915244652036097>',
	Happy = '<:RSHappy:380915244760825857>',
	PeepoOSBot = '<:peepoOSBot:601695641088950282>',
	PeepoSlayer = '<:peepoSlayer:644411576425775104>',
	PeepoRanger = '<:peepoRanger:663096705746731089>',
	PeepoNoob = '<:peepoNoob:660712001500086282>',
	XP = '<:xp:630911040510623745>',
	GP = '<:RSGP:369349580040437770>',
	ThumbsUp = '👍',
	ThumbsDown = '👎',
	Casket = '<:Casket:365003978678730772>',
	Agility = '<:agility:630911040355565568>',
	Cooking = '<:cooking:630911040426868756>',
	Fishing = '<:fishing:630911040091193356>',
	Mining = '<:mining:630911040128811010>',
	Smithing = '<:smithing:630911040452034590>',
	Woodcutting = '<:woodcutting:630911040099450892>',
	Runecraft = '<:runecraft:630911040435257364>',
	Prayer = '<:prayer:630911040426868746>',
	Construction = '<:construction:630911040493715476>',
	Diango = '<:diangoChatHead:678146375300415508>',
	MysteryBox = '<:mysterybox:680783258488799277>',
	QuestIcon = '<:questIcon:690191385907036179>',
	MinigameIcon = '<:minigameIcon:630400565070921761>',
	Warning = '⚠️',
	Ironman = '<:ironman:626647335900020746>',
	Firemaking = '<:firemaking:630911040175210518>',
	Crafting = '<:crafting:630911040460161047>',
	EasterEgg = '<:easterEgg:695473553314938920>',
	TzRekJad = '<:Tzrekjad:324127379188613121>',
	Phoenix = '<:Phoenix:324127378223792129>',
	TinyTempor = '<:TinyTempor:824483631694217277>',
	AnimatedFireCape = '<a:FireCape:394692985184583690>',
	Fletching = '<:fletching:630911040544309258>',
	Farming = '<:farming:630911040355565599>',
	Tangleroot = '<:tangleroot:324127378978635778>',
	Herblore = '<:herblore:630911040535658496>',
	Purple = '🟪',
	Green = '🟩',
	Blue = '🟦',
	Orange = '🟧',
	Thieving = '<:thieving:630910829352452123>',
	Hunter = '<:hunter:630911040166559784>',
	Ely = '<:ely:784453586033049630>',
	Timer = '<:ehpclock:352323705210142721>',
	ChristmasCracker = '<:cracker:785389969962958858>',
	SantaHat = '<:santaHat:785874868905181195>',
	RottenPotato = '<:rottenPotato:791498767051915275>',
	Magic = '<:magic:630911040334331917>',
	Hitpoints = '<:hitpoints:630911040460292108>',
	Strength = '<:strength:630911040481263617>',
	Attack = '<:attack:630911039969427467>',
	Defence = '<:defence:630911040393052180>',
	Ranged = '<:ranged:630911040258834473>',
	Dungeoneering = '<:dungeoneering:828683755198873623>',
	Gear = '<:gear:835314891950129202>',
	Slayer = '<:slayer:630911040560824330>',
	SlayerMasterCape = '<:slayerMasterCape:869497600284459008>',
	RunecraftMasterCape = '<:runecraftMasterCape:869497600997470258>',
	Flappy = '<:Flappy:884799334737129513>',
	CombatAchievements = '<:combatAchievements:1145015804040065184>',
	Stopwatch = '⏱️',
	Smokey = '<:Smokey:886284971914969149>',
	ItemContract = '<:Item_contract:988422348434718812>',
	// Badges,
	BigOrangeGem = '<:bigOrangeGem:778418736188489770>',
	GreenGem = '<:greenGem:778418736495067166>',
	PinkGem = '<:pinkGem:778418736276963349>',
	OrangeGem = '<:orangeGem:778418736474095616>',
	Minion = '<:minion:778418736180494347>',
	Spanner = '<:spanner:778418736621158410>',
	DoubleSpanner = '<:doubleSpanner:778418736327688194>',
	Hammer = '<:hammer:778418736595206184>',
	Bug = '<:bug:778418736330833951>',
	Trophy = '<:goldTrophy:778418736561782794>',
	Crab = '<:crab:778418736432021505>',
	Snake = '🐍',
	Skiller = '<:skiller:802136963775463435>',
	Incinerator = '<:incinerator:802136963674275882>',
	CollectionLog = '<:collectionLog:802136964027121684>',
	Bank = '<:bank:739459924693614653>',
	Minigames = '<:minigameIcon:630400565070921761>',
	Skull = '<:Skull:802136963926065165>',
	CombatSword = '<:combat:802136963956080650>',
	SOTW = '<:SOTWtrophy:842938096097820693>',
	OSRSSkull = '<:skull:863392427040440320>',
	Invention = '<:Invention:936219232146980874>',
	BSO = '<:BSO:863823820435619890>',
	Kuro = '<:kuro:1032277900579319888>',
	SOTWTrophy = '<:SOTWtrophy:842938096097820693>',

	DragonTrophy = '<:DragonTrophy:1152881074259624007>',
	RuneTrophy = '<:RuneTrophy:1152881071445254164>',
	AdamantTrophy = '<:AdamantTrophy:1152881069281001472>',
	MithrilTrophy = '<:MithrilTrophy:1152881066353373236>',
	SteelTrophy = '<:SteelTrophy:1152881062846939206>',
	IronTrophy = '<:IronTrophy:1152881060972085279>',
	BronzeTrophy = '<:BronzeTrophy:1152881057788592188>'
}

export enum ActivityGroup {
	Skilling = 'Skilling',
	Clue = 'Clue',
	Monster = 'Monster',
	Minigame = 'Minigame'
}

export enum Events {
	Error = 'error',
	Log = 'log',
	Verbose = 'verbose',
	Warn = 'warn',
	Wtf = 'wtf',
	ServerNotification = 'serverNotification',
	SkillLevelUp = 'skillLevelUp',
	EconomyLog = 'economyLog'
}

export const COINS_ID = 995;

export enum BitField {
	IsPatronTier1 = 2,
	IsPatronTier2 = 3,
	IsPatronTier3 = 4,
	IsPatronTier4 = 5,
	IsPatronTier5 = 6,
	isModerator = 7,
	BypassAgeRestriction = 9,
	HasHosidiusWallkit = 10,
	HasPermanentEventBackgrounds = 11,
	HasPermanentTierOne = 12,
	DisabledRandomEvents = 13,
	PermanentIronman = 14,
	AlwaysSmallBank = 15,
	HasDexScroll = 16,
	HasArcaneScroll = 17,
	HasTornPrayerScroll = 18,
	HasSlepeyTablet = 20,
	IsPatronTier6 = 21,
	DisableBirdhouseRunButton = 22,
	DisableAshSanctifier = 23,
	BothBotsMaxedFreeTierOnePerks = 24,
	HasBloodbarkScroll = 25,
	DisableAutoFarmContractButton = 26,
	DisableGrandExchangeDMs = 27,
	HadAllSlayerUnlocks = 28,
	HasSwampbarkScroll = 29,
	HasSaradominsLight = 30,
	UsedScarredTablet = 31,
	UsedSirenicTablet = 32,
	UsedStrangledTablet = 33,
	UsedFrozenTablet = 34,
	CleanHerbsFarming = 35,
	SelfGamblingLocked = 36,
	DisabledFarmingReminders = 37,
	DisableClueButtons = 38,
	DisableAutoSlayButton = 39,
	DisableHighPeakTimeWarning = 40,
	DisableOpenableNames = 41,
	ShowDetailedInfo = 42,

	HasGivenBirthdayPack = 200,
	HasPermanentSpawnLamp = 201,
	HasScrollOfFarming = 202,
	HasScrollOfLongevity = 203,
	HasScrollOfTheHunt = 204,
	HasBananaEnchantmentScroll = 205,
	HasDaemonheimAgilityPass = 206,
	DisabledGorajanBoneCrusher = 207,
	HasLeaguesOneMinuteLengthBoost = 208,
	HasPlantedIvy = 209,
	HasGuthixEngram = 210,
	ScrollOfLongevityDisabled = 211,
	HasUnlockedYeti = 212,
	NoItemContractDonations = 213,

	HasFlickeringBoon = 214,
	HasBrightBoon = 215,
	HasGlowingBoon = 216,
	HasSparklingBoon = 217,
	HasGleamingBoon = 218,
	HasLustrousBoon = 219,
	HasElderBoon = 220,
	HasBrilliantBoon = 221,
	HasRadiantBoon = 222,
	HasLuminousBoon = 223,
	HasIncandescentBoon = 224,
	HasVibrantBoon = 225,
	HasAncientBoon = 226,
	DisabledTameClueOpening = 227,
	HasMoondashCharm = 228,
	HasUnlockedVenatrix = 229,
	GrewFiveSpiritTrees = 230,
	UseSuperRestoresForDwarvenBlessing = 231,
	DisableSizeMatters = 232,
	DisabledTameImplingOpening = 233
}

interface BitFieldData {
	name: string;
	/**
	 * Users can never 'choose' to get this, even in testing.
	 */
	protected: boolean;
	userConfigurable: boolean;
}

export const BitFieldData: Record<BitField, BitFieldData> = {
	[BitField.isModerator]: { name: 'Moderator', protected: true, userConfigurable: false },

	[BitField.HasPermanentTierOne]: { name: 'Permanent Tier 1', protected: false, userConfigurable: false },
	[BitField.HasPermanentSpawnLamp]: { name: 'Permanent Spawn Lamp', protected: false, userConfigurable: false },
	[BitField.IsPatronTier1]: { name: 'Tier 1 Patron', protected: false, userConfigurable: false },
	[BitField.IsPatronTier2]: { name: 'Tier 2 Patron', protected: false, userConfigurable: false },
	[BitField.IsPatronTier3]: { name: 'Tier 3 Patron', protected: false, userConfigurable: false },
	[BitField.IsPatronTier4]: { name: 'Tier 4 Patron', protected: false, userConfigurable: false },
	[BitField.IsPatronTier5]: { name: 'Tier 5 Patron', protected: false, userConfigurable: false },
	[BitField.IsPatronTier6]: { name: 'Tier 6 Patron', protected: false, userConfigurable: false },

	[BitField.HasHosidiusWallkit]: { name: 'Hosidius Wall Kit Unlocked', protected: false, userConfigurable: false },
	[BitField.HasDexScroll]: { name: 'Dexterous Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasArcaneScroll]: { name: 'Arcane Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasTornPrayerScroll]: { name: 'Torn Prayer Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasSlepeyTablet]: { name: 'Slepey Tablet Used', protected: false, userConfigurable: false },
	[BitField.HasScrollOfFarming]: { name: 'Scroll of Farming Used', protected: false, userConfigurable: false },
	[BitField.HasScrollOfLongevity]: { name: 'Scroll of Longevity Used', protected: false, userConfigurable: false },
	[BitField.HasScrollOfTheHunt]: { name: 'Scroll of the Hunt Used', protected: false, userConfigurable: false },
	[BitField.HasPlantedIvy]: { name: 'Has Planted Ivy Seed', protected: false, userConfigurable: false },
	[BitField.HasGuthixEngram]: { name: 'Has Guthix Engram', protected: false, userConfigurable: false },
	[BitField.HasUnlockedYeti]: { name: 'Yeti Unlocked', protected: false, userConfigurable: false },
	[BitField.HasBananaEnchantmentScroll]: {
		name: 'Banana Enchantment Scroll Used',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasDaemonheimAgilityPass]: {
		name: 'Daemonheim Agility Pass Used',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasBloodbarkScroll]: { name: 'Runescroll of bloodbark Used', protected: false, userConfigurable: false },
	[BitField.HasSwampbarkScroll]: { name: 'Runescroll of swampbark Used', protected: false, userConfigurable: false },
	[BitField.HasSaradominsLight]: { name: "Saradomin's light Used", protected: false, userConfigurable: false },
	[BitField.HadAllSlayerUnlocks]: { name: 'Had All Slayer Unlocks', protected: false, userConfigurable: false },
	[BitField.UsedScarredTablet]: { name: 'Used Scarred Tablet', protected: false, userConfigurable: false },
	[BitField.UsedFrozenTablet]: { name: 'Used Frozen Tablet', protected: false, userConfigurable: false },
	[BitField.UsedSirenicTablet]: { name: 'Used Sirenic Tablet', protected: false, userConfigurable: false },
	[BitField.UsedStrangledTablet]: { name: 'Used Strangled Tablet', protected: false, userConfigurable: false },
	[BitField.SelfGamblingLocked]: { name: 'Self Gambling Lock', protected: false, userConfigurable: false },

	[BitField.HasGivenBirthdayPack]: { name: 'Has Given Birthday Pack', protected: false, userConfigurable: false },
	[BitField.BypassAgeRestriction]: { name: 'Bypassed Age Restriction', protected: false, userConfigurable: false },
	[BitField.HasPermanentEventBackgrounds]: {
		name: 'Permanent Event Backgrounds',
		protected: false,
		userConfigurable: false
	},
	[BitField.PermanentIronman]: { name: 'Permanent Ironman', protected: false, userConfigurable: false },
	[BitField.HasLeaguesOneMinuteLengthBoost]: {
		name: 'Leagues One Minute Trip Length Boost',
		protected: false,
		userConfigurable: false
	},
	[BitField.BothBotsMaxedFreeTierOnePerks]: {
		name: 'Free T1 Perks for Maxed in OSB/BSO',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasFlickeringBoon]: {
		name: 'Has Flickering Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasBrightBoon]: {
		name: 'Has Bright Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasGlowingBoon]: {
		name: 'Has Glowing Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasSparklingBoon]: {
		name: 'Has Sparkling Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasGleamingBoon]: {
		name: 'Has Gleaming Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasLustrousBoon]: {
		name: 'Has Lustrous Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasElderBoon]: {
		name: 'Has Elder Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasBrilliantBoon]: {
		name: 'Has Brilliant Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasRadiantBoon]: {
		name: 'Has Radiant Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasLuminousBoon]: {
		name: 'Has Luminous Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasIncandescentBoon]: {
		name: 'Has Incandescent Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasVibrantBoon]: {
		name: 'Has Vibrant Boon',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasAncientBoon]: {
		name: 'Has Ancient Boon',
		protected: false,
		userConfigurable: false
	},

	[BitField.AlwaysSmallBank]: { name: 'Always Use Small Banks', protected: false, userConfigurable: true },
	[BitField.DisabledRandomEvents]: { name: 'Disabled Random Events', protected: false, userConfigurable: true },
	[BitField.DisabledGorajanBoneCrusher]: {
		name: 'Disabled Gorajan Bonecrusher',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableBirdhouseRunButton]: {
		name: 'Disable Birdhouse Run Button',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableAshSanctifier]: { name: 'Disable Ash Sanctifier', protected: false, userConfigurable: true },
	[BitField.DisableAutoFarmContractButton]: {
		name: 'Disable Auto Farm Contract Button',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableGrandExchangeDMs]: {
		name: 'Disable Grand Exchange DMs',
		protected: false,
		userConfigurable: true
	},
	[BitField.ScrollOfLongevityDisabled]: {
		name: 'Disable Scroll of Longevity',
		protected: false,
		userConfigurable: true
	},
	[BitField.CleanHerbsFarming]: {
		name: 'Clean herbs during farm runs',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisabledFarmingReminders]: {
		name: 'Disable Farming Reminders',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableClueButtons]: {
		name: 'Disable Clue Buttons',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableAutoSlayButton]: {
		name: 'Disable Auto Slay Button',
		protected: false,
		userConfigurable: true
	},
	[BitField.NoItemContractDonations]: {
		name: 'Disable Item Contract donations',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisabledTameClueOpening]: {
		name: 'Disable Eagle Tame Opening Caskets',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisabledTameImplingOpening]: {
		name: 'Disable Tame from Opening Impling Jars',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableHighPeakTimeWarning]: {
		name: 'Disable Wilderness High Peak Time Warning',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableOpenableNames]: {
		name: 'Disable Names On Open',
		protected: false,
		userConfigurable: true
	},
	[BitField.ShowDetailedInfo]: {
		name: 'Show Detailed Info',
		protected: false,
		userConfigurable: true
	},
	[BitField.HasMoondashCharm]: {
		name: 'Used Moondash Charm',
		protected: false,
		userConfigurable: false
	},
	[BitField.HasUnlockedVenatrix]: {
		name: 'Has Unlocked Venatrix',
		protected: false,
		userConfigurable: false
	},
	[BitField.GrewFiveSpiritTrees]: {
		name: 'Has grown five spirit trees',
		protected: false,
		userConfigurable: false
	},
	[BitField.UseSuperRestoresForDwarvenBlessing]: {
		name: 'Use Super Restores For Dwarven Blessing',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableSizeMatters]: {
		name: 'Disable Size Matters unlock',
		protected: false,
		userConfigurable: true
	}
} as const;

export const BadgesEnum = {
	Developer: 0,
	Booster: 1,
	LimitedPatron: 2,
	Patron: 3,
	Moderator: 4,
	GreenGem: 5,
	Bug: 6,
	GoldenTrophy: 7,
	TopSacrifice: 8,
	TopSkiller: 9,
	TopCollector: 10,
	TopMinigame: 11,
	SotWTrophy: 12,
	Slayer: 13,
	TopGiveawayer: 14,
	Farmer: 15,
	Hacktoberfest: 16
} as const;

export const badges: { [key: number]: string } = {
	[BadgesEnum.Developer]: Emoji.Spanner,
	[BadgesEnum.Booster]: Emoji.PinkGem,
	[BadgesEnum.LimitedPatron]: Emoji.Crab,
	[BadgesEnum.Patron]: Emoji.BigOrangeGem,
	[BadgesEnum.Moderator]: Emoji.Hammer,
	[BadgesEnum.GreenGem]: Emoji.GreenGem,
	[BadgesEnum.Bug]: Emoji.Bug,
	[BadgesEnum.GoldenTrophy]: Emoji.Trophy,
	[BadgesEnum.TopSacrifice]: Emoji.Incinerator,
	[BadgesEnum.TopSkiller]: Emoji.Skiller,
	[BadgesEnum.TopCollector]: Emoji.CollectionLog,
	[BadgesEnum.TopMinigame]: Emoji.MinigameIcon,
	[BadgesEnum.SotWTrophy]: Emoji.SOTWTrophy,
	[BadgesEnum.Slayer]: Emoji.Slayer,
	[BadgesEnum.TopGiveawayer]: Emoji.SantaHat,
	[BadgesEnum.Farmer]: Emoji.Farming,
	[BadgesEnum.Hacktoberfest]: '<:hacktoberfest:1304259875634942082>'
};

export const MAX_XP = 5_000_000_000;

export const MIMIC_MONSTER_ID = 23_184;

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
export const HERBIBOAR_ID = 36;
export const RAZOR_KEBBIT_ID = 35;
export const BLACK_CHIN_ID = 9;
export const ZALCANO_ID = 9049;
export const NIGHTMARE_ID = 9415;
export const MIN_LENGTH_FOR_PET = Time.Minute * 5;
export const HESPORI_ID = 8583;
export const NEX_ID = 11_278;

export const LEVEL_99_XP = convertLVLtoXP(99);
export const LEVEL_120_XP = convertLVLtoXP(120);
export const MAX_LEVEL = 120;
export const MAX_TOTAL_LEVEL = Object.values(SkillsEnum).length * MAX_LEVEL;
export const SILENT_ERROR = 'SILENT_ERROR';

export const PATRON_ONLY_GEAR_SETUP =
	'Sorry - but the `other` gear setup is only available for Tier 3 Patrons (and higher) to use.';

export const projectiles = {
	arrow: {
		items: resolveItems(['Adamant arrow', 'Rune arrow', 'Amethyst arrow', 'Dragon arrow', 'Hellfire arrow']),
		savedByAvas: true,
		weapons: resolveItems(['Twisted bow'])
	},
	bolt: {
		items: resolveItems([
			'Silver bolts',
			'Runite bolts',
			'Dragon bolts',
			'Diamond bolts (e)',
			'Diamond dragon bolts (e)',
			'Ruby dragon bolts (e)'
		]),
		savedByAvas: true,
		weapons: resolveItems([
			'Armadyl crossbow',
			'Dragon hunter crossbow',
			'Dragon crossbow',
			'Zaryte crossbow',
			'Rune crossbow'
		])
	},
	javelin: {
		items: resolveItems(['Amethyst javelin', 'Rune javelin', 'Dragon javelin', 'Obsidian javelin']),
		savedByAvas: false,
		weapons: resolveItems(['Heavy ballista'])
	}
} as const;
export type ProjectileType = keyof typeof projectiles;

export const spearWeapon = resolveItems(['Crystal halberd', 'Zamorakian hasta', 'Zamorakian spear']);
export const clawWeapon = resolveItems(['Dragon claws']); // TODO: Add Burning claws once OSJS updated

export const PHOSANI_NIGHTMARE_ID = 9416;
const COMMANDS_TO_NOT_TRACK = [['minion', ['k', 'kill', 'clue', 'info']]];
export function shouldTrackCommand(command: AbstractCommand, args: CommandOptions) {
	if (!Array.isArray(args)) return true;
	for (const [name, subs] of COMMANDS_TO_NOT_TRACK) {
		if (command.name === name && typeof args[0] === 'string' && subs.includes(args[0])) {
			return false;
		}
	}
	return true;
}

function compressMahojiArgs(options: CommandOptions) {
	const newOptions: Record<string, string | number | boolean | null | undefined> = {};
	for (const [key, val] of Object.entries(options) as [
		keyof CommandOptions,
		CommandOptions[keyof CommandOptions]
	][]) {
		if (
			typeof val === 'string' ||
			typeof val === 'number' ||
			typeof val === 'boolean' ||
			typeof val === 'undefined'
		) {
			newOptions[key] = val;
			continue;
		}

		if ('user' in val && 'member' in val) {
			newOptions[key] = (val.user as { id: string }).id;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as APIRole | APIInteractionDataResolvedChannel).id;
			continue;
		}

		newOptions[key] = null;
	}
	return newOptions;
}

export function getCommandArgs(
	commandName: string,
	args: CommandOptions
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (Array.isArray(args) && args.length === 0) return undefined;
	if (!Array.isArray(args) && Object.keys(args).length === 0) return undefined;
	if (commandName === 'bank') return undefined;
	if (commandName === 'rp' && Array.isArray(args) && ['c', 'eval'].includes(args[0] as string)) return undefined;
	return (Array.isArray(args) ? args : compressMahojiArgs(args)) as Prisma.InputJsonObject | Prisma.InputJsonArray;
}
export const GLOBAL_BSO_XP_MULTIPLIER = 5;

export const DISABLED_COMMANDS = new Set<string>();
export const PVM_METHODS = ['barrage', 'cannon', 'burst', 'chinning', 'none'] as const;
export type PvMMethod = (typeof PVM_METHODS)[number];

export const NMZ_STRATEGY = ['experience', 'points'] as const;
export type NMZStrategy = (typeof NMZ_STRATEGY)[number];

export const UNDERWATER_AGILITY_THIEVING_TRAINING_SKILL = ['agility', 'thieving', 'agility+thieving'] as const;
export type UnderwaterAgilityThievingTrainingSkill = (typeof UNDERWATER_AGILITY_THIEVING_TRAINING_SKILL)[number];

export const TWITCHERS_GLOVES = ['egg', 'ring', 'seed', 'clue'] as const;
export type TwitcherGloves = (typeof TWITCHERS_GLOVES)[number];

export const busyImmuneCommands = ['admin', 'rp'];

export const FormattedCustomEmoji = /<a?:\w{2,32}:\d{17,20}>/;

export const IVY_MAX_TRIP_LENGTH_BOOST = Time.Minute * 25;
export const chompyHats = [
	[getItemOrThrow('Chompy bird hat (ogre bowman)'), 30],
	[getItemOrThrow('Chompy bird hat (bowman)'), 40],
	[getItemOrThrow('Chompy bird hat (ogre yeoman)'), 50],
	[getItemOrThrow('Chompy bird hat (yeoman)'), 70],
	[getItemOrThrow('Chompy bird hat (ogre marksman)'), 95],
	[getItemOrThrow('Chompy bird hat (marksman)'), 125],
	[getItemOrThrow('Chompy bird hat (ogre woodsman)'), 170],
	[getItemOrThrow('Chompy bird hat (woodsman)'), 225],
	[getItemOrThrow('Chompy bird hat (ogre forester)'), 300],
	[getItemOrThrow('Chompy bird hat (forester)'), 400],
	[getItemOrThrow('Chompy bird hat (ogre bowmaster)'), 550],
	[getItemOrThrow('Chompy bird hat (bowmaster)'), 700],
	[getItemOrThrow('Chompy bird hat (ogre expert)'), 1000],
	[getItemOrThrow('Chompy bird hat (expert)'), 1300],
	[getItemOrThrow('Chompy bird hat (ogre dragon archer)'), 1700],
	[getItemOrThrow('Chompy bird hat (dragon archer)'), 2250],
	[getItemOrThrow('Chompy bird hat (expert ogre dragon archer)'), 3000],
	[getItemOrThrow('Chompy bird hat (expert dragon archer)'), 4000]
] as const;

export const toaPurpleItems = resolveItems([
	"Tumeken's guardian",
	"Tumeken's shadow (uncharged)",
	"Elidinis' ward",
	'Masori mask',
	'Masori body',
	'Masori chaps',
	'Lightbearer',
	"Osmumten's fang"
]);

export const doaPurples = resolveItems([
	'Oceanic relic',
	'Oceanic dye',
	'Aquifer aegis',
	'Shark tooth',
	'Shark jaw',
	'Bruce',
	'Pearl',
	'Bluey'
]);

export const ORI_DISABLED_MONSTERS = [
	'The Nightmare',
	"Phosani's Nightmare",
	'Ignecarus',
	'King Goldemar',
	'Kalphite King',
	'Nex',
	'Moktang',
	'Naxxus',
	'Vasa Magus'
] as const;

export enum PeakTier {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

export const minionActivityCache: Map<string, ActivityTaskData> = new Map();

export const ParsedCustomEmojiWithGroups = /(?<animated>a?):(?<name>[^:]+):(?<id>\d{17,20})/;

const globalConfigSchema = z.object({
	clientID: z.string().min(10).max(25),
	botToken: z.string().min(1),
	isCI: z.coerce.boolean().default(false),
	isProduction: z.boolean(),
	timeZone: z.literal('UTC'),
	sentryDSN: z.string().url().optional(),
	adminUserIDs: z.array(z.string()).default(['157797566833098752', '425134194436341760']),
	maxingMessage: z.string().default('Congratulations on maxing!'),
	moderatorLogsChannels: z.string().default(''),
	supportServerID: z.string()
});

dotenv.config({ path: path.resolve(process.cwd(), process.env.TEST ? '.env.test' : '.env') });

if (!process.env.BOT_TOKEN && !process.env.CI) {
	throw new Error(
		`You need to specify the BOT_TOKEN environment variable, copy your bot token from your config.ts and put it in the ".env" file like so:\n\nBOT_TOKEN=your_token_here`
	);
}

export const globalConfig = globalConfigSchema.parse({
	clientID: process.env.CLIENT_ID,
	botToken: process.env.BOT_TOKEN,
	isCI: process.env.CI,
	isProduction,
	timeZone: process.env.TZ,
	sentryDSN: process.env.SENTRY_DSN,

	moderatorLogsChannels: isProduction ? '830145040495411210' : GENERAL_CHANNEL_ID,
	supportServerID: isProduction ? '342983479501389826' : OLDSCHOOLGG_TESTING_SERVER_ID
});

if ((process.env.NODE_ENV === 'production') !== globalConfig.isProduction) {
	throw new Error('The NODE_ENV and isProduction variables must match');
}

export const ONE_TRILLION = 1_000_000_000_000;
export const gloriesInventorySize = 26;
export const gloriesInventoryTime = Time.Minute * 2.2;
export const wealthInventorySize = 26;
export const wealthInventoryTime = Time.Minute * 2.2;
export const discontinuedItems = resolveItems([
	'Turkey',
	'Raw turkey',
	'Burnt turkey',
	'Turkey drumstick',
	'Golden partyhat',
	'Black swan',
	...customItems.filter(i => Items.get(i)?.customItemData?.isDiscontinued)
]);
export function herbertDroprate(herbloreXP: number, itemLevel: number) {
	let petChance = Math.ceil(10_000_000 / (itemLevel * (itemLevel / 5)));
	if (herbloreXP >= MAX_XP) {
		petChance = Math.ceil(petChance / 2);
	}
	return petChance;
}

export const OSB_VIRTUS_IDS = [26_241, 26_243, 26_245];
export const YETI_ID = 129_521;
export const KING_GOLDEMAR_GUARD_ID = 30_913;
export const demonBaneWeapons = resolveItems([
	'Silverlight',
	'Darklight',
	'Arclight',
	'Emberlight',
	'Scorching bow',
	'Purging staff'
]);

export const gitHash = process.env.TEST ? 'TESTGITHASH' : execSync('git rev-parse HEAD').toString().trim();
const gitRemote = BOT_TYPE === 'BSO' ? 'gc/oldschoolbot-secret' : 'oldschoolgg/oldschoolbot';

const GIT_BRANCH = BOT_TYPE === 'BSO' ? 'bso' : 'master';

export const META_CONSTANTS = {
	GIT_HASH: gitHash,
	GITHUB_URL: `https://github.com/${gitRemote}/commit/${gitHash}`,
	STARTUP_DATE: new Date(),
	GIT_DIFF_URL: `https://github.com/${gitRemote}/compare/${gitHash}...${GIT_BRANCH}`,
	RENDERED_STR: ''
};
META_CONSTANTS.RENDERED_STR = `**Date/Time:** ${dateFm(META_CONSTANTS.STARTUP_DATE)}
**Git Hash:** ${META_CONSTANTS.GIT_HASH.slice(0, 7)}
**Commit:** <${META_CONSTANTS.GITHUB_URL}>
**Code Difference:** <${META_CONSTANTS.GIT_DIFF_URL}>`;

export const CHINCANNON_MESSAGES = [
	'Your team received no loot, your Chincannon blew it up!',
	'Oops.. your Chincannon blew up all the loot.',
	'Your Chincannon blew up all the loot!',
	'Your Chincannon turned the loot into dust.'
];

export const masteryKey = BOT_TYPE === 'OSB' ? 'osb_mastery' : 'bso_mastery';

export const ItemIconPacks = [
	{
		name: 'Halloween',
		storeBitfield: StoreBitfield.HalloweenItemIconPack,
		id: 'halloween',
		icons: new Map<number, CanvasImage>()
	}
];

export const patronFeatures = {
	ShowEnteredInGiveawayList: {
		tier: PerkTier.Four
	}
};

export const christmasCakeIngredients = resolveItems([
	'Gingerbread',
	'Grimy salt',
	'Snail oil',
	'Ashy flour',
	'Banana-butter',
	'Fresh rat milk',
	'Pristine chocolate bar',
	'Smokey egg'
]);
export const gearValidationChecks = new Set();

export const BSO_MAX_TOTAL_LEVEL = 3120;

if (!process.env.TEST && isMainThread) {
	console.log(
		`Starting... Git[${gitHash}] ClientID[${globalConfig.clientID}] Production[${globalConfig.isProduction}]`
	);
}
