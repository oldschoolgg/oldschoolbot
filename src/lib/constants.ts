import PQueue from 'p-queue';
import { join } from 'path';

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * 30,
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum Channel {
	Notifications = '811589869314899980',
	ErrorLogs = '665678499578904596',
	GrandExchange = '682996313209831435',
	Developers = '648196527294251020',
	BlacklistLogs = '782459317218967602',
	EconomyLogs = '802029843712573510',
	NewSponsors = '806744016309714966',
	SupportChannel = '668073484731154462'
}

export const enum Roles {
	Booster = '665908237152813057',
	Contributor = '456181501437018112',
	Moderator = '622806157563527178',
	PatronTier1 = '678970545789730826',
	PatronTier2 = '678967943979204608',
	PatronTier3 = '687408140832342043',
	Patron = '679620175838183424',
	// Status Roles
	TopSkiller = '848966830617788427',
	TopCollector = '848966773885763586',
	TopSacrificer = '848966732265160775',
	TopeClueHunter = '848967350120218636'
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
	Skiller = '<:skiller:802136963775463435>',
	Incinerator = '<:incinerator:802136963674275882>',
	CollectionLog = '<:collectionLog:802136964027121684>',
	Minigames = '<:minigameIcon:630400565070921761>',
	Skull = '<:Skull:802136963926065165>',
	CombatSword = '<:combat:802136963956080650>',
	SOTW = '<:SOTWtrophy:842938096097820693>'
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
	Orange = 16098851
}

export const SupportServer = '342983479501389826';

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
	OuraniaDeliveryService = 'ouraniaDeliveryServiceActivity'
}

export enum Activity {
	Agility = 'Agility',
	Cooking = 'Cooking',
	MonsterKilling = 'MonsterKilling',
	GroupMonsterKilling = 'GroupMonsterKilling',
	ClueCompletion = 'ClueCompletion',
	Fishing = 'Fishing',
	Mining = 'Mining',
	Smithing = 'Smithing',
	Woodcutting = 'Woodcutting',
	Questing = 'Questing',
	Firemaking = 'Firemaking',
	Runecraft = 'Runecraft',
	Smelting = 'Smelting',
	Crafting = 'Crafting',
	Burying = 'Burying',
	Offering = 'Offering',
	FightCaves = 'FightCaves',
	Wintertodt = 'Wintertodt',
	TitheFarm = 'TitheFarm',
	Fletching = 'Fletching',
	Pickpocket = 'Pickpocket',
	Herblore = 'Herblore',
	Hunter = 'Hunter',
	Birdhouse = 'Birdhouse',
	Alching = 'Alching',
	Raids = 'Raids',
	AnimatedArmour = 'AnimatedArmour',
	Cyclops = 'Cyclops',
	Sawmill = 'Sawmill',
	Nightmare = 'Nightmare',
	Sepulchre = 'Sepulchre',
	Plunder = 'Plunder',
	FishingTrawler = 'FishingTrawler',
	Zalcano = 'Zalcano',
	Farming = 'Farming',
	Construction = 'Construction',
	Enchanting = 'Enchanting',
	Casting = 'Casting',
	GloryCharging = 'GloryCharging',
	WealthCharging = 'WealthCharging',
	BarbarianAssault = 'BarbarianAssault',
	AgilityArena = 'AgilityArena',
	ChampionsChallenge = 'ChampionsChallenge',
	AerialFishing = 'AerialFishing',
	MahoganyHomes = 'MahoganyHomes',
	Nex = 'Nex',
	GnomeRestaurant = 'GnomeRestaurant',
	SoulWars = 'SoulWars',
	RoguesDenMaze = 'RoguesDenMaze',
	KalphiteKing = 'KalphiteKing',
	Gauntlet = 'Gauntlet',
	Dungeoneering = 'Dungeoneering',
	CastleWars = 'CastleWars',
	MageArena = 'MageArena',
	Collecting = 'Collecting',
	MageTrainingArena = 'MageTrainingArena',
	BlastFurnace = 'BlastFurnace',
	MageArena2 = 'MageArena2',
	BigChompyBirdHunting = 'BigChompyBirdHunting',
	KingGoldemar = 'KingGoldemar',
	VasaMagus = 'VasaMagus',
	OuraniaDeliveryService = 'OuraniaDeliveryService'
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

export const enum BadgesEnum {
	Developer = 0,
	Booster = 1,
	LimitedPatron = 2,
	Patron = 3
}

export const enum PermissionLevelsEnum {
	Zero = 0,
	Moderator = 6,
	Admin = 7,
	Owner = 10
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
	HasGivenBirthdayPack = 200,
	HasPermanentSpawnLamp = 201,
	HasScrollOfFarming = 202
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
	[BitField.HasPermanentEventBackgrounds]: {
		name: 'Permanent Event Backgrounds'
	},
	[BitField.HasPermanentTierOne]: { name: 'Permanent Tier 1' },
	[BitField.HasPermanentSpawnLamp]: { name: 'Permanent Spawn Lamp' },
	[BitField.PermanentIronman]: { name: 'Permanent Ironman' }
} as const;

export const enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216'
}

export const badges: { [key: number]: string } = {
	0: Emoji.Spanner,
	1: Emoji.PinkGem,
	2: Emoji.Crab,
	3: Emoji.BigOrangeGem,
	4: Emoji.Hammer,
	5: Emoji.GreenGem,
	6: Emoji.Bug,
	7: Emoji.Trophy,
	8: Emoji.Incinerator,
	9: Emoji.Skiller,
	10: Emoji.CollectionLog,
	11: Emoji.MinigameIcon,
	12: Emoji.SOTW
};

export const MAX_QP = 5000;

export const MIMIC_MONSTER_ID = 23184;

export const continuationChars = 'abdefghjkmnopqrstuvwxyz123456789'.split('');
export const CENA_CHARS = ['​', '‎', '‍'];
export const NIGHTMARES_HP = 2400;
export const ZAM_HASTA_CRUSH = 65;
export const MAX_INT_JAVA = 2_147_483_647;
export const TWEETS_RATELIMITING =
	`Tweets in Old School Bot can only be enabled in servers with more than 20 members, or by Tier 3 Patrons - this is due to ratelimiting issues.` +
	`You can consider checking tweets in another server, or becoming a patron. Apologies for the inconvenience.`;
export const HERBIBOAR_ID = 36;
export const RAZOR_KEBBIT_ID = 35;
export const BLACK_CHIN_ID = 9;
export const ZALCANO_ID = 9049;
export const NIGHTMARE_ID = 9415;
export const MIN_LENGTH_FOR_PET = Time.Minute * 5;

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
