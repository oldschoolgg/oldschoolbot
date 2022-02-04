import { MessageButton } from 'discord.js';
import { Time } from 'e';
import { Command, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';
import PQueue from 'p-queue';
import { join } from 'path';

import { DISCORD_SETTINGS } from '../config';
import { AbstractCommand, CommandArgs } from '../mahoji/lib/inhibitors';
import { UserSettings } from './settings/types/UserSettings';
import { SkillsEnum } from './skilling/types';
import { ActivityTaskOptions } from './types/minions';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

export const SupportServer = DISCORD_SETTINGS.SupportServer ?? '342983479501389826';
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
	HelpAndSupport: DISCORD_SETTINGS.Channels?.HelpAndSupport ?? '668073484731154462',
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
	TopSlayer: DISCORD_SETTINGS.Roles?.TopSlayer ?? '867967551819358219'
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
	BirthdayPresent = '<:birthdayPresent:680041979710668880>',
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
	Dungeoneering = '<:dungeoneering:828683755198873623>',
	Gear = '<:gear:835314891950129202>',
	Slayer = '<:slayer:630911040560824330>',
	SlayerMasterCape = '<:slayerMasterCape:869497600284459008>',
	RunecraftMasterCape = '<:runecraftMasterCape:869497600997470258>',
	Flappy = '<:Flappy:884799334737129513>',
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
	SOTW = '<:SOTWtrophy:842938096097820693>',
	OSRSSkull = '<:skull:863392427040440320>'
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
	RaidsActivity = 'raidsActivity',
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
	NexActivity = 'nexActivity',
	GnomeRestaurant = 'gnomeRestaurantActivity',
	SoulWars = 'soulWarsActivity',
	RoguesDenMaze = 'roguesDenMazeActivity',
	KalphiteKing = 'kalphiteKingActivity',
	Gauntlet = 'gauntletActivity',
	Dungeoneering = 'dungeoneeringActivity',
	CastleWars = 'castleWarsActivity',
	MageArena = 'mageArenaActivity',
	Collecting = 'collectingActivity',
	MageTrainingArena = 'mageTrainingArenaActivity',
	BlastFurnaceActivity = 'blastFurnaceActivity',
	MageArena2 = 'mageArena2Activity',
	BigChompyBirdHunting = 'chompyHuntActivity',
	KingGoldemar = 'kingGoldemarActivity',
	VasaMagus = 'vasaMagusActivity',
	OuraniaDeliveryService = 'ouraniaDeliveryServiceActivity',
	DarkAltar = 'darkAltarActivity',
	Ignecarus = 'ignecarusActivity',
	TrekkingActivity = 'templeTrekkingActivity',
	KibbleActivity = 'kibbleActivity',
	RevenantsActivity = 'revenantsActivity',
	PestControl = 'pestControlActivity',
	VolcanicMine = 'volcanicMineActivity',
	MonkeyRumble = 'monkeyRumbleActivity',
	TrickOrTreat = 'trickOrTreatActivity',
	BossEvent = 'bossEventActivity',
	KourendFavour = 'kourendFavourActivity',
	Inferno = 'infernoActivity',
	ToB = 'tobActivity',
	FishingContest = 'fishingContestActivity',
	TearsOfGuthix = 'tearsOfGuthixActivity'
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
	HasGivenBirthdayPresent = 1,
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
	HasGivenBirthdayPack = 200,
	HasPermanentSpawnLamp = 201,
	HasScrollOfFarming = 202,
	HasScrollOfLongevity = 203,
	HasScrollOfTheHunt = 204,
	HasBananaEnchantmentScroll = 205,
	HasDaemonheimAgilityPass = 206
}

interface BitFieldData {
	name: string;
}

export const BitFieldData: Partial<Record<BitField, BitFieldData>> = {
	[BitField.IsPatronTier1]: { name: 'Tier 1 Patron' },
	[BitField.IsPatronTier2]: { name: 'Tier 2 Patron' },
	[BitField.IsPatronTier3]: { name: 'Tier 3 Patron' },
	[BitField.IsPatronTier4]: { name: 'Tier 4 Patron' },
	[BitField.IsPatronTier5]: { name: 'Tier 5 Patron' },
	[BitField.isModerator]: { name: 'Moderator' },
	[BitField.isContributor]: { name: 'Contributor' },
	[BitField.BypassAgeRestriction]: { name: 'Bypassed Age Restriction' },
	[BitField.HasHosidiusWallkit]: { name: 'Hosidius Wall Kit Unlocked' },
	[BitField.HasPermanentEventBackgrounds]: { name: 'Permanent Event Backgrounds' },
	[BitField.HasPermanentTierOne]: { name: 'Permanent Tier 1' },
	[BitField.HasPermanentSpawnLamp]: { name: 'Permanent Spawn Lamp' },
	[BitField.PermanentIronman]: { name: 'Permanent Ironman' },
	[BitField.AlwaysSmallBank]: { name: 'Always Use Small Banks' },
	[BitField.IsWikiContributor]: { name: 'Wiki Contributor' }
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
	[BadgesEnum.SotWTrophy]: Emoji.SOTW
};

