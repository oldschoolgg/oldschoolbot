import { Monsters } from 'oldschooljs';

import itemID from '../util/itemID';

interface SlayerTaskUnlocks {
	id: SlayerTaskUnlocksEnum;
	name: string;
	desc?: string;
	slayerPointCost: number;
	item?: number;
	haveOne?: boolean;
	canBeRemoved?: boolean;
	aliases?: string[];
	extendID?: number[];
	extendMult?: number;
}

export enum SlayerTaskUnlocksEnum {
	// Unlockables
	MalevolentMasquerade = 2,
	RingBling = 3,
	SeeingRed = 4,
	IHopeYouMithMe = 5,
	WatchTheBirdie = 6,
	HotStuff = 7,
	ReptileGotRipped = 8,
	LikeABoss = 9,
	BiggerAndBadder = 10,
	KingBlackBonnet = 11,
	KalphiteKhat = 12,
	UnholyHelmet = 13,
	DarkMantle = 14,
	UndeadHead = 15,
	UseMoreHead = 16,
	TwistedVision = 17,
	StopTheWyvern = 18,
	Basilocked = 19,
	ActualVampyreSlayer = 20,
	// Extension Unlocks
	NeedMoreDarkness = 21,
	AnkouVeryMuch = 22,
	SuqANotherOne = 23,
	FireAndDarkness = 24,
	PedalToTheMetals = 25,
	IReallyMithYou = 26,
	AdamindSomeMore = 27,
	RUUUUUNE = 28,
	SpiritualFervour = 29,
	BirdsOfAFeather = 30,
	GreaterChallenge = 31,
	ItsDarkInHere = 32,
	BleedMeDry = 33,
	SmellYaLater = 34,
	Horrorific = 35,
	ToDustYouShallReturn = 36,
	WyverNotherOne = 37,
	GetSmashed = 38,
	NechsPlease = 39,
	AugmentMyAbbies = 40,
	KrackOn = 41,
	GetScabarightOnIt = 42,
	WyverNotherTwo = 43,
	Basilonger = 44,
	MoreAtStake = 45,
	// Item Purchases:
	SlayerRing = 46,
	HerbSack = 47,
	RunePouch = 48,
	DoubleTrouble = 49,
	BroaderFletching = 50,
	IWildyMoreSlayer = 200,
	Revenenenenenants = 201,
	EyeSeeYou = 202,
	MoreEyesThanSense = 203
}

