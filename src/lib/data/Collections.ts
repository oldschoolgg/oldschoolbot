import { MessageAttachment } from 'discord.js';
import { KlasaUser } from 'klasa';
import { Bank, Clues, Monsters } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';
import { table } from 'table';

import killableMonsters, { effectiveMonsters, NightmareMonster } from '../minions/data/killableMonsters';
import { sepulchreFloors } from '../minions/data/sepulchre';
import {
	EasyEncounterLoot,
	HardEncounterLoot,
	MediumEncounterLoot,
	rewardTokens
} from '../minions/data/templeTrekking';
import { UserSettings } from '../settings/types/UserSettings';
import { ItemBank } from '../types';
import { stringMatches } from '../util';
import resolveItems from '../util/resolveItems';
import {
	abyssalSireCL,
	aerialFishingCL,
	alchemicalHydraCL,
	allPetsCL,
	barbarianAssaultCL,
	barrowsChestCL,
	brimhavenAgilityArenaCL,
	bryophytaCL,
	callistoCL,
	camdozaalCL,
	capesCL,
	castleWarsCL,
	cerberusCL,
	chambersOfXericCl,
	championsChallengeCL,
	chaosDruisCL,
	chaosElementalCL,
	chaosFanaticCL,
	chompyBirdsCL,
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesEliteRareCL,
	cluesHardCL,
	cluesHardRareCL,
	cluesMasterCL,
	cluesMasterRareCL,
	cluesMediumCL,
	cluesSharedCL,
	commanderZilyanaCL,
	corporealBeastCL,
	crazyArchaeologistCL,
	creatureCreationCL,
	cyclopsCL,
	dagannothKingsCL,
	dagannothPrimeCL,
	dagannothRexCL,
	dagannothSupremeCL,
	dailyCL,
	demonicGorillaCL,
	fightCavesCL,
	fishingTrawlerCL,
	fossilIslandNotesCL,
	generalGraardorCL,
	giantMoleCL,
	gnomeRestaurantCL,
	grotesqueGuardiansCL,
	hallowedSepulchreCL,
	hesporiCL,
	holidayCL,
	ICollection,
	ILeftListStatus,
	IToReturnCollection,
	kalphiteQueenCL,
	kingBlackDragonCL,
	krakenCL,
	kreeArraCL,
	krilTsutsarothCL,
	lastManStandingCL,
	magicTrainingArenaCL,
	mahoganyHomesCL,
	miscellaneousCL,
	monkeyBackpacksCL,
	motherlodeMineCL,
	oborCL,
	pestControlCL,
	questCL,
	randomEventsCL,
	revenantsCL,
	roguesDenCL,
	rooftopAgilityCL,
	sarachnisCL,
	scorpiaCL,
	shadesOfMorttonCL,
	shayzienArmourCL,
	skillingPetsCL,
	skotizoCL,
	slayerCL,
	soulWarsCL,
	spiritAnglerOutfit,
	templeTrekkingCL,
	temporossCL,
	theatreOfBLoodCL,
	theGauntletCL,
	theInfernoCL,
	theNightmareCL,
	thermonuclearSmokeDevilCL,
	titheFarmCL,
	TRoleCategories,
	troubleBrewingCL,
	tzHaarCL,
	venenatisCL,
	vetionCL,
	volcanicMineCL,
	vorkathCL,
	wintertodtCL,
	zalcanoCL,
	zulrahCL
} from './CollectionsExport';

