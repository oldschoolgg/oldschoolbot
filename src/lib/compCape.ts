import {
	abyssalDragonCL,
	abyssalSireCL,
	aerialFishingCL,
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
	cluesRaresCL,
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
	dungeoneeringCL,
	emergedZukInfernoCL,
	fishingContestCL,
	fishingTrawlerCL,
	fistOfGuthixCL,
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
	holidayCL,
	ignecarusCL,
	implingsCL,
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
	stealingCreationCL,
	temporossCL,
	theGauntletCL,
	theInfernoCL,
	theNightmareCL,
	thermonuclearSmokeDevilCL,
	tinkeringWorshopCL,
	titheFarmCL,
	tormentedDemonCL,
	treeBeardCL,
	troubleBrewingCL,
	vasaMagusCL,
	venenatisCL,
	vetionCL,
	volcanicMineCL,
	vorkathCL,
	wintertodtCL,
	zulrahCL
} from './data/CollectionsExport';
import { creatablesCL } from './data/createables';
import { kibbleCL } from './data/kibble';
import { slayerMasksHelmsCL } from './data/slayerMaskHelms';
import { growablePetsCL } from './growablePets';
import { inventionCL } from './invention/inventions';
import { calcActualClues } from './leagues/stats';
import { cookingCL } from './skilling/skills/cooking';
import { craftingCL } from './skilling/skills/crafting/craftables';
import { allFarmingItems } from './skilling/skills/farming';
import { fletchingCL } from './skilling/skills/fletching/fletchables';
import { herbloreCL } from './skilling/skills/herblore/mixables';
import { smithingCL } from './skilling/skills/smithing/smithables';
import { Requirements } from './structures/Requirements';

export const minigameCLRequirements = new Requirements()
	.add({ name: "Complete Balthazar's Big Bonanza CL", clRequirement: balthazarsBigBonanzaCL })
	.add({ name: 'Complete Barbarian Assault CL', clRequirement: barbarianAssaultCL })
	.add({ name: 'Complete Baxtorian Bathhouses CL', clRequirement: baxtorianBathhousesCL })
	.add({ name: 'Complete Brimhaven Agility Arena CL', clRequirement: brimhavenAgilityArenaCL })
	.add({ name: 'Complete Castle Wars CL', clRequirement: castleWarsCL })
	.add({ name: 'Complete Fishing Contest CL', clRequirement: fishingContestCL })
	.add({ name: 'Complete Fishing Trawler CL', clRequirement: fishingTrawlerCL })
	.add({ name: 'Complete Fist of Guthix CL', clRequirement: fistOfGuthixCL })
	.add({ name: "Complete Giants' Foundry CL", clRequirement: giantsFoundryCL })
	.add({ name: 'Complete Gnome Restaurant CL', clRequirement: gnomeRestaurantCL })
	.add({ name: 'Complete Guardians of the Rift CL', clRequirement: guardiansOfTheRiftCL })
	.add({ name: 'Complete Hallowed Sepulchre CL', clRequirement: hallowedSepulchreCL })
	.add({ name: 'Complete Last Man Standing CL', clRequirement: lastManStandingCL })
	.add({ name: "Complete Mad Marimbo's Monkey Rumble CL", clRequirement: monkeyRumbleCL })
	.add({ name: 'Complete Magic Training Arena CL', clRequirement: magicTrainingArenaCL })
	.add({ name: 'Complete Mahogany Homes CL', clRequirement: mahoganyHomesCL })
	.add({ name: 'Complete Ourania Delivery Service CL', clRequirement: odsCL })
	.add({ name: 'Complete Pest Control CL', clRequirement: pestControlCL })
	.add({ name: "Complete Rogues' Den CL", clRequirement: roguesDenCL })
	.add({ name: "Complete Shades of Mort'ton CL", clRequirement: shadesOfMorttonCL })
	.add({ name: 'Complete Soul Wars CL', clRequirement: soulWarsCL })
	.add({ name: 'Complete Stealing Creation CL', clRequirement: stealingCreationCL })
	.add({ name: 'Complete Tinkering Workshop CL', clRequirement: tinkeringWorshopCL })
	.add({ name: 'Complete Tithe Farm CL', clRequirement: titheFarmCL })
	.add({ name: 'Complete Trouble Brewing CL', clRequirement: troubleBrewingCL })
	.add({ name: 'Complete Volcanic Mine CL', clRequirement: volcanicMineCL });

