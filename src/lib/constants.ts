import { execSync } from 'node:child_process';
import path from 'node:path';
import { isMainThread } from 'node:worker_threads';
import { Emoji } from '@oldschoolgg/toolkit/constants';
import { type CommandOptions, PerkTier, StoreBitfield, dateFm } from '@oldschoolgg/toolkit/util';
import type { Prisma } from '@prisma/client';
import type { APIInteractionDataResolvedChannel, APIRole } from 'discord.js';
import * as dotenv from 'dotenv';
import { convertLVLtoXP, resolveItems } from 'oldschooljs';
import { z } from 'zod';

import type { AbstractCommand } from '../mahoji/lib/inhibitors';
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

export enum ActivityGroup {
	Skilling = 'Skilling',
	Clue = 'Clue',
	Monster = 'Monster',
	Minigame = 'Minigame'
}

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
	DisableTearsOfGuthixButton = 43,
	DisableDailyButton = 44,

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
	[BitField.DisableTearsOfGuthixButton]: {
		name: 'Disable Tears of Guthix Trip Button',
		protected: false,
		userConfigurable: true
	},
	[BitField.DisableDailyButton]: {
		name: 'Disable Minion Daily Button',
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
export const LEVEL_120_XP = convertLVLtoXP(120);
export const LEVEL_99_XP = 13_034_431;
export const MAX_LEVEL = BOT_TYPE === 'OSB' ? 99 : 120;
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
	ogreArrow: {
		items: resolveItems(['Ogre Arrow']),
		savedByAvas: true,
		weapons: resolveItems(['Ogre bow'])
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

export const DISABLED_COMMANDS = new Set<string>();

export const NMZ_STRATEGY = ['experience', 'points'] as const;
export type NMZStrategy = (typeof NMZ_STRATEGY)[number];

export const busyImmuneCommands = ['admin', 'rp'];

export const FormattedCustomEmoji = /<a?:\w{2,32}:\d{17,20}>/;

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

if (!process.env.TEST && isMainThread) {
	console.log(
		`Starting... Git[${gitHash}] ClientID[${globalConfig.clientID}] Production[${globalConfig.isProduction}]`
	);
}
