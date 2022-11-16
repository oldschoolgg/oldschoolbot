import { User } from '@prisma/client';
import { AttachmentBuilder } from 'discord.js';
import { calcWhatPercent, uniqueArr } from 'e';
import { Bank, Clues, Monsters } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';
import { table } from 'table';

import { getKCByName, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { CollectionLogType } from '../collectionLogTask';
import { dyedItems } from '../dyedItems';
import { growablePets } from '../growablePets';
import { Inventions } from '../invention/inventions';
import killableMonsters, { effectiveMonsters, NightmareMonster } from '../minions/data/killableMonsters';
import { Ignecarus } from '../minions/data/killableMonsters/custom/bosses/Ignecarus';
import {
	kalphiteKingLootTable,
	KalphiteKingMonster
} from '../minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { MoktangLootTable } from '../minions/data/killableMonsters/custom/bosses/Moktang';
import { Naxxus, NaxxusLootTableFinishable } from '../minions/data/killableMonsters/custom/bosses/Naxxus';
import { VasaMagus } from '../minions/data/killableMonsters/custom/bosses/VasaMagus';
import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import { sepulchreFloors } from '../minions/data/sepulchre';
import {
	EasyEncounterLoot,
	HardEncounterLoot,
	MediumEncounterLoot,
	rewardTokens
} from '../minions/data/templeTrekking';
import { nexLootTable, NexMonster } from '../nex';
import { getMinigameScore } from '../settings/minigames';
import { GrandmasterClueTable } from '../simulation/grandmasterClue';
import { pumpkinHeadUniqueTable } from '../simulation/pumpkinHead';
import { Cookables } from '../skilling/skills/cooking';
import { Craftables } from '../skilling/skills/crafting/craftables';
import { allFarmingItems } from '../skilling/skills/farming';
import { Fletchables } from '../skilling/skills/fletching/fletchables';
import mixables from '../skilling/skills/herblore/mixables';
import smithables from '../skilling/skills/smithing/smithables';
import { ItemBank } from '../types';
import { addArrayOfNumbers, removeFromArr, shuffleRandom, stringMatches } from '../util';
import { repairBrokenItemsFromUser } from '../util/repairBrokenItems';
import resolveItems from '../util/resolveItems';
import {
	abyssalDragonCL,
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
	cluesGrandmasterCL,
	cluesHardCL,
	cluesHardRareCL,
	cluesMasterCL,
	cluesMasterRareCL,
	cluesMediumCL,
	cluesSharedCL,
	cmbClothes,
	commanderZilyanaCL,
	corporealBeastCL,
	crazyArchaeologistCL,
	creatureCreationCL,
	customPetsCL,
	cyclopsCL,
	dagannothKingsCL,
	dailyCL,
	demonicGorillaCL,
	diariesCL,
	discontinuedCustomPetsCL,
	expertCapesCL,
	fightCavesCL,
	fishingContestCL,
	fishingTrawlerCL,
	fossilIslandNotesCL,
	generalGraardorCL,
	giantMoleCL,
	gnomeRestaurantCL,
	godWarsDungeonGodswordShards,
	gracefulCL,
	grotesqueGuardiansCL,
	guardiansOfTheRiftCL,
	hallowedSepulchreCL,
	hesporiCL,
	holidayCL,
	ICollection,
	ignecarusCL,
	ILeftListStatus,
	implingsCL,
	IToReturnCollection,
	kalphiteKingCL,
	kalphiteQueenCL,
	kingBlackDragonCL,
	kingGoldemarCL,
	krakenCL,
	kreeArraCL,
	krilTsutsarothCL,
	lastManStandingCL,
	magicTrainingArenaCL,
	mahoganyHomesCL,
	masterCapesCL,
	miscellaneousCL,
	moktangCL,
	monkeyBackpacksCL,
	motherlodeMineCL,
	naxxusCL,
	nexCL,
	nihilizCL,
	oborCL,
	pestControlCL,
	queenBlackDragonCL,
	questCL,
	randomEventsCL,
	revenantsCL,
	roguesDenCL,
	rooftopAgilityCL,
	sarachnisCL,
	scorpiaCL,
	seaKrakenCL,
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
	treeBeardCL,
	troubleBrewingCL,
	tzHaarCL,
	vasaMagusCL,
	venenatisCL,
	vetionCL,
	volcanicMineCL,
	vorkathCL,
	wintertodtCL,
	zalcanoCL,
	zulrahCL
} from './CollectionsExport';
import Createables from './createables';
import { kibbles } from './kibble';

export const allCollectionLogs: ICollection = {
	PvM: {
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
			'God Wars Dungeon': {
				alias: ['gwd', 'godwars'],
				kcActivity: {
					Default: async user => {
						return addArrayOfNumbers(
							[
								Monsters.GeneralGraardor.id,
								Monsters.CommanderZilyana.id,
								Monsters.Kreearra.id,
								Monsters.KrilTsutsaroth.id
							].map(i => user.getKC(i))
						);
					}
				},
				allItems: (() => {
					return [
						...new Set(
							...[
								Monsters.GeneralGraardor.allItems,
								Monsters.CommanderZilyana.allItems,
								Monsters.Kreearra.allItems,
								Monsters.KrilTsutsaroth.allItems
							]
						)
					];
				})(),
				items: [
					...godWarsDungeonGodswordShards,
					...commanderZilyanaCL,
					...generalGraardorCL,
					...kreeArraCL,
					...krilTsutsarothCL
				].sort((a, b) => a - b),
				counts: false
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
					Default: user => getMinigameScore(user.id, 'gauntlet'),
					Corrupted: user => getMinigameScore(user.id, 'corrupted_gauntlet')
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
			'Emerged Zuk Inferno': {
				alias: ['emerged inferno', 'ezi', 'emerged zuk'],
				items: resolveItems(['Head of TzKal Zuk', 'Infernal core', 'Tokkul'])
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
			Moktang: {
				alias: ['mt', 'moktang'],
				items: moktangCL,
				allItems: MoktangLootTable.allItems
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
			},
			'King Goldemar': {
				alias: KingGoldemar.aliases,
				allItems: KingGoldemar.allItems,
				items: kingGoldemarCL
			},
			Malygos: {
				alias: BSOMonsters.Malygos.aliases,
				allItems: BSOMonsters.Malygos.table.allItems,
				items: abyssalDragonCL
			},
			Nihiliz: {
				alias: BSOMonsters.Nihiliz.aliases,
				allItems: BSOMonsters.Nihiliz.table.allItems,
				items: nihilizCL
			},
			'Kalphite King': {
				alias: KalphiteKingMonster.aliases,
				allItems: kalphiteKingLootTable.allItems,
				items: kalphiteKingCL
			},
			Naxxus: {
				alias: Naxxus.aliases,
				allItems: NaxxusLootTableFinishable.allItems,
				items: naxxusCL
			},
			Nex: {
				alias: NexMonster.aliases,
				allItems: nexLootTable.allItems,
				items: nexCL
			},
			'Vasa Magus': {
				alias: VasaMagus.aliases,
				allItems: VasaMagus.allItems,
				items: vasaMagusCL
			},
			Ignecarus: {
				alias: Ignecarus.aliases,
				allItems: Ignecarus.allItems,
				items: ignecarusCL
			},
			Treebeard: {
				alias: BSOMonsters.Treebeard.aliases,
				allItems: BSOMonsters.Treebeard.table.allItems,
				items: treeBeardCL
			},
			'Sea Kraken': {
				alias: BSOMonsters.SeaKraken.aliases,
				allItems: BSOMonsters.SeaKraken.table.allItems,
				items: seaKrakenCL
			},
			'Queen Black Dragon': {
				alias: BSOMonsters.QueenBlackDragon.aliases,
				allItems: BSOMonsters.QueenBlackDragon.table.allItems,
				items: queenBlackDragonCL
			},
			"Chamber's of Xeric": {
				alias: ChambersOfXeric.aliases,
				kcActivity: {
					Default: user => getMinigameScore(user.id, 'raids'),
					Challenge: user => getMinigameScore(user.id, 'raids_challenge_mode')
				},
				items: chambersOfXericCL,
				isActivity: true
			},
			'Theatre of Blood': {
				alias: ['tob'],
				kcActivity: {
					Default: user => getMinigameScore(user.id, 'tob'),
					Hard: user => getMinigameScore(user.id, 'tob_hard')
				},
				items: theatreOfBLoodCL,
				isActivity: true
			},
			'Tormented Demons': {
				items: resolveItems([
					'Dragon claw',
					'Offhand dragon claw',
					'Ruined dragon armour slice',
					'Ruined dragon armour lump',
					'Ruined dragon armour shard',
					'Dragon limbs'
				]),
				alias: ['td', 'tormented demon', 'tormented demons']
			},
			Cyclopes: {
				alias: ['cyclops', 'wg', 'warriors guild', 'warrior guild'],
				kcActivity: Monsters.Cyclops.name,
				allItems: Monsters.Cyclops.allItems,
				items: cyclopsCL
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
				allItems: (() => {
					return [
						...new Set(
							...[
								Monsters.RevenantImp.allItems,
								Monsters.RevenantGoblin.allItems,
								Monsters.RevenantPyrefiend.allItems,
								Monsters.RevenantHobgoblin.allItems,
								Monsters.RevenantCyclops.allItems,
								Monsters.RevenantHellhound.allItems,
								Monsters.RevenantDemon.allItems,
								Monsters.RevenantOrk.allItems,
								Monsters.RevenantDarkBeast.allItems,
								Monsters.RevenantKnight.allItems,
								Monsters.RevenantDragon.allItems
							]
						)
					];
				})(),
				items: revenantsCL
			},
			'Polypore Dungeon': {
				items: resolveItems([
					'Mycelium leggings web',
					'Mycelium poncho web',
					'Mycelium visor web',
					'Neem drupe',
					'Polypore spore',
					'Grifolic flake',
					'Grifolic gloves',
					'Grifolic orb',
					'Gorajian mushroom',
					'Tombshroom spore',
					'Ganodermic flake',
					'Ganodermic gloves',
					'Ganodermic boots'
				])
			},
			Slayer: {
				alias: ['slay'],
				items: slayerCL
			},
			TzHaar: {
				kcActivity: {
					Default: [Monsters.TzHaarKet.name, Monsters.TzHaarMej.name, Monsters.TzHaarXil.name],
					Ket: Monsters.TzHaarKet.name,
					Mej: Monsters.TzHaarMej.name,
					Xil: Monsters.TzHaarXil.name
				},
				allItems: [
					...Monsters.TzHaarKet.allItems,
					...Monsters.TzHaarMej.allItems,
					...Monsters.TzHaarXil.allItems
				],
				items: tzHaarCL
			}
		}
	},
	Clues: {
		activities: {
			'Beginner Treasure Trails': {
				alias: ['beginner', 'clues beginner', 'clue beginner'],
				allItems: Clues.Beginner.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[23_245] || 0
				},
				items: cluesBeginnerCL,
				isActivity: true
			},
			'Easy Treasure Trails': {
				alias: ['easy', 'clues easy', 'clue easy'],
				allItems: Clues.Easy.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[20_546] || 0
				},
				items: cluesEasyCL,
				isActivity: true
			},
			'Medium Treasure Trails': {
				alias: ['medium', 'clues medium', 'clue medium'],
				allItems: Clues.Medium.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[20_545] || 0
				},
				items: cluesMediumCL,
				isActivity: true
			},
			'Hard Treasure Trails': {
				alias: ['hard', 'clues hard', 'clue hard'],
				allItems: Clues.Hard.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[20_544] || 0
				},
				items: cluesHardCL,
				isActivity: true
			},
			'Elite Treasure Trails': {
				alias: ['elite', 'clues elite', 'clue elite'],
				allItems: Clues.Elite.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[20_543] || 0
				},
				items: cluesEliteCL,
				isActivity: true
			},
			'Master Treasure Trails': {
				alias: ['master', 'clues master', 'clue master'],
				allItems: Clues.Master.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[19_836] || 0
				},
				items: cluesMasterCL,
				isActivity: true
			},
			'Grandmaster Treasure Trails': {
				alias: ['grandmaster', 'clues grandmaster', 'clue grandmaster', 'clue gm', 'gm'],
				allItems: GrandmasterClueTable.table.allItems,
				kcActivity: {
					Default: async user => user.openableScores()[19_838] || 0
				},
				items: cluesGrandmasterCL,
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
					Default: async user => user.openableScores()[20_544] || 0
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
					Default: async user => user.openableScores()[20_543] || 0
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
					Default: async user => user.openableScores()[19_836] || 0
				},
				items: cluesMasterRareCL,
				isActivity: true
			},
			'Shared Treasure Trail Rewards': {
				alias: ['shared', 'clues shared', 'clue shared'],
				kcActivity: {
					Default: async user => {
						const scores = user.openableScores();
						return (
							(scores[23_245] ?? 0) +
							(scores[20_546] ?? 0) +
							(scores[20_545] ?? 0) +
							(scores[20_544] ?? 0) +
							(scores[20_543] ?? 0) +
							(scores[19_836] ?? 0)
						);
					}
				},
				items: cluesSharedCL,
				isActivity: true
			},
			'Rare Treasure Trail Rewards': {
				alias: ['clues rare', 'rares'],
				kcActivity: {
					Default: async user => {
						const scores = user.openableScores();
						return (scores[20_544] ?? 0) + (scores[20_543] ?? 0) + (scores[19_836] ?? 0);
					}
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
					Default: async user => getMinigameScore(user.id, 'barb_assault'),
					'High Gambles': async user => user.user.high_gambles
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
			'Guardians of the Rift': {
				alias: ['gotr'],
				items: guardiansOfTheRiftCL,
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
					Default: user => getMinigameScore(user.id, 'lms')
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
					Default: async user => user.user.stats_titheFarmsCompleted
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
			},
			'Ourania Delivery Service': {
				alias: ['ods', 'ourania'],
				items: resolveItems([
					'Master runecrafter hat',
					'Master runecrafter robe',
					'Master runecrafter skirt',
					'Master runecrafter boots',
					'Elder thread',
					'Elder talisman',
					'Magic crate',
					'Lychee seed',
					'Avocado seed',
					'Mysterious seed',
					'Mango seed',
					'Magical artifact'
				])
			},
			"Mad Marimbo's Monkey Rumble": {
				alias: ['mr', 'mmmr', 'mmr', 'monkey rumble', 'mad marimbos monkey rumble'],
				items: resolveItems([
					'Monkey egg',
					'Marimbo statue',
					'Monkey dye',
					'Banana enchantment scroll',
					'Rumble token',
					'Big banana',
					'Monkey crate',
					'Gorilla rumble greegree',
					'Beginner rumble greegree',
					'Intermediate rumble greegree',
					'Ninja rumble greegree',
					'Expert ninja rumble greegree',
					'Elder rumble greegree'
				])
			},
			'Fishing Contest': {
				alias: ['fc'],
				items: fishingContestCL
			},
			'Baxtorian Bathhouses': {
				alias: ['bb', 'bax bath', 'baxtorian bathhouses', 'bath', 'baths'],
				items: resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire', 'Phoenix eggling'])
			},
			'Fist of Guthix': {
				alias: ['fog', 'fist of guthix'],
				items: resolveItems([
					'Rune spikeshield',
					'Rune berserker shield',
					'Adamant spikeshield',
					'Adamant berserker shield',
					'Guthix engram',
					'Fist of guthix token'
				])
			},
			'Stealing Creation': {
				alias: ['stealing creation', 'sc'],
				items: resolveItems([
					'Stealing creation token',
					"Fletcher's gloves",
					"Fletcher's boots",
					"Fletcher's top",
					"Fletcher's hat",
					"Fletcher's legs"
				])
			}
		}
	},
	Skilling: {
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
				allItems: Monsters.ElderChaosDruid.allItems,
				kcActivity: Monsters.ElderChaosDruid.name,
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
					Default: async user => (user.user.lapsScores as ItemBank)[6] || 0
				},
				items: monkeyBackpacksCL,
				isActivity: true
			},
			'Motherlode Mine': {
				alias: ['mlm'],
				items: motherlodeMineCL
			},
			'Rooftop Agility': {
				alias: ['rooftop', 'laps', 'agility', 'agil'],
				items: rooftopAgilityCL,
				isActivity: true
			},
			'Shooting Stars': { items: resolveItems(['Celestial ring (uncharged)', 'Star fragment']) },
			'Skilling Pets': {
				alias: ['skill pets'],
				items: skillingPetsCL
			},
			Dungeoneering: {
				alias: ['dg', 'dung', 'dungeoneering'],
				items: resolveItems([
					'Chaotic rapier',
					'Chaotic longsword',
					'Chaotic maul',
					'Chaotic staff',
					'Chaotic crossbow',
					'Offhand Chaotic rapier',
					'Offhand Chaotic longsword',
					'Offhand chaotic crossbow',
					'Scroll of life',
					'Scroll of efficiency',
					'Scroll of cleansing',
					'Scroll of dexterity',
					'Scroll of teleportation',
					'Scroll of farming',
					'Scroll of proficiency',
					'Scroll of mystery',
					'Scroll of longevity',
					'Scroll of the hunt',
					'Farseer kiteshield',
					'Chaotic remnant',
					'Frosty',
					'Gorajan shards',
					'Amulet of zealots',
					'Herbicide',
					'Gorajan warrior helmet',
					'Gorajan warrior top',
					'Gorajan warrior legs',
					'Gorajan warrior gloves',
					'Gorajan warrior boots',
					'Gorajan archer helmet',
					'Gorajan archer top',
					'Gorajan archer legs',
					'Gorajan archer gloves',
					'Gorajan archer boots',
					'Gorajan occult helmet',
					'Gorajan occult top',
					'Gorajan occult legs',
					'Gorajan occult gloves',
					'Gorajan occult boots',
					'Arcane blast necklace',
					'Farsight snapshot necklace',
					"Brawler's hook necklace",
					'Daemonheim agility pass',
					'Dungeoneering dye',
					'Gorajan bonecrusher (u)'
				])
			},
			Farming: {
				counts: false,
				items: allFarmingItems
			},
			Cooking: {
				counts: false,
				items: Cookables.map(i => i.id)
			},
			Crafting: {
				counts: false,
				items: Craftables.map(i => i.id)
			},
			Herblore: {
				counts: false,
				items: mixables.map(i => i.id)
			},
			Smithing: {
				counts: false,
				items: smithables.map(i => i.id)
			},
			Kibble: {
				counts: false,
				items: kibbles.map(i => i.item.id)
			},
			Graceful: {
				counts: false,
				items: gracefulCL
			},
			Fletching: {
				counts: false,
				items: Fletchables.map(i => i.id)
			},
			'Skilling Misc': {
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
					"Pharaoh's sceptre",
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
					'Abyssal pouch',
					'Elder pouch',
					'Crystal pickaxe',
					'Crystal axe',
					'Crystal harpoon',
					// Dwarven equipment
					'Dwarven greataxe',
					'Dwarven greathammer',
					'Dwarven pickaxe',
					'Dwarven knife',
					'Dwarven gauntlets'
				])
			},
			Invention: {
				alias: ['inv'],
				items: [...Inventions.map(i => i.item.id), ...resolveItems('Cogsworth')]
			}
		}
	},
	Other: {
		activities: {
			'All Pets': {
				alias: ['pet', 'pets'],
				items: allPetsCL
			},
			Camdozaal: {
				items: camdozaalCL
			},
			'Chompy Birds': {
				alias: ['chompy', 'bgc', 'big chompy hunting', 'ch', 'chompyhunting', 'chompyhunt'],
				kcActivity: 'BigChompyBirdHunting',
				items: chompyBirdsCL
			},
			'Creature Creation': {
				items: creatureCreationCL
			},
			'Fossil Island Notes': {
				items: fossilIslandNotesCL
			},
			'Random Events': {
				alias: ['random'],
				items: randomEventsCL
			},
			'Shayzien Armour': {
				items: shayzienArmourCL
			},
			Miscellaneous: {
				alias: ['misc'],
				items: miscellaneousCL
			},
			'Achievement Diary': {
				counts: false,
				alias: ['ad', 'diary', 'diaries'],
				items: resolveItems([...diariesCL])
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
			'Master Capes': {
				counts: false,
				items: masterCapesCL
			},
			'Expert Capes': {
				counts: false,
				items: expertCapesCL
			},
			Quest: {
				counts: false,
				items: questCL
			},
			'Custom Pets': {
				alias: ['cpets', 'custom pet', 'cpet', 'custom pet'],
				items: customPetsCL
			},
			Implings: {
				counts: false,
				items: implingsCL
			},
			'Dyed Items': {
				counts: false,
				items: dyedItems.map(i => i.dyedVersions.map(i => i.item.id)).flat(2)
			},
			'Clothing Mystery Box': {
				counts: false,
				items: cmbClothes,
				alias: ['cmb', 'clothing mystery box']
			},
			'Holiday Mystery box': {
				counts: false,
				items: holidayCL,
				alias: ['hmb', 'holiday mystery box']
			},
			'Growable Pets': {
				items: growablePets.map(i => i.stages).flat()
			},
			Creatables: {
				counts: false,
				items: Createables.filter(i => i.noCl !== true)
					.map(i => new Bank(i.outputItems).items().map(i => i[0].id))
					.flat()
			},
			Leagues: {
				items: resolveItems(['Fuzzy dice', 'Karambinana'])
			}
		}
	},
	Discontinued: {
		activities: {
			'Easter 2022': {
				items: resolveItems(['Chickaxe', 'Leia', 'Decorative easter eggs']),
				counts: false
			},
			'Thanksgiving 2021': {
				items: resolveItems(['Raw turkey', 'Turkey', 'Turkey drumstick', 'Burnt turkey', 'Cornucopia']),
				counts: false
			},
			'Custom Pets (Discontinued)': {
				alias: ['dcpets', 'disc custom pet', 'dcpet', 'dcp', 'discontinued custom pet'],
				items: discontinuedCustomPetsCL,
				counts: false
			},
			'Halloween 2021': {
				alias: ['hween2021', 'halloween 2021'],
				items: resolveItems([
					'Human appendage',
					'Sliced femur',
					'Human blood',
					'Human tooth',
					'Candy teeth',
					'Toffeet',
					'Chocolified skull',
					'Rotten sweets',
					'Hairyfloss',
					'Eyescream',
					'Goblinfinger soup',
					"Benny's brain brew",
					'Roasted newt',
					"Choc'rock",
					'Gregoyle',
					...pumpkinHeadUniqueTable.allItems
				]),
				counts: false
			},
			'Halloween 2022': {
				alias: ['hween2022', 'halloween 2022'],
				items: resolveItems([
					'Dirty hoe',
					'Boo-balloon',
					'Twinkly topper',
					'Broomstick',
					'Spooky graceful hood',
					'Spooky graceful top',
					'Spooky graceful legs',
					'Spooky graceful cape',
					'Spooky graceful boots',
					'Spooky graceful gloves',
					'Kuro',
					'Spooky box'
				]),
				counts: false,
				allItems: resolveItems([
					'Pumpkin seed',
					'Dirty hoe',
					'Boo-balloon',
					'Twinkly topper',
					'Broomstick',
					'Spooky graceful hood',
					'Spooky graceful top',
					'Spooky graceful legs',
					'Spooky graceful cape',
					'Spooky graceful boots',
					'Spooky graceful gloves',
					'Spooky partyhat',
					'Orange halloween mask',
					'Necronomicon',
					"M'eye hat",
					'Back pain',
					'Witch hat',
					'Spooky mask',
					'Toffeet',
					'Chocolified skull',
					'Eyescream',
					"Choc'rock",
					'Rotten sweets',
					'Gloom and doom potion',
					'Handled candle',
					'Kuro',
					'Spooky box',
					'Grim sweeper'
				])
			},
			'Christmas 2021': {
				alias: ['xmas 2021', 'christmas 2021'],
				items: resolveItems([
					'Smokey bbq sauce',
					'Pumpkinhead pie',
					'Roasted ham',
					'Corn on the cob',
					"Dougs' chocolate mud",
					"Shepherd's pie",
					'Flappy meal',
					'Smokey painting',
					'Yule log',
					'Gr-egg-oyle special',
					'Roast potatoes',
					'Ratatouille',
					'Fish n chips',
					'Pretzel',
					'Bacon',
					'Prawns',
					'Pavlova',
					'Christmas tree hat',
					'Christmas pudding',
					'Christmas pudding amulet',
					'Festive mistletoe',
					'Christmas tree kite',
					'Festive wrapping paper',
					'Festive jumper',
					'Frozen santa hat',
					'Golden shard',
					'Seer',
					'Festive present',
					'Golden partyhat'
				]),
				counts: false
			},
			'BSO Birthday 2022': {
				alias: ['bso birthday 2022'],
				items: resolveItems(['Honey', 'Honeycomb', 'Beehive', 'Buzz']),
				counts: false
			}
		}
	}
};
// Get all items, from all monsters and all CLs into a variable, for uses like mostdrops
export const allDroppedItems = uniqueArr([
	...Object.values(allCollectionLogs)
		.map(e =>
			Object.values(e.activities).map(a => [
				...new Set([...a.items, ...(a.allItems !== undefined ? a.allItems : [])])
			])
		)
		.flat(100),
	...Object.values(Monsters)
		.map(m => (m && m.allItems ? m.allItems : []))
		.flat(100)
]);