export const allCollectionLogs: ICollection = {
	Bosses: {
		'Abyssal Sire': {
			alias: Monsters.AbyssalSire.aliases,
			allItems: Monsters.AbyssalSire.allItems,
			items: abyssalSireCL,
			roleCategory: ['bosses']
		},
		'Alchemical Hydra': {
			alias: [...Monsters.AlchemicalHydra.aliases, 'ahydra', 'alchhydra'],
			allItems: Monsters.AlchemicalHydra.allItems,
			items: alchemicalHydraCL,
			roleCategory: ['bosses']
		},
		'Barrows Chests': {
			alias: Monsters.Barrows.aliases,
			kcActivity: Monsters.Barrows.name,
			items: barrowsChestCL,
			roleCategory: []
		},
		Bryophyta: {
			alias: Monsters.Bryophyta.aliases,
			allItems: Monsters.Bryophyta.allItems,
			items: bryophytaCL,
			roleCategory: ['bosses']
		},
		Callisto: {
			alias: Monsters.Callisto.aliases,
			allItems: Monsters.Callisto.allItems,
			items: callistoCL,
			roleCategory: ['bosses']
		},
		Cerberus: {
			alias: Monsters.Cerberus.aliases,
			allItems: Monsters.Cerberus.allItems,
			items: cerberusCL,
			roleCategory: ['bosses']
		},
		'Chaos Elemental': {
			alias: Monsters.ChaosElemental.aliases,
			allItems: Monsters.ChaosElemental.allItems,
			items: chaosElementalCL,
			roleCategory: ['bosses']
		},
		'Chaos Fanatic': {
			alias: Monsters.ChaosFanatic.aliases,
			allItems: Monsters.ChaosFanatic.allItems,
			items: chaosFanaticCL,
			roleCategory: ['bosses']
		},
		'Commander Zilyana': {
			alias: Monsters.CommanderZilyana.aliases,
			allItems: Monsters.CommanderZilyana.allItems,
			items: commanderZilyanaCL,
			roleCategory: ['bosses']
		},
		'Corporeal Beast': {
			alias: Monsters.CorporealBeast.aliases,
			allItems: Monsters.CorporealBeast.allItems,
			items: corporealBeastCL,
			roleCategory: ['bosses']
		},
		'Crazy archaeologist': {
			alias: Monsters.CrazyArchaeologist.aliases,
			allItems: Monsters.CrazyArchaeologist.allItems,
			items: crazyArchaeologistCL,
			roleCategory: ['bosses']
		},
		'Dagannoth Kings': {
			alias: ['dagannoth kings', 'kings', 'dagga', 'dks'],
			kcActivity: [Monsters.DagannothSupreme.name, Monsters.DagannothRex.name, Monsters.DagannothPrime.name],
			allItems: (() => {
				return [
					...new Set(
						...[
							Monsters.DagannothPrime.allItems,
							Monsters.DagannothSupreme.allItems,
							Monsters.DagannothRex.allItems
						]
					)
				];
			})(),
			items: dagannothKingsCL,
			roleCategory: ['bosses']
		},
		'Dagannoth Rex': {
			hidden: true,
			alias: Monsters.DagannothRex.aliases,
			allItems: Monsters.DagannothRex.allItems,
			items: dagannothRexCL
		},
		'Dagannoth Prime': {
			hidden: true,
			alias: Monsters.DagannothPrime.aliases,
			allItems: Monsters.DagannothPrime.allItems,
			items: dagannothPrimeCL
		},
		'Dagannoth Supreme': {
			hidden: true,
			alias: Monsters.DagannothSupreme.aliases,
			allItems: Monsters.DagannothSupreme.allItems,
			items: dagannothSupremeCL
		},
		'The Fight Caves': {
			kcActivity: Monsters.TzTokJad.name,
			alias: ['firecape', 'jad', 'fightcave'],
			items: fightCavesCL,
			roleCategory: ['bosses']
		},
		'The Gauntlet': {
			alias: ['gauntlet', 'crystalline hunllef', 'hunllef'],
			kcActivity: ['Gauntlet', 'CorruptedGauntlet'],
			items: theGauntletCL,
			roleCategory: ['bosses']
		},
		'General Graardor': {
			alias: Monsters.GeneralGraardor.aliases,
			allItems: Monsters.GeneralGraardor.allItems,
			items: generalGraardorCL,
			roleCategory: ['bosses']
		},
		'Giant Mole': {
			alias: Monsters.GiantMole.aliases,
			allItems: Monsters.GiantMole.allItems,
			items: giantMoleCL,
			roleCategory: ['bosses']
		},
		'Grotesque Guardians': {
			alias: Monsters.GrotesqueGuardians.aliases,
			allItems: Monsters.GrotesqueGuardians.allItems,
			items: grotesqueGuardiansCL,
			roleCategory: ['bosses']
		},
		Hespori: {
			alias: Monsters.Hespori.aliases,
			allItems: Monsters.Hespori.allItems,
			items: hesporiCL,
			roleCategory: ['bosses']
		},
		'The Inferno': {
			enabled: false,
			alias: ['zuk', 'inferno'],
			items: theInfernoCL
		},
		'Kalphite Queen': {
			alias: Monsters.KalphiteQueen.aliases,
			allItems: Monsters.KalphiteQueen.allItems,
			items: kalphiteQueenCL,
			roleCategory: ['bosses']
		},
		'King Black Dragon': {
			alias: Monsters.KingBlackDragon.aliases,
			allItems: Monsters.KingBlackDragon.allItems,
			items: kingBlackDragonCL,
			roleCategory: ['bosses']
		},
		Kraken: {
			alias: Monsters.Kraken.aliases,
			allItems: Monsters.Kraken.allItems,
			items: krakenCL,
			roleCategory: ['bosses']
		},
		"Kree'arra": {
			alias: Monsters.Kreearra.aliases,
			allItems: Monsters.Kreearra.allItems,
			items: kreeArraCL,
			roleCategory: ['bosses']
		},
		"K'ril Tsutsaroth": {
			alias: Monsters.KrilTsutsaroth.aliases,
			allItems: Monsters.KrilTsutsaroth.allItems,
			items: krilTsutsarothCL,
			roleCategory: ['bosses']
		},
		'The Nightmare': {
			alias: NightmareMonster.aliases,
			items: theNightmareCL,
			roleCategory: ['bosses']
		},
		Obor: {
			alias: Monsters.Obor.aliases,
			allItems: Monsters.Obor.allItems,
			items: oborCL,
			roleCategory: ['bosses']
		},
		Sarachnis: {
			alias: Monsters.Sarachnis.aliases,
			allItems: Monsters.Sarachnis.allItems,
			items: sarachnisCL,
			roleCategory: ['bosses']
		},
		Scorpia: {
			alias: Monsters.Scorpia.aliases,
			allItems: Monsters.Scorpia.allItems,
			items: scorpiaCL,
			roleCategory: ['bosses']
		},
		Skotizo: {
			alias: Monsters.Skotizo.aliases,
			allItems: Monsters.Skotizo.allItems,
			items: skotizoCL,
			roleCategory: ['bosses']
		},
		Tempoross: {
			items: temporossCL,
			allItems: resolveItems([...spiritAnglerOutfit, 'Spirit flakes']),
			roleCategory: ['bosses']
		},
		'Thermonuclear smoke devil': {
			alias: Monsters.ThermonuclearSmokeDevil.aliases,
			allItems: Monsters.ThermonuclearSmokeDevil.allItems,
			items: thermonuclearSmokeDevilCL,
			roleCategory: ['bosses']
		},
		Venenatis: {
			alias: Monsters.Venenatis.aliases,
			allItems: Monsters.Venenatis.allItems,
			items: venenatisCL,
			roleCategory: ['bosses']
		},
		"Vet'ion": {
			alias: Monsters.Vetion.aliases,
			allItems: Monsters.Vetion.allItems,
			items: vetionCL,
			roleCategory: ['bosses']
		},
		Vorkath: {
			alias: Monsters.Vorkath.aliases,
			allItems: Monsters.Vorkath.allItems,
			items: vorkathCL,
			roleCategory: ['bosses']
		},
		Wintertodt: {
			alias: ['todt', 'wintertodt', 'wt'],
			items: wintertodtCL,
			roleCategory: ['bosses', 'skilling']
		},
		Zalcano: { items: zalcanoCL, roleCategory: ['bosses', 'skilling'] },
		Zulrah: {
			alias: Monsters.Zulrah.aliases,
			allItems: Monsters.Zulrah.allItems,
			items: zulrahCL,
			roleCategory: ['bosses']
		}
	},
	Raids: {
		"Chamber's of Xeric": {
			alias: ChambersOfXeric.aliases,
			kcActivity: ['Raids', 'RaidsChallengeMode'],
			items: chambersOfXericCl,
			roleCategory: ['raids'],
			isActivity: true
		},
		'Theatre of Blood': {
			enabled: false,
			alias: ['tob'],
			items: theatreOfBLoodCL,
			roleCategory: ['raids'],
			isActivity: true
		}
	},
	Clues: {
		'Beginner Treasure Trails': {
			alias: ['beginner', 'clues beginner', 'clue beginner'],
			allItems: Clues.Beginner.allItems,
			kcActivity: user => {
				return user.getOpenableScore(23_245);
			},
			items: cluesBeginnerCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Easy Treasure Trails': {
			alias: ['easy', 'clues easy', 'clue easy'],
			allItems: Clues.Easy.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_546);
			},
			items: cluesEasyCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Medium Treasure Trails': {
			alias: ['medium', 'clues medium', 'clue medium'],
			allItems: Clues.Medium.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_545);
			},
			items: cluesMediumCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Hard Treasure Trails': {
			alias: ['hard', 'clues hard', 'clue hard'],
			allItems: Clues.Hard.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_544);
			},
			items: cluesHardCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Elite Treasure Trails': {
			alias: ['elite', 'clues elite', 'clue elite'],
			allItems: Clues.Elite.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_543);
			},
			items: cluesEliteCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Master Treasure Trails': {
			alias: ['master', 'clues master', 'clue master'],
			allItems: Clues.Master.allItems,
			kcActivity: user => {
				return user.getOpenableScore(19_836);
			},
			items: cluesMasterCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Hard Treasure Trail Rewards (Rare)': {
			alias: [
				'hard rares',
				'clues hard rares',
				'clue hard rares',
				'clue rare hard',
				'clue rares hard',
				'clues rares hard',
				'clues rare hard'
			],
			kcActivity: user => {
				return user.getOpenableScore(20_544);
			},
			items: cluesHardRareCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Elite Treasure Trail Rewards (Rare)': {
			alias: [
				'elite rares',
				'clues elite rares',
				'clue elite rares',
				'clue rare elite',
				'clue rares elite',
				'clues rares elite',
				'clues rare elite'
			],
			kcActivity: user => {
				return user.getOpenableScore(20_543);
			},
			items: cluesEliteRareCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Master Treasure Trail Rewards (Rare)': {
			alias: [
				'master rares',
				'clues master rares',
				'clue master rares',
				'clue rare master',
				'clue rares master',
				'clues rares master',
				'clues rare master'
			],
			kcActivity: user => {
				return user.getOpenableScore(19_836);
			},
			items: cluesMasterRareCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Shared Treasure Trail Rewards': {
			alias: ['shared', 'clues shared', 'clue shared'],
			items: cluesSharedCL,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Rare Treasure Trail Rewards': {
			alias: ['clues rare', 'rares'],
			items: [...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL],
			roleCategory: ['clues'],
			isActivity: true
		}
	},
	Minigames: {
		'Barbarian Assault': {
			alias: ['ba', 'barb assault', 'barbarian assault'],
			items: barbarianAssaultCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Brimhaven Agility Arena': {
			alias: ['aa', 'agility arena'],
			items: brimhavenAgilityArenaCL,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Castle Wars': {
			alias: ['cw', 'castle wars'],
			items: castleWarsCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Fishing Trawler': {
			alias: ['trawler', 'ft', 'fishing trawler'],
			allItems: resolveItems([
				'Broken arrow',
				'Broken glass',
				'Broken staff',
				'Buttons',
				'Damaged armour',
				'Old boot',
				'Oyster',
				'Pot',
				'Rusty sword',
				'Raw shrimps',
				'Raw sardine',
				'Raw anchovies',
				'Raw tuna',
				'Raw lobster',
				'Raw swordfish',
				'Raw shark',
				'Raw sea turtle',
				'Raw manta ray'
			]),
			items: fishingTrawlerCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Gnome Restaurant': {
			alias: ['gnome', 'restaurant'],
			allItems: resolveItems(['Snake charm', 'Gnomeball']),
			items: gnomeRestaurantCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Hallowed Sepulchre': {
			alias: ['sepulchre', 'hallowed sepulchre'],
			allItems: sepulchreFloors.map(f => f.coffinTable.allItems).flat(100),
			items: hallowedSepulchreCL,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Last Man Standing': {
			enabled: false,
			items: lastManStandingCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Magic Training Arena': {
			alias: ['mta'],
			items: magicTrainingArenaCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Mahogany Homes': {
			items: mahoganyHomesCL,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Pest Control': {
			enabled: false,
			items: pestControlCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		"Rogues' Den": {
			alias: ['rogues den', 'rd'],
			items: roguesDenCL,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		"Shades of Mort'ton": {
			enabled: false,
			items: shadesOfMorttonCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Soul Wars': {
			alias: ['soul wars', 'sw'],
			items: soulWarsCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Temple Trekking': {
			allItems: [
				...HardEncounterLoot.allItems,
				...EasyEncounterLoot.allItems,
				...MediumEncounterLoot.allItems,
				...[rewardTokens.hard, rewardTokens.medium, rewardTokens.easy]
			],
			alias: ['temple trekking', 'tt', 'temple', 'trek', 'trekking'],
			items: templeTrekkingCL,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Tithe Farm': {
			alias: ['tithe'],
			kcActivity: user => {
				return user.settings.get(UserSettings.Stats.TitheFarmsCompleted);
			},
			items: titheFarmCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Trouble Brewing': {
			enabled: false,
			items: troubleBrewingCL,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Volcanic Mine': {
			enabled: false,
			items: volcanicMineCL,
			roleCategory: ['minigames'],
			isActivity: true
		}
	},
	Others: {
		'Aerial Fishing': {
			alias: ['af', 'aerial fishing'],
			items: aerialFishingCL,
			roleCategory: ['skilling']
		},
		'All Pets': {
			alias: ['pet', 'pets'],
			items: allPetsCL,
			roleCategory: ['pets']
		},
		Camdozaal: {
			enabled: false,
			items: camdozaalCL
		},
		"Champion's Challenge": {
			alias: ['champion', 'champion scrolls', 'champion scroll', 'scroll', 'scrolls'],
			items: championsChallengeCL,
			isActivity: true
		},
		'Chaos Druids': {
			allItems: Monsters.ChaosDruid.allItems,
			kcActivity: Monsters.ChaosDruid.name,
			items: chaosDruisCL
		},
		'Chompy Birds': {
			alias: ['chompy', 'bgc', 'big chompy hunting'],
			kcActivity: 'BigChompyBirdHunting',
			items: chompyBirdsCL
		},
		'Creature Creation': {
			enabled: false,
			items: creatureCreationCL
		},
		Cyclopes: {
			alias: ['cyclops', 'wg', 'warriors guild', 'warrior guild'],
			kcActivity: Monsters.Cyclops.name,
			allItems: Monsters.Cyclops.allItems,
			items: cyclopsCL
		},
		'Fossil Island Notes': {
			enabled: false,
			items: fossilIslandNotesCL
		},
		"Glough's Experiments": {
			alias: Monsters.DemonicGorilla.aliases,
			allItems: Monsters.DemonicGorilla.allItems,
			kcActivity: Monsters.DemonicGorilla.name,
			items: demonicGorillaCL
		},
		'Monkey Backpacks': {
			alias: ['monkey', 'monkey bps', 'backpacks'],
			kcActivity: user => {
				return user.settings.get(UserSettings.LapsScores)[6];
			},
			items: monkeyBackpacksCL,
			roleCategory: ['skilling'],
			isActivity: true
		},
		'Motherlode Mine': {
			enabled: false,
			items: motherlodeMineCL
		},
		'Random Events': {
			alias: ['random'],
			items: randomEventsCL
		},
		Revenants: {
			enabled: false,
			items: revenantsCL
		},
		'Rooftop Agility': {
			alias: ['rooftop', 'laps', 'agility', 'agil'],
			items: rooftopAgilityCL,
			roleCategory: ['skilling'],
			isActivity: true
		},
		'Shayzien Armour': {
			enabled: false,
			items: shayzienArmourCL
		},
		'Shooting Stars': { enabled: false, items: resolveItems(['Celestial ring (uncharged)', 'Star fragment']) },
		'Skilling Pets': {
			alias: ['skill pets'],
			items: skillingPetsCL
		},
		Slayer: {
			alias: ['slay'],
			items: slayerCL,
			roleCategory: ['slayer']
		},
		TzHaar: {
			kcActivity: [Monsters.TzHaarKet.name],
			allItems: Monsters.TzHaarKet.allItems,
			items: tzHaarCL
		},
		Skilling: {
			items: resolveItems([
				'Prospector helmet',
				'Prospector jacket',
				'Prospector legs',
				'Prospector boots',
				'Mining gloves',
				'Superior mining gloves',
				'Expert mining gloves',
				'Golden nugget',
				'Unidentified minerals',
				'Big swordfish',
				'Big shark',
				'Big bass',
				'Tangleroot',
				'Bottomless compost bucket',
				"Farmer's strawhat",
				"Farmer's jacket",
				"Farmer's shirt",
				"Farmer's boro trousers",
				"Farmer's boots",
				"Pharaoh's sceptre (3)",
				'Baby chinchompa',
				'Kyatt hat',
				'Kyatt top',
				'Kyatt legs',
				'Spotted cape',
				'Spottier cape',
				'Gloves of silence',
				'Small pouch',
				'Medium pouch',
				'Large pouch',
				'Giant pouch',
				'Crystal pickaxe',
				'Crystal axe',
				'Crystal harpoon',
				'Rift guardian',
				'Rock golem',
				'Heron',
				'Rocky',
				'Herbi',
				'Beaver'
			]),
			roleCategory: ['skilling']
		},
		Miscellaneous: {
			alias: ['misc'],
			items: miscellaneousCL
		}
	},
	Custom: {
		Holiday: {
			counts: false,
			items: holidayCL
		},
		Daily: {
			counts: false,
			alias: ['diango'],
			items: dailyCL
		},
		Capes: {
			counts: false,
			items: capesCL
		},
		Quest: {
			counts: false,
			items: questCL
		}
	}
};

// Get all items, from all monsters and all CLs into a variable, for uses like mostdrops
export const allDroppedItems = [
	...new Set([
		...Object.entries(allCollectionLogs)
			.map(e =>
				Object.entries(e[1])
					.filter(f => f[1].enabled === undefined && f[1].hidden === undefined && f[1].counts === undefined)
					.map(a => [...new Set([...a[1].items, ...(a[1].allItems !== undefined ? a[1].allItems : [])])])
			)
			.flat(100),
		...Object.values(Monsters)
			.map(m => (m && m.allItems ? m.allItems : []))
			.flat(100)
	])
];

// Get all the log items into a single variable
export const allCLItems = [
	...new Set(
		Object.entries(allCollectionLogs)
			.map(e =>
				Object.entries(e[1])
					.filter(f => f[1].enabled === undefined && f[1].hidden === undefined && f[1].counts === undefined)
					.map(a => a[1].items)
			)
			.flat(100)
	)
];

// Get the collections for the custom discord roles
export const collectionLogRoleCategories: { [key: string]: number[] } = {
	bosses: getItemsRole('bosses'),
	skilling: getItemsRole('skilling'),
	raids: getItemsRole('raids'),
	slayer: getItemsRole('slayer'),
	minigames: getItemsRole('minigames'),
	pets: getItemsRole('pets'),
	clues: getItemsRole('clues'),
	overall: allCLItems
};

// To avoid code duplication, makes it into a function
export function getItemsRole(role: TRoleCategories) {
	return [
		...new Set(
			Object.values(allCollectionLogs)
				.map(c =>
					Object.values(c)
						.map(a => {
							if (a.hidden === undefined || a.enabled === undefined)
								return a.roleCategory?.includes(role) ? a.items : undefined;
						})
						.filter(f => f !== undefined)
				)
				.flat(100) as number[]
		)
	];
}

export function converCLtoBank(items: number[]) {
	const clBank = new Bank();
	for (const item of items) {
		clBank.add(item, 1);
	}
	return clBank;
}

// Get the left list to be added to the cls
function getLeftList(userBank: Bank, checkCategory: string, allItems: boolean = false): ILeftListStatus {
	let leftList: ILeftListStatus = {};
	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (category === checkCategory) {
			for (const [activityName, attributes] of Object.entries(entries)) {
				if (attributes.enabled === false || attributes.hidden === true) continue;
				let items: number[] = [];
				if (allItems && attributes.allItems) {
					items = [...new Set([...attributes.items, ...attributes.allItems])];
				} else {
					items = attributes.items;
				}
				const clItemBank = converCLtoBank(items);
				const totalCl = clItemBank.items().length;
				const userAmount = clItemBank.items().length - clItemBank.remove(userBank).items().length;
				leftList[activityName] =
					userAmount === 0 ? 'not_started' : userAmount === totalCl ? 'completed' : 'started';
			}
		}
	}
	return leftList;
}

