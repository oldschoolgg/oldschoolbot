import { stringMatches } from '@oldschoolgg/toolkit/string-util';
import { calcWhatPercent, isObject, notEmpty, removeFromArr, sumArr, uniqueArr } from 'e';
import {
	Bank,
	ChambersOfXeric,
	Clues,
	EItem,
	EMonster,
	type Item,
	type ItemBank,
	ItemGroups,
	type Monster,
	Monsters,
	resolveItems
} from 'oldschooljs';

import type { ClueTier } from '../clues/clueTiers';
import { ClueTiers } from '../clues/clueTiers';
import killableMonsters, { NightmareMonster } from '../minions/data/killableMonsters';
import { sepulchreFloors } from '../minions/data/sepulchre';
import {
	EasyEncounterLoot,
	HardEncounterLoot,
	MediumEncounterLoot,
	rewardTokens
} from '../minions/data/templeTrekking';
import type { MinigameName } from '../settings/minigames';
import { NexNonUniqueTable, NexUniqueTable } from '../simulation/misc';
import { allFarmingItems } from '../skilling/skills/farming';
import { SkillsEnum } from '../skilling/types';
import { MUserStats } from '../structures/MUserStats';
import { shuffleRandom } from '../util/smallUtils';
import type { FormatProgressFunction, ICollection, ILeftListStatus, IToReturnCollection } from './CollectionsExport';
import {
	NexCL,
	abyssalSireCL,
	aerialFishingCL,
	alchemicalHydraCL,
	allPetsCL,
	amoxliatlCL,
	araxxorCL,
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
	colossalWyrmAgilityCL,
	commanderZilyanaCL,
	corporealBeastCL,
	crazyArchaeologistCL,
	creatureCreationCL,
	cyclopsCL,
	dagannothKingsCL,
	dailyCL,
	demonicGorillaCL,
	diariesCL,
	dukeSucellusCL,
	fightCavesCL,
	fishingTrawlerCL,
	forestryCL,
	fossilIslandNotesCL,
	generalGraardorCL,
	giantMoleCL,
	giantsFoundryCL,
	gnomeRestaurantCL,
	godWarsDungeonCL,
	gracefulCL,
	grotesqueGuardiansCL,
	guardiansOfTheRiftCL,
	hallowedSepulchreCL,
	hesporiCL,
	implingsCL,
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
	muspahCL,
	myNotesCL,
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
	theGauntletCL,
	theInfernoCL,
	theLeviathanCL,
	theNightmareCL,
	theWhispererCL,
	theatreOfBLoodCL,
	thermonuclearSmokeDevilCL,
	titheFarmCL,
	tormentedDemonCL,
	troubleBrewingCL,
	tzHaarCL,
	vardorvisCL,
	venenatisCL,
	vetionCL,
	volcanicMineCL,
	vorkathCL,
	wintertodtCL,
	zalcanoCL,
	zulrahCL
} from './CollectionsExport';
import Createables from './createables';
import { leagueBuyables } from './leaguesBuyables';

function kcProg(mon: Monster): FormatProgressFunction {
	return ({ stats }) => `${stats.kcBank[mon.id] ?? 0} KC`;
}

function mgProg(minigameName: MinigameName): FormatProgressFunction {
	return ({ minigames }) => `${minigames[minigameName]} Completions`;
}

function skillProg(skillName: SkillsEnum): FormatProgressFunction {
	return ({ user }) => `Level ${user.skillLevel(skillName)} ${skillName}`;
}

function clueProg(tiers: ClueTier['name'][]): FormatProgressFunction {
	return async ({ stats }) => {
		return tiers
			.map(i => {
				const tier = ClueTiers.find(_tier => _tier.name === i)!;
				return `${stats.openableScores.amount(tier.id)} ${tier.name} Opens`;
			})
			.filter(notEmpty)
			.join(', ');
	};
}