export const allCLItems = uniqueArr(
	Object.values(allCollectionLogs)
		.map(e => Object.values(e.activities).map(a => a.items))
		.flat(100)
);

export const allCLItemsFiltered = [
	...new Set(
		Object.values(allCollectionLogs)
			.map(e =>
				Object.values(e.activities)
					.filter(f => f.counts === undefined)
					.map(a => a.items)
			)
			.flat(100)
	)
];

export const overallPlusItems = [
	...new Set(
		Object.entries(allCollectionLogs)
			.filter(i => i[0] !== 'Discontinued')
			.map(e => Object.values(e[1].activities).map(a => a.items))
			.flat(100)
	)
];

export function calcCLDetails(user: MUser) {
	const clItems = user.cl.filter(i => allCLItemsFiltered.includes(i.id), true);
	const debugBank = new Bank().add(clItems);
	const owned = clItems.filter(i => allCLItemsFiltered.includes(i.id));
	const notOwned = shuffleRandom(
		Number(user.id),
		allCLItemsFiltered.filter(i => !clItems.has(i))
	).slice(0, 10);
	return {
		percent: calcWhatPercent(owned.length, allCLItemsFiltered.length),
		notOwned,
		owned,
		debugBank
	};
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
				const [totalCl, userAmount] = getUserClData(userBank, items);
				leftList[activityName] =
					userAmount === 0 ? 'not_started' : userAmount === totalCl ? 'completed' : 'started';
			}
		}
	}
	return leftList;
}

