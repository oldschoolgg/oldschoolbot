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
import { NexNonUniqueTable, NexUniqueTable } from '../simulation/misc';
import { allFarmingItems } from '../skilling/skills/farming';
import { ItemBank } from '../types';
import { addArrayOfNumbers, stringMatches } from '../util';
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
	chambersOfXericCL,
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
	dailyCL,
	demonicGorillaCL,
	fightCavesCL,
	fishingTrawlerCL,
	fossilIslandNotesCL,
	generalGraardorCL,
	giantMoleCL,
	gnomeRestaurantCL,
	godWarsDungeonCL,
	gracefulCL,
	grotesqueGuardiansCL,
	hallowedSepulchreCL,
	hesporiCL,
	ICollection,
	ILeftListStatus,
	implingsCL,
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
	NexCL,
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
		alias: ['boss'],
		activities: {
			'Abyssal Sire': {
				alias: Monsters.AbyssalSire.aliases,
				allItems: Monsters.AbyssalSire.allItems,
				items: abyssalSireCL
			},
			'Alchemical Hydra': {
				alias: [...Monsters.AlchemicalHydra.aliases, 'ahydra', 'alchhydra'],
				allItems: Monsters.AlchemicalHydra.allItems,
				items: alchemicalHydraCL
			},
			'Barrows Chests': {
				alias: Monsters.Barrows.aliases,
				kcActivity: Monsters.Barrows.name,
				items: barrowsChestCL
			},
			Bryophyta: {
				alias: Monsters.Bryophyta.aliases,
				allItems: Monsters.Bryophyta.allItems,
				items: bryophytaCL
			},
			Callisto: {
				alias: Monsters.Callisto.aliases,
				allItems: Monsters.Callisto.allItems,
				items: callistoCL
			},
			Cerberus: {
				alias: Monsters.Cerberus.aliases,
				allItems: Monsters.Cerberus.allItems,
				items: cerberusCL
			},
			'Chaos Elemental': {
				alias: Monsters.ChaosElemental.aliases,
				allItems: Monsters.ChaosElemental.allItems,
				items: chaosElementalCL
			},
			'Chaos Fanatic': {
				alias: Monsters.ChaosFanatic.aliases,
				allItems: Monsters.ChaosFanatic.allItems,
				items: chaosFanaticCL
			},
			'Commander Zilyana': {
				alias: Monsters.CommanderZilyana.aliases,
				allItems: Monsters.CommanderZilyana.allItems,
				items: commanderZilyanaCL
			},
			'Corporeal Beast': {
				alias: Monsters.CorporealBeast.aliases,
				allItems: Monsters.CorporealBeast.allItems,
				items: corporealBeastCL
			},
			'Crazy archaeologist': {
				alias: Monsters.CrazyArchaeologist.aliases,
				allItems: Monsters.CrazyArchaeologist.allItems,
				items: crazyArchaeologistCL
			},
			'Dagannoth Kings': {
				alias: ['dagannoth kings', 'kings', 'dagga', 'dks'],
				kcActivity: {
					Default: [Monsters.DagannothSupreme.name, Monsters.DagannothRex.name, Monsters.DagannothPrime.name],
					Rex: Monsters.DagannothRex.name,
					Prime: Monsters.DagannothPrime.name,
					Supreme: Monsters.DagannothSupreme.name
				},
				allItems: [
					...Monsters.DagannothPrime.allItems,
					...Monsters.DagannothSupreme.allItems,
					...Monsters.DagannothRex.allItems
				],
				items: dagannothKingsCL
			},
			'The Fight Caves': {
				kcActivity: Monsters.TzTokJad.name,
				alias: ['firecape', 'jad', 'fightcave'],
				items: fightCavesCL
			},
			'The Gauntlet': {
				alias: ['gauntlet', 'crystalline hunllef', 'hunllef'],
				kcActivity: {
					Default: user => user.getMinigameScore('gauntlet'),
					Corrupted: user => user.getMinigameScore('corrupted_gauntlet')
				},
				items: theGauntletCL
			},
			'General Graardor': {
				alias: Monsters.GeneralGraardor.aliases,
				allItems: Monsters.GeneralGraardor.allItems,
				items: generalGraardorCL
			},
			'Giant Mole': {
				alias: Monsters.GiantMole.aliases,
				allItems: Monsters.GiantMole.allItems,
				items: giantMoleCL
			},
			'Grotesque Guardians': {
				alias: Monsters.GrotesqueGuardians.aliases,
				allItems: Monsters.GrotesqueGuardians.allItems,
				items: grotesqueGuardiansCL
			},
			Hespori: {
				alias: Monsters.Hespori.aliases,
				allItems: Monsters.Hespori.allItems,
				items: hesporiCL
			},
			'The Inferno': {
				alias: ['zuk', 'inferno'],
				items: theInfernoCL
			},
			'Kalphite Queen': {
				alias: Monsters.KalphiteQueen.aliases,
				allItems: Monsters.KalphiteQueen.allItems,
				items: kalphiteQueenCL
			},
			'King Black Dragon': {
				alias: Monsters.KingBlackDragon.aliases,
				allItems: Monsters.KingBlackDragon.allItems,
				items: kingBlackDragonCL
			},
			Kraken: {
				alias: Monsters.Kraken.aliases,
				allItems: Monsters.Kraken.allItems,
				items: krakenCL
			},
			"Kree'arra": {
				alias: Monsters.Kreearra.aliases,
				allItems: Monsters.Kreearra.allItems,
				items: kreeArraCL
			},
			"K'ril Tsutsaroth": {
				alias: Monsters.KrilTsutsaroth.aliases,
				allItems: Monsters.KrilTsutsaroth.allItems,
				items: krilTsutsarothCL
			},
			Nex: {
				alias: ['nex'],
				allItems: [...NexUniqueTable.allItems, ...NexNonUniqueTable.allItems],
				items: NexCL
			},
			'The Nightmare': {
				alias: [...NightmareMonster.aliases, 'phosani'],
				kcActivity: {
					Default: 'Nightmare',
					Phosani: "Phosani's Nightmare"
				},
				items: theNightmareCL
			},
			Obor: {
				alias: Monsters.Obor.aliases,
				allItems: Monsters.Obor.allItems,
				items: oborCL
			},
			Sarachnis: {
				alias: Monsters.Sarachnis.aliases,
				allItems: Monsters.Sarachnis.allItems,
				items: sarachnisCL
			},
			Scorpia: {
				alias: Monsters.Scorpia.aliases,
				allItems: Monsters.Scorpia.allItems,
				items: scorpiaCL
			},
			Skotizo: {
				alias: Monsters.Skotizo.aliases,
				allItems: Monsters.Skotizo.allItems,
				items: skotizoCL
			},
			Tempoross: {
				alias: ['tempoross', 'temp', 'tempo', 'tr', 'watertodt', 'ross'],
				items: temporossCL,
				allItems: resolveItems([...spiritAnglerOutfit, 'Spirit flakes'])
			},
			'Thermonuclear smoke devil': {
				alias: Monsters.ThermonuclearSmokeDevil.aliases,
				allItems: Monsters.ThermonuclearSmokeDevil.allItems,
				items: thermonuclearSmokeDevilCL
			},
			Venenatis: {
				alias: Monsters.Venenatis.aliases,
				allItems: Monsters.Venenatis.allItems,
				items: venenatisCL
			},
			"Vet'ion": {
				alias: Monsters.Vetion.aliases,
				allItems: Monsters.Vetion.allItems,
				items: vetionCL
			},
			Vorkath: {
				alias: Monsters.Vorkath.aliases,
				allItems: Monsters.Vorkath.allItems,
				items: vorkathCL
			},
			Wintertodt: {
				alias: ['todt', 'wintertodt', 'wt'],
				items: wintertodtCL
			},
			Zalcano: { items: zalcanoCL },
			Zulrah: {
				alias: Monsters.Zulrah.aliases,
				allItems: Monsters.Zulrah.allItems,
				items: zulrahCL
			}
		}
	},
	Raids: {
		activities: {
			"Chamber's of Xeric": {
				alias: ChambersOfXeric.aliases,
				kcActivity: {
					Default: user => user.getMinigameScore('raids'),
					Challenge: user => user.getMinigameScore('raids_challenge_mode')
				},
				items: chambersOfXericCL,

				isActivity: true
			},
			'Theatre of Blood': {
				alias: ['tob'],
				kcActivity: {
					Default: user => user.getMinigameScore('tob'),
					Hard: user => user.getMinigameScore('tob_hard')
				},
				items: theatreOfBLoodCL,

				isActivity: true
			}
		}
	},
	Clues: {
		activities: {
			'Beginner Treasure Trails': {
				alias: ['beginner', 'clues beginner', 'clue beginner'],
				allItems: Clues.Beginner.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[23_245] || 0
				},
				items: cluesBeginnerCL,

				isActivity: true
			},
			'Easy Treasure Trails': {
				alias: ['easy', 'clues easy', 'clue easy'],
				allItems: Clues.Easy.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_546] || 0
				},
				items: cluesEasyCL,

				isActivity: true
			},
			'Medium Treasure Trails': {
				alias: ['medium', 'clues medium', 'clue medium'],
				allItems: Clues.Medium.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_545] || 0
				},
				items: cluesMediumCL,
				isActivity: true
			},
			'Hard Treasure Trails': {
				alias: ['hard', 'clues hard', 'clue hard'],
				allItems: Clues.Hard.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_544] || 0
				},
				items: cluesHardCL,
				isActivity: true
			},
			'Elite Treasure Trails': {
				alias: ['elite', 'clues elite', 'clue elite'],
				allItems: Clues.Elite.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_543] || 0
				},
				items: cluesEliteCL,
				isActivity: true
			},
			'Master Treasure Trails': {
				alias: ['master', 'clues master', 'clue master'],
				allItems: Clues.Master.allItems,
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[19_836] || 0
				},
				items: cluesMasterCL,
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
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_544] || 0
				},
				items: cluesHardRareCL,
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
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[20_543] || 0
				},
				items: cluesEliteRareCL,
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
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.ClueScores)[19_836] || 0
				},
				items: cluesMasterRareCL,
				isActivity: true
			},
			'Shared Treasure Trail Rewards': {
				alias: ['shared', 'clues shared', 'clue shared'],
				kcActivity: {
					Default: async user =>
						(user.settings.get(UserSettings.ClueScores)[23_245] || 0) +
						(user.settings.get(UserSettings.ClueScores)[20_546] || 0) +
						(user.settings.get(UserSettings.ClueScores)[20_545] || 0) +
						(user.settings.get(UserSettings.ClueScores)[20_544] || 0) +
						(user.settings.get(UserSettings.ClueScores)[20_543] || 0) +
						(user.settings.get(UserSettings.ClueScores)[19_836] || 0)
				},
				items: cluesSharedCL,

				isActivity: true
			},
			'Rare Treasure Trail Rewards': {
				alias: ['clues rare', 'rares'],
				kcActivity: {
					Default: async user =>
						(user.settings.get(UserSettings.ClueScores)[20_544] || 0) +
						(user.settings.get(UserSettings.ClueScores)[20_543] || 0) +
						(user.settings.get(UserSettings.ClueScores)[19_836] || 0)
				},
				items: [...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL],
				isActivity: true
			}
		}
	},
	Minigames: {
		activities: {
			'Barbarian Assault': {
				alias: ['ba', 'barb assault', 'barbarian assault'],
				items: barbarianAssaultCL,
				kcActivity: {
					Default: async user => user.getMinigameScore('barb_assault'),
					'High Gambles': async user => user.settings.get(UserSettings.HighGambles)
				},
				isActivity: true
			},
			'Brimhaven Agility Arena': {
				alias: ['aa', 'agility arena'],
				items: brimhavenAgilityArenaCL,
				isActivity: true
			},
			'Castle Wars': {
				alias: ['cw', 'castle wars'],
				items: castleWarsCL,
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
				isActivity: true
			},
			'Gnome Restaurant': {
				alias: ['gnome', 'restaurant'],
				allItems: resolveItems(['Snake charm', 'Gnomeball']),
				items: gnomeRestaurantCL,
				isActivity: true
			},
			'Hallowed Sepulchre': {
				alias: ['sepulchre', 'hallowed sepulchre'],
				allItems: sepulchreFloors.map(f => f.coffinTable.allItems).flat(100),
				items: hallowedSepulchreCL,
				isActivity: true
			},
			'Last Man Standing': {
				items: lastManStandingCL,
				isActivity: true,
				kcActivity: {
					Default: user => user.getMinigameScore('lms')
				},
				alias: ['lms']
			},
			'Magic Training Arena': {
				alias: ['mta'],
				items: magicTrainingArenaCL,
				isActivity: true
			},
			'Mahogany Homes': {
				items: mahoganyHomesCL,
				isActivity: true
			},
			'Pest Control': {
				items: pestControlCL,
				isActivity: true,
				alias: ['pc']
			},
			"Rogues' Den": {
				alias: ['rogues den', 'rd'],
				items: roguesDenCL,
				isActivity: true
			},
			"Shades of Mort'ton": {
				items: shadesOfMorttonCL,
				isActivity: true
			},
			'Soul Wars': {
				alias: ['soul wars', 'sw'],
				items: soulWarsCL,
				allItems: resolveItems(['Blue soul cape']),
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
				isActivity: true
			},
			'Tithe Farm': {
				alias: ['tithe'],
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.Stats.TitheFarmsCompleted)
				},
				items: titheFarmCL,
				isActivity: true
			},
			'Trouble Brewing': {
				items: troubleBrewingCL,
				isActivity: true
			},
			'Volcanic Mine': {
				items: volcanicMineCL,
				alias: ['vm', 'vmine', 'volcanic'],
				isActivity: true
			}
		}
	},
	Other: {
		activities: {
			'Aerial Fishing': {
				alias: ['af', 'aerial fishing'],
				items: aerialFishingCL
			},
			'All Pets': {
				alias: ['pet', 'pets'],
				items: allPetsCL
			},
			Camdozaal: {
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
				alias: ['chompy', 'bgc', 'big chompy hunting', 'ch', 'chompyhunting', 'chompyhunt'],
				kcActivity: 'BigChompyBirdHunting',
				items: chompyBirdsCL
			},
			'Creature Creation': {
				items: creatureCreationCL
			},
			Cyclopes: {
				alias: ['cyclops', 'wg', 'warriors guild', 'warrior guild'],
				kcActivity: Monsters.Cyclops.name,
				allItems: Monsters.Cyclops.allItems,
				items: cyclopsCL
			},
			'Fossil Island Notes': {
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
				kcActivity: {
					Default: async user => user.settings.get(UserSettings.LapsScores)[6] || 0
				},
				items: monkeyBackpacksCL,
				isActivity: true
			},
			'Motherlode Mine': {
				alias: ['mlm'],
				items: motherlodeMineCL
			},
			'Random Events': {
				alias: ['random'],
				items: randomEventsCL
			},
			Revenants: {
				alias: ['revs'],
				kcActivity: {
					Default: async user => {
						return addArrayOfNumbers(
							[
								Monsters.RevenantImp.id,
								Monsters.RevenantGoblin.id,
								Monsters.RevenantPyrefiend.id,
								Monsters.RevenantHobgoblin.id,
								Monsters.RevenantCyclops.id,
								Monsters.RevenantHellhound.id,
								Monsters.RevenantDemon.id,
								Monsters.RevenantOrk.id,
								Monsters.RevenantDarkBeast.id,
								Monsters.RevenantKnight.id,
								Monsters.RevenantDragon.id
							].map(i => user.getKC(i))
						);
					}
				},
				allItems: [
					...Monsters.RevenantImp.allItems,
					...Monsters.RevenantGoblin.allItems,
					...Monsters.RevenantPyrefiend.allItems,
					...Monsters.RevenantHobgoblin.allItems,
					...Monsters.RevenantCyclops.allItems,
					...Monsters.RevenantHellhound.allItems,
					...Monsters.RevenantDemon.allItems,
					...Monsters.RevenantOrk.allItems,
					...Monsters.RevenantDarkBeast.allItems,
					...Monsters.RevenantKnight.allItems,
					...Monsters.RevenantDragon.allItems
				],
				items: revenantsCL
			},
			'Rooftop Agility': {
				alias: ['rooftop', 'laps', 'agility', 'agil'],
				items: rooftopAgilityCL,
				isActivity: true
			},
			'Shayzien Armour': {
				items: shayzienArmourCL
			},
			'Shooting Stars': { items: resolveItems(['Celestial ring (uncharged)', 'Star fragment']) },
			'Skilling Pets': {
				alias: ['skill pets'],
				items: skillingPetsCL
			},
			Slayer: {
				alias: ['slay'],
				items: slayerCL
			},
			TzHaar: {
				kcActivity: Monsters.TzHaarKet.name,
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
					'Beaver',
					'Giant squirrel'
				])
			},
			Miscellaneous: {
				alias: ['misc'],
				items: miscellaneousCL
			}
		}
	},
	Custom: {
		activities: {
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
			},
			Farming: {
				counts: false,
				items: allFarmingItems
			},
			Implings: {
				counts: false,
				items: implingsCL
			},
			Graceful: {
				counts: false,
				items: gracefulCL
			},
			'God Wars Dungeon': {
				counts: false,
				alias: ['gwd', 'god wars'],
				kcActivity: {
					Default: [
						Monsters.CommanderZilyana.name,
						Monsters.KrilTsutsaroth.name,
						Monsters.Kreearra.name,
						Monsters.GeneralGraardor.name
					]
				},
				allItems: [
					...Monsters.CommanderZilyana.allItems,
					...Monsters.KrilTsutsaroth.allItems,
					...Monsters.Kreearra.allItems,
					...Monsters.GeneralGraardor.allItems
				],
				items: godWarsDungeonCL
			}
		}
	}
};
// Get all items, from all monsters and all CLs into a variable, for uses like mostdrops
export const allDroppedItems = [
	...new Set([
		...Object.entries(allCollectionLogs)
			.map(e =>
				Object.entries(e[1].activities).map(a => [
					...new Set([...a[1].items, ...(a[1].allItems !== undefined ? a[1].allItems : [])])
				])
			)
			.flat(100),
		...Object.values(Monsters)
			.map(m => (m && m.allItems ? m.allItems : []))
			.flat(100)
	])
];

