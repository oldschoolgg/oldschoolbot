import { Prisma } from '@prisma/client';
import {
	APIButtonComponent,
	APIInteractionDataResolvedChannel,
	APIRole,
	ButtonBuilder,
	ButtonStyle,
	ComponentType
} from 'discord.js';
import { Time } from 'e';
import { CommandOptions } from 'mahoji/dist/lib/types';
import { convertLVLtoXP } from 'oldschooljs/dist/util/util';

import { DISCORD_SETTINGS } from '../config';
import { AbstractCommand, CommandArgs } from '../mahoji/lib/inhibitors';
import { SkillsEnum } from './skilling/types';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

export const BotID = DISCORD_SETTINGS.BotID ?? '729244028989603850';

export const Channel = {
	General: DISCORD_SETTINGS.Channels?.General ?? '342983479501389826',
	Notifications: DISCORD_SETTINGS.Channels?.Notifications ?? '811589869314899980',
	ErrorLogs: DISCORD_SETTINGS.Channels?.ErrorLogs ?? '665678499578904596',
	GrandExchange: DISCORD_SETTINGS.Channels?.GrandExchange ?? '738780181946171493',
	Developers: DISCORD_SETTINGS.Channels?.Developers ?? '648196527294251020',
	BlacklistLogs: DISCORD_SETTINGS.Channels?.BlacklistLogs ?? '782459317218967602',
	EconomyLogs: DISCORD_SETTINGS.Channels?.EconomyLogs ?? '802029843712573510',
	NewSponsors: DISCORD_SETTINGS.Channels?.NewSponsors ?? '806744016309714966',
	HelpAndSupport: '970752140324790384',
	TestingMain: DISCORD_SETTINGS.Channels?.TestingMain ?? '680770361893322761',
	// BSO Channels
	BSOGeneral: DISCORD_SETTINGS.Channels?.BSOGeneral ?? '792691343284764693',
	BSOChannel: DISCORD_SETTINGS.Channels?.BSOChannel ?? '732207379818479756',
	BSOGambling: DISCORD_SETTINGS.Channels?.BSOChannel ?? '792692390778896424',
	BSOGrandExchange: DISCORD_SETTINGS.Channels?.BSOChannel ?? '738780181946171493'
};

export const Roles = {
	Booster: DISCORD_SETTINGS.Roles?.Booster ?? '665908237152813057',
	Contributor: DISCORD_SETTINGS.Roles?.Contributor ?? '456181501437018112',
	Moderator: DISCORD_SETTINGS.Roles?.Moderator ?? '622806157563527178',
	PatronTier1: DISCORD_SETTINGS.Roles?.PatronTier1 ?? '678970545789730826',
	PatronTier2: DISCORD_SETTINGS.Roles?.PatronTier2 ?? '678967943979204608',
	PatronTier3: DISCORD_SETTINGS.Roles?.PatronTier3 ?? '687408140832342043',
	Patron: DISCORD_SETTINGS.Roles?.Patron ?? '679620175838183424',
	MassHoster: DISCORD_SETTINGS.Roles?.MassHoster ?? '734055552933429280',
	BSOMassHoster: DISCORD_SETTINGS.Roles?.BSOMassHoster ?? '759572886364225558',
	TopSkiller: DISCORD_SETTINGS.Roles?.TopSkiller ?? '848966830617788427',
	TopCollector: DISCORD_SETTINGS.Roles?.TopCollector ?? '848966773885763586',
	TopSacrificer: DISCORD_SETTINGS.Roles?.TopSacrificer ?? '848966732265160775',
	TopMinigamer: DISCORD_SETTINGS.Roles?.TopMinigamer ?? '867967884515770419',
	TopClueHunter: DISCORD_SETTINGS.Roles?.TopClueHunter ?? '848967350120218636',
	TopSlayer: DISCORD_SETTINGS.Roles?.TopSlayer ?? '867967551819358219',
	TopInventor: '992799099801833582',
	TopLeagues: '1005417171112972349'
};

export const enum DefaultPingableRoles {
	// Tester roles:
	Tester = '682052620809928718',
	BSOTester = '829368646182371419',
	// Mass roles:
	BSOMass = '759573020464906242'
}

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
	Dungeoneering = '<:dungeoneering:828683755198873623>',
	Gear = '<:gear:835314891950129202>',
	Slayer = '<:slayer:630911040560824330>',
	SlayerMasterCape = '<:slayerMasterCape:869497600284459008>',
	RunecraftMasterCape = '<:runecraftMasterCape:869497600997470258>',
	Flappy = '<:Flappy:884799334737129513>',
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
	BSO = '<:BSO:863823820435619890>'
}

export enum ActivityGroup {
	Skilling = 'Skilling',
	Clue = 'Clue',
	Monster = 'Monster',
	Minigame = 'Minigame'
}

export const enum Events {
	Debug = 'debug',
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
	HasGivenBirthdayPack = 200,
	HasPermanentSpawnLamp = 201,
	HasScrollOfFarming = 202,
	HasScrollOfLongevity = 203,
	HasScrollOfTheHunt = 204,
	HasBananaEnchantmentScroll = 205,
	HasDaemonheimAgilityPass = 206,
	DisabledGorajanBoneCrusher = 207,
	HasLeaguesOneMinuteLengthBoost = 208
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
	[BadgesEnum.SotWTrophy]: Emoji.SOTW
};