export const MAX_REAL_QP = 284;
export const MAX_QP = 5000;
export const MAX_XP = 5_000_000_000;

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
export const MIN_LENGTH_FOR_PET = Time.Minute * 5;
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
	combat: '<:combat:802136963956080650>',
	dungeoneering: '<:dungeoneering:828683755198873623>'
};

export const LEVEL_99_XP = convertLVLtoXP(99);
export const LEVEL_120_XP = convertLVLtoXP(120);
export const MAX_LEVEL = 120;
export const MAX_TOTAL_LEVEL = Object.values(SkillsEnum).length * MAX_LEVEL;
export const SILENT_ERROR = 'SILENT_ERROR';

export const informationalButtons = [
	new MessageButton().setLabel('Wiki').setEmoji('📰').setURL('https://wiki.oldschool.gg/').setStyle('LINK'),
	new MessageButton()
		.setLabel('Wiki')
		.setEmoji('863823820435619890')
		.setURL('https://bso-wiki.oldschool.gg/')
		.setStyle('LINK'),
	new MessageButton()
		.setLabel('Patreon')
		.setEmoji('679334888792391703')
		.setURL('https://www.patreon.com/oldschoolbot')
		.setStyle('LINK'),
	new MessageButton()
		.setLabel('Bot Invite')
		.setEmoji('🤖')
		.setURL('http://www.oldschool.gg/invite/bso')
		.setStyle('LINK')
];

export const lastTripCache = new Map<
	string,
	{ continue: (message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>; data: ActivityTaskOptions }
>();

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

export function getScaryFoodFromBank(userBank: Bank, totalHealingNeeded: number): false | Bank {
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove = new Bank();

	const sorted = [...scaryEatables]
		.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))
		.sort((a, b) => {
			if (!userBank.has(a.item.id!)) return 1;
			if (!userBank.has(b.item.id!)) return -1;
			return 0;
		});

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const { id } = eatable.item;
		const { healAmount } = eatable;
		const amountOwned = userBank.amount(id!);
		const toRemove = Math.ceil(totalHealingCalc / healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= toRemove) {
			totalHealingCalc -= Math.ceil(healAmount * toRemove);
			foodToRemove.add(id!, toRemove);
			break;
		} else {
			totalHealingCalc -= Math.ceil(healAmount * amountOwned);
			foodToRemove.add(id!, amountOwned);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}
export type ProjectileType = 'arrow' | 'bolt';
export const projectiles: Record<ProjectileType, number[]> = {
	arrow: resolveItems(['Adamant arrow', 'Rune arrow', 'Amethyst arrow', 'Dragon arrow', 'Hellfire arrow']),
	bolt: resolveItems(['Runite bolts', 'Dragon bolts', 'Diamond bolts (e)', 'Diamond dragon bolts (e)'])
};

export const PHOSANI_NIGHTMARE_ID = 9416;

export const dailyResetTime = Time.Hour * 4;
export const spawnLampResetTime = (user: KlasaUser) => {
	const bf = user.settings.get(UserSettings.BitField);

	const hasPerm = bf.includes(BitField.HasPermanentSpawnLamp);
	const hasTier5 = user.perkTier >= PerkTier.Five;
	const hasTier4 = !hasTier5 && user.perkTier === PerkTier.Four;

	let cooldown = [PerkTier.Six, PerkTier.Five].includes(user.perkTier) ? Time.Hour * 12 : Time.Hour * 24;

	if (!hasTier5 && !hasTier4 && hasPerm) {
		cooldown = Time.Hour * 48;
	}

	return cooldown;
};
export const itemContractResetTime = Time.Hour * 8;
export const giveBoxResetTime = Time.Hour * 24;

export const userTimers = [
	[dailyResetTime, UserSettings.LastDailyTimestamp, 'Daily'],
	[itemContractResetTime, UserSettings.LastItemContractDate, 'ItemContract'],
	[giveBoxResetTime, UserSettings.LastGivenBox, 'GiveBox'],
	[spawnLampResetTime, UserSettings.LastSpawnLamp, 'SpawnLamp']
] as const;
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
export function getCommandArgs(command: Command, args: any[]) {
	if (args.length === 0) return undefined;
	if (command.name === 'bank') return undefined;
	if (command.name === 'rp' && ['c'].includes(args[0])) return undefined;
	if (command.name === 'eval') return undefined;
	return args;
}

export const GLOBAL_BSO_XP_MULTIPLIER = 5;

export const COMMAND_BECAME_SLASH_COMMAND_MESSAGE = (
	msg: KlasaMessage
) => `This command you're trying to use, has been changed to a 'slash command'.

- Slash commands are integrated into the actual Discord client. We are *required* to change our commands to be slash commands.
- Slash commands are generally easier to use, and also have new features like autocompletion. They take some time to get used too though.
- You no longer use this command using \`${msg.cmdPrefix}${msg.command?.name}\`, now you use: \`/${msg.command?.name}\`
`;

export const DISABLED_COMMANDS = new Set<string>();