export const allCLItems = [
	...new Set(
		Object.entries(allCollectionLogs)
			.map(e => Object.entries(e[1].activities).map(a => a[1].items))
			.flat(100)
	)
];

export const allCLItemsFiltered = [
	...new Set(
		Object.entries(allCollectionLogs)
			.map(e =>
				Object.entries(e[1].activities)
					.filter(f => f[1].counts === undefined)
					.map(a => a[1].items)
			)
			.flat(100)
	)
];
export function convertCLtoBank(items: number[]) {
	const clBank = new Bank();
	for (const item of items) {
		clBank.add(item, 1);
	}
	return clBank;
}

// Get the left list to be added to the cls
function getLeftList(
	userBank: Bank,
	checkCategory: string,
	allItems: boolean = false,
	removeCoins = false
): ILeftListStatus {
	let leftList: ILeftListStatus = {};
	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (category === checkCategory) {
			// Sort list by alphabetical order
			const catEntries = Object.entries(entries.activities).sort((a, b) => 0 - (a > b ? -1 : 1));
			for (const [activityName, attributes] of catEntries) {
				let items: number[] = [];
				if (allItems && attributes.allItems) {
					items = [...new Set([...attributes.items, ...attributes.allItems])];
				} else {
					items = [...new Set(attributes.items)];
				}
				if (removeCoins && items.includes(995)) items.splice(items.indexOf(995), 1);
				const [totalCl, userAmount] = getUserClData(userBank.bank, items);
				leftList[activityName] =
					userAmount === 0 ? 'not_started' : userAmount === totalCl ? 'completed' : 'started';
			}
		}
	}
	return leftList;
}

