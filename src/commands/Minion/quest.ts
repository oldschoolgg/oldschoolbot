import { Time, uniqueArr } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank, Skills } from '../../lib/types';
import { formatSkillRequirements, stringMatches } from '../../lib/util';

export const enum Quests {
	CooksAssistant = 1,
	DemonSlayer = 2,
	TheRestlessGhost = 3,
	RomeoAndJuliet = 4,
	SheepShearer = 5,
	ShieldofArrav = 6,
	ErnesttheChicken = 7,
	VampyreSlayer = 8,
	ImpCatcher = 9,
	PrinceAliRescue = 10,
	DoricsQuest = 11,
	BlackKnightsFortress = 12,
	WitchsPotion = 13,
	TheKnightsSword = 14,
	GoblinDiplomacy = 15,
	PiratesTreasure = 16,
	DragonSlayerI = 17,
	DruidicRitual = 18,
	LostCity = 19,
	WitchsHouse = 20,
	MerlinsCrystal = 21,
	HeroesQuest = 22,
	ScorpionCatcher = 23,
	FamilyCrest = 24,
	TribalTotem = 25,
	FishingContest = 26,
	MonksFriend = 27,
	TempleofIkov = 28,
	ClockTower = 29,
	HolyGrail = 30,
	TreeGnomeVillage = 31,
	FightArena = 32,
	HazeelCult = 33,
	SheepHerder = 34,
	PlagueCity = 35,
	SeaSlug = 36,
	WaterfallQuest = 37,
	Biohazard = 38,
	JunglePotion = 39,
	TheGrandTree = 40,
	ShiloVillage = 41,
	UndergroundPass = 42,
	ObservatoryQuest = 43,
	TheTouristTrap = 44,
	Watchtower = 45,
	DwarfCannon = 46,
	MurderMystery = 47,
	TheDigSite = 48,
	GertrudesCat = 49,
	LegendsQuest = 50,
	RuneMysteries = 51,
	BigChompyBirdHunting = 52,
	ElementalWorkshopI = 53,
	PriestinPeril = 54,
	NatureSpirit = 55,
	DeathPlateau = 56,
	TrollStronghold = 57,
	TaiBwoWannaiTrio = 58,
	Regicide = 59,
	EadgarsRuse = 60,
	ShadesofMortton = 61,
	TheFremennikTrials = 62,
	HorrorfromtheDeep = 63,
	ThroneofMiscellania = 64,
	MonkeyMadnessI = 65,
	HauntedMine = 66,
	TrollRomance = 67,
	InSearchoftheMyreque = 68,
	CreatureofFenkenstrain = 69,
	RovingElves = 70,
	GhostsAhoy = 71,
	OneSmallFavour = 72,
	MountainDaughter = 73,
	BetweenaRock = 74,
	TheFeud = 75,
	TheGolem = 76,
	DesertTreasure = 77,
	IcthlarinsLittleHelper = 78,
	TearsofGuthix = 79,
	ZogreFleshEaters = 80,
	TheLostTribe = 81,
	TheGiantDwarf = 82,
	RecruitmentDrive = 83,
	MourningsEndPartI = 84,
	ForgettableTaleofaDrunkenDwarf = 85,
	GardenofTranquillity = 86,
	ATailofTwoCats = 87,
	Wanted = 88,
	MourningsEndPartII = 89,
	RumDeal = 90,
	ShadowoftheStorm = 91,
	MakingHistory = 92,
	Ratcatchers = 93,
	SpiritsoftheElid = 94,
	DeviousMinds = 95,
	TheHandintheSand = 96,
	EnakhrasLament = 97,
	CabinFever = 98,
	FairyTaleIGrowingPains = 99,
	RecipeforDisaster = 100,
	InAidoftheMyreque = 101,
	ASoulsBane = 102,
	RagandBoneManI = 103,
	RagandBoneManII = 104,
	SwanSong = 105,
	RoyalTrouble = 106,
	DeathtotheDorgeshuun = 107,
	FairyTaleIICureaQueen = 108,
	LunarDiplomacy = 109,
	TheEyesofGlouphrie = 110,
	DarknessofHallowvale = 111,
	TheSlugMenace = 112,
	ElementalWorkshopII = 113,
	MyArmsBigAdventure = 114,
	EnlightenedJourney = 115,
	EaglesPeak = 116,
	AnimalMagnetism = 117,
	Contact = 118,
	ColdWar = 119,
	TheFremennikIsles = 120,
	TowerofLife = 121,
	TheGreatBrainRobbery = 122,
	WhatLiesBelow = 123,
	OlafsQuest = 124,
	AnotherSliceofHAM = 125,
	DreamMentor = 126,
	GrimTales = 127,
	KingsRansom = 128,
	MonkeyMadnessII = 129,
	MisthalinMystery = 130,
	ClientofKourend = 131,
	BoneVoyage = 132,
	TheQueenofThieves = 133,
	TheDepthsofDespair = 134,
	TheCorsairCurse = 135,
	DragonSlayerII = 136,
	TaleoftheRighteous = 137,
	ATasteofHope = 138,
	MakingFriendswithMyArm = 139,
	TheForsakenTower = 140,
	TheAscentofArceuus = 141,
	XMarkstheSpot = 142,
	SongoftheElves = 143,
	TheFremennikExiles = 144,
	SinsoftheFather = 145,
	APorcineofInterest = 146,
	GettingAhead = 147,
	BelowIceMountain = 148,
	ANightattheTheatre = 149,
	AKingdomDivide = 150
}