export const pvmCLRequirements = new Requirements()
	.add({ name: 'Complete Abyssal Sire CL', clRequirement: abyssalSireCL })
	.add({ name: 'Complete Alchemical Hydra CL', clRequirement: alchemicalHydraCL })
	.add({ name: 'Complete Barrows Chests CL', clRequirement: barrowsChestCL })
	.add({ name: 'Complete Bryophyta CL', clRequirement: bryophytaCL })
	.add({ name: 'Complete Callisto CL', clRequirement: callistoCL })
	.add({ name: 'Complete Cerberus CL', clRequirement: cerberusCL })
	.add({ name: 'Complete Chaos Druids CL', clRequirement: chaosDruisCL })
	.add({ name: 'Complete Chaos Elemental CL', clRequirement: chaosElementalCL })
	.add({ name: 'Complete Chaos Fanatic CL', clRequirement: chaosFanaticCL })
	.add({ name: 'Complete Commander Zilyana CL', clRequirement: commanderZilyanaCL })
	.add({ name: 'Complete Corporeal Beast CL', clRequirement: corporealBeastCL })
	.add({ name: 'Complete Crazy archaeologist CL', clRequirement: crazyArchaeologistCL })
	.add({ name: 'Complete Cyclopes CL', clRequirement: cyclopsCL })
	.add({ name: 'Complete Dagannoth Kings CL', clRequirement: dagannothKingsCL })
	.add({ name: 'Complete Emerged Zuk Inferno CL', clRequirement: emergedZukInfernoCL })
	.add({ name: 'Complete General Graardor CL', clRequirement: generalGraardorCL })
	.add({ name: 'Complete Giant Mole CL', clRequirement: giantMoleCL })
	.add({ name: "Complete Glough's Experiments CL", clRequirement: demonicGorillaCL })
	.add({ name: 'Complete God Wars Dungeon CL', clRequirement: godWarsDungeonCL })
	.add({ name: 'Complete Grotesque Guardians CL', clRequirement: grotesqueGuardiansCL })
	.add({ name: 'Complete Hespori CL', clRequirement: hesporiCL })
	.add({ name: 'Complete Ignecarus CL', clRequirement: ignecarusCL })
	.add({ name: "Complete K'ril Tsutsaroth CL", clRequirement: krilTsutsarothCL })
	.add({ name: 'Complete Kalphite King CL', clRequirement: kalphiteKingCL })
	.add({ name: 'Complete Kalphite Queen CL', clRequirement: kalphiteQueenCL })
	.add({ name: 'Complete King Black Dragon CL', clRequirement: kingBlackDragonCL })
	.add({ name: 'Complete King Goldemar CL', clRequirement: kingGoldemarCL })
	.add({ name: 'Complete Kraken CL', clRequirement: krakenCL })
	.add({ name: "Complete Kree'arra CL", clRequirement: kreeArraCL })
	.add({ name: 'Complete Malygos CL', clRequirement: abyssalDragonCL })
	.add({ name: 'Complete Moktang CL', clRequirement: moktangCL })
	.add({ name: 'Complete Muspah CL', clRequirement: muspahCL })
	.add({ name: 'Complete Naxxus CL', clRequirement: naxxusCL })
	.add({ name: 'Complete Nex CL', clRequirement: nexCL })
	.add({ name: 'Complete Nihiliz CL', clRequirement: nihilizCL })
	.add({ name: 'Complete Obor CL', clRequirement: oborCL })
	.add({ name: 'Complete Polypore Dungeon CL', clRequirement: polyporeDungeonCL })
	.add({ name: 'Complete Queen Black Dragon CL', clRequirement: queenBlackDragonCL })
	.add({ name: 'Complete Revenants CL', clRequirement: revenantsCL })
	.add({ name: 'Complete Sarachnis CL', clRequirement: sarachnisCL })
	.add({ name: 'Complete Scorpia CL', clRequirement: scorpiaCL })
	.add({ name: 'Complete Sea Kraken CL', clRequirement: seaKrakenCL })
	.add({ name: 'Complete Skotizo CL', clRequirement: skotizoCL })
	.add({ name: 'Complete Slayer CL', clRequirement: slayerCL })
	.add({ name: 'Complete Tempoross CL', clRequirement: temporossCL })
	.add({ name: 'Complete The Gauntlet CL', clRequirement: theGauntletCL })
	.add({ name: 'Complete The Inferno CL', clRequirement: theInfernoCL })
	.add({ name: 'Complete The Nightmare CL', clRequirement: theNightmareCL })
	.add({ name: 'Complete Thermonuclear smoke devil CL', clRequirement: thermonuclearSmokeDevilCL })
	.add({ name: 'Complete Tormented Demon CL', clRequirement: tormentedDemonCL })
	.add({ name: 'Complete Treebeard CL', clRequirement: treeBeardCL })
	.add({ name: 'Complete Vasa Magus CL', clRequirement: vasaMagusCL })
	.add({ name: 'Complete Venenatis CL', clRequirement: venenatisCL })
	.add({ name: "Complete Vet'ion CL", clRequirement: vetionCL })
	.add({ name: 'Complete Vorkath CL', clRequirement: vorkathCL })
	.add({ name: 'Complete Wintertodt CL', clRequirement: wintertodtCL })
	.add({ name: 'Complete Zulrah CL', clRequirement: zulrahCL })
	.add({ name: 'Obtain all slayer mask and helms', clRequirement: slayerMasksHelmsCL });