export async function getBank(user: MUser, type: CollectionLogType) {
	const userCheckBank = new Bank();
	switch (type) {
		case 'collection':
			userCheckBank.add(user.cl);
			break;
		case 'bank':
			userCheckBank.add(user.bankWithGP);
			break;
		case 'sacrifice':
			userCheckBank.add(user.user.sacrificedBank as ItemBank);
			break;
		case 'tame': {
			const { getUsersTamesCollectionLog } = await import('../util/getUsersTameCL');
			return getUsersTamesCollectionLog(user);
		}
		case 'temp':
			userCheckBank.add(user.user.temp_cl as ItemBank);
			break;
		case 'disassembly': {
			const items = await mahojiUsersSettingsFetch(user.id, { disassembled_items_bank: true });
			userCheckBank.add(items.disassembled_items_bank as ItemBank);
			break;
		}
	}
	return userCheckBank;
}

// Get the total items the user has in its CL and the total items to collect
export async function getTotalCl(user: MUser, logType: CollectionLogType) {
	const b = await getBank(user, logType);
	let result = undefined;
	try {
		result = getUserClData(b, allCLItemsFiltered);
	} catch (_e) {
		await repairBrokenItemsFromUser(user);
		const newUser = await mUserFetch(user.id);
		const newBank = await getBank(newUser, logType);
		result = getUserClData(newBank, allCLItemsFiltered);
	}
	return result;
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
	const normalTable = table([['Type', 'name: ', 'Alias'], ...[...categories, ...activities, ...roles]]);
	return new AttachmentBuilder(Buffer.from(normalTable), { name: 'possible_logs.txt' });
}