interface IQuestRequirements {
	level?: Skills;
	items?: ItemBank;
	quests?: number[];
}

interface IQuestRewards {
	xp?: Skills;
	items?: ItemBank;
	qp: number;
}

interface IQuest {
	id: number;
	name: string;
	time?: number;
	rewards: IQuestRewards;
	requirements?: IQuestRequirements;
}

const QuestList: IQuest[] = [
	{
		id: Quests.CooksAssistant,
		name: "Cook's Assistant",
		time: Time.Minute * 5,
		requirements: {
			items: resolveBank({
				Pot: 1,
				Bucket: 1
			})
		},
		rewards: {
			qp: 1,
			xp: {
				[SkillsEnum.Cooking]: 300
			}
		}
	},
	{
		id: Quests.DemonSlayer,
		name: 'Demon Slayer',
		time: Time.Minute * 10,
		requirements: {
			items: resolveBank({
				Bones: 25,
				995: 1
			}),
			level: {
				[SkillsEnum.Attack]: 20
			},
			quests: [Quests.VampyreSlayer]
		},
		rewards: {
			qp: 3,
			items: resolveBank({
				Silverlight: 1
			})
		}
	},
	{
		id: Quests.TheRestlessGhost,
		name: 'The Restless Ghost',
		rewards: {
			qp: 1,
			xp: { [SkillsEnum.Prayer]: 1125 },
			items: resolveBank({
				'Ghostspeak amulet': 1
			})
		}
	},
	{ id: Quests.RomeoAndJuliet, name: 'Romeo & Juliet', rewards: { qp: 5 } },
	{
		id: Quests.SheepShearer,
		name: 'Sheep Shearer',
		requirements: { items: resolveBank({ 'Ball of wool': 20 }) },
		rewards: {
			qp: 1,
			xp: {
				[SkillsEnum.Crafting]: 150
			},
			items: resolveBank({
				995: 60
			})
		}
	},
	{
		id: Quests.ShieldofArrav,
		name: 'Shield of Arrav',
		requirements: {
			items: resolveBank({ 995: 20 })
		},
		rewards: { qp: 1, items: resolveBank({ 995: 600 }) }
	},
	{ id: Quests.ErnesttheChicken, name: 'Ernest the Chicken', rewards: { qp: 4, items: resolveBank({ 995: 300 }) } },
	{
		id: Quests.VampyreSlayer,
		name: 'Vampyre Slayer',
		requirements: { items: resolveBank({ 995: 2 }) },
		rewards: { qp: 3, xp: { [SkillsEnum.Attack]: 4825 } }
	},
	{
		id: Quests.ImpCatcher,
		name: 'Imp Catcher',
		requirements: {
			items: resolveBank({
				'White bead': 1,
				'Black bead': 1,
				'Yellow bead': 1,
				'Red bead': 1
			})
		},
		rewards: {
			qp: 1,
			xp: {
				[SkillsEnum.Magic]: 875
			},
			items: resolveBank({ 'Amulet of accuracy': 1 })
		}
	},
	{
		id: Quests.PrinceAliRescue,
		name: 'Prince Ali Rescue',
		requirements: {
			items: resolveBank({
				'Ball of wool': 3,
				995: 105,
				Ashes: 1,
				'Bronze bar': 1
			})
		},
		rewards: {
			qp: 3,
			items: resolveBank({
				995: 700
			})
		}
	},
	{
		id: Quests.DoricsQuest,
		name: "Doric's Quest",
		requirements: { items: resolveBank({ 'Copper ore': 4, 'Tin ore': 2 }) },
		rewards: {
			qp: 1,
			xp: {
				[SkillsEnum.Mining]: 1300
			},
			items: resolveBank({
				995: 180
			})
		}
	},
	{
		id: Quests.BlackKnightsFortress,
		name: "Black Knights' Fortress",
		requirements: { items: resolveBank({ Cabbage: 1, 'Iron chainbody': 1, 'Bronze med helm': 1 }) },
		rewards: { qp: 3, items: resolveBank({ 995: 2500 }) }
	}
	// { id: Quests.WitchsPotion, name: "Witch's Potion", rewards: { qp: 1 } },
	// { id: Quests.TheKnightsSword, name: "The Knight's Sword", rewards: { qp: 1 } },
	// { id: Quests.GoblinDiplomacy, name: 'Goblin Diplomacy', rewards: { qp: 1 } },
	// { id: Quests.PiratesTreasure, name: "Pirate's Treasure", rewards: { qp: 1 } },
	// { id: Quests.DragonSlayerI, name: 'Dragon Slayer I', rewards: { qp: 1 } },
	// { id: Quests.DruidicRitual, name: 'Druidic Ritual', rewards: { qp: 1 } },
	// { id: Quests.LostCity, name: 'Lost City', rewards: { qp: 1 } },
	// { id: Quests.WitchsHouse, name: "Witch's House", rewards: { qp: 1 } },
	// { id: Quests.MerlinsCrystal, name: "Merlin's Crystal", rewards: { qp: 1 } },
	// { id: Quests.HeroesQuest, name: "Heroes' Quest", rewards: { qp: 1 } },
	// { id: Quests.ScorpionCatcher, name: 'Scorpion Catcher', rewards: { qp: 1 } },
	// { id: Quests.FamilyCrest, name: 'Family Crest', rewards: { qp: 1 } },
	// { id: Quests.TribalTotem, name: 'Tribal Totem', rewards: { qp: 1 } },
	// { id: Quests.FishingContest, name: 'Fishing Contest', rewards: { qp: 1 } },
	// { id: Quests.MonksFriend, name: "Monk's Friend", rewards: { qp: 1 } },
	// { id: Quests.TempleofIkov, name: 'Temple of Ikov', rewards: { qp: 1 } },
	// { id: Quests.ClockTower, name: 'Clock Tower', rewards: { qp: 1 } },
	// { id: Quests.HolyGrail, name: 'Holy Grail', rewards: { qp: 1 } },
	// { id: Quests.TreeGnomeVillage, name: 'Tree Gnome Village', rewards: { qp: 1 } },
	// { id: Quests.FightArena, name: 'Fight Arena', rewards: { qp: 1 } },
	// { id: Quests.HazeelCult, name: 'Hazeel Cult', rewards: { qp: 1 } },
	// { id: Quests.SheepHerder, name: 'Sheep Herder', rewards: { qp: 1 } },
	// { id: Quests.PlagueCity, name: 'Plague City', rewards: { qp: 1 } },
	// { id: Quests.SeaSlug, name: 'Sea Slug', rewards: { qp: 1 } },
	// { id: Quests.WaterfallQuest, name: 'Waterfall Quest', rewards: { qp: 1 } },
	// { id: Quests.Biohazard, name: 'Biohazard', rewards: { qp: 1 } },
	// { id: Quests.JunglePotion, name: 'Jungle Potion', rewards: { qp: 1 } },
	// { id: Quests.TheGrandTree, name: 'The Grand Tree', rewards: { qp: 1 } },
	// { id: Quests.ShiloVillage, name: 'Shilo Village', rewards: { qp: 1 } },
	// { id: Quests.UndergroundPass, name: 'Underground Pass', rewards: { qp: 1 } },
	// { id: Quests.ObservatoryQuest, name: 'Observatory Quest', rewards: { qp: 1 } },
	// { id: Quests.TheTouristTrap, name: 'The Tourist Trap', rewards: { qp: 1 } },
	// { id: Quests.Watchtower, name: 'Watchtower', rewards: { qp: 1 } },
	// { id: Quests.DwarfCannon, name: 'Dwarf Cannon', rewards: { qp: 1 } },
	// { id: Quests.MurderMystery, name: 'Murder Mystery', rewards: { qp: 1 } },
	// { id: Quests.TheDigSite, name: 'The Dig Site', rewards: { qp: 1 } },
	// { id: Quests.GertrudesCat, name: "Gertrude's Cat", rewards: { qp: 1 } },
	// { id: Quests.LegendsQuest, name: "Legends' Quest", rewards: { qp: 1 } },
	// { id: Quests.RuneMysteries, name: 'Rune Mysteries', rewards: { qp: 1 } },
	// { id: Quests.BigChompyBirdHunting, name: 'Big Chompy Bird Hunting', rewards: { qp: 1 } },
	// { id: Quests.ElementalWorkshopI, name: 'Elemental Workshop I', rewards: { qp: 1 } },
	// { id: Quests.PriestinPeril, name: 'Priest in Peril', rewards: { qp: 1 } },
	// { id: Quests.NatureSpirit, name: 'Nature Spirit', rewards: { qp: 1 } },
	// { id: Quests.DeathPlateau, name: 'Death Plateau', rewards: { qp: 1 } },
	// { id: Quests.TrollStronghold, name: 'Troll Stronghold', rewards: { qp: 1 } },
	// { id: Quests.TaiBwoWannaiTrio, name: 'Tai Bwo Wannai Trio', rewards: { qp: 1 } },
	// { id: Quests.Regicide, name: 'Regicide', rewards: { qp: 1 } },
	// { id: Quests.EadgarsRuse, name: "Eadgar's Ruse", rewards: { qp: 1 } },
	// { id: Quests.ShadesofMortton, name: "Shades of Mort'ton", rewards: { qp: 1 } },
	// { id: Quests.TheFremennikTrials, name: 'The Fremennik Trials', rewards: { qp: 1 } },
	// { id: Quests.HorrorfromtheDeep, name: 'Horror from the Deep', rewards: { qp: 1 } },
	// { id: Quests.ThroneofMiscellania, name: 'Throne of Miscellania', rewards: { qp: 1 } },
	// { id: Quests.MonkeyMadnessI, name: 'Monkey Madness I', rewards: { qp: 1 } },
	// { id: Quests.HauntedMine, name: 'Haunted Mine', rewards: { qp: 1 } },
	// { id: Quests.TrollRomance, name: 'Troll Romance', rewards: { qp: 1 } },
	// { id: Quests.InSearchoftheMyreque, name: 'In Search of the Myreque', rewards: { qp: 1 } },
	// { id: Quests.CreatureofFenkenstrain, name: 'Creature of Fenkenstrain', rewards: { qp: 1 } },
	// { id: Quests.RovingElves, name: 'Roving Elves', rewards: { qp: 1 } },
	// { id: Quests.GhostsAhoy, name: 'Ghosts Ahoy', rewards: { qp: 1 } },
	// { id: Quests.OneSmallFavour, name: 'One Small Favour', rewards: { qp: 1 } },
	// { id: Quests.MountainDaughter, name: 'Mountain Daughter', rewards: { qp: 1 } },
	// { id: Quests.BetweenaRock, name: 'Between a Rock...', rewards: { qp: 1 } },
	// { id: Quests.TheFeud, name: 'The Feud', rewards: { qp: 1 } },
	// { id: Quests.TheGolem, name: 'The Golem', rewards: { qp: 1 } },
	// { id: Quests.DesertTreasure, name: 'Desert Treasure', rewards: { qp: 1 } },
	// { id: Quests.IcthlarinsLittleHelper, name: "Icthlarin's Little Helper", rewards: { qp: 1 } },
	// { id: Quests.TearsofGuthix, name: 'Tears of Guthix', rewards: { qp: 1 } },
	// { id: Quests.ZogreFleshEaters, name: 'Zogre Flesh Eaters', rewards: { qp: 1 } },
	// { id: Quests.TheLostTribe, name: 'The Lost Tribe', rewards: { qp: 1 } },
	// { id: Quests.TheGiantDwarf, name: 'The Giant Dwarf', rewards: { qp: 1 } },
	// { id: Quests.RecruitmentDrive, name: 'Recruitment Drive', rewards: { qp: 1 } },
	// { id: Quests.MourningsEndPartI, name: "Mourning's End Part I", rewards: { qp: 1 } },
	// { id: Quests.ForgettableTaleofaDrunkenDwarf, name: 'Forgettable Tale of a Drunken Dwarf', rewards: { qp: 1 } },
	// { id: Quests.GardenofTranquillity, name: 'Garden of Tranquillity', rewards: { qp: 1 } },
	// { id: Quests.ATailofTwoCats, name: 'A Tail of Two Cats', rewards: { qp: 1 } },
	// { id: Quests.Wanted, name: 'Wanted!', rewards: { qp: 1 } },
	// { id: Quests.MourningsEndPartII, name: "Mourning's End Part II", rewards: { qp: 1 } },
	// { id: Quests.RumDeal, name: 'Rum Deal', rewards: { qp: 1 } },
	// { id: Quests.ShadowoftheStorm, name: 'Shadow of the Storm', rewards: { qp: 1 } },
	// { id: Quests.MakingHistory, name: 'Making History', rewards: { qp: 1 } },
	// { id: Quests.Ratcatchers, name: 'Ratcatchers', rewards: { qp: 1 } },
	// { id: Quests.SpiritsoftheElid, name: 'Spirits of the Elid', rewards: { qp: 1 } },
	// { id: Quests.DeviousMinds, name: 'Devious Minds', rewards: { qp: 1 } },
	// { id: Quests.TheHandintheSand, name: 'The Hand in the Sand', rewards: { qp: 1 } },
	// { id: Quests.EnakhrasLament, name: "Enakhra's Lament", rewards: { qp: 1 } },
	// { id: Quests.CabinFever, name: 'Cabin Fever', rewards: { qp: 1 } },
	// { id: Quests.FairyTaleIGrowingPains, name: 'Fairy Tale I - Growing Pains', rewards: { qp: 1 } },
	// { id: Quests.RecipeforDisaster, name: 'Recipe for Disaster', rewards: { qp: 1 } },
	// { id: Quests.InAidoftheMyreque, name: 'In Aid of the Myreque', rewards: { qp: 1 } },
	// { id: Quests.ASoulsBane, name: "A Soul's Bane", rewards: { qp: 1 } },
	// { id: Quests.RagandBoneManI, name: 'Rag and Bone Man I', rewards: { qp: 1 } },
	// { id: Quests.RagandBoneManII, name: 'Rag and Bone Man II', rewards: { qp: 1 } },
	// { id: Quests.SwanSong, name: 'Swan Song', rewards: { qp: 1 } },
	// { id: Quests.RoyalTrouble, name: 'Royal Trouble', rewards: { qp: 1 } },
	// { id: Quests.DeathtotheDorgeshuun, name: 'Death to the Dorgeshuun', rewards: { qp: 1 } },
	// { id: Quests.FairyTaleIICureaQueen, name: 'Fairy Tale II - Cure a Queen', rewards: { qp: 1 } },
	// { id: Quests.LunarDiplomacy, name: 'Lunar Diplomacy', rewards: { qp: 1 } },
	// { id: Quests.TheEyesofGlouphrie, name: 'The Eyes of Glouphrie', rewards: { qp: 1 } },
	// { id: Quests.DarknessofHallowvale, name: 'Darkness of Hallowvale', rewards: { qp: 1 } },
	// { id: Quests.TheSlugMenace, name: 'The Slug Menace', rewards: { qp: 1 } },
	// { id: Quests.ElementalWorkshopII, name: 'Elemental Workshop II', rewards: { qp: 1 } },
	// { id: Quests.MyArmsBigAdventure, name: "My Arm's Big Adventure", rewards: { qp: 1 } },
	// { id: Quests.EnlightenedJourney, name: 'Enlightened Journey', rewards: { qp: 1 } },
	// { id: Quests.EaglesPeak, name: "Eagles' Peak", rewards: { qp: 1 } },
	// { id: Quests.AnimalMagnetism, name: 'Animal Magnetism', rewards: { qp: 1 } },
	// { id: Quests.Contact, name: 'Contact!', rewards: { qp: 1 } },
	// { id: Quests.ColdWar, name: 'Cold War', rewards: { qp: 1 } },
	// { id: Quests.TheFremennikIsles, name: 'The Fremennik Isles', rewards: { qp: 1 } },
	// { id: Quests.TowerofLife, name: 'Tower of Life', rewards: { qp: 1 } },
	// { id: Quests.TheGreatBrainRobbery, name: 'The Great Brain Robbery', rewards: { qp: 1 } },
	// { id: Quests.WhatLiesBelow, name: 'What Lies Below', rewards: { qp: 1 } },
	// { id: Quests.OlafsQuest, name: "Olaf's Quest", rewards: { qp: 1 } },
	// { id: Quests.AnotherSliceofHAM, name: 'Another Slice of H.A.M.', rewards: { qp: 1 } },
	// { id: Quests.DreamMentor, name: 'Dream Mentor', rewards: { qp: 1 } },
	// { id: Quests.GrimTales, name: 'Grim Tales', rewards: { qp: 1 } },
	// { id: Quests.KingsRansom, name: "King's Ransom", rewards: { qp: 1 } },
	// { id: Quests.MonkeyMadnessII, name: 'Monkey Madness II', rewards: { qp: 1 } },
	// { id: Quests.MisthalinMystery, name: 'Misthalin Mystery', rewards: { qp: 1 } },
	// { id: Quests.ClientofKourend, name: 'Client of Kourend', rewards: { qp: 1 } },
	// { id: Quests.BoneVoyage, name: 'Bone Voyage', rewards: { qp: 1 } },
	// { id: Quests.TheQueenofThieves, name: 'The Queen of Thieves', rewards: { qp: 1 } },
	// { id: Quests.TheDepthsofDespair, name: 'The Depths of Despair', rewards: { qp: 1 } },
	// { id: Quests.TheCorsairCurse, name: 'The Corsair Curse', rewards: { qp: 1 } },
	// { id: Quests.DragonSlayerII, name: 'Dragon Slayer II', rewards: { qp: 1 } },
	// { id: Quests.TaleoftheRighteous, name: 'Tale of the Righteous', rewards: { qp: 1 } },
	// { id: Quests.ATasteofHope, name: 'A Taste of Hope', rewards: { qp: 1 } },
	// { id: Quests.MakingFriendswithMyArm, name: 'Making Friends with My Arm', rewards: { qp: 1 } },
	// { id: Quests.TheForsakenTower, name: 'The Forsaken Tower', rewards: { qp: 1 } },
	// { id: Quests.TheAscentofArceuus, name: 'The Ascent of Arceuus', rewards: { qp: 1 } },
	// { id: Quests.XMarkstheSpot, name: 'X Marks the Spot', rewards: { qp: 1 } },
	// { id: Quests.SongoftheElves, name: 'Song of the Elves', rewards: { qp: 1 } },
	// { id: Quests.TheFremennikExiles, name: 'The Fremennik Exiles', rewards: { qp: 1 } },
	// { id: Quests.SinsoftheFather, name: 'Sins of the Father', rewards: { qp: 1 } },
	// { id: Quests.APorcineofInterest, name: 'A Porcine of Interest', rewards: { qp: 1 } },
	// { id: Quests.GettingAhead, name: 'Getting Ahead', rewards: { qp: 1 } },
	// { id: Quests.BelowIceMountain, name: 'Below Ice Mountain', rewards: { qp: 1 } },
	// { id: Quests.ANightattheTheatre, name: 'A Night at the Theatre', rewards: { qp: 1 } },
	// { id: Quests.AKingdomDivide, name: 'A Kingdom Divided', rewards: { qp: 1 } }
];