export const SlayerRewardsShop: SlayerTaskUnlocks[] = [
	{
		id: SlayerTaskUnlocksEnum.MalevolentMasquerade,
		name: 'Malevolent Masquerade',
		desc: 'Unlocks ability to create Slayer helmets.',
		slayerPointCost: 400,
		canBeRemoved: false,
		aliases: ['slayer helm', 'slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.RingBling,
		name: 'Ring Bling',
		desc: 'Unlocks ability to create Slayer rings.',
		slayerPointCost: 300,
		canBeRemoved: false,
		aliases: ['unlock slayer ring', 'unlock slayer rings']
	},
	{
		id: SlayerTaskUnlocksEnum.SeeingRed,
		name: 'Seeing Red',
		desc: 'Allows slayer masters to assign Red dragons.',
		slayerPointCost: 50,
		canBeRemoved: true,
		aliases: ['red dragon', 'red dragons']
	},
	{
		id: SlayerTaskUnlocksEnum.IHopeYouMithMe,
		name: 'I hope you mith me!',
		desc: 'Unlocks the ability to receive Mithril dragons as a task.',
		slayerPointCost: 80,
		canBeRemoved: true,
		aliases: ['mithril dragons', 'mithril dragon']
	},
	{
		id: SlayerTaskUnlocksEnum.WatchTheBirdie,
		name: 'Watch the birdie',
		desc: 'Unlocks the ability to receive Aviansies as a task.',
		slayerPointCost: 80,
		canBeRemoved: true,
		aliases: ['aviansie', 'aviansies']
	},
	{
		id: SlayerTaskUnlocksEnum.HotStuff,
		name: 'Hot Stuff',
		desc: 'Unlocks the ability to receive TzHaar as a task.',
		slayerPointCost: 100,
		canBeRemoved: true,
		aliases: ['tzhaar', 'unlock tzhaar', 'jad', 'jad tasks', 'jad task']
	},
	{
		id: SlayerTaskUnlocksEnum.ReptileGotRipped,
		name: 'Reptile got Ripped',
		desc: 'Unlocks the ability to receive Lizardmen as a task.',
		slayerPointCost: 75,
		canBeRemoved: true,
		aliases: ['lizardmen', 'lizardman', 'unlock lizardmen', 'unlock lizardman', 'shamans', 'unlock shamans']
	},
	{
		id: SlayerTaskUnlocksEnum.LikeABoss,
		name: 'Like a Boss',
		desc: 'Unlocks boss tasks from high level slayer masters.',
		slayerPointCost: 200,
		canBeRemoved: true,
		aliases: ['boss tasks', 'unlock boss tasks']
	},
	{
		id: SlayerTaskUnlocksEnum.BiggerAndBadder,
		name: 'Bigger and Badder',
		desc: 'Unlocks superiors.',
		slayerPointCost: 150,
		canBeRemoved: true,
		aliases: ['superiors', 'superior']
	},
	{
		id: SlayerTaskUnlocksEnum.KingBlackBonnet,
		name: 'King Black Bonnet',
		desc: 'Unlocks ability to create the Black slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['kbd slayer helmet', 'black slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.KalphiteKhat,
		name: 'Kalphite Khat',
		desc: 'Unlocks ability to create the Green slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['green slayer helmet', 'kq slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.UnholyHelmet,
		name: 'Unholy Helmet',
		desc: 'Unlocks ability to create the Red slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['red slayer helmet', 'abyssal slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.DarkMantle,
		name: 'Dark Mantle',
		desc: 'Unlocks ability to create the Purple slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['purple slayer helmet', 'skotizo slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.UndeadHead,
		name: 'Undead Head',
		desc: 'Unlocks ability to create the Turquoise slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['vorkath slayer helmet', 'turquoise slayer helmet', 'blue slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.EyeSeeYou,
		name: 'Eye see you',
		desc: 'Unlocks ability to create the Araxyte slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['araxyte slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.UseMoreHead,
		name: 'Use More Head',
		desc: 'Unlocks ability to create the Hydra slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['hydra slayer helmet', 'alchemical slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.TwistedVision,
		name: 'Twisted Vision',
		desc: 'Unlocks ability to create the Twisted slayer helmet.',
		slayerPointCost: 1000,
		canBeRemoved: false,
		aliases: ['twisted slayer helmet', 'horny slayer helmet']
	},
	{
		id: SlayerTaskUnlocksEnum.StopTheWyvern,
		name: 'Stop The Wyvern',
		desc: 'Prevents slayer masters from assigning Fossil island wyverns.',
		slayerPointCost: 500,
		canBeRemoved: true,
		aliases: ['block fossil island wyverns', 'fossil island wyverns']
	},
	{
		id: SlayerTaskUnlocksEnum.Basilocked,
		name: 'Basilocked',
		desc: 'Unlocks the ability for Konar, Duradel and Nieve to assign Basilisks',
		slayerPointCost: 80,
		canBeRemoved: true,
		aliases: ['basilisks', 'basilisk']
	},
	{
		id: SlayerTaskUnlocksEnum.ActualVampyreSlayer,
		name: 'Actual Vampyre Slayer',
		desc: 'Unlocks the ability for Konar, Duradel, Nieve and Chaeldar to assign Vampyres',
		slayerPointCost: 80,
		canBeRemoved: true,
		aliases: ['vampyre slayer', 'vampire slayer', 'actual vampire slayer', 'vampyres', 'vampires']
	},
	{
		id: SlayerTaskUnlocksEnum.IWildyMoreSlayer,
		name: 'I Wildy More Slayer',
		desc: 'Krystilia will be able to assign Jellies, Dust Devils, Nechryaels and Abyssal Demons as your task.',
		slayerPointCost: 0,
		canBeRemoved: true,
		aliases: ['wildy slayer']
	},
	{
		id: SlayerTaskUnlocksEnum.SlayerRing,
		name: 'Slayer ring',
		desc: 'Purchase 1 Slayer ring (8)',
		slayerPointCost: 75,
		item: itemID('Slayer ring (8)'),
		haveOne: false,
		aliases: ['slayer ring 8', 'slayer ring (8)']
	},
	{
		id: SlayerTaskUnlocksEnum.HerbSack,
		name: 'Herb sack',
		desc: 'Purchase 1 Herb sack',
		slayerPointCost: 750,
		item: itemID('Herb sack'),
		haveOne: true,
		aliases: ['herbs sack', 'herb bag']
	},
	{
		id: SlayerTaskUnlocksEnum.RunePouch,
		name: 'Rune pouch',
		desc: 'Purchase 1 Rune pouch',
		slayerPointCost: 750,
		item: itemID('Rune pouch'),
		haveOne: true,
		aliases: ['rune sack', 'runes pouch']
	},
	{
		id: SlayerTaskUnlocksEnum.NeedMoreDarkness,
		name: 'Need more darkness',
		desc: 'Extends Dark beast tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.DarkBeast.id],
		extendMult: 9,
		canBeRemoved: true,
		aliases: ['extend dark beasts']
	},
	{
		id: SlayerTaskUnlocksEnum.AnkouVeryMuch,
		name: 'Ankou very much',
		desc: 'Extends Ankou tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.Ankou.id],
		extendMult: 2,
		canBeRemoved: true,
		aliases: ['extend ankous', 'extend ankou']
	},
	{
		id: SlayerTaskUnlocksEnum.SuqANotherOne,
		name: 'Suq-a-nother one',
		desc: 'Extends Suqah tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.Suqah.id],
		extendMult: 3,
		canBeRemoved: true,
		aliases: ['suqanother one', 'suq a nother one', 'extend suqahs']
	},
	{
		id: SlayerTaskUnlocksEnum.FireAndDarkness,
		name: 'Fire & Darkness',
		desc: 'Extend Black dragon tasks.',
		slayerPointCost: 50,
		extendID: [Monsters.BlackDragon.id],
		extendMult: 3,
		canBeRemoved: true,
		aliases: ['fire and darkness', 'extend black dragons', 'extend black drags']
	},
	{
		id: SlayerTaskUnlocksEnum.PedalToTheMetals,
		name: 'Pedal to the metals',
		desc: 'Extends Bronze, Iron, and Steel dragon tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.BronzeDragon.id, Monsters.IronDragon.id, Monsters.SteelDragon.id],
		extendMult: 3,
		canBeRemoved: true,
		aliases: ['extend metal dragons', 'extend steel dragons', 'extend bronze dragons', 'extend iron dragons']
	},
	{
		id: SlayerTaskUnlocksEnum.IReallyMithYou,
		name: 'I really mith you',
		desc: 'Extends Mithril dragon tasks.',
		slayerPointCost: 120,
		extendID: [Monsters.MithrilDragon.id],
		extendMult: 4,
		canBeRemoved: true,
		aliases: ['extend mith dragons', 'extend mithril dragons', 'extend mith drags']
	},
	{
		id: SlayerTaskUnlocksEnum.AdamindSomeMore,
		name: 'Adamind some more',
		desc: 'Extends Adamant dragon tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.AdamantDragon.id],
		extendMult: 5,
		canBeRemoved: true,
		aliases: ['extend addy dragons', 'extend adamant dragons']
	},
	{
		id: SlayerTaskUnlocksEnum.RUUUUUNE,
		name: 'RUUUUUNE',
		desc: 'Extends Rune dragon tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.RuneDragon.id],
		extendMult: 9,
		canBeRemoved: true,
		aliases: ['rune', 'extend rune dragons', 'extend rune dragon']
	},
	{
		id: SlayerTaskUnlocksEnum.SpiritualFervour,
		name: 'Spiritual fervour',
		desc: 'Extends Spiritual creature tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.SpiritualRanger.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend spiritual creatures', 'extend spirituals']
	},
	{
		id: SlayerTaskUnlocksEnum.BirdsOfAFeather,
		name: 'Birds of a feather',
		desc: 'Extends Aviansie tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.Aviansie.id],
		extendMult: 1.33,
		canBeRemoved: true,
		aliases: ['extend aviansies', 'extend birds']
	},
	{
		id: SlayerTaskUnlocksEnum.GreaterChallenge,
		name: 'Greater challenge',
		desc: 'Extends Greater demons tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.GreaterDemon.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend greaters', 'extend greater demons']
	},
	{
		id: SlayerTaskUnlocksEnum.ItsDarkInHere,
		name: 'Its Dark In Here',
		desc: 'Extends Black demon beast tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.BlackDemon.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend black demons']
	},
	{
		id: SlayerTaskUnlocksEnum.BleedMeDry,
		name: 'Bleed me dry',
		desc: 'Extends Bloodveld tasks.',
		slayerPointCost: 75,
		extendID: [Monsters.Bloodveld.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend bloodvelds']
	},
	{
		id: SlayerTaskUnlocksEnum.SmellYaLater,
		name: 'Smell ya later',
		desc: 'Extends Aberrant spectre tasks',
		slayerPointCost: 100,
		extendID: [Monsters.AberrantSpectre.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend aberrant spectres', 'extend abby specs']
	},
	{
		id: SlayerTaskUnlocksEnum.Horrorific,
		name: 'Horrorific',
		desc: 'Extends Cave horrors task',
		slayerPointCost: 100,
		extendID: [Monsters.CaveHorror.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend cave horrors']
	},
	{
		id: SlayerTaskUnlocksEnum.ToDustYouShallReturn,
		name: 'To dust you shall return',
		desc: 'Extends Dust devils task',
		slayerPointCost: 100,
		extendID: [Monsters.DustDevil.id],
		extendMult: 1.7,
		canBeRemoved: true,
		aliases: ['extend dusties', 'extend dust devils']
	},
	{
		id: SlayerTaskUnlocksEnum.WyverNotherOne,
		name: 'Wyver-nother one',
		desc: 'Extends Skeletal wyvern tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.SkeletalWyvern.id],
		extendMult: 2,
		canBeRemoved: true,
		aliases: ['extend wyverns', 'extend skeletal wyverns']
	},
	{
		id: SlayerTaskUnlocksEnum.GetSmashed,
		name: 'Get smashed',
		desc: 'Extends Gargoyle  tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.Gargoyle.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend gargs', 'extend gargoyles']
	},
	{
		id: SlayerTaskUnlocksEnum.NechsPlease,
		name: 'Nechs please',
		desc: 'Extends Nechryael tasks',
		slayerPointCost: 100,
		extendID: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend nechs', 'extend nechryaels']
	},
	{
		id: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		name: 'Augment my Abbies',
		desc: 'Extends Abyssal demon tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.AbyssalDemon.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['augment my abbys', 'extend abby demons', 'extend abyssal demons']
	},
	{
		id: SlayerTaskUnlocksEnum.KrackOn,
		name: 'Krack On',
		desc: 'Extends Cave Kraken tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.CaveKraken.id],
		extendMult: 1.67,
		canBeRemoved: true,
		aliases: ['extend cave kraken', 'extend kraken']
	},
	{
		id: SlayerTaskUnlocksEnum.GetScabarightOnIt,
		name: 'Get Scabaright on it',
		desc: 'Extends Scabarite tasks',
		slayerPointCost: 50,
		extendID: [Monsters.ScarabMage.id],
		extendMult: 3,
		canBeRemoved: true,
		aliases: ['extend scabarites', 'extend scarabs', 'extend scarabites']
	},
	{
		id: SlayerTaskUnlocksEnum.WyverNotherTwo,
		name: 'Wyver-nother two',
		desc: 'Extends Fossil island wyvrns.',
		slayerPointCost: 100,
		extendID: [Monsters.FossilIslandWyvernSpitting.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend fossil island wyverns', 'extend fossil wyverns']
	},
	{
		id: SlayerTaskUnlocksEnum.Basilonger,
		name: 'Basilonger',
		desc: 'Extends Basilisk tasks.',
		slayerPointCost: 100,
		extendID: [Monsters.Basilisk.id],
		extendMult: 1.4,
		canBeRemoved: true,
		aliases: ['extend basilisks', 'extend basilisk']
	},
	{
		id: SlayerTaskUnlocksEnum.MoreAtStake,
		name: 'More at stake',
		desc: 'Extends Vampyre tasks',
		slayerPointCost: 100,
		extendID: [Monsters.FeralVampyre.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend vampyres', 'extend vampires']
	},
	{
		id: SlayerTaskUnlocksEnum.DoubleTrouble,
		name: 'Double Trouble',
		desc: 'Each Grotesque Guardians kc gives 2 kc to your slayer task',
		slayerPointCost: 500,
		canBeRemoved: true,
		aliases: ['double trouble', 'double garg kc', 'double grotesque kc', '2x groteque kc', '2x ggs kc']
	},
	{
		id: SlayerTaskUnlocksEnum.BroaderFletching,
		name: 'Broader fletching',
		desc: 'Unlocks ability to fletch broad ammunition',
		slayerPointCost: 300,
		canBeRemoved: false,
		aliases: ['broad bolts', 'broads', 'broad arrows', 'fletching', 'broad fletching']
	},
	{
		id: SlayerTaskUnlocksEnum.Revenenenenenants,
		name: 'Revenenenenenants',
		desc: 'Extends Revenants tasks',
		slayerPointCost: 100,
		extendID: [Monsters.RevenantImp.id],
		extendMult: 1.5,
		canBeRemoved: true,
		aliases: ['extend revenants', 'extend revs']
	},
	{
		id: SlayerTaskUnlocksEnum.MoreEyesThanSense,
		name: 'More eyes than sense',
		desc: 'Number of araxytes assigned is increased to 200-250.',
		slayerPointCost: 150,
		extendID: [Monsters.Araxyte.id],
		extendMult: 3.3,
		canBeRemoved: true,
		aliases: ['extend araxytes']
	}
];