export function getBank(user: KlasaUser, type: 'sacrifice' | 'bank' | 'collection' | 'temp') {
	const userCheckBank = new Bank();
	switch (type) {
		case 'collection':
			userCheckBank.add(user.settings.get(UserSettings.CollectionLogBank));
			break;
		case 'bank':
			userCheckBank.add(user.bank({ withGP: true }));
			break;
		case 'sacrifice':
			userCheckBank.add(user.settings.get(UserSettings.SacrificedBank));
			break;
		case 'temp':
			userCheckBank.add(user.settings.get(UserSettings.TempCL));
			break;
	}
	return userCheckBank;
}

// Get the total items the user has in its CL and the total items to collect
export function getTotalCl(user: KlasaUser, logType: 'sacrifice' | 'bank' | 'collection' | 'temp') {
	return getUserClData(getBank(user, logType).bank, allCLItemsFiltered);
}

export function getPossibleOptions() {
	const roles: [string, string, string][] = [];
	const categories: [string, string, string][] = [];
	const activities: [string, string, string][] = [];

	// Get categories and enabled activities
	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		categories.push(['General', category, entries.alias ? entries.alias.join(', ') : '']);
		for (const [activityName, attributes] of Object.entries(entries.activities)) {
			categories.push(['Activity', activityName, attributes.alias ? attributes.alias.join(', ') : '']);
		}
	}

	// get monsters
	for (const monster of effectiveMonsters) {
		categories.push(['Monsters', monster.name, monster.aliases ? monster.aliases.join(', ') : '']);
	}
	const normalTable = table([['Type', 'Name', 'Alias'], ...[...categories, ...activities, ...roles]]);
	return new MessageAttachment(Buffer.from(normalTable), 'possible_logs.txt');
}