// Get the total items the user has in its CL and the total items to collect
export function getTotalCl(user: KlasaUser, logType: 'sacrifice' | 'bank' | 'collection') {
	const userCheckBank = new Bank();
	switch (logType) {
		case 'collection':
			userCheckBank.add(user.settings.get(UserSettings.CollectionLogBank));
			break;
		case 'bank':
			userCheckBank.add(user.bank());
			break;
		case 'sacrifice':
			userCheckBank.add(user.settings.get(UserSettings.SacrificedBank));
			break;
	}

	const clItems = Object.keys(userCheckBank.bank).map(i => parseInt(i));
	const owned = clItems.filter(i => allCLItems.includes(i));
	return [owned.length, allCLItems.length];
}

export function getPossibleOptions() {
	const roles: [string, string, string][] = [];
	const categories: [string, string, string][] = [];
	const activities: [string, string, string][] = [];

	// Get categories and enabled activities
	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		categories.push(['General', category, '']);
		for (const [activityName, attributes] of Object.entries(entries)) {
			if (attributes.enabled === false || attributes.hidden === true) continue;
			categories.push(['Activity', activityName, attributes.alias ? attributes.alias.join(', ') : '']);
		}
	}
	// get log roles
	for (const role of Object.keys(collectionLogRoleCategories)) {
		categories.push(['Discord Roles', role, '']);
	}
	// get monsters
	for (const monster of effectiveMonsters) {
		categories.push(['Monsters', monster.name, monster.aliases ? monster.aliases.join(', ') : '']);
	}
	const normalTable = table([['Type', 'Name', 'Alias'], ...[...categories, ...activities, ...roles]]);
	return new MessageAttachment(Buffer.from(normalTable), 'possible_logs.txt');
}

