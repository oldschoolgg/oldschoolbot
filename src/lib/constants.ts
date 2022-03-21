import { MessageButton } from 'discord.js';
import { KlasaMessage } from 'klasa';
import PQueue from 'p-queue';
import { join } from 'path';

import { DISCORD_SETTINGS } from '../config';
import { AbstractCommand, CommandArgs } from '../mahoji/lib/inhibitors';
import { SkillsEnum } from './skilling/types';
import { ActivityTaskOptions } from './types/minions';
import resolveItems from './util/resolveItems';

export const SupportServer = DISCORD_SETTINGS.SupportServer ?? '342983479501389826';
export const BotID = DISCORD_SETTINGS.BotID ?? '303730326692429825';

export const Channel = {
	General: DISCORD_SETTINGS.Channels?.General ?? '342983479501389826',
	Notifications: DISCORD_SETTINGS.Channels?.Notifications ?? '469523207691436042',
	ErrorLogs: DISCORD_SETTINGS.Channels?.ErrorLogs ?? '665678499578904596',
	GrandExchange: DISCORD_SETTINGS.Channels?.GrandExchange ?? '682996313209831435',
	Developers: DISCORD_SETTINGS.Channels?.Developers ?? '648196527294251020',
	BlacklistLogs: DISCORD_SETTINGS.Channels?.BlacklistLogs ?? '782459317218967602',
	EconomyLogs: DISCORD_SETTINGS.Channels?.EconomyLogs ?? '802029843712573510',
	NewSponsors: DISCORD_SETTINGS.Channels?.NewSponsors ?? '806744016309714966',
	HelpAndSupport: DISCORD_SETTINGS.Channels?.HelpAndSupport ?? '668073484731154462',
	TestingMain: DISCORD_SETTINGS.Channels?.TestingMain ?? '680770361893322761',
	BarbarianAssault: DISCORD_SETTINGS.Channels?.BarbarianAssault ?? '789717054902763520',
	ChambersOfXeric: DISCORD_SETTINGS.Channels?.ChambersOfXeric ?? '835876917252587581'
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
	TopSlayer: DISCORD_SETTINGS.Roles?.TopSlayer ?? '856080958247010324'
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
	Join = '<:join:705971600956194907>',
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
	Minigames = '<:minigameIcon:630400565070921761>',
	Skull = '<:Skull:802136963926065165>',
	CombatSword = '<:combat:802136963956080650>',
	OSRSSkull = '<:skull:863392427040440320>',
	SOTWTrophy = '<:SOTWtrophy:842938096097820693>'
}

export const enum ReactionEmoji {
	Join = '705971600956194907',
	Stop = '705972260950769669',
	Start = '705973302719414329'
}

export const enum Image {
	DiceBag = 'https://i.imgur.com/sySQkSX.png'
}

export const enum Color {
	Orange = 16_098_851
}