export function getCollectionItems(collection: string, allItems = false, removeCoins = false): number[] {
	if (['overall', 'all'].some(s => stringMatches(collection, s))) {
		return allCLItemsFiltered;
	}

	let _items: number[] = [];
	loop: for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (
			stringMatches(category, collection) ||
			(entries.alias && entries.alias.some(a => stringMatches(a, collection)))
		) {
			_items = [
				...new Set(
					Object.entries(entries.activities)

						.map(e => [...new Set([...e[1].items, ...(allItems && e[1].allItems ? e[1].allItems : [])])])
						.flat(2)
				)
			];
			break;
		}
		for (const [activityName, attributes] of Object.entries(entries.activities)) {
			if (
				stringMatches(activityName, collection) ||
				(attributes.alias && attributes.alias.find(a => stringMatches(a, collection)))
			) {
				_items = [
					...new Set([...attributes.items, ...(allItems && attributes.allItems ? attributes.allItems : [])])
				];
				break loop;
			}
		}
	}

	if (_items.length === 0) {
		const _monster = killableMonsters.find(
			m => stringMatches(m.name, collection) || m.aliases.some(name => stringMatches(name, collection))
		);
		if (_monster) {
			_items = Array.from(new Set(Object.values(Monsters.get(_monster!.id)!.allItems!).flat(100))) as number[];
		}
	}
	if (removeCoins && _items.includes(995)) _items.splice(_items.indexOf(995), 1);
	return _items;
}

