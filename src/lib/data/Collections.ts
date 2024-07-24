import { calcWhatPercent, isObject, notEmpty, removeFromArr, sumArr, uniqueArr } from 'e';
import { Bank, Clues, Monsters } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';
import type Monster from 'oldschooljs/dist/structures/Monster';

import { divinationEnergies, portents } from '../bso/divination';
import { type ClueTier, ClueTiers } from '../clues/clueTiers';
import type { CollectionLogType } from '../collectionLogTask';
import { PHOSANI_NIGHTMARE_ID, ZALCANO_ID } from '../constants';
import { discontinuedDyes, dyedItems } from '../dyedItems';
import { growablePetsCL } from '../growablePets';
import { implingsCL } from '../implings';
import { inventionCL } from '../invention/inventions';
import { keyCrates } from '../keyCrates';
import killableMonsters, { NightmareMonster } from '../minions/data/killableMonsters';
import { AkumuLootTable } from '../minions/data/killableMonsters/custom/bosses/Akumu';
import { Ignecarus } from '../minions/data/killableMonsters/custom/bosses/Ignecarus';
import {
	KalphiteKingMonster,
	kalphiteKingLootTable
} from '../minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { MOKTANG_ID, MoktangLootTable } from '../minions/data/killableMonsters/custom/bosses/Moktang';
import { Naxxus, NaxxusLootTableFinishable } from '../minions/data/killableMonsters/custom/bosses/Naxxus';
import { VasaMagus } from '../minions/data/killableMonsters/custom/bosses/VasaMagus';
import { VenatrixLootTable } from '../minions/data/killableMonsters/custom/bosses/Venatrix';
import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import { sepulchreFloors } from '../minions/data/sepulchre';
import {
	EasyEncounterLoot,
	HardEncounterLoot,
	MediumEncounterLoot,
	rewardTokens
} from '../minions/data/templeTrekking';
import { NexMonster, nexLootTable } from '../nex';
import type { MinigameName } from '../settings/minigames';
import { ElderClueTable } from '../simulation/elderClue';
import { GrandmasterClueTable } from '../simulation/grandmasterClue';
import { pumpkinHeadUniqueTable } from '../simulation/pumpkinHead';
import { cookingCL } from '../skilling/skills/cooking/cooking';
import { craftingCL } from '../skilling/skills/crafting/craftables';
import { allFarmingItems } from '../skilling/skills/farming';
import { fletchingCL } from '../skilling/skills/fletching/fletchables';
import { herbloreCL } from '../skilling/skills/herblore/mixables';
import smithables from '../skilling/skills/smithing/smithables';
import { SkillsEnum } from '../skilling/types';
import { MUserStats } from '../structures/MUserStats';
import type { ItemBank } from '../types';
import { stringMatches } from '../util';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';
import { shuffleRandom } from '../util/smallUtils';
import type { FormatProgressFunction, ICollection, ILeftListStatus, IToReturnCollection } from './CollectionsExport';
import {
	abyssalDragonCL,
	abyssalSireCL,
	aerialFishingCL,
	akumuCL,
	alchemicalHydraCL,
	allPetsCL,
	balthazarsBigBonanzaCL,
	barbarianAssaultCL,
	barrowsChestCL,
	baxtorianBathhousesCL,
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
	cluesGrandmasterRareCL,
	cluesHardCL,
	cluesHardRareCL,
	cluesMasterCL,
	cluesMasterRareCL,
	cluesMediumCL,
	cluesSharedCL,
	cmbClothes,
	commanderZilyanaCL,
	corporealBeastCL,
	crackerCL,
	crazyArchaeologistCL,
	creatureCreationCL,
	customPetsCL,
	cyclopsCL,
	dagannothKingsCL,
	dailyCL,
	demonicGorillaCL,
	diariesCL,
	discontinuedCustomPetsCL,
	divinersOutfit,
	doaCL,
	dukeSucellusCL,
	dungeoneeringCL,
	emergedZukInfernoCL,
	expertCapesCL,
	fightCavesCL,
	fishingContestCL,
	fishingTrawlerCL,
	fistOfGuthixCL,
	forestryCL,
	fossilIslandNotesCL,
	generalGraardorCL,
	giantMoleCL,
	giantsFoundryCL,
	gnomeRestaurantCL,
	godWarsDungeonGodswordShards,
	gracefulCL,
	grotesqueGuardiansCL,
	guardiansOfTheRiftCL,
	hallowedSepulchreCL,
	hesporiCL,
	holidayCL,
	ignecarusCL,
	kalphiteKingCL,
	kalphiteQueenCL,
	kingBlackDragonCL,
	kingGoldemarCL,
	krakenCL,
	kreeArraCL,
	krilTsutsarothCL,
	lastManStandingCL,
	leaguesCL,
	magicTrainingArenaCL,
	mahoganyHomesCL,
	masterCapesCL,
	miscellaneousCL,
	moktangCL,
	monkeyBackpacksCL,
	monkeyRumbleCL,
	motherlodeMineCL,
	muspahCL,
	naxxusCL,
	nexCL,
	nihilizCL,
	oborCL,
	odsCL,
	pestControlCL,
	polyporeDungeonCL,
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
	shootingStarsCL,
	skillingMiscCL,
	skillingPetsCL,
	skotizoCL,
	slayerCL,
	soulWarsCL,
	spectatorClothes,
	spiritAnglerOutfit,
	stealingCreationCL,
	templeTrekkingCL,
	temporossCL,
	theGauntletCL,
	theInfernoCL,
	theLeviathanCL,
	theNightmareCL,
	theWhispererCL,
	theatreOfBLoodCL,
	thermonuclearSmokeDevilCL,
	tinkeringWorshopCL,
	titheFarmCL,
	toaCL,
	tormentedDemonCL,
	treeBeardCL,
	troubleBrewingCL,
	tzHaarCL,
	vardorvisCL,
	vasaMagusCL,
	venatrixCL,
	venenatisCL,
	vetionCL,
	vladDrakanCL,
	volcanicMineCL,
	vorkathCL,
	wintertodtCL,
	zalcanoCL,
	zulrahCL
} from './CollectionsExport';
import { creatablesCL } from './createables';
import { kibbleCL } from './kibble';
import { slayerMasksHelmsCL } from './slayerMaskHelms';