export function getCollectionItems(collection: string, allItems = false, removeCoins = false): number[] {
	if (collection === 'overall+') {
		return overallPlusItems;
	}
	if (['overall', 'all'].some(s => stringMatches(collection, s))) {
		return allCLItemsFiltered;
	}

	let _items: number[] = [];
	loop: for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (
			stringMatches(category, collection) ||
			(entries.alias && entries.alias.some(a => stringMatches(a, collection)))
		) {
			_items = uniqueArr(
				Object.values(entries.activities)
					.map(e => [...new Set([...e.items, ...(allItems ? e.allItems ?? [] : [])])])
					.flat(2)
			);

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
		const _monster = killableMonsters.find(m =>
			[m.name, ...m.aliases].some(name => stringMatches(name, collection))
		);
		if (_monster) {
			_items = uniqueArr(Monsters.get(_monster!.id)!.allItems);
		}
	}
	if (removeCoins && _items.includes(995)) _items = removeFromArr(_items, 995);
	return _items;
}

function getUserClData(userBank: Bank, clItems: number[]): [number, number] {
	const owned = userBank.items().filter(([item]) => clItems.includes(item.id));
	return [clItems.length, owned.length];
}

export const allClNames: string[] = [];
for (const [category, val] of Object.entries(allCollectionLogs)) {
	allClNames.push(category);
	allClNames.push(...Object.keys(val.activities));
}
for (const mon of killableMonsters) allClNames.push(mon.name);