export const MAX_REAL_QP = 290;
export const MAX_QP = 5000;
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

export const skillEmoji = {
	runecraft: '<:runecraft:630911040435257364>',
	firemaking: '<:firemaking:630911040175210518>',
	thieving: '<:thieving:630910829352452123>',
	mining: '<:mining:630911040128811010>',
	ranged: '<:ranged:630911040258834473>',
	construction: '<:construction:630911040493715476>',
	smithing: '<:smithing:630911040452034590>',
	herblore: '<:herblore:630911040535658496>',
	attack: '<:attack:630911039969427467>',
	strength: '<:strength:630911040481263617>',
	defence: '<:defence:630911040393052180>',
	fishing: '<:fishing:630911040091193356>',
	hitpoints: '<:hitpoints:630911040460292108>',
	total: '<:xp:630911040510623745>',
	overall: '<:xp:630911040510623745>',
	magic: '<:magic:630911040334331917>',
	crafting: '<:crafting:630911040460161047>',
	agility: '<:agility:630911040355565568>',
	fletching: '<:fletching:630911040544309258>',
	cooking: '<:cooking:630911040426868756>',
	farming: '<:farming:630911040355565599>',
	slayer: '<:slayer:630911040560824330>',
	prayer: '<:prayer:630911040426868746>',
	woodcutting: '<:woodcutting:630911040099450892>',
	hunter: '<:hunter:630911040166559784>',
	cml: '<:CrystalMathLabs:364657225249062912>',
	clock: '<:ehpclock:352323705210142721>',
	combat: '<:combat:802136963956080650>',
	dungeoneering: '<:dungeoneering:828683755198873623>',
	invention: '<:Invention:936219232146980874>'
};

export const LEVEL_99_XP = convertLVLtoXP(99);
export const LEVEL_120_XP = convertLVLtoXP(120);
export const MAX_LEVEL = 120;
export const MAX_TOTAL_LEVEL = Object.values(SkillsEnum).length * MAX_LEVEL;
export const SILENT_ERROR = 'SILENT_ERROR';

const buttonSource = [
	{
		label: 'Wiki',
		emoji: '802136964027121684',
		url: 'https://bso-wiki.oldschool.gg/'
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
		url: 'http://www.oldschool.gg/invite/bso'
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

export const BOT_TYPE: 'BSO' | 'OSB' = 'BSO';

export const scaryEatables = [
	{
		item: getOSItem('Candy teeth'),
		healAmount: 3
	},
	{
		item: getOSItem('Toffeet'),
		healAmount: 5
	},
	{
		item: getOSItem('Chocolified skull'),
		healAmount: 8
	},
	{
		item: getOSItem('Rotten sweets'),
		healAmount: 9
	},
	{
		item: getOSItem('Hairyfloss'),
		healAmount: 12
	},
	{
		item: getOSItem('Eyescream'),
		healAmount: 13
	},
	{
		item: getOSItem('Goblinfinger soup'),
		healAmount: 20
	},
	{
		item: getOSItem("Benny's brain brew"),
		healAmount: 50
	},
	{
		item: getOSItem('Roasted newt'),
		healAmount: 120
	}
];

export type ProjectileType = 'arrow' | 'bolt';
export const projectiles: Record<ProjectileType, number[]> = {
	arrow: resolveItems(['Adamant arrow', 'Rune arrow', 'Amethyst arrow', 'Dragon arrow', 'Hellfire arrow']),
	bolt: resolveItems([
		'Runite bolts',
		'Dragon bolts',
		'Diamond bolts (e)',
		'Diamond dragon bolts (e)',
		'Ruby dragon bolts (e)'
	])
};

export const PHOSANI_NIGHTMARE_ID = 9416;

export const COMMANDS_TO_NOT_TRACK = [['minion', ['k', 'kill', 'clue', 'info']]];
export function shouldTrackCommand(command: AbstractCommand, args: CommandArgs) {
	if (!Array.isArray(args)) return true;
	for (const [name, subs] of COMMANDS_TO_NOT_TRACK) {
		if (command.name === name && typeof args[0] === 'string' && subs.includes(args[0])) {
			return false;
		}
	}
	return true;
}

function compressMahojiArgs(options: CommandArgs) {
	let newOptions: Record<string, string | number | boolean | null | undefined> = {};
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
	args: CommandArgs
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (Array.isArray(args) && args.length === 0) return undefined;
	if (!Array.isArray(args) && Object.keys(args).length === 0) return undefined;
	if (commandName === 'bank') return undefined;
	if (commandName === 'rp' && Array.isArray(args) && ['c', 'eval'].includes(args[0] as string)) return undefined;
	return (Array.isArray(args) ? args : compressMahojiArgs(args)) as Prisma.InputJsonObject | Prisma.InputJsonArray;
}
export const GLOBAL_BSO_XP_MULTIPLIER = 5;

export const DISABLED_COMMANDS = new Set<string>();
export const PVM_METHODS = ['barrage', 'cannon', 'burst', 'none'] as const;
export type PvMMethod = typeof PVM_METHODS[number];
export const usernameCache = new Map<string, string>();
export const minionBuyButton = new ButtonBuilder()
	.setCustomId('BUY_MINION')
	.setLabel('Buy Minion')
	.setStyle(ButtonStyle.Success);
export const FormattedCustomEmoji = /<a?:\w{2,32}:\d{17,20}>/;