export const allCollectionLogs: ICollection = {
	Bosses: {
		alias: ['boss'],
		activities: {
			'Abyssal Sire': {
				alias: Monsters.AbyssalSire.aliases,
				allItems: Monsters.AbyssalSire.allItems,
				items: abyssalSireCL,
				fmtProg: kcProg(Monsters.AbyssalSire)
			},
			'Alchemical Hydra': {
				alias: [...Monsters.AlchemicalHydra.aliases, 'ahydra', 'alchhydra'],
				allItems: Monsters.AlchemicalHydra.allItems,
				items: alchemicalHydraCL,
				fmtProg: kcProg(Monsters.AlchemicalHydra)
			},
			Amoxliatl: {
				allItems: uniqueArr([...amoxliatlCL, ...Monsters.Amoxliatl.allItems]),
				items: amoxliatlCL,
				fmtProg: kcProg(Monsters.Amoxliatl)
			},
			Araxxor: {
				alias: [...Monsters.Araxxor.aliases, 'rax'],
				allItems: uniqueArr([...araxxorCL, ...Monsters.Araxxor.allItems]),
				items: araxxorCL,
				fmtProg: kcProg(Monsters.Araxxor)
			},
			'Barrows Chests': {
				alias: Monsters.Barrows.aliases,
				kcActivity: Monsters.Barrows.name,
				items: barrowsChestCL,
				fmtProg: kcProg(Monsters.Barrows)
			},
			Bryophyta: {
				alias: Monsters.Bryophyta.aliases,
				allItems: Monsters.Bryophyta.allItems,
				items: bryophytaCL,
				fmtProg: kcProg(Monsters.Bryophyta)
			},
			'Callisto and Artio': {
				alias: [...Monsters.Callisto.aliases, ...Monsters.Artio.aliases],
				kcActivity: {
					Default: [Monsters.Callisto.name, Monsters.Artio.name],
					Callisto: Monsters.Callisto.name,
					Artio: Monsters.Artio.name
				},
				allItems: Monsters.Callisto.allItems,
				items: callistoCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.Callisto.id] ?? 0} Callisto KC`,
					`${stats.kcBank[Monsters.Artio.id] ?? 0} Artio KC`
				]
			},
			Cerberus: {
				alias: Monsters.Cerberus.aliases,
				allItems: Monsters.Cerberus.allItems,
				items: cerberusCL,
				fmtProg: kcProg(Monsters.Cerberus)
			},
			'Chaos Elemental': {
				alias: Monsters.ChaosElemental.aliases,
				allItems: Monsters.ChaosElemental.allItems,
				items: chaosElementalCL,
				fmtProg: kcProg(Monsters.ChaosElemental)
			},
			'Chaos Fanatic': {
				alias: Monsters.ChaosFanatic.aliases,
				allItems: Monsters.ChaosFanatic.allItems,
				items: chaosFanaticCL,
				fmtProg: kcProg(Monsters.ChaosFanatic)
			},
			'Commander Zilyana': {
				alias: Monsters.CommanderZilyana.aliases,
				allItems: Monsters.CommanderZilyana.allItems,
				items: commanderZilyanaCL,
				fmtProg: kcProg(Monsters.CommanderZilyana)
			},
			'Corporeal Beast': {
				alias: Monsters.CorporealBeast.aliases,
				allItems: Monsters.CorporealBeast.allItems,
				items: corporealBeastCL,
				fmtProg: kcProg(Monsters.CorporealBeast)
			},
			'Crazy archaeologist': {
				alias: Monsters.CrazyArchaeologist.aliases,
				allItems: Monsters.CrazyArchaeologist.allItems,
				items: crazyArchaeologistCL,
				fmtProg: kcProg(Monsters.CrazyArchaeologist)
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
				items: dagannothKingsCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.DagannothPrime.id] ?? 0} Prime KC`,
					`${stats.kcBank[Monsters.DagannothRex.id] ?? 0} Rex KC`,
					`${stats.kcBank[Monsters.DagannothSupreme.id] ?? 0} Supreme KC`
				]
			},
			'Duke Sucellus': {
				alias: ['duke', 'duke sucellus'],
				kcActivity: {
					Default: [Monsters.DukeSucellus.name, Monsters.AwakenedDukeSucellus.name],
					Awakened: Monsters.AwakenedDukeSucellus.name
				},
				allItems: Monsters.DukeSucellus.allItems,
				items: dukeSucellusCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.DukeSucellus.id] ?? 0} KC`,
					`${stats.kcBank[Monsters.AwakenedDukeSucellus.id] ?? 0} Awakened KC`
				]
			},
			'The Leviathan': {
				alias: ['the leviathan'],
				kcActivity: {
					Default: [Monsters.TheLeviathan.name, Monsters.AwakenedTheLeviathan.name],
					Awakened: Monsters.AwakenedTheLeviathan.name
				},
				allItems: Monsters.TheLeviathan.allItems,
				items: theLeviathanCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.TheLeviathan.id] ?? 0} KC`,
					`${stats.kcBank[Monsters.AwakenedTheLeviathan.id] ?? 0} Awakened KC`
				]
			},
			Vardorvis: {
				alias: ['vardorvis'],
				kcActivity: {
					Default: [Monsters.Vardorvis.name, Monsters.AwakenedVardorvis.name],
					Awakened: Monsters.AwakenedVardorvis.name
				},
				allItems: Monsters.Vardorvis.allItems,
				items: vardorvisCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.Vardorvis.id] ?? 0} KC`,
					`${stats.kcBank[Monsters.AwakenedVardorvis.id] ?? 0} Awakened KC`
				]
			},
			'The Whisperer': {
				alias: ['the whisperer'],
				kcActivity: {
					Default: [Monsters.TheWhisperer.name, Monsters.AwakenedTheWhisperer.name],
					Awakened: Monsters.AwakenedTheWhisperer.name
				},
				allItems: Monsters.TheWhisperer.allItems,
				items: theWhispererCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.TheWhisperer.id] ?? 0} KC`,
					`${stats.kcBank[Monsters.AwakenedTheWhisperer.id] ?? 0} Awakened KC`
				]
			},
			'The Fight Caves': {
				kcActivity: Monsters.TzTokJad.name,
				alias: ['firecape', 'jad', 'fightcave'],
				items: fightCavesCL,
				fmtProg: kcProg(Monsters.TzTokJad)
			},
			'Fortis Colosseum': {
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'colosseum')!.score
				},
				alias: ['colosseum'],
				items: resolveItems([
					'Smol heredit',
					"Dizana's quiver (uncharged)",
					'Sunfire fanatic cuirass',
					'Sunfire fanatic chausses',
					'Sunfire fanatic helm',
					'Echo crystal',
					'Tonalztics of ralos (uncharged)',
					'Sunfire splinters',
					'Uncut onyx'
				]),
				fmtProg: ({ minigames }) => `${minigames.colosseum} KC`
			},
			'The Gauntlet': {
				alias: ['gauntlet', 'crystalline hunllef', 'hunllef'],
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'gauntlet')!.score,
					Corrupted: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'corrupted_gauntlet')!.score
				},
				items: theGauntletCL,
				fmtProg: ({ minigames }) => [`${minigames.gauntlet} KC`, `${minigames.corrupted_gauntlet} Corrupted KC`]
			},
			'General Graardor': {
				alias: Monsters.GeneralGraardor.aliases,
				allItems: Monsters.GeneralGraardor.allItems,
				items: generalGraardorCL,
				fmtProg: kcProg(Monsters.GeneralGraardor)
			},
			'Giant Mole': {
				alias: Monsters.GiantMole.aliases,
				allItems: Monsters.GiantMole.allItems,
				items: giantMoleCL,
				fmtProg: kcProg(Monsters.GiantMole)
			},
			'Grotesque Guardians': {
				alias: Monsters.GrotesqueGuardians.aliases,
				allItems: Monsters.GrotesqueGuardians.allItems,
				items: grotesqueGuardiansCL,
				fmtProg: kcProg(Monsters.GrotesqueGuardians)
			},
			Hespori: {
				alias: Monsters.Hespori.aliases,
				allItems: Monsters.Hespori.allItems,
				items: hesporiCL,
				fmtProg: kcProg(Monsters.Hespori)
			},
			'The Hueycoatl': {
				allItems: Monsters.TheHueycoatl.allItems,
				items: resolveItems([
					'Huberte',
					'Dragon hunter wand',
					'Tome of earth (empty)',
					'Soiled page',
					'Hueycoatl hide',
					'Huasca seed'
				]),
				fmtProg: kcProg(Monsters.TheHueycoatl)
			},
			'The Inferno': {
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'inferno')!.score
				},
				alias: ['zuk', 'inferno'],
				items: theInfernoCL,
				fmtProg: ({ minigames }) => `${minigames.inferno} KC`
			},
			'Kalphite Queen': {
				alias: Monsters.KalphiteQueen.aliases,
				allItems: Monsters.KalphiteQueen.allItems,
				items: kalphiteQueenCL,
				fmtProg: kcProg(Monsters.KalphiteQueen)
			},
			'King Black Dragon': {
				alias: Monsters.KingBlackDragon.aliases,
				allItems: Monsters.KingBlackDragon.allItems,
				items: kingBlackDragonCL,
				fmtProg: kcProg(Monsters.KingBlackDragon)
			},
			Kraken: {
				alias: Monsters.Kraken.aliases,
				allItems: Monsters.Kraken.allItems,
				items: krakenCL,
				fmtProg: kcProg(Monsters.Kraken)
			},
			"Kree'arra": {
				alias: Monsters.Kreearra.aliases,
				allItems: Monsters.Kreearra.allItems,
				items: kreeArraCL,
				fmtProg: kcProg(Monsters.Kreearra)
			},
			"K'ril Tsutsaroth": {
				alias: Monsters.KrilTsutsaroth.aliases,
				allItems: Monsters.KrilTsutsaroth.allItems,
				items: krilTsutsarothCL,
				fmtProg: kcProg(Monsters.KrilTsutsaroth)
			},
			Nex: {
				alias: ['nex'],
				allItems: [
					...NexUniqueTable.allItems,
					...NexNonUniqueTable.allItems,
					...resolveItems(['Clue scroll (elite)'])
				],
				items: NexCL,
				fmtProg: ({ stats }) => `${stats.kcBank[EMonster.NEX] ?? 0} KC`
			},
			'The Nightmare': {
				alias: [...NightmareMonster.aliases, 'phosani'],
				kcActivity: {
					Default: 'Nightmare',
					Phosani: "Phosani's Nightmare"
				},
				items: theNightmareCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[NightmareMonster.id] ?? 0} KC`,
					`${stats.kcBank[EMonster.PHOSANI_NIGHTMARE] ?? 0} Phosani KC`
				]
			},
			Obor: {
				alias: Monsters.Obor.aliases,
				allItems: Monsters.Obor.allItems,
				items: oborCL,
				fmtProg: kcProg(Monsters.Obor)
			},
			'Phantom Muspah': {
				alias: Monsters.PhantomMuspah.aliases,
				allItems: Monsters.PhantomMuspah.allItems,
				items: muspahCL,
				fmtProg: kcProg(Monsters.PhantomMuspah)
			},
			'Royal Titans': {
				alias: ['branda', 'eldric', 'royal', 'titans', 'royal titans'],
				kcActivity: {
					Default: [Monsters.Branda.name, Monsters.Eldric.name, Monsters.RoyalTitans.name],
					Branda: Monsters.Branda.name,
					Eldric: Monsters.Eldric.name,
					Sac: Monsters.RoyalTitans.name
				},
				items: resolveItems([
					'Bran',
					'Deadeye prayer scroll',
					'Mystic vigour prayer scroll',
					'Giantsoul amulet (uncharged)',
					'Ice element staff crown',
					'Fire element staff crown',
					'Desiccated page'
				]),
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.Branda.id] ?? 0} Branda KC`,
					`${stats.kcBank[Monsters.Eldric.id] ?? 0} Eldric KC`,
					`${stats.kcBank[Monsters.RoyalTitans.id] ?? 0} Sacrifice KC`
				]
			},
			Sarachnis: {
				alias: Monsters.Sarachnis.aliases,
				allItems: Monsters.Sarachnis.allItems,
				items: sarachnisCL,
				fmtProg: kcProg(Monsters.Sarachnis)
			},
			Scorpia: {
				alias: Monsters.Scorpia.aliases,
				allItems: Monsters.Scorpia.allItems,
				items: scorpiaCL,
				fmtProg: kcProg(Monsters.Scorpia)
			},
			Scurrius: {
				alias: Monsters.Scurrius.aliases,
				allItems: Monsters.Scurrius.allItems,
				items: resolveItems(['Scurry', "Scurrius' spine"]),
				fmtProg: kcProg(Monsters.Scurrius)
			},
			Skotizo: {
				alias: Monsters.Skotizo.aliases,
				allItems: Monsters.Skotizo.allItems,
				items: skotizoCL,
				fmtProg: kcProg(Monsters.Skotizo)
			},
			Tempoross: {
				alias: ['tempoross', 'temp', 'tempo', 'tr', 'watertodt', 'ross'],
				items: temporossCL,
				allItems: resolveItems([...spiritAnglerOutfit, 'Spirit flakes']),
				fmtProg: mgProg('tempoross')
			},
			'Thermonuclear smoke devil': {
				alias: Monsters.ThermonuclearSmokeDevil.aliases,
				allItems: Monsters.ThermonuclearSmokeDevil.allItems,
				items: thermonuclearSmokeDevilCL,
				fmtProg: kcProg(Monsters.ThermonuclearSmokeDevil)
			},
			'Venenatis and Spindel': {
				alias: [...Monsters.Venenatis.aliases, ...Monsters.Spindel.aliases],
				kcActivity: {
					Default: [Monsters.Venenatis.name, Monsters.Spindel.name],
					Venenatis: Monsters.Venenatis.name,
					Spindel: Monsters.Spindel.name
				},
				allItems: Monsters.Venenatis.allItems,
				items: venenatisCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.Venenatis.id] ?? 0} Venenatis KC`,
					`${stats.kcBank[Monsters.Spindel.id] ?? 0} Spindel KC`
				]
			},
			"Vet'ion and Calvar'ion": {
				alias: [...Monsters.Vetion.aliases, ...Monsters.Calvarion.aliases],
				kcActivity: {
					Default: [Monsters.Vetion.name, Monsters.Calvarion.name],
					Vetion: Monsters.Vetion.name,
					Calvarion: Monsters.Calvarion.name
				},
				allItems: Monsters.Vetion.allItems,
				items: vetionCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[Monsters.Vetion.id] ?? 0} Vet'ion KC`,
					`${stats.kcBank[Monsters.Calvarion.id] ?? 0} Calvar'ion KC`
				]
			},
			Vorkath: {
				alias: Monsters.Vorkath.aliases,
				allItems: Monsters.Vorkath.allItems,
				items: vorkathCL,
				fmtProg: kcProg(Monsters.Vorkath)
			},
			Wintertodt: {
				alias: ['todt', 'wintertodt', 'wt'],
				items: wintertodtCL,
				fmtProg: mgProg('wintertodt')
			},
			Zalcano: { items: zalcanoCL, fmtProg: ({ stats }) => `${stats.kcBank[EMonster.ZALCANO] ?? 0} KC` },
			Zulrah: {
				alias: Monsters.Zulrah.aliases,
				allItems: Monsters.Zulrah.allItems,
				items: zulrahCL,
				fmtProg: kcProg(Monsters.Zulrah)
			}
		}
	},
	Raids: {
		activities: {
			'Chambers of Xeric': {
				alias: ChambersOfXeric.aliases,
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'raids')!.score,
					Challenge: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'raids_challenge_mode')!.score
				},
				items: chambersOfXericCL,
				isActivity: true,
				fmtProg: ({ minigames }) => {
					return [`${minigames.raids} KC, ${minigames.raids_challenge_mode} CM KC`];
				}
			},
			'Theatre of Blood': {
				alias: ['tob'],
				kcActivity: {
					Default: async (_, minigameScores) => minigameScores.find(i => i.minigame.column === 'tob')!.score,
					Hard: async (_, minigameScores) => minigameScores.find(i => i.minigame.column === 'tob_hard')!.score
				},
				items: theatreOfBLoodCL,
				isActivity: true,
				fmtProg: ({ minigames }) => {
					return [`${minigames.tob} KC, ${minigames.tob_hard} Hard KC`];
				}
			},
			'Tombs of Amascut': {
				alias: ['toa'],
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'tombs_of_amascut')!.score,
					Entry: async (_, __, stats) => stats.getToaKCs().entryKC,
					Normal: async (_, __, stats) => stats.getToaKCs().normalKC,
					Expert: async (_, __, stats) => stats.getToaKCs().expertKC
				},
				items: ItemGroups.toaCL,
				isActivity: true,
				fmtProg: ({ minigames }) => {
					return [`${minigames.tombs_of_amascut} KC`];
				}
			}
		}
	},
	Clues: {
		activities: {
			'Beginner Treasure Trails': {
				alias: ['beginner', 'clues beginner', 'clue beginner'],
				allItems: Clues.Beginner.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(23_245)
				},
				items: cluesBeginnerCL,
				isActivity: true,
				fmtProg: clueProg(['Beginner'])
			},
			'Easy Treasure Trails': {
				alias: ['easy', 'clues easy', 'clue easy'],
				allItems: Clues.Easy.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(20_546)
				},
				items: cluesEasyCL,
				isActivity: true,
				fmtProg: clueProg(['Easy'])
			},
			'Medium Treasure Trails': {
				alias: ['medium', 'clues medium', 'clue medium'],
				allItems: Clues.Medium.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(20_545)
				},
				items: cluesMediumCL,
				isActivity: true,
				fmtProg: clueProg(['Medium'])
			},
			'Hard Treasure Trails': {
				alias: ['hard', 'clues hard', 'clue hard'],
				allItems: Clues.Hard.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(20_544)
				},
				items: cluesHardCL,
				isActivity: true,
				fmtProg: clueProg(['Hard'])
			},
			'Elite Treasure Trails': {
				alias: ['elite', 'clues elite', 'clue elite'],
				allItems: Clues.Elite.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(20_543)
				},
				items: cluesEliteCL,
				isActivity: true,
				fmtProg: clueProg(['Elite'])
			},
			'Master Treasure Trails': {
				alias: ['master', 'clues master', 'clue master'],
				allItems: Clues.Master.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(19_836)
				},
				items: cluesMasterCL,
				isActivity: true,
				fmtProg: clueProg(['Master'])
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
					Default: async (_, __, { openableScores }) => openableScores.amount(20_544)
				},
				items: cluesHardRareCL,
				isActivity: true,
				fmtProg: clueProg(['Hard'])
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
					Default: async (_, __, { openableScores }) => openableScores.amount(20_543)
				},
				items: cluesEliteRareCL,
				isActivity: true,
				fmtProg: clueProg(['Elite'])
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
					Default: async (_, __, { openableScores }) => openableScores.amount(19_836)
				},
				items: cluesMasterRareCL,
				isActivity: true,
				fmtProg: clueProg(['Master'])
			},
			'Shared Treasure Trail Rewards': {
				alias: ['shared', 'clues shared', 'clue shared'],
				kcActivity: {
					Default: async (_, __, { openableScores }) => {
						return (
							openableScores.amount(23_245) +
							openableScores.amount(20_546) +
							openableScores.amount(20_545) +
							openableScores.amount(20_544) +
							openableScores.amount(20_543) +
							openableScores.amount(19_836)
						);
					}
				},
				items: cluesSharedCL,

				isActivity: true,
				fmtProg: clueProg(ClueTiers.map(i => i.name))
			},
			'Rare Treasure Trail Rewards': {
				alias: ['clues rare', 'rares'],
				kcActivity: {
					Default: async (_, __, { openableScores }) => {
						return (
							openableScores.amount(20_544) +
							openableScores.amount(20_543) +
							openableScores.amount(19_836)
						);
					}
				},
				items: uniqueArr([...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL]),
				isActivity: true,
				fmtProg: clueProg(['Hard', 'Elite', 'Master'])
			}
		}
	},
	Minigames: {
		activities: {
			'Barbarian Assault': {
				alias: ['ba', 'barb assault', 'barbarian assault'],
				items: barbarianAssaultCL,
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'barb_assault')!.score,
					'High Gambles': async (_, __, stats) => stats.highGambles
				},
				isActivity: true,
				fmtProg: ({ minigames, stats }) => {
					return [`${minigames.barb_assault} KC`, `${stats.highGambles} Gambles`];
				}
			},
			'Brimhaven Agility Arena': {
				alias: ['aa', 'agility arena'],
				items: brimhavenAgilityArenaCL,
				isActivity: true,
				fmtProg: mgProg('agility_arena')
			},
			'Castle Wars': {
				alias: ['cw', 'castle wars'],
				items: castleWarsCL,
				isActivity: true,
				fmtProg: mgProg('castle_wars')
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
				isActivity: true,
				fmtProg: mgProg('fishing_trawler')
			},
			"Giants' Foundry": {
				alias: ['giants', 'giants foundry', 'giants foundry'],
				items: giantsFoundryCL,
				isActivity: true
			},
			'Gnome Restaurant': {
				alias: ['gnome', 'restaurant'],
				allItems: resolveItems(['Snake charm', 'Gnomeball']),
				items: gnomeRestaurantCL,
				isActivity: true,
				fmtProg: mgProg('gnome_restaurant')
			},
			'Guardians of the Rift': {
				alias: ['gotr'],
				items: guardiansOfTheRiftCL,
				isActivity: true,
				fmtProg: mgProg('guardians_of_the_rift')
			},
			'Hallowed Sepulchre': {
				alias: ['sepulchre', 'hallowed sepulchre'],
				allItems: sepulchreFloors.map(f => f.coffinTable.allItems).flat(100),
				items: hallowedSepulchreCL,
				isActivity: true,
				fmtProg: mgProg('sepulchre')
			},
			'Last Man Standing': {
				items: lastManStandingCL,
				isActivity: true,
				kcActivity: {
					Default: async (_, minigameScores) => minigameScores.find(i => i.minigame.column === 'lms')!.score
				},
				alias: ['lms'],
				fmtProg: mgProg('sepulchre')
			},
			'Magic Training Arena': {
				alias: ['mta'],
				items: magicTrainingArenaCL,
				isActivity: true,
				fmtProg: mgProg('magic_training_arena')
			},
			'Mahogany Homes': {
				items: mahoganyHomesCL,
				isActivity: true,
				fmtProg: mgProg('mahogany_homes')
			},
			'Pest Control': {
				items: pestControlCL,
				isActivity: true,
				alias: ['pc'],
				fmtProg: mgProg('pest_control')
			},
			"Rogues' Den": {
				alias: ['rogues den', 'rd'],
				items: roguesDenCL,
				isActivity: true,
				fmtProg: mgProg('rogues_den')
			},
			"Shades of Mort'ton": {
				items: shadesOfMorttonCL,
				isActivity: true,
				fmtProg: mgProg('shades_of_morton')
			},
			'Soul Wars': {
				alias: ['soul wars', 'sw'],
				items: soulWarsCL,
				allItems: resolveItems(['Blue soul cape']),
				isActivity: true,
				fmtProg: mgProg('soul_wars')
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
				isActivity: true,
				fmtProg: mgProg('temple_trekking')
			},
			'Tithe Farm': {
				alias: ['tithe'],
				kcActivity: {
					Default: async (_, __, stats) => stats.titheFarmsCompleted
				},
				items: titheFarmCL,
				isActivity: true,
				fmtProg: ({ stats }) => `${stats.titheFarmsCompleted} Completions`
			},
			'Trouble Brewing': {
				items: troubleBrewingCL,
				isActivity: true,
				fmtProg: mgProg('trouble_brewing')
			},
			'Volcanic Mine': {
				items: volcanicMineCL,
				alias: ['vm', 'vmine', 'volcanic'],
				isActivity: true,
				fmtProg: mgProg('volcanic_mine')
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
				isActivity: true,
				fmtProg: mgProg('champions_challenge')
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
			'Colossal Wyrm Agility': {
				alias: ['colossal wyrm agility', 'colo agility', 'wyrm agility'],
				items: colossalWyrmAgilityCL
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
			Forestry: {
				alias: ['forestry', 'forest', 'for'],
				fmtProg: skillProg(SkillsEnum.Woodcutting),
				allItems: forestryCL,
				items: forestryCL
			},
			'Fossil Island Notes': {
				items: fossilIslandNotesCL
			},
			"Glough's Experiments": {
				alias: Monsters.DemonicGorilla.aliases,
				allItems: Monsters.DemonicGorilla.allItems,
				kcActivity: Monsters.DemonicGorilla.name,
				items: demonicGorillaCL,
				fmtProg: kcProg(Monsters.DemonicGorilla)
			},
			'Monkey Backpacks': {
				alias: ['monkey', 'monkey bps', 'backpacks'],
				kcActivity: {
					Default: async (_, __, u) => u.lapsScores[6] || 0
				},
				items: monkeyBackpacksCL,
				isActivity: true
			},
			'Motherlode Mine': {
				alias: ['mlm'],
				items: motherlodeMineCL,
				fmtProg: kcProg(Monsters.DemonicGorilla)
			},
			'My Notes': {
				alias: ['my notes'],
				items: myNotesCL
			},
			'Random Events': {
				alias: ['random'],
				items: randomEventsCL
			},
			Revenants: {
				alias: ['revs'],
				kcActivity: {
					Default: async user => {
						const stats = await user.fetchStats({ monster_scores: true });
						return sumArr(
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
							].map(i => (stats.monster_scores as ItemBank)[i] ?? 0)
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
				isActivity: true,
				fmtProg: skillProg(SkillsEnum.Agility)
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
				items: slayerCL,
				fmtProg: skillProg(SkillsEnum.Slayer)
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
			},
			'Tormented Demons': {
				alias: Monsters.TormentedDemon.aliases,
				allItems: Monsters.TormentedDemon.allItems,
				kcActivity: Monsters.TormentedDemon.name,
				items: tormentedDemonCL,
				fmtProg: kcProg(Monsters.TormentedDemon)
			},
			Miscellaneous: {
				alias: ['misc'],
				items: miscellaneousCL
			}
		}
	},
	Custom: {
		activities: {
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
			Quest: {
				counts: false,
				items: questCL
			},
			Farming: {
				counts: false,
				items: allFarmingItems,
				fmtProg: skillProg(SkillsEnum.Farming)
			},
			Implings: {
				counts: false,
				items: implingsCL
			},
			Graceful: {
				counts: false,
				items: gracefulCL,
				fmtProg: skillProg(SkillsEnum.Agility)
			},
			'God Wars Dungeon': {
				counts: false,
				alias: ['gwd', 'god wars'],
				kcActivity: {
					Default: [
						Monsters.CommanderZilyana.name,
						Monsters.KrilTsutsaroth.name,
						Monsters.Kreearra.name,
						Monsters.GeneralGraardor.name,
						'Nex'
					]
				},
				allItems: [
					...Monsters.CommanderZilyana.allItems,
					...Monsters.KrilTsutsaroth.allItems,
					...Monsters.Kreearra.allItems,
					...Monsters.GeneralGraardor.allItems,
					...NexNonUniqueTable.allItems
				],
				items: [...godWarsDungeonCL, ...NexCL]
			},
			'The Forgotten Four': {
				counts: false,
				alias: ['dt2', 'desert treasure 2', 'forgotten four'],
				kcActivity: {
					Default: [
						Monsters.TheLeviathan.name,
						Monsters.TheWhisperer.name,
						Monsters.Vardorvis.name,
						Monsters.DukeSucellus.name
					],
					Awakened: [
						Monsters.AwakenedTheLeviathan.name,
						Monsters.AwakenedTheWhisperer.name,
						Monsters.AwakenedVardorvis.name,
						Monsters.AwakenedDukeSucellus.name
					]
				},
				allItems: [
					...Monsters.TheLeviathan.allItems,
					...Monsters.TheWhisperer.allItems,
					...Monsters.Vardorvis.allItems,
					...Monsters.DukeSucellus.allItems
				],
				items: uniqueArr([...theLeviathanCL, ...theWhispererCL, ...vardorvisCL, ...dukeSucellusCL])
			},
			Creatables: {
				counts: false,
				items: uniqueArr(
					Createables.filter(i => i.noCl !== true).flatMap(i =>
						new Bank(i.outputItems).items().map(i => i[0].id)
					)
				)
			},
			Leagues: {
				counts: false,
				items: leagueBuyables.map(i => i.item.id)
			},
			Skilling: {
				counts: false,
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
		.map(m => (m?.allItems ? m.allItems : []))
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

const overallPlusItems = [
	...new Set(
		Object.entries(allCollectionLogs)
			.filter(i => i[0] !== 'Discontinued')
			.map(e => Object.values(e[1].activities).map(a => a.items))
			.flat(100)
	)
];

export function calcCLDetails(user: MUser | Bank) {
	const clItems = (user instanceof Bank ? user : user.cl).filter(i => allCLItemsFiltered.includes(i.id));
	const debugBank = new Bank(clItems);
	const owned = clItems.filter(i => allCLItemsFiltered.includes(i.id));
	const notOwned = shuffleRandom(
		Number(user instanceof Bank ? '1' : user.id),
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
function getLeftList(userBank: Bank, checkCategory: string, allItems = false, removeCoins = false): ILeftListStatus {
	const leftList: ILeftListStatus = {};
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
				if (removeCoins && items.includes(EItem.COINS)) items.splice(items.indexOf(EItem.COINS), 1);
				const [totalCl, userAmount] = getUserClData(userBank, items);
				leftList[activityName] =
					userAmount === 0 ? 'not_started' : userAmount === totalCl ? 'completed' : 'started';
			}
		}
	}
	return leftList;
}

function getBank(user: MUser, type: 'sacrifice' | 'bank' | 'collection' | 'temp', userStats: MUserStats | null) {
	switch (type) {
		case 'collection':
			return new Bank(user.cl);
		case 'bank':
			return new Bank(user.bankWithGP);
		case 'sacrifice':
			if (!userStats) return new Bank();
			return new Bank(userStats.sacrificedBank);
		case 'temp':
			return new Bank(user.user.temp_cl as ItemBank);
	}
}

// Get the total items the user has in its CL and the total items to collect
export function getTotalCl(
	user: MUser,
	logType: 'sacrifice' | 'bank' | 'collection' | 'temp',
	userStats: MUserStats | null
) {
	return getUserClData(getBank(user, logType, userStats), allCLItemsFiltered);
}

export function getCollectionItems(
	collection: string,
	allItems: boolean,
	removeCoins: boolean,
	returnResolvedCl: boolean
): { resolvedCl: string; items: number[] };
export function getCollectionItems(collection: string, allItems?: boolean, removeCoins?: boolean): number[];
export function getCollectionItems(
	collection: string,
	allItems = false,
	removeCoins = false,
	returnResolvedCl?: boolean
): { resolvedCl: string; items: number[] } | number[] {
	const returnValue = (clName: string, items: number[]) => {
		return returnResolvedCl !== undefined ? { resolvedCl: clName.toLowerCase(), items } : items;
	};
	if (collection === 'overall+') {
		return returnValue(collection, overallPlusItems);
	}
	if (['overall', 'all'].some(s => stringMatches(collection, s))) {
		return returnValue('overall', allCLItemsFiltered);
	}

	let _items: number[] = [];
	let _clName = '';
	loop: for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (stringMatches(category, collection) || entries.alias?.some(a => stringMatches(a, collection))) {
			_clName = category;
			_items = uniqueArr(
				Object.values(entries.activities)
					.map(e => [...new Set([...e.items, ...(allItems ? (e.allItems ?? []) : [])])])
					.flat(2)
			);

			break;
		}
		for (const [activityName, attributes] of Object.entries(entries.activities)) {
			if (stringMatches(activityName, collection) || attributes.alias?.find(a => stringMatches(a, collection))) {
				_clName = activityName;
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
			_clName = _monster.name;
			_items = uniqueArr(Monsters.get(_monster?.id)!.allItems);
		}
	}
	if (removeCoins && _items.includes(EItem.COINS)) _items = removeFromArr(_items, EItem.COINS);
	return returnValue(_clName, _items);
}

function getUserClData(userBank: Bank, clItems: number[]): [number, number] {
	const owned = userBank.itemIDs.filter(i => clItems.includes(i));
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
	search: string;
	flags: { [key: string]: string | number | undefined };
	logType?: 'collection' | 'sacrifice' | 'bank' | 'temp';
	minigameScoresOverride?: Awaited<ReturnType<MUser['fetchMinigameScores']>> | null;
}): Promise<false | IToReturnCollection> {
	let { user, search, flags, logType } = options;

	const allItems = Boolean(flags.all);
	if (logType === undefined) logType = 'collection';

	const userStats = await MUserStats.fromID(user.id);
	const userCheckBank = getBank(user, logType, userStats);
	let clItems = getCollectionItems(search, allItems, logType === 'sacrifice');

	if (clItems.length >= 500) {
		flags.missing = 'missing';
	}

	if (flags.missing) {
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

	const minigameScores = options.minigameScoresOverride ?? (await user.fetchMinigameScores());

	for (const [category, entries] of Object.entries(allCollectionLogs)) {
		if (stringMatches(category, search) || entries.alias?.some(a => stringMatches(a, search))) {
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
			if (stringMatches(activityName, search) || attributes.alias?.find(a => stringMatches(a, search))) {
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
								userKC[type] += await value(user, minigameScores, userStats);
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
			completions: { Default: await user.getKC(monster.id) },
			collectionObtained: userAmount,
			collectionTotal: totalCl,
			userItems: userCheckBank,
			counts: false
		};
	}

	return false;
}

export const allCollectionLogsFlat = Object.values(allCollectionLogs).flatMap(i =>
	Object.entries(i.activities).map(entry => ({ ...entry[1], name: entry[0] }))
);

export function isCLItem(item: Item | number | [Item, number]): boolean {
	if (Array.isArray(item)) return isCLItem(item[0]);
	return allCLItemsFiltered.includes(isObject(item) ? item.id : item);
}

export const bossCLItems = Object.values({
	...allCollectionLogs.Bosses.activities,
	...allCollectionLogs.Raids.activities
}).flatMap(i => i.items);