function meetQuestRequirements(quest: IQuest, user: KlasaUser) {
	// Check requirements
	const requirementsFailure: string[] = [];
	// Skills
	if (quest.requirements?.level) {
		const [hasSkillReqs, neededReqs] = user.hasSkillReqs(quest.requirements?.level);
		if (!hasSkillReqs) {
			requirementsFailure.push(`You are missing the following skill requirements for this quest: ${neededReqs}`);
		}
	}
	// Items
	// if (quest.requirements?.items && !user.bank({ withGP: true }).has(quest.requirements?.items)) {
	// 	requirementsFailure.push(
	// 		`You are missing the following items for this quest: ${new Bank(quest.requirements?.items)}`
	// 	);
	// }
	// Quests
	if (quest.requirements?.quests) {
		let questsMissing: IQuest[] = [];
		for (const q of quest.requirements?.quests) {
			const questsDone = user.settings.get(UserSettings.Quests);
			if (!questsDone.includes(q)) {
				questsMissing.push(QuestList.find(_q => _q.id === q)!);
			}
		}
		if (questsMissing.length > 0) {
			requirementsFailure.push(
				`You are missing the following quests before you can attempt this one: ${questsMissing
					.map(q => q.name)
					.join(', ')}`
			);
		}
	}

	return requirementsFailure;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quest:...string]'
		});
	}

	async run(msg: KlasaMessage, [_quest]: [string]) {
		let quest: IQuest | undefined = undefined;
		await msg.author.settings.sync();
		const questsDone = msg.author.settings.get(UserSettings.Quests);
		if (questsDone.length === QuestList.length) {
			return msg.channel.send('You have done all the quests! Congratulations!');
		}
		if (!_quest) {
			for (const q of QuestList) {
				if (questsDone.includes(q.id)) continue;
				if (meetQuestRequirements(q, msg.author).length === 0) {
					quest = q;
					break;
				}
			}
			if (!quest) {
				return msg.channel.send('You dont have the requirements to do any quest at the moment!');
			}
		} else {
			quest = QuestList.find(q => stringMatches(q.name, _quest) || q.id === Number(_quest));
			if (!quest) {
				return msg.channel.send(
					`There is no quest called ${_quest}. Look on your \`+questlog\` for more infrmation on what adventures you can go!`
				);
			}
			if (questsDone.includes(quest.id)) {
				return msg.channel.send(`You already completed the quest **${quest.name}**.`);
			}
			const requirementsFailure = meetQuestRequirements(quest, msg.author);
			if (requirementsFailure.length > 0) {
				return msg.channel.send(
					`You do not met all the requirements for this quest. ${requirementsFailure.join(', ')}`
				);
			}
		}

		// Give rewards
		// xp
		if (quest.rewards?.xp) {
			for (const [skill, amount] of Object.entries(quest.rewards?.xp)) {
				await msg.author.addXP({ skillName: skill as SkillsEnum, amount });
			}
		}
		// items
		if (quest.rewards?.items) {
			await msg.author.addItemsToBank(quest.rewards?.items);
		}
		// qp + quest
		await msg.author.addQP(quest.rewards.qp);
		const saveQuests = msg.author.settings.get(UserSettings.Quests);
		const newQuestList = [...saveQuests, quest.id];
		await msg.author.settings.update(UserSettings.Quests, uniqueArr(newQuestList), {
			arrayAction: 'overwrite'
		});

		return msg.channel.send(
			`Your minion would be doing **${quest.name}** quest. You would receive: ${quest.rewards?.qp} QP${
				quest.rewards?.xp ? `, ${formatSkillRequirements(quest.rewards?.xp)}` : ''
			}${quest.rewards?.items ? `, ${new Bank(quest.rewards?.items)}` : ''}`
		);
	}
}