// Main function that gets the user collection based on its search parameter
export async function getCollection(options: {
	user: MUser;
	mahojiUser: User;
	search: string;
	flags: { [key: string]: string | number };
	logType?: CollectionLogType;
}): Promise<false | IToReturnCollection> {
	let { user, search, flags, logType } = options;

	const allItems = Boolean(flags.all);
	if (logType === undefined) logType = 'collection';
	if (flags.tame) {
		logType = 'tame';
	}
	const userCheckBank = await getBank(user, logType);
	let clItems = getCollectionItems(search, allItems, logType === 'sacrifice');
	const isOverall = search.toLowerCase().startsWith('overall');

	if (isOverall || Boolean(flags.missing)) {
		clItems = clItems.filter(i => !userCheckBank.has(i));
	}

	const [totalCl, userAmount] = getUserClData(userCheckBank, clItems);

	if (stringMatches(search, 'overall+')) {
		return {
			category: 'Other',
			name: 'Overall+',
			collection: clItems,
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank,
			counts: false
		};
	}
	if (stringMatches(search, 'overall')) {
		return {
			category: 'Other',
			name: 'Overall',
			collection: clItems,
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank,
			counts: false
		};
	}

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
						userKC.Default += (await getKCByName(user, attributes.kcActivity))[1];
					} else {
						for (const [type, value] of Object.entries(attributes.kcActivity)) {
							if (!userKC[type]) userKC[type] = 0;
							if (Array.isArray(value)) {
								for (const name of value) {
									userKC[type] += (await getKCByName(user, name))[1];
								}
							} else if (typeof value === 'function') {
								userKC[type] += await value(user);
							} else {
								userKC[type] += (await getKCByName(user, value))[1];
							}
						}
					}
				} else {
					const defaultKc = await getKCByName(user, activityName);
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

export const allCollectionLogsFlat = Object.values(allCollectionLogs)
	.map(i => Object.entries(i.activities).map(entry => ({ ...entry[1], name: entry[0] })))
	.flat();