function kcProg(mon: Monster | number): FormatProgressFunction {
	return ({ stats }) => `${stats.kcBank[typeof mon === 'number' ? mon : mon.id] ?? 0} KC`;
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
	PvM: {
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
			'God Wars Dungeon': {
				alias: ['gwd', 'godwars'],
				kcActivity: {
					Default: async user => {
						return sumArr(
							await Promise.all(
								[
									Monsters.GeneralGraardor.id,
									Monsters.CommanderZilyana.id,
									Monsters.Kreearra.id,
									Monsters.KrilTsutsaroth.id
								].map(i => user.getKC(i))
							)
						);
					}
				},
				allItems: (() => {
					return [
						...new Set([
							...Monsters.GeneralGraardor.allItems,
							...Monsters.CommanderZilyana.allItems,
							...Monsters.Kreearra.allItems,
							...Monsters.KrilTsutsaroth.allItems
						])
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
			'Vladimir Drakan': {
				alias: BSOMonsters.VladimirDrakan.aliases,
				allItems: BSOMonsters.VladimirDrakan.table.allItems,
				items: vladDrakanCL,
				fmtProg: kcProg(BSOMonsters.VladimirDrakan.id)
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
			'The Inferno': {
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'inferno')!.score
				},
				alias: ['zuk', 'inferno'],
				items: theInfernoCL,
				fmtProg: ({ minigames }) => `${minigames.inferno} KC`
			},
			'Emerged Zuk Inferno': {
				alias: ['emerged inferno', 'ezi', 'emerged zuk'],
				items: emergedZukInfernoCL,
				fmtProg: ({ minigames }) => `${minigames.emerged_inferno} KC`
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
			'The Nightmare': {
				alias: [...NightmareMonster.aliases, 'phosani'],
				kcActivity: {
					Default: 'Nightmare',
					Phosani: "Phosani's Nightmare"
				},
				items: theNightmareCL,
				fmtProg: ({ stats }) => [
					`${stats.kcBank[NightmareMonster.id] ?? 0} KC`,
					`${stats.kcBank[PHOSANI_NIGHTMARE_ID] ?? 0} Phosani KC`
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
			Moktang: {
				alias: ['mt', 'moktang'],
				items: moktangCL,
				allItems: MoktangLootTable.allItems,
				fmtProg: kcProg(MOKTANG_ID)
			},
			Wintertodt: {
				alias: ['todt', 'wintertodt', 'wt'],
				items: wintertodtCL,
				fmtProg: mgProg('wintertodt')
			},
			Zalcano: { items: zalcanoCL, fmtProg: ({ stats }) => `${stats.kcBank[ZALCANO_ID] ?? 0} KC` },
			Zulrah: {
				alias: Monsters.Zulrah.aliases,
				allItems: Monsters.Zulrah.allItems,
				items: zulrahCL,
				fmtProg: kcProg(Monsters.Zulrah)
			},
			'King Goldemar': {
				alias: KingGoldemar.aliases,
				allItems: KingGoldemar.allItems,
				items: kingGoldemarCL,
				fmtProg: kcProg(KingGoldemar.id)
			},
			Malygos: {
				alias: BSOMonsters.Malygos.aliases,
				allItems: BSOMonsters.Malygos.table.allItems,
				items: abyssalDragonCL,
				fmtProg: kcProg(BSOMonsters.Malygos.id)
			},
			Nihiliz: {
				alias: BSOMonsters.Nihiliz.aliases,
				allItems: BSOMonsters.Nihiliz.table.allItems,
				items: nihilizCL,
				fmtProg: kcProg(BSOMonsters.Nihiliz.id)
			},
			'Kalphite King': {
				alias: KalphiteKingMonster.aliases,
				allItems: kalphiteKingLootTable.allItems,
				items: kalphiteKingCL,
				fmtProg: kcProg(KalphiteKingMonster.id)
			},
			Naxxus: {
				alias: Naxxus.aliases,
				allItems: NaxxusLootTableFinishable.allItems,
				items: naxxusCL,
				fmtProg: kcProg(Naxxus.id)
			},
			Nex: {
				alias: NexMonster.aliases,
				allItems: nexLootTable.allItems,
				items: nexCL,
				fmtProg: kcProg(NexMonster.id)
			},
			'Vasa Magus': {
				alias: VasaMagus.aliases,
				allItems: VasaMagus.allItems,
				items: vasaMagusCL,
				fmtProg: kcProg(VasaMagus.id)
			},
			Ignecarus: {
				alias: Ignecarus.aliases,
				allItems: Ignecarus.allItems,
				items: ignecarusCL,
				fmtProg: kcProg(Ignecarus.id)
			},
			Treebeard: {
				alias: BSOMonsters.Treebeard.aliases,
				allItems: BSOMonsters.Treebeard.table.allItems,
				items: treeBeardCL,
				fmtProg: kcProg(BSOMonsters.Treebeard.id)
			},
			'Sea Kraken': {
				alias: BSOMonsters.SeaKraken.aliases,
				allItems: BSOMonsters.SeaKraken.table.allItems,
				items: seaKrakenCL,
				fmtProg: kcProg(BSOMonsters.SeaKraken.id)
			},
			'Queen Black Dragon': {
				alias: BSOMonsters.QueenBlackDragon.aliases,
				allItems: BSOMonsters.QueenBlackDragon.table.allItems,
				items: queenBlackDragonCL,
				fmtProg: kcProg(BSOMonsters.QueenBlackDragon.id)
			},
			Akumu: {
				alias: ['akumu'],
				allItems: AkumuLootTable.allItems,
				items: akumuCL,
				fmtProg: kcProg(BSOMonsters.Akumu.id)
			},
			Venatrix: {
				alias: ['venatrix'],
				allItems: VenatrixLootTable.allItems,
				items: venatrixCL,
				fmtProg: kcProg(BSOMonsters.Venatrix.id)
			},
			"Chamber's of Xeric": {
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
				items: toaCL,
				isActivity: true,
				fmtProg: ({ minigames }) => {
					return [`${minigames.tombs_of_amascut} KC`];
				}
			},
			'Depths of Atlantis': {
				alias: ['doa'],
				kcActivity: {
					Default: async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'depths_of_atlantis')!.score,
					'Challenge Mode': async (_, minigameScores) =>
						minigameScores.find(i => i.minigame.column === 'depths_of_atlantis_cm')!.score
				},
				items: doaCL,
				isActivity: true,
				fmtProg: ({ minigames }) => {
					return [`${minigames.depths_of_atlantis} KC`, `${minigames.depths_of_atlantis_cm} CM KC`];
				}
			},
			'Tormented Demons': {
				items: tormentedDemonCL,
				alias: ['td', 'tormented demon', 'tormented demons'],
				fmtProg: kcProg(BSOMonsters.TormentedDemon.id)
			},
			"Champion's Challenge": {
				alias: ['champion', 'champion scrolls', 'champion scroll', 'scroll', 'scrolls'],
				items: championsChallengeCL,
				isActivity: true,
				fmtProg: mgProg('champions_challenge')
			},
			'Chaos Druids': {
				allItems: Monsters.ChaosDruid.allItems,
				kcActivity: Monsters.ChaosDruid.name,
				items: chaosDruisCL
			},
			Revenants: {
				alias: ['revs'],
				kcActivity: {
					Default: async (_, __, stats) => {
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
							].map(i => stats.kcBank[i] ?? 0)
						);
					}
				},
				allItems: (() => {
					return [
						...new Set([
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
						])
					];
				})(),
				items: revenantsCL
			},
			'Polypore Dungeon': {
				items: polyporeDungeonCL
			},
			Slayer: {
				alias: ['slay'],
				items: slayerCL,
				fmtProg: skillProg(SkillsEnum.Slayer)
			},
			'Slayer Masks/Helms': {
				alias: ['slayer Masks/Helms'],
				items: slayerMasksHelmsCL,
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
			Solis: {
				alias: ['solis'],
				allItems: BSOMonsters.Solis.allItems,
				items: BSOMonsters.Solis.allItems!,
				fmtProg: kcProg(BSOMonsters.Solis.id)
			},
			Celestara: {
				alias: ['celestara'],
				allItems: BSOMonsters.Celestara.allItems,
				items: BSOMonsters.Celestara.allItems!,
				fmtProg: kcProg(BSOMonsters.Celestara.id)
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
			'Elder Treasure Trails': {
				alias: ['elder'],
				allItems: resolveItems([
					...ElderClueTable.allItems,
					'Clue bag',
					'Inventors tools',
					'Elder knowledge',
					'Octo'
				]),
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(73_124)
				},
				items: resolveItems([
					'Lord marshal boots',
					'Lord marshal gloves',
					'Lord marshal trousers',
					'Lord marshal top',
					'Lord marshal cap',
					'Akumu mask',
					'Commander boots',
					'Commander gloves',
					'Commander trousers',
					'Commander top',
					'Commander cap',
					'Apple parasol',
					'Watermelon parasol',
					'Lemon parasol',
					'Strawberry parasol',
					'Blueberry parasol',
					'Grape parasol',
					'Coconut parasol',
					'Detective hat',
					'Detective trenchcoat',
					'Detective pants',
					'2nd age range legs',
					'2nd age range top',
					'2nd age range coif',
					'2nd age bow',
					'2nd age mage top',
					'2nd age mage bottom',
					'2nd age mage mask',
					'2nd age staff',
					'First age robe top',
					'First age robe bottom',
					'Clue bag',
					'Inventors tools',
					'Elder knowledge',
					'Octo'
				]),
				isActivity: true,
				fmtProg: clueProg(['Elder'])
			},
			'Grandmaster Treasure Trails': {
				alias: ['grandmaster', 'clues grandmaster', 'clue grandmaster', 'clue gm', 'gm'],
				allItems: GrandmasterClueTable.table.allItems,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(19_838)
				},
				items: cluesGrandmasterCL,
				isActivity: true,
				fmtProg: clueProg(['Grandmaster'])
			},
			'Grandmaster Treasure Trails (Rare)': {
				alias: ['grandmaster', 'clues grandmaster', 'clue grandmaster', 'clue gm', 'gm'],
				allItems: cluesGrandmasterRareCL,
				kcActivity: {
					Default: async (_, __, { openableScores }) => openableScores.amount(19_838)
				},
				items: cluesGrandmasterRareCL,
				isActivity: true,
				fmtProg: clueProg(['Grandmaster'])
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
				items: [...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL],
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
				isActivity: true
			},
			'Ourania Delivery Service': {
				alias: ['ods', 'ourania'],
				items: odsCL,
				isActivity: true,
				fmtProg: mgProg('ourania_delivery_service')
			},
			"Mad Marimbo's Monkey Rumble": {
				alias: ['mr', 'mmmr', 'mmr', 'monkey rumble', 'mad marimbos monkey rumble'],
				items: monkeyRumbleCL,
				isActivity: true,
				fmtProg: mgProg('monkey_rumble')
			},
			'Fishing Contest': {
				alias: ['fc'],
				items: fishingContestCL,
				isActivity: true,
				fmtProg: mgProg('fishing_contest')
			},
			'Baxtorian Bathhouses': {
				alias: ['bb', 'bax bath', 'baxtorian bathhouses', 'bath', 'baths'],
				items: baxtorianBathhousesCL,
				isActivity: true,
				fmtProg: mgProg('bax_baths')
			},
			'Fist of Guthix': {
				alias: ['fog', 'fist of guthix'],
				items: fistOfGuthixCL,
				isActivity: true,
				fmtProg: mgProg('fist_of_guthix')
			},
			'Guthixian Caches': {
				alias: ['guthixian caches'],
				items: [...divinersOutfit],
				isActivity: true,
				fmtProg: mgProg('guthixian_cache')
			},
			'Stealing Creation': {
				alias: ['stealing creation', 'sc'],
				items: stealingCreationCL,
				isActivity: true,
				fmtProg: mgProg('stealing_creation')
			},
			'Tinkering Workshop': {
				alias: ['tw', 'tinkering workshop'],
				items: tinkeringWorshopCL,
				isActivity: true,
				fmtProg: mgProg('tinkering_workshop')
			},
			"Balthazar's Big Bonanza": {
				alias: ['bbb', 'balthazars big bananza', 'circus'],
				items: balthazarsBigBonanzaCL,
				isActivity: true,
				fmtProg: mgProg('balthazars_big_bonanza')
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
			'Rooftop Agility': {
				alias: ['rooftop', 'laps', 'agility', 'agil'],
				items: rooftopAgilityCL,
				isActivity: true,
				fmtProg: skillProg(SkillsEnum.Agility)
			},
			'Shooting Stars': { items: shootingStarsCL },
			'Skilling Pets': {
				alias: ['skill pets'],
				items: skillingPetsCL
			},
			Dungeoneering: {
				alias: ['dg', 'dung', 'dungeoneering'],
				items: dungeoneeringCL,
				fmtProg: skillProg(SkillsEnum.Dungeoneering)
			},
			Farming: {
				counts: false,
				items: allFarmingItems,
				fmtProg: skillProg(SkillsEnum.Farming)
			},
			Cooking: {
				counts: false,
				items: cookingCL,
				fmtProg: skillProg(SkillsEnum.Cooking)
			},
			Crafting: {
				counts: false,
				items: craftingCL,
				fmtProg: skillProg(SkillsEnum.Crafting)
			},
			Herblore: {
				counts: false,
				items: herbloreCL,
				fmtProg: skillProg(SkillsEnum.Herblore)
			},
			Smithing: {
				counts: false,
				items: smithables.map(i => i.id),
				fmtProg: skillProg(SkillsEnum.Smithing)
			},
			Kibble: {
				counts: false,
				items: kibbleCL
			},
			Graceful: {
				counts: false,
				items: gracefulCL,
				fmtProg: skillProg(SkillsEnum.Agility)
			},
			Fletching: {
				counts: false,
				items: fletchingCL,
				fmtProg: skillProg(SkillsEnum.Fletching)
			},
			'Skilling Misc': {
				items: skillingMiscCL
			},
			Invention: {
				alias: ['inv'],
				items: inventionCL,
				fmtProg: skillProg(SkillsEnum.Invention)
			},
			Divination: {
				alias: ['div'],
				items: resolveItems([
					...divinersOutfit,
					...portents.map(p => p.item.id),
					...divinationEnergies.flatMap(i => [i.boon?.id, i.item.id]).filter(notEmpty),
					'Divine egg',
					'Jar of memories',
					'Doopy'
				]),
				fmtProg: skillProg(SkillsEnum.Divination)
			}
		}
	},
	Other: {
		activities: {
			'All Pets': {
				alias: ['pet', 'pets'],
				items: allPetsCL
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
				items: dyedItems
					.map(i => i.dyedVersions.filter(i => !discontinuedDyes.includes(i.dye.id)).map(i => i.item.id))
					.flat(2)
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
			'Christmas Cracker': {
				counts: false,
				items: crackerCL,
				alias: ['hmb', 'holiday mystery box']
			},
			'Growable Pets': {
				items: growablePetsCL
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
				items: [...theLeviathanCL, ...theWhispererCL, ...vardorvisCL, ...dukeSucellusCL]
			},
			Creatables: {
				counts: false,
				items: creatablesCL
			},
			Leagues: {
				items: leaguesCL
			},
			'Spectator Clothes': {
				items: spectatorClothes,
				counts: false
			},
			'Tame Gear': {
				items: resolveItems([
					'Dragon igne armor',
					'Barrows igne armor',
					'Volcanic igne armor',
					'Justiciar igne armor',
					'Drygore igne armor',
					'Dwarven igne armor',
					'Gorajan igne armor',
					'Runite igne claws',
					'Dragon igne claws',
					'Barrows igne claws',
					'Volcanic igne claws',
					'Drygore igne claws',
					'Dwarven igne claws',
					'Gorajan igne claws',
					'Seamonkey staff (t1)',
					'Seamonkey staff (t2)',
					'Seamonkey staff (t3)',
					'Impling locator',
					'Divine ring',
					'Abyssal jibwings (e)',
					'Demonic jibwings (e)',
					'3rd age jibwings (e)',
					'Abyssal jibwings',
					'Demonic jibwings',
					'3rd age jibwings'
				])
			},
			'Divine Dominion': {
				alias: ['dd', 'divine dominion'],
				items: resolveItems([
					'Zamorak egg',
					'Baby zamorak hawk',
					'Juvenile zamorak hawk',
					'Zamorak hawk',
					'Warpriest of Zamorak set',
					'Guthix egg',
					'Baby guthix raptor',
					'Juvenile guthix raptor',
					'Guthix raptor',
					'Saradomin egg',
					'Baby saradomin owl',
					'Juvenile saradomin owl',
					'Saradomin owl',
					'Warpriest of Saradomin set',
					'Warpriest of Bandos set',
					'Warpriest of Armadyl set'
				])
			}
		}
	},
	Discontinued: {
		activities: {
			'Easter 2022': {
				items: resolveItems(['Chickaxe', 'Leia', 'Decorative easter eggs']),
				counts: false
			},
			'Easter 2023': {
				items: resolveItems([
					'Cute magic egg',
					'Fancy magic egg',
					'Big mysterious egg',
					'Fancy ancient egg',
					'Sweet small egg',
					'Mysterious magic egg',
					'Big ancient egg',
					'Fancy sweet egg',
					'Eggy',
					'Easter egg backpack',
					'Floppy bunny ears',
					'Egg coating',
					'Chocolate pot'
				]),
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
			'Halloween 2023': {
				alias: ['hween2023', 'halloween 2023'],
				items: resolveItems([
					'Splooky fwizzle',
					"Fool's ace",
					"Pandora's box",
					'Maledict codex',
					'Maledict gloves',
					'Maledict ring',
					'Maledict amulet',
					'Maledict boots',
					'Maledict cape',
					'Maledict legs',
					'Maledict top',
					'Maledict hat',
					'Purple halloween mask',
					'Cosmic dice',
					'Spooky aura',
					'Spooky sheet',
					'Evil partyhat',
					'Soul shield',
					'Bag of tricks',
					'Bat bat',
					'Mini mortimer',
					'Casper',
					'Covenant of grimace'
				]),
				counts: false,
				allItems: resolveItems([
					'Splooky fwizzle',
					"Fool's ace",
					"Pandora's box",
					'Maledict codex',
					'Maledict gloves',
					'Maledict ring',
					'Maledict amulet',
					'Maledict boots',
					'Maledict cape',
					'Maledict legs',
					'Maledict top',
					'Maledict hat',
					'Purple halloween mask',
					'Cosmic dice',
					'Spooky aura',
					'Spooky sheet',
					'Evil partyhat',
					'Soul shield',
					'Bag of tricks',
					'Bat bat',
					'Mini mortimer',
					'Casper',
					'Covenant of grimace'
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
					'Festive jumper (2021)',
					'Frozen santa hat',
					'Seer',
					'Festive present'
				]),
				counts: false
			},
			'BSO Birthday 2022': {
				alias: ['bso birthday 2022'],
				items: resolveItems(['Honey', 'Honeycomb', 'Beehive', 'Buzz']),
				counts: false
			},
			'Christmas 2022': {
				alias: ['xmas 2022', 'christmas 2022'],
				items: resolveItems([
					'Christmas snowglobe',
					'Festive jumper (2022)',
					'Christmas cape',
					'Christmas socks',
					'Tinsel scarf',
					'Frosted wreath',
					'Edible yoyo',
					'Reinbeer',
					'Pork sausage',
					'Pork crackling',
					'Festive treats',
					'Snowman plushie',
					'Snowman top hat',
					'Festive scarf',
					'Frosty'
				]),
				counts: false
			},
			'BSO Birthday 2023': {
				alias: ['birthday 2023'],
				items: resolveItems(['Buggy', 'Ban hammer', 'The Interrogator', 'Acrylic set', 'Golden cape shard']),
				counts: false
			},
			'Christmas 2023': {
				alias: ['xmas 2023', 'christmas 2023'],
				items: resolveItems([
					'Santa costume top (male)',
					'Santa costume top (female)',
					'Santa costume skirt',
					'Santa costume pants',
					'Santa costume gloves',
					'Santa costume boots',
					'Tinsel twirler',
					'Grinch head',
					'Grinch top',
					'Grinch legs',
					'Grinch feet',
					'Grinch hands',
					'Grinch santa hat',
					'Christmas cake',
					'Rudolph'
				]),
				counts: false
			},
			'Dyed Items (Discontinued)': {
				counts: false,
				items: dyedItems
					.map(i => i.dyedVersions.filter(i => discontinuedDyes.includes(i.dye.id)).map(i => i.item.id))
					.flat(2)
			},
			'Miscelleanous (Discontinued)': {
				alias: ['discontinued misc'],
				items: resolveItems(['Golden cape shard', 'Golden cape', 'Golden shard', 'Golden partyhat']),
				counts: false
			}
		}
	}
};

for (const crate of keyCrates) {
	allCollectionLogs.Discontinued.activities[crate.item.name] = {
		alias: [crate.item.name.toLowerCase()],
		items: resolveItems([crate.item.id, crate.key.id, ...crate.table.allItems]).filter(
			i => !getOSItem(i).customItemData?.isSecret
		),
		counts: false
	};
}
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

export const overallPlusItems = [
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
				if (removeCoins && items.includes(995)) items.splice(items.indexOf(995), 1);
				const [totalCl, userAmount] = getUserClData(userBank, items);
				leftList[activityName] =
					userAmount === 0 ? 'not_started' : userAmount === totalCl ? 'completed' : 'started';
			}
		}
	}
	return leftList;
}

type CLType = 'sacrifice' | 'bank' | 'collection' | 'temp' | 'tame' | 'disassembly';

export function getBank(user: MUser, type: CLType, userStats: MUserStats | null): Bank {
	switch (type) {
		case 'collection':
			return new Bank(user.cl);
		case 'bank':
			return new Bank(user.bankWithGP);
		case 'sacrifice':
			if (!userStats) return new Bank();
			return new Bank(userStats.sacrificedBank);
		case 'tame': {
			if (!userStats) return new Bank();
			return new Bank(userStats.userStats.tame_cl_bank as ItemBank);
		}
		case 'temp':
			return new Bank(user.user.temp_cl as ItemBank);
		case 'disassembly': {
			return new Bank(user.user.disassembled_items_bank as ItemBank);
		}
	}
}

export async function getTotalCl(user: MUser, logType: CLType, userStats: MUserStats | null) {
	let result = undefined;
	try {
		result = getUserClData(getBank(user, logType, userStats), allCLItemsFiltered);
	} catch (_e) {
		await user.repairBrokenItems();
		const newBank = getBank(user, logType, userStats);
		result = getUserClData(newBank, allCLItemsFiltered);
	}
	return result;
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
					.map(e => [...new Set([...e.items, ...(allItems ? e.allItems ?? [] : [])])])
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
	if (removeCoins && _items.includes(995)) _items = removeFromArr(_items, 995);
	return returnValue(_clName, _items);
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
	search: string;
	flags: { [key: string]: string | number | undefined };
	logType?: CollectionLogType;
}): Promise<false | IToReturnCollection> {
	let { user, search, flags, logType } = options;

	const allItems = Boolean(flags.all);
	if (logType === undefined) logType = 'collection';
	if (flags.tame) {
		logType = 'tame';
	}

	const minigameScores = await user.fetchMinigameScores();
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
	...allCollectionLogs.PvM.activities
}).flatMap(i => i.items);