const skillingCLRequirements = new Requirements()
	.add({ name: 'Complete Aerial Fishing CL', clRequirement: aerialFishingCL })
	.add({ name: 'Complete All Pets CL', clRequirement: allPetsCL })
	.add({ name: 'Complete Camdozaal CL', clRequirement: camdozaalCL })
	.add({ name: "Complete Champion's Challenge CL", clRequirement: championsChallengeCL })
	.add({ name: 'Complete Chompy Birds CL', clRequirement: chompyBirdsCL })
	.add({ name: 'Complete Cooking CL', clRequirement: cookingCL })
	.add({ name: 'Complete Crafting CL', clRequirement: craftingCL })
	.add({ name: 'Complete Creature Creation CL', clRequirement: creatureCreationCL })
	.add({ name: 'Complete Dungeoneering CL', clRequirement: dungeoneeringCL })
	.add({ name: 'Complete Farming CL', clRequirement: allFarmingItems })
	.add({ name: 'Complete Fletching CL', clRequirement: fletchingCL })
	.add({ name: 'Complete Fossil Island Notes CL', clRequirement: fossilIslandNotesCL })
	.add({ name: 'Complete Graceful CL', clRequirement: gracefulCL })
	.add({ name: 'Complete Herblore CL', clRequirement: herbloreCL })
	.add({ name: 'Complete Invention CL', clRequirement: inventionCL })
	.add({ name: 'Complete Kibble CL', clRequirement: kibbleCL })
	.add({ name: 'Complete Monkey Backpacks CL', clRequirement: monkeyBackpacksCL })
	.add({ name: 'Complete Motherlode Mine CL', clRequirement: motherlodeMineCL })
	.add({ name: 'Complete Rooftop Agility CL', clRequirement: rooftopAgilityCL })
	.add({ name: 'Complete Shooting Stars CL', clRequirement: shootingStarsCL })
	.add({ name: 'Complete Skilling Misc CL', clRequirement: skillingMiscCL })
	.add({ name: 'Complete Skilling Pets CL', clRequirement: skillingPetsCL })
	.add({ name: 'Complete Smithing CL', clRequirement: smithingCL });