export const enum Tasks {
	AgilityActivity = 'agilityActivity',
	CookingActivity = 'cookingActivity',
	MonsterActivity = 'monsterActivity',
	GroupMonsterActivity = 'groupMonsterActivity',
	ClueActivity = 'clueActivity',
	FishingActivity = 'fishingActivity',
	MiningActivity = 'miningActivity',
	SmeltingActivity = 'smeltingActivity',
	SmithingActivity = 'smithingActivity',
	WoodcuttingActivity = 'woodcuttingActivity',
	RunecraftActivity = 'runecraftActivity',
	FiremakingActivity = 'firemakingActivity',
	CraftingActivity = 'craftingActivity',
	BuryingActivity = 'buryingActivity',
	OfferingActivity = 'offeringActivity',
	FletchingActivity = 'fletchingActivity',
	FarmingActivity = 'farmingActivity',
	HerbloreActivity = 'herbloreActivity',
	HunterActivity = 'hunterActivity',
	ConstructionActivity = 'constructionActivity',
	QuestingActivity = 'questingActivity',
	FightCavesActivity = 'fightCavesActivity',
	WintertodtActivity = 'wintertodtActivity',
	TemporossActivity = 'temporossActivity',
	AlchingActivity = 'alchingActivity',
	NightmareActivity = 'nightmareActivity',
	AnimatedArmourActivity = 'animatedArmourActivity',
	CyclopsActivity = 'cyclopsActivity',
	SepulchreActivity = 'sepulchreActivity',
	PlunderActivity = 'plunderActivity',
	FishingTrawler = 'trawlerActivity',
	ZalcanoActivity = 'zalcanoActivity',
	SawmillActivity = 'sawmillActivity',
	PickpocketActivity = 'pickpocketActivity',
	Enchanting = 'enchantingActivity',
	Casting = 'castingActivity',
	GloryCharging = 'gloryChargingActivity',
	WealthCharging = 'wealthChargingActivity',
	TitheFarmActivity = 'titheFarmActivity',
	BarbarianAssault = 'barbarianAssaultActivity',
	AgilityArena = 'agilityArenaActivity',
	ChampionsChallenge = 'championsChallengeActivity',
	BirdhouseActivity = 'birdhouseActivity',
	AerialFishingActivity = 'aerialFishingActivity',
	DriftNetActivity = 'driftNetActivity',
	MahoganyHomes = 'mahoganyHomesActivity',
	GnomeRestaurant = 'gnomeRestaurantActivity',
	SoulWars = 'soulWarsActivity',
	RoguesDenMaze = 'roguesDenMazeActivity',
	Gauntlet = 'gauntletActivity',
	CastleWars = 'castleWarsActivity',
	MageArena = 'mageArenaActivity',
	Raids = 'raidsActivity',
	Collecting = 'collectingActivity',
	MageTrainingArena = 'mageTrainingArenaActivity',
	BlastFurnaceActivity = 'blastFurnaceActivity',
	MageArena2 = 'mageArena2Activity',
	BigChompyBirdHunting = 'chompyHuntActivity',
	DarkAltar = 'darkAltarActivity',
	TrekkingActivity = 'templeTrekkingActivity',
	RevenantsActivity = 'revenantsActivity',
	PestControl = 'pestControlActivity',
	VolcanicMine = 'volcanicMineActivity',
	KourendFavour = 'kourendFavourActivity',
	Inferno = 'infernoActivity',
	TearsOfGuthix = 'tearsOfGuthixActivity',
	ToB = 'tobActivity',
	LastManStanding = 'lmsActivity',
	BirthdayEvent = 'birthdayEventActivity',
	TokkulShop = 'tokkulShopActivity'
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

export const rootFolder = join(__dirname, '..', '..', '..');

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
	Six = 6
}

export const enum BitField {
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
	HasSlepeyTablet = 20
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

	[BitField.HasHosidiusWallkit]: { name: 'Hosidius Wall Kit Unlocked', protected: false, userConfigurable: false },
	[BitField.HasDexScroll]: { name: 'Dexterous Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasArcaneScroll]: { name: 'Arcane Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasTornPrayerScroll]: { name: 'Torn Prayer Scroll Used', protected: false, userConfigurable: false },
	[BitField.HasSlepeyTablet]: { name: 'Slepey Tablet Used', protected: false, userConfigurable: false },

	[BitField.BypassAgeRestriction]: { name: 'Bypassed Age Restriction', protected: false, userConfigurable: false },
	[BitField.HasPermanentEventBackgrounds]: {
		name: 'Permanent Event Backgrounds',
		protected: false,
		userConfigurable: false
	},
	[BitField.PermanentIronman]: { name: 'Permanent Ironman', protected: false, userConfigurable: false },

	[BitField.AlwaysSmallBank]: { name: 'Always Use Small Banks', protected: false, userConfigurable: true },
	[BitField.DisabledRandomEvents]: { name: 'Disabled Random Events', protected: false, userConfigurable: true }
} as const;

export const enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216'
}