function stringMatchNoS(string1: string, string2: string) {
	let match = stringMatches(string1, string2);
	if (!match) match = stringMatches(string1, string2.substr(0, string2.length - 1));
	if (!match) match = stringMatches(string1, string2.substr(0, string2.length - 2));
	if (!match) match = stringMatches(string1.substr(0, string1.length - 1), string2);
	if (!match) match = stringMatches(string1.substr(0, string1.length - 2), string2);
	return match;
}

export function getCollectionItems(collection: string, allItems = false): number[] {
	let _items: number[] = [];
	loop: for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (stringMatchNoS(category, collection)) {
			_items = [
				...new Set(
					Object.entries(entries)
						.filter(e => e[1].enabled === undefined)
						.map(e => [...new Set([...e[1].items, ...(allItems && e[1].allItems ? e[1].allItems : [])])])
						.flat(2)
				)
			];
			break;
		}
		for (const [activityName, attributes] of Object.entries(entries)) {
			if (
				attributes.enabled === undefined &&
				(stringMatchNoS(activityName, collection) ||
					(attributes.alias && attributes.alias.find(a => stringMatchNoS(a, collection))))
			) {
				_items = [
					...new Set([...attributes.items, ...(allItems && attributes.allItems ? attributes.allItems : [])])
				];
				break loop;
			}
		}
	}
	if (_items.length === 0) {
		_items = collectionLogRoleCategories[collection.toLowerCase().replace('role', '')] ?? [];
	}
	if (_items.length === 0) {
		const _monster = killableMonsters.find(
			m => stringMatchNoS(m.name, collection) || m.aliases.some(name => stringMatchNoS(name, collection))
		);
		if (_monster) {
			_items = Array.from(new Set(Object.values(Monsters.get(_monster!.id)!.allItems!).flat(100))) as number[];
		}
	}
	return _items;
}