const otherCLRequirements = new Requirements()
	.add({ name: 'Complete Achievement Diary CL', clRequirement: diariesCL })
	.add({ name: 'Complete Daily CL', clRequirement: dailyCL })
	.add({ name: 'Complete Growable Pets CL', clRequirement: growablePetsCL })
	.add({ name: 'Complete Implings CL', clRequirement: implingsCL })
	.add({ name: 'Complete Leagues CL', clRequirement: leaguesCL })
	.add({ name: 'Complete Miscellaneous CL', clRequirement: miscellaneousCL })
	.add({ name: 'Complete Quest CL', clRequirement: questCL })
	.add({ name: 'Complete Random Events CL', clRequirement: randomEventsCL })
	.add({ name: 'Complete Shayzien Armour CL', clRequirement: shayzienArmourCL })
	.add({ name: 'Complete Capes CL', clRequirement: capesCL })
	.add({ name: 'Complete Clothing Mystery Box CL', clRequirement: cmbClothes })
	.add({ name: 'Complete Creatables CL', clRequirement: creatablesCL })
	.add({ name: 'Complete Custom Pets CL', clRequirement: customPetsCL })
	.add({ name: 'Complete Holiday Mystery box CL', clRequirement: holidayCL });

const cluesRequirements = new Requirements()
	.add({ name: 'Complete Beginner Treasure Trails CL', clRequirement: cluesBeginnerCL })
	.add({ name: 'Complete Easy Treasure Trails CL', clRequirement: cluesEasyCL })
	.add({ name: 'Complete Elite Treasure Trail Rewards (Rare) CL', clRequirement: cluesEliteRareCL })
	.add({ name: 'Complete Elite Treasure Trails CL', clRequirement: cluesEliteCL })
	.add({ name: 'Complete Hard Treasure Trail Rewards (Rare) CL', clRequirement: cluesHardRareCL })
	.add({ name: 'Complete Hard Treasure Trails CL', clRequirement: cluesHardCL })
	.add({ name: 'Complete Master Treasure Trail Rewards (Rare) CL', clRequirement: cluesMasterRareCL })
	.add({ name: 'Complete Master Treasure Trails CL', clRequirement: cluesMasterCL })
	.add({ name: 'Complete Medium Treasure Trails CL', clRequirement: cluesMediumCL })
	.add({ name: 'Complete Rare Treasure Trail Rewards CL', clRequirement: cluesRaresCL })
	.add({ name: 'Complete Shared Treasure Trail Rewards CL', clRequirement: cluesSharedCL })
	.add({
		name: 'Build and Fill all STASH Units',
		has: ({ stashUnits }) => {
			const hasBuiltAll = stashUnits.every(i => i.isFull && Boolean(i.builtUnit));
			if (!hasBuiltAll) {
				return [
					{
						reason: `You have ${
							stashUnits.filter(i => i.isFull && !i.builtUnit).length
						} stash units left to build and fill.`
					}
				];
			}
			return [];
		}
	})
	.add({
		name: 'Collect/Complete/Open a Grandmaster clue',
		has: async ({ user }) => {
			const actualClues = await calcActualClues(user);
			if (!actualClues.has('Clue scroll (grandmaster)')) {
				return [
					{
						reason: 'You need to Collect/Complete/Open a Grandmaster clue'
					}
				];
			}
			return [];
		}
	});

const trimmedRequirements = new Requirements().add({
	name: 'Complete Grandmaster clue log (excluding 1a and 3a dye)',
	clRequirement: allPetsCL
});

/**
 *
 *
 * - Removed olof
 * - Put clues/clues cl into 1 category
 * - Changed Built all STASH Units task to Build AND FILL
 *
 *
 * TODO:
 * - Remove muphin from skilling cl?
 *
 *
 * Tasks that seem weird/odd:
 * - Complete Grandmaster clue log (excluding 1a and 3a dye)
 * - Collect/Complete/Open a Grandmaster clue
 */