export const enum BadgesEnum {
	Developer = 0,
	Booster = 1,
	LimitedPatron = 2,
	Patron = 3,
	Moderator = 4,
	GreenGem = 5,
	Bug = 6,
	GoldenTrophy = 7,
	TopSacrifice = 8,
	TopSkiller = 9,
	TopCollector = 10,
	TopMinigame = 11,
	SotWTrophy = 12
}

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

export const MAX_QP = 284;
export const MAX_XP = 200_000_000;

export const MIMIC_MONSTER_ID = 23_184;

export const continuationChars = 'abdefghjknoprstuvwxyz123456789'.split('');
export const CENA_CHARS = ['​', '‎', '‍'];
export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
export const TWEETS_RATELIMITING =
	'Tweets in Old School Bot can only be enabled in servers with more than 20 members, or by Tier 3 Patrons - this is due to ratelimiting issues.' +
	'You can consider checking tweets in another server, or becoming a patron. Apologies for the inconvenience.';
export const HERBIBOAR_ID = 36;
export const RAZOR_KEBBIT_ID = 35;
export const BLACK_CHIN_ID = 9;
export const ZALCANO_ID = 9049;
export const NIGHTMARE_ID = 9415;
export const HESPORI_ID = 8583;

/**
 * Map<user_id, PromiseQueue>
 */
export const userQueues: Map<string, PQueue> = new Map();

export const bankImageCache = new Map<string, string>();

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
	combat: '<:combat:802136963956080650>'
};

export const LEVEL_99_XP = 13_034_431;
export const MAX_LEVEL = 99;
export const MAX_TOTAL_LEVEL = Object.values(SkillsEnum).length * MAX_LEVEL;
export const SILENT_ERROR = 'SILENT_ERROR';

export const informationalButtons = [
	new MessageButton().setLabel('Wiki').setEmoji('📰').setURL('https://wiki.oldschool.gg/').setStyle('LINK'),
	new MessageButton()
		.setLabel('Patreon')
		.setEmoji('679334888792391703')
		.setURL('https://www.patreon.com/oldschoolbot')
		.setStyle('LINK'),
	new MessageButton()
		.setLabel('Support Server')
		.setEmoji('778418736180494347')
		.setURL('https://www.discord.gg/ob')
		.setStyle('LINK'),
	new MessageButton()
		.setLabel('Bot Invite')
		.setEmoji('🤖')
		.setURL('http://www.oldschool.gg/invite/osb')
		.setStyle('LINK')
];

export const lastTripCache = new Map<
	string,
	{ continue: (message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>; data: ActivityTaskOptions }
>();

export const PATRON_ONLY_GEAR_SETUP =
	'Sorry - but the `other` gear setup is only available for Tier 3 Patrons (and higher) to use.';

export type ProjectileType = 'arrow' | 'bolt';
export const projectiles: Record<ProjectileType, number[]> = {
	arrow: resolveItems(['Adamant arrow', 'Rune arrow', 'Amethyst arrow', 'Dragon arrow']),
	bolt: resolveItems(['Runite bolts', 'Dragon bolts', 'Diamond bolts (e)', 'Diamond dragon bolts (e)'])
};

export const BOT_TYPE: 'BSO' | 'OSB' = 'OSB';
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

export const COMMAND_BECAME_SLASH_COMMAND_MESSAGE = (
	msg: KlasaMessage,
	commandName?: string
) => `This command you're trying to use, has been changed to a 'slash command'.

- Slash commands are integrated into the actual Discord client. We are *required* to change our commands to be slash commands.
- Slash commands are generally easier to use, and also have new features like autocompletion. They take some time to get used to though.
- You no longer use this command using \`${msg.cmdPrefix}${commandName ?? msg.command?.name}\`, now you use: \`/${
	commandName ?? msg.command?.name
}\`
`;

export const DISABLED_COMMANDS = new Set<string>();
export const PVM_METHODS = ['barrage', 'cannon', 'burst', 'none'] as const;
export type PvMMethod = typeof PVM_METHODS[number];