function getUserClData(usarBank: ItemBank, clItems: number[]) {
	const clItemBank = converCLtoBank(clItems);
	const totalCl = clItemBank.items().length;
	const userAmount = clItemBank.items().length - clItemBank.remove(usarBank).items().length;
	return [totalCl, userAmount];
}

// Main function that gets the user collection based on its search parameter
export async function getCollection(options: {
	user: KlasaUser;
	search: string;
	flags: { [key: string]: string | number };
	logType?: 'collection' | 'sacrifice' | 'bank';
}): Promise<false | IToReturnCollection> {
	let { user, search, flags, logType } = options;

	await user.settings.sync(true);

	const allItems = Boolean(flags.all);
	if (logType === undefined) logType = 'collection';

	let userCheckBank = new Bank();

	switch (logType) {
		case 'collection':
			userCheckBank.add(user.settings.get(UserSettings.CollectionLogBank));
			break;
		case 'bank':
			userCheckBank.add(user.bank());
			break;
		case 'sacrifice':
			userCheckBank.add(user.settings.get(UserSettings.SacrificedBank));
			break;
	}

	let clItems = getCollectionItems(search, allItems);
	if (Boolean(flags.missing)) {
		clItems = clItems.filter(i => !userCheckBank.has(i));
	}
	const [totalCl, userAmount] = getUserClData(userCheckBank.bank, clItems);

	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (stringMatchNoS(category, search)) {
			return {
				category,
				name: category,
				collection: clItems,
				collectionObtained: userAmount,
				collectionTotal: totalCl,
				leftList: getLeftList(userCheckBank, category, allItems),
				userItems: userCheckBank
			};
		}
		for (const [activityName, attributes] of Object.entries(entries)) {
			if (
				attributes.enabled !== false &&
				(stringMatches(activityName, search) ||
					stringMatches(activityName, search.substr(0, search.length - 1)) ||
					(attributes.alias && attributes.alias.find(a => stringMatches(a, search))) ||
					(attributes.alias &&
						attributes.alias.find(a => stringMatches(a, search.substr(0, search.length - 1)))))
			) {
				let userKC = 0;
				if (attributes.kcActivity && Array.isArray(attributes.kcActivity)) {
					for (const name of attributes.kcActivity) {
						userKC += (await user.getKCByName(name))[1];
					}
				} else if (attributes.kcActivity && typeof attributes.kcActivity === 'function') {
					userKC += attributes.kcActivity(user);
				} else {
					userKC += (await user.getKCByName(attributes.kcActivity ? attributes.kcActivity : activityName))[1];
				}
				return {
					category,
					name: activityName,
					collection: clItems,
					completions: userKC,
					isActivity: attributes.isActivity,
					collectionObtained: userAmount,
					collectionTotal: totalCl,
					leftList: getLeftList(userCheckBank, category, allItems && attributes.allItems !== undefined),
					userItems: userCheckBank
				};
			}
		}
	}

	// If didnt found it above, check for categories
	const roleCategory = collectionLogRoleCategories[search.toLowerCase().replace('role', '')];
	if (roleCategory) {
		return {
			category: 'Custom',
			name: search,
			collection: roleCategory,
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank
		};
	}
	const monster = killableMonsters.find(
		_type => stringMatches(_type.name, search) || _type.aliases.some(name => stringMatches(name, search))
	);
	if (monster) {
		return {
			category: 'Others',
			name: monster.name,
			collection: clItems,
			completions: user.getKC(monster.id),
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank
		};
	}

	return false;
}