function getUserClData(usarBank: ItemBank, clItems: number[]) {
	const owned = Object.keys(usarBank).filter(i => clItems.includes(Number(i)));
	return [clItems.length, owned.length];
}

// Main function that gets the user collection based on its search parameter
export async function getCollection(options: {
	user: KlasaUser;
	search: string;
	flags: { [key: string]: string | number };
	logType?: 'collection' | 'sacrifice' | 'bank' | 'temp';
}): Promise<false | IToReturnCollection> {
	let { user, search, flags, logType } = options;

	await user.settings.sync(true);

	const allItems = Boolean(flags.all);
	if (logType === undefined) logType = 'collection';

	const userCheckBank = getBank(user, logType);
	let clItems = getCollectionItems(search, allItems, logType === 'sacrifice');

	if (Boolean(flags.missing)) {
		clItems = clItems.filter(i => !userCheckBank.has(i));
	}

	const [totalCl, userAmount] = getUserClData(userCheckBank.bank, clItems);

	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (stringMatches(category, search) || (entries.alias && entries.alias.some(a => stringMatches(a, search)))) {
			return {
				category,
				name: category,
				collection: clItems,
				collectionObtained: userAmount,
				collectionTotal: totalCl,
				leftList: getLeftList(userCheckBank, category, allItems, logType === 'sacrifice'),
				userItems: userCheckBank,
				counts: false
			};
		}
		for (const [activityName, attributes] of Object.entries(entries.activities)) {
			if (
				stringMatches(activityName, search) ||
				(attributes.alias && attributes.alias.find(a => stringMatches(a, search)))
			) {
				let userKC: Record<string, number> | undefined = { Default: 0 };

				// Defaults to the activity name
				if (attributes.kcActivity) {
					if (typeof attributes.kcActivity === 'string') {
						userKC.Default += (await user.getKCByName(attributes.kcActivity))[1];
					} else {
						for (const [type, value] of Object.entries(attributes.kcActivity)) {
							if (!userKC[type]) userKC[type] = 0;
							if (Array.isArray(value)) {
								for (const name of value) {
									userKC[type] += (await user.getKCByName(name))[1];
								}
							} else if (typeof value === 'function') {
								userKC[type] += await value(user);
							} else {
								userKC[type] += (await user.getKCByName(value))[1];
							}
						}
					}
				} else {
					const defaultKc = await user.getKCByName(activityName);
					if (defaultKc[0] !== null) userKC.Default += defaultKc[1];
					else userKC = undefined;
				}
				return {
					category,
					name: activityName,
					collection: clItems,
					completions: userKC,
					isActivity: attributes.isActivity,
					collectionObtained: userAmount,
					collectionTotal: totalCl,
					leftList: getLeftList(
						userCheckBank,
						category,
						allItems && attributes.allItems !== undefined,
						logType === 'sacrifice'
					),
					userItems: userCheckBank,
					counts: attributes.counts ?? true
				};
			}
		}
	}

	const monster = killableMonsters.find(
		_type => stringMatches(_type.name, search) || _type.aliases.some(name => stringMatches(name, search))
	);
	if (monster) {
		return {
			category: 'Other',
			name: monster.name,
			collection: clItems,
			completions: { Default: user.getKC(monster.id) },
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank,
			counts: false
		};
	}

	return false;
}
