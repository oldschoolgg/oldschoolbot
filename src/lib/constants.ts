import path from 'node:path';

import { execSync } from 'child_process';
import { APIButtonComponent, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import * as dotenv from 'dotenv';
import { CommandOptions } from 'mahoji/dist/lib/types';
import { z } from 'zod';

import { DISCORD_SETTINGS, production } from '../config';
import type { AbstractCommand } from '../mahoji/lib/inhibitors';
import { SkillsEnum } from './skilling/types';
import type { ActivityTaskData } from './types/minions';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';
import { dateFm } from './util/smallUtils';

export const BotID = DISCORD_SETTINGS.BotID ?? '303730326692429825';

const TestingMainChannelID = DISCORD_SETTINGS.Channels?.TestingMain ?? '940760643525570591';

export const BOT_TYPE: 'BSO' | 'OSB' = 'OSB' as 'BSO' | 'OSB';

export const Channel = {
	General: DISCORD_SETTINGS.Channels?.General ?? '342983479501389826',
	Notifications: production ? '469523207691436042' : '1042760447830536212',
	GrandExchange: DISCORD_SETTINGS.Channels?.GrandExchange ?? '682996313209831435',
	Developers: DISCORD_SETTINGS.Channels?.Developers ?? '648196527294251020',
	BlacklistLogs: DISCORD_SETTINGS.Channels?.BlacklistLogs ?? '782459317218967602',
	EconomyLogs: DISCORD_SETTINGS.Channels?.EconomyLogs ?? '802029843712573510',
	PatronLogs: '806744016309714966',
	HelpAndSupport: '668073484731154462',
	TestingMain: TestingMainChannelID,
	BarbarianAssault: DISCORD_SETTINGS.Channels?.BarbarianAssault ?? '789717054902763520',
	ChambersOfXeric: DISCORD_SETTINGS.Channels?.ChambersOfXeric ?? '835876917252587581',
	BotLogs: production ? '1051725977320964197' : TestingMainChannelID,
	GeneralChannel:
		BOT_TYPE === 'OSB'
			? production
				? '346304390858145792'
				: '1154056119019393035'
			: production
			? '792691343284764693'
			: '1154056119019393035'
};

export const Roles = {
	Booster: DISCORD_SETTINGS.Roles?.Booster ?? '665908237152813057',
	Contributor: DISCORD_SETTINGS.Roles?.Contributor ?? '456181501437018112',
	Moderator: DISCORD_SETTINGS.Roles?.Moderator ?? '622806157563527178',
	PatronTier1: DISCORD_SETTINGS.Roles?.PatronTier1 ?? '678970545789730826',
	PatronTier2: DISCORD_SETTINGS.Roles?.PatronTier2 ?? '678967943979204608',
	PatronTier3: DISCORD_SETTINGS.Roles?.PatronTier3 ?? '687408140832342043',
	Patron: DISCORD_SETTINGS.Roles?.Patron ?? '679620175838183424',
	Testers: DISCORD_SETTINGS.Roles?.Tester ?? '682052620809928718',
	MassHoster: DISCORD_SETTINGS.Roles?.MassHoster ?? '734055552933429280',
	Mass: DISCORD_SETTINGS.Roles?.Mass ?? '711215501543473182',
	BarbarianAssaultMass: DISCORD_SETTINGS.Roles?.BarbarianAssaultMass ?? '789724904885846016',
	ChambersOfXericMass: DISCORD_SETTINGS.Roles?.ChambersOfXericMass ?? '836539487815204865',
	// Top Roles
	TopSkiller: DISCORD_SETTINGS.Roles?.TopSkiller ?? '795266465329709076',
	TopCollector: DISCORD_SETTINGS.Roles?.TopCollector ?? '795271210141351947',
	TopSacrificer: DISCORD_SETTINGS.Roles?.TopSacrificer ?? '795933981715464192',
	TopMinigamer: DISCORD_SETTINGS.Roles?.TopMinigamer ?? '832798997033779220',
	TopClueHunter: DISCORD_SETTINGS.Roles?.TopClueHunter ?? '839135887467610123',
	TopSlayer: DISCORD_SETTINGS.Roles?.TopSlayer ?? '856080958247010324',
	TopGlobalCL: '1072426869028294747'
};

export const enum Emoji {
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
	Gear = '<:gear:835314891950129202>',
	Slayer = '<:slayer:630911040560824330>',
	CombatAchievements = '<:combatAchievements:1145015804040065184>',
	Stopwatch = '⏱️',
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
	OSRSSkull = '<:skull:863392427040440320>',
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

export const enum Events {
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

export const enum PerkTier {
	/**
	 * Boosters
	 */
	One = 1,
	/**
	 * Tier 1 Patron
	 */
	Two = 2,
	/**
	 * Tier 2 Patron, Contributors, Mods
	 */
	Three = 3,
	/**
	 * Tier 3 Patron
	 */
	Four = 4,
	/**
	 * Tier 4 Patron
	 */
	Five = 5,
	/**
	 * Tier 5 Patron
	 */
	Six = 6,
	/**
	 * Tier 6 Patron
	 */
	Seven = 7
}

export enum BitField {
	IsPatronTier1 = 2,
	IsPatronTier2 = 3,
	IsPatronTier3 = 4,
	IsPatronTier4 = 5,
	IsPatronTier5 = 6,
	isModerator = 7,
	isContributor = 8,
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
	IsWikiContributor = 19,
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
	DisabledDailyReminders = 38
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
	[BitField.IsWikiContributor]: { name: 'Wiki Contributor', protected: true, userConfigurable: false },
	[BitField.isModerator]: { name: 'Moderator', protected: true, userConfigurable: false },
	[BitField.isContributor]: { name: 'Contributor', protected: true, userConfigurable: false },

	[BitField.HasPermanentTierOne]: { name: 'Permanent Tier 1', protected: false, userConfigurable: false },
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
	[BitField.HasBloodbarkScroll]: { name: 'Runescroll of bloodbark Used', protected: false, userConfigurable: false },
	[BitField.HasSwampbarkScroll]: { name: 'Runescroll of swampbark Used', protected: false, userConfigurable: false },
	[BitField.HasSaradominsLight]: { name: "Saradomin's light Used", protected: false, userConfigurable: false },
	[BitField.HadAllSlayerUnlocks]: { name: 'Had All Slayer Unlocks', protected: false, userConfigurable: false },
	[BitField.UsedScarredTablet]: { name: 'Used Scarred Tablet', protected: false, userConfigurable: false },
	[BitField.UsedFrozenTablet]: { name: 'Used Frozen Tablet', protected: false, userConfigurable: false },
	[BitField.UsedSirenicTablet]: { name: 'Used Sirenic Tablet', protected: false, userConfigurable: false },
	[BitField.UsedStrangledTablet]: { name: 'Used Strangled Tablet', protected: false, userConfigurable: false },
	[BitField.SelfGamblingLocked]: { name: 'Self Gambling Lock', protected: false, userConfigurable: false },

	[BitField.BypassAgeRestriction]: { name: 'Bypassed Age Restriction', protected: false, userConfigurable: false },
	[BitField.HasPermanentEventBackgrounds]: {
		name: 'Permanent Event Backgrounds',
		protected: false,
		userConfigurable: false
	},
	[BitField.PermanentIronman]: { name: 'Permanent Ironman', protected: false, userConfigurable: false },
	[BitField.BothBotsMaxedFreeTierOnePerks]: {
		name: 'Free T1 Perks for Maxed in OSB/BSO',
		protected: false,
		userConfigurable: false
	},

	[BitField.AlwaysSmallBank]: { name: 'Always Use Small Banks', protected: false, userConfigurable: true },
	[BitField.DisabledRandomEvents]: { name: 'Disabled Random Events', protected: false, userConfigurable: true },
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
	[BitField.DisabledDailyReminders]: {
		name: 'Disable Daily Reminder DMs',
		protected: false,
		userConfigurable: true
	}
} as const;

export const enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216',
	Six = '8091554'
}

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
	SotWTrophy: 12
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
	[BadgesEnum.SotWTrophy]: Emoji.SOTWTrophy
};

export const MAX_XP = 200_000_000;

export const MIMIC_MONSTER_ID = 23_184;

export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
export const HERBIBOAR_ID = 36;
export const RAZOR_KEBBIT_ID = 35;
export const BLACK_CHIN_ID = 9;
export const ZALCANO_ID = 9049;
export const NIGHTMARE_ID = 9415;
export const NEX_ID = 11_278;

export const LEVEL_99_XP = 13_034_431;
export const MAX_LEVEL = 99;
export const MAX_TOTAL_LEVEL = Object.values(SkillsEnum).length * MAX_LEVEL;
export const SILENT_ERROR = 'SILENT_ERROR';

const buttonSource = [
	{
		label: 'Wiki',
		emoji: '802136964027121684',
		url: 'https://wiki.oldschool.gg/'
	},
	{
		label: 'Patreon',
		emoji: '679334888792391703',
		url: 'https://www.patreon.com/oldschoolbot'
	},
	{
		label: 'Support Server',
		emoji: '778418736180494347',
		url: 'https://www.discord.gg/ob'
	},
	{
		label: 'Bot Invite',
		emoji: '778418736180494347',
		url: 'http://www.oldschool.gg/invite/osb'
	}
];

export const informationalButtons = buttonSource.map(i =>
	new ButtonBuilder().setLabel(i.label).setEmoji(i.emoji).setURL(i.url).setStyle(ButtonStyle.Link)
);
export const mahojiInformationalButtons: APIButtonComponent[] = buttonSource.map(i => ({
	type: ComponentType.Button,
	label: i.label,
	emoji: { id: i.emoji },
	style: ButtonStyle.Link,
	url: i.url
}));

export const PATRON_ONLY_GEAR_SETUP =
	'Sorry - but the `other` gear setup is only available for Tier 3 Patrons (and higher) to use.';

export const projectiles = {
	arrow: {
		items: resolveItems(['Adamant arrow', 'Rune arrow', 'Amethyst arrow', 'Dragon arrow']),
		savedByAvas: true,
		weapons: resolveItems(['Twisted bow'])
	},
	bolt: {
		items: resolveItems([
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
		items: resolveItems(['Amethyst javelin', 'Rune javelin', 'Dragon javelin']),
		savedByAvas: false,
		weapons: resolveItems(['Heavy ballista'])
	}
} as const;
export type ProjectileType = keyof typeof projectiles;

export const PHOSANI_NIGHTMARE_ID = 9416;
export const COMMANDS_TO_NOT_TRACK = [['minion', ['k', 'kill', 'clue', 'info']]];
export function shouldTrackCommand(command: AbstractCommand, args: CommandOptions) {
	if (!Array.isArray(args)) return true;
	for (const [name, subs] of COMMANDS_TO_NOT_TRACK) {
		if (command.name === name && typeof args[0] === 'string' && subs.includes(args[0])) {
			return false;
		}
	}
	return true;
}

export const DISABLED_COMMANDS = new Set<string>();
export const PVM_METHODS = ['barrage', 'cannon', 'burst', 'chinning', 'none'] as const;
export type PvMMethod = (typeof PVM_METHODS)[number];

export const NMZ_STRATEGY = ['experience', 'points'] as const;
export type NMZStrategy = (typeof NMZ_STRATEGY)[number];

export const UNDERWATER_AGILITY_THIEVING_TRAINING_SKILL = ['agility', 'thieving', 'agility+thieving'] as const;
export type UnderwaterAgilityThievingTrainingSkill = (typeof UNDERWATER_AGILITY_THIEVING_TRAINING_SKILL)[number];

export const busyImmuneCommands = ['admin', 'rp'];
export const usernameCache = new Map<string, string>();
export const badgesCache = new Map<string, string>();
export const minionBuyButton = new ButtonBuilder()
	.setCustomId('BUY_MINION')
	.setLabel('Buy Minion')
	.setStyle(ButtonStyle.Success);
export const FormattedCustomEmoji = /<a?:\w{2,32}:\d{17,20}>/;

export const chompyHats = [
	[getOSItem('Chompy bird hat (ogre bowman)'), 30],
	[getOSItem('Chompy bird hat (bowman)'), 40],
	[getOSItem('Chompy bird hat (ogre yeoman)'), 50],
	[getOSItem('Chompy bird hat (yeoman)'), 70],
	[getOSItem('Chompy bird hat (ogre marksman)'), 95],
	[getOSItem('Chompy bird hat (marksman)'), 125],
	[getOSItem('Chompy bird hat (ogre woodsman)'), 170],
	[getOSItem('Chompy bird hat (woodsman)'), 225],
	[getOSItem('Chompy bird hat (ogre forester)'), 300],
	[getOSItem('Chompy bird hat (forester)'), 400],
	[getOSItem('Chompy bird hat (ogre bowmaster)'), 550],
	[getOSItem('Chompy bird hat (bowmaster)'), 700],
	[getOSItem('Chompy bird hat (ogre expert)'), 1000],
	[getOSItem('Chompy bird hat (expert)'), 1300],
	[getOSItem('Chompy bird hat (ogre dragon archer)'), 1700],
	[getOSItem('Chompy bird hat (dragon archer)'), 2250],
	[getOSItem('Chompy bird hat (expert ogre dragon archer)'), 3000],
	[getOSItem('Chompy bird hat (expert dragon archer)'), 4000]
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

export enum PeakTier {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

export const minionActivityCache: Map<string, ActivityTaskData> = new Map();

export const ParsedCustomEmojiWithGroups = /(?<animated>a?):(?<name>[^:]+):(?<id>\d{17,20})/;

const globalConfigSchema = z.object({
	patreonToken: z.coerce.string().default(''),
	patreonCampaignID: z.coerce.number().int().default(1),
	patreonWebhookSecret: z.coerce.string().default(''),
	httpPort: z.coerce.number().int().default(8080),
	clientID: z.string().min(15).max(25),
	geAdminChannelID: z.string().default('')
});
dotenv.config({ path: path.resolve(process.cwd(), process.env.TEST ? '.env.example' : '.env') });

export const globalConfig = globalConfigSchema.parse({
	patreonToken: process.env.PATREON_TOKEN,
	patreonCampaignID: process.env.PATREON_CAMPAIGN_ID,
	patreonWebhookSecret: process.env.PATREON_WEBHOOK_SECRET,
	httpPort: process.env.HTTP_PORT,
	clientID: process.env.CLIENT_ID,
	geAdminChannelID: process.env.GE_ADMIN_CHANNEL_ID
});

export const ONE_TRILLION = 1_000_000_000_000;
export const demonBaneWeapons = resolveItems(['Silverlight', 'Darklight', 'Arclight']);

const gitHash = execSync('git rev-parse HEAD').toString().trim();
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
