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
	AbyssalSireCl,
	AerialFishingCl,
	AlchemicalHydraCl,
	AllPetsCl,
	BarbarianAssaultCl,
	BarrowsChestCl,
	BrimhavenAgilityArenaCl,
	BryophytaCl,
	CallistoCl,
	CamdozaalCl,
	CapesCl,
	CastleWarsCl,
	CerberusCl,
	ChambersOfXericCl,
	ChampionsChallengeCl,
	ChaosDruisCl,
	ChaosElementalCl,
	ChaosFanaticCl,
	ChompyBirdsCl,
	CluesBeginnerCl,
	CluesEasyCl,
	CluesEliteCl,
	CluesEliteRareCl,
	CluesHardCl,
	CluesHardRareCl,
	CluesMasterCl,
	CluesMasterRareCl,
	CluesMediumCl,
	CluesSharedCl,
	CommanderZilyanaCl,
	CorporealBeastCl,
	CrazyArchaeologistCl,
	CreatureCreationCl,
	CyclopsCl,
	DagannothKingsCl,
	DagannothPrimeCl,
	DagannothRexCl,
	DagannothSupremeCl,
	DailyCl,
	DemonicGorillaCl,
	FightCavesCl,
	FishingTrawlerCl,
	FossilIslandNotesCl,
	GeneralGraardorCl,
	GiantMoleCl,
	GnomeRestaurantCl,
	GrotesqueGuardiansCl,
	HallowedSepulchreCl,
	HesporiCl,
	HolidayCl,
	ICollection,
	ILeftListStatus,
	IToReturnCollection,
	KalphiteQueenCl,
	KingBlackDragonCl,
	KrakenCl,
	KreeArraCl,
	KrilTsutsarothCl,
	LastManStandingCl,
	MagicTrainingArenaCl,
	MahoganyHomesCl,
	MiscellaneousCl,
	MonkeyBackpacksCl,
	MotherlodeMineCl,
	OborCl,
	PestControlCl,
	QuestCl,
	RandomEventsCl,
	RevenantsCl,
	RoguesDenCl,
	RooftopAgilityCl,
	SarachnisCl,
	ScorpiaCl,
	ShadesOfMorttonCl,
	ShayzienArmourCl,
	SkillingPetsCl,
	SkotizoCl,
	SlayerCl,
	SoulWarsCl,
	SpiritAnglerOutfit,
	TempleTrekkingCl,
	TemporossCl,
	TheatreOfBLoodCl,
	TheGauntletCl,
	TheInfernoCl,
	TheNightmareCl,
	ThermonuclearSmokeDevilCl,
	TitheFarmCl,
	TRoleCategories,
	TroubleBrewingCl,
	TzHaarCl,
	VenenatisCl,
	VetionCl,
	VolcanicMineCl,
	VorkathCl,
	WintertodtCl,
	ZalcanoCl,
	ZulrahCl
} from './CollectionsExport';

export const allCollectionLogs: ICollection = {
	Bosses: {
		'Abyssal Sire': {
			alias: Monsters.AbyssalSire.aliases,
			allItems: Monsters.AbyssalSire.allItems,
			items: AbyssalSireCl,
			roleCategory: ['bosses']
		},
		'Alchemical Hydra': {
			alias: Monsters.AlchemicalHydra.aliases,
			allItems: Monsters.AlchemicalHydra.allItems,
			items: AlchemicalHydraCl,
			roleCategory: ['bosses']
		},
		'Barrows Chests': {
			alias: Monsters.Barrows.aliases,
			kcActivity: Monsters.Barrows.name,
			items: BarrowsChestCl,
			roleCategory: []
		},
		Bryophyta: {
			alias: Monsters.Bryophyta.aliases,
			allItems: Monsters.Bryophyta.allItems,
			items: BryophytaCl,
			roleCategory: ['bosses']
		},
		Callisto: {
			alias: Monsters.Callisto.aliases,
			allItems: Monsters.Callisto.allItems,
			items: CallistoCl,
			roleCategory: ['bosses']
		},
		Cerberus: {
			alias: Monsters.Cerberus.aliases,
			allItems: Monsters.Cerberus.allItems,
			items: CerberusCl,
			roleCategory: ['bosses']
		},
		'Chaos Elemental': {
			alias: Monsters.ChaosElemental.aliases,
			allItems: Monsters.ChaosElemental.allItems,
			items: ChaosElementalCl,
			roleCategory: ['bosses']
		},
		'Chaos Fanatic': {
			alias: Monsters.ChaosFanatic.aliases,
			allItems: Monsters.ChaosFanatic.allItems,
			items: ChaosFanaticCl,
			roleCategory: ['bosses']
		},
		'Commander Zilyana': {
			alias: Monsters.CommanderZilyana.aliases,
			allItems: Monsters.CommanderZilyana.allItems,
			items: CommanderZilyanaCl,
			roleCategory: ['bosses']
		},
		'Corporeal Beast': {
			alias: Monsters.CorporealBeast.aliases,
			allItems: Monsters.CorporealBeast.allItems,
			items: CorporealBeastCl,
			roleCategory: ['bosses']
		},
		'Crazy archaeologist': {
			alias: Monsters.CrazyArchaeologist.aliases,
			allItems: Monsters.CrazyArchaeologist.allItems,
			items: CrazyArchaeologistCl,
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
			items: DagannothKingsCl,
			roleCategory: ['bosses']
		},
		'Dagannoth Rex': {
			hidden: true,
			alias: Monsters.DagannothRex.aliases,
			allItems: Monsters.DagannothRex.allItems,
			items: DagannothRexCl
		},
		'Dagannoth Prime': {
			hidden: true,
			alias: Monsters.DagannothPrime.aliases,
			allItems: Monsters.DagannothPrime.allItems,
			items: DagannothPrimeCl
		},
		'Dagannoth Supreme': {
			hidden: true,
			alias: Monsters.DagannothSupreme.aliases,
			allItems: Monsters.DagannothSupreme.allItems,
			items: DagannothSupremeCl
		},
		'The Fight Caves': {
			kcActivity: Monsters.TzTokJad.name,
			alias: ['firecape', 'jad', 'fightcave'],
			items: FightCavesCl,
			roleCategory: ['bosses']
		},
		'The Gauntlet': {
			alias: ['gauntlet', 'crystalline hunllef', 'hunllef'],
			kcActivity: ['Gauntlet', 'CorruptedGauntlet'],
			items: TheGauntletCl,
			roleCategory: ['bosses']
		},
		'General Graardor': {
			alias: Monsters.GeneralGraardor.aliases,
			allItems: Monsters.GeneralGraardor.allItems,
			items: GeneralGraardorCl,
			roleCategory: ['bosses']
		},
		'Giant Mole': {
			alias: Monsters.GiantMole.aliases,
			allItems: Monsters.GiantMole.allItems,
			items: GiantMoleCl,
			roleCategory: ['bosses']
		},
		'Grotesque Guardians': {
			alias: Monsters.GrotesqueGuardians.aliases,
			allItems: Monsters.GrotesqueGuardians.allItems,
			items: GrotesqueGuardiansCl,
			roleCategory: ['bosses']
		},
		Hespori: {
			alias: Monsters.Hespori.aliases,
			allItems: Monsters.Hespori.allItems,
			items: HesporiCl,
			roleCategory: ['bosses']
		},
		'The Inferno': {
			enabled: false,
			alias: ['zuk', 'inferno'],
			items: TheInfernoCl
		},
		'Kalphite Queen': {
			alias: Monsters.KalphiteQueen.aliases,
			allItems: Monsters.KalphiteQueen.allItems,
			items: KalphiteQueenCl,
			roleCategory: ['bosses']
		},
		'King Black Dragon': {
			alias: Monsters.KingBlackDragon.aliases,
			allItems: Monsters.KingBlackDragon.allItems,
			items: KingBlackDragonCl,
			roleCategory: ['bosses']
		},
		Kraken: {
			alias: Monsters.Kraken.aliases,
			allItems: Monsters.Kraken.allItems,
			items: KrakenCl,
			roleCategory: ['bosses']
		},
		"Kree'arra": {
			alias: Monsters.Kreearra.aliases,
			allItems: Monsters.Kreearra.allItems,
			items: KreeArraCl,
			roleCategory: ['bosses']
		},
		"K'ril Tsutsaroth": {
			alias: Monsters.KrilTsutsaroth.aliases,
			allItems: Monsters.KrilTsutsaroth.allItems,
			items: KrilTsutsarothCl,
			roleCategory: ['bosses']
		},
		'The Nightmare': {
			alias: NightmareMonster.aliases,
			items: TheNightmareCl,
			roleCategory: ['bosses']
		},
		Obor: {
			alias: Monsters.Obor.aliases,
			allItems: Monsters.Obor.allItems,
			items: OborCl,
			roleCategory: ['bosses']
		},
		Sarachnis: {
			alias: Monsters.Sarachnis.aliases,
			allItems: Monsters.Sarachnis.allItems,
			items: SarachnisCl,
			roleCategory: ['bosses']
		},
		Scorpia: {
			alias: Monsters.Scorpia.aliases,
			allItems: Monsters.Scorpia.allItems,
			items: ScorpiaCl,
			roleCategory: ['bosses']
		},
		Skotizo: {
			alias: Monsters.Skotizo.aliases,
			allItems: Monsters.Skotizo.allItems,
			items: SkotizoCl,
			roleCategory: ['bosses']
		},
		Tempoross: {
			items: TemporossCl,
			allItems: resolveItems([...SpiritAnglerOutfit, 'Spirit flakes']),
			roleCategory: ['bosses']
		},
		'Thermonuclear smoke devil': {
			alias: Monsters.ThermonuclearSmokeDevil.aliases,
			allItems: Monsters.ThermonuclearSmokeDevil.allItems,
			items: ThermonuclearSmokeDevilCl,
			roleCategory: ['bosses']
		},
		Venenatis: {
			alias: Monsters.Venenatis.aliases,
			allItems: Monsters.Venenatis.allItems,
			items: VenenatisCl,
			roleCategory: ['bosses']
		},
		"Vet'ion": {
			alias: Monsters.Vetion.aliases,
			allItems: Monsters.Vetion.allItems,
			items: VetionCl,
			roleCategory: ['bosses']
		},
		Vorkath: {
			alias: Monsters.Vorkath.aliases,
			allItems: Monsters.Vorkath.allItems,
			items: VorkathCl,
			roleCategory: ['bosses']
		},
		Wintertodt: {
			alias: ['todt', 'wintertodt', 'wt'],
			items: WintertodtCl,
			roleCategory: ['bosses', 'skilling']
		},
		Zalcano: { items: ZalcanoCl, roleCategory: ['bosses', 'skilling'] },
		Zulrah: {
			alias: Monsters.Zulrah.aliases,
			allItems: Monsters.Zulrah.allItems,
			items: ZulrahCl,
			roleCategory: ['bosses']
		}
	},
	Raids: {
		"Chamber's of Xeric": {
			alias: ChambersOfXeric.aliases,
			kcActivity: ['Raids', 'RaidsChallengeMode'],
			items: ChambersOfXericCl,
			roleCategory: ['raids'],
			isActivity: true
		},
		'Theatre of Blood': {
			enabled: false,
			alias: ['tob'],
			items: TheatreOfBLoodCl,
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
			items: CluesBeginnerCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Easy Treasure Trails': {
			alias: ['easy', 'clues easy', 'clue easy'],
			allItems: Clues.Easy.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_546);
			},
			items: CluesEasyCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Medium Treasure Trails': {
			alias: ['medium', 'clues medium', 'clue medium'],
			allItems: Clues.Medium.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_545);
			},
			items: CluesMediumCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Hard Treasure Trails': {
			alias: ['hard', 'clues hard', 'clue hard'],
			allItems: Clues.Hard.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_544);
			},
			items: CluesHardCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Elite Treasure Trails': {
			alias: ['elite', 'clues elite', 'clue elite'],
			allItems: Clues.Elite.allItems,
			kcActivity: user => {
				return user.getOpenableScore(20_543);
			},
			items: CluesEliteCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Master Treasure Trails': {
			alias: ['master', 'clues master', 'clue master'],
			allItems: Clues.Master.allItems,
			kcActivity: user => {
				return user.getOpenableScore(19_836);
			},
			items: CluesMasterCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Hard Treasure Trail Rewards (Rare)': {
			alias: ['hard rares', 'clues hard rares', 'clue hard rares'],
			kcActivity: user => {
				return user.getOpenableScore(20_544);
			},
			items: CluesHardRareCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Elite Treasure Trail Rewards (Rare)': {
			alias: ['elite rares', 'clues elite rares', 'clue elite rares'],
			kcActivity: user => {
				return user.getOpenableScore(20_543);
			},
			items: CluesEliteRareCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Master Treasure Trail Rewards (Rare)': {
			alias: ['master rares', 'clues master rares', 'clue master rares'],
			kcActivity: user => {
				return user.getOpenableScore(19_836);
			},
			items: CluesMasterRareCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Shared Treasure Trail Rewards': {
			alias: ['shared', 'clues shared', 'clue shared'],
			items: CluesSharedCl,
			roleCategory: ['clues'],
			isActivity: true
		},
		'Rare Treasure Trail Rewards': {
			alias: ['clues rare', 'rares'],
			items: [...CluesHardRareCl, ...CluesEliteRareCl, ...CluesMasterRareCl],
			roleCategory: ['clues'],
			isActivity: true
		}
	},
	Minigames: {
		'Barbarian Assault': {
			alias: ['ba', 'barb assault', 'barbarian assault'],
			items: BarbarianAssaultCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Brimhaven Agility Arena': {
			alias: ['aa', 'agility arena'],
			items: BrimhavenAgilityArenaCl,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Castle Wars': {
			alias: ['cw', 'castle wars'],
			items: CastleWarsCl,
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
			items: FishingTrawlerCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Gnome Restaurant': {
			alias: ['gnome', 'restaurant'],
			allItems: resolveItems(['Snake charm', 'Gnomeball']),
			items: GnomeRestaurantCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Hallowed Sepulchre': {
			alias: ['sepulchre', 'hallowed sepulchre'],
			allItems: sepulchreFloors.map(f => f.coffinTable.allItems).flat(100),
			items: HallowedSepulchreCl,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Last Man Standing': {
			enabled: false,
			items: LastManStandingCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Magic Training Arena': {
			alias: ['mta'],
			items: MagicTrainingArenaCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Mahogany Homes': {
			items: MahoganyHomesCl,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Pest Control': {
			enabled: false,
			items: PestControlCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		"Rogues' Den": {
			alias: ['rogues den', 'rd'],
			items: RoguesDenCl,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		"Shades of Mort'ton": {
			enabled: false,
			items: ShadesOfMorttonCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Soul Wars': {
			alias: ['soul wars', 'sw'],
			items: SoulWarsCl,
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
			items: TempleTrekkingCl,
			roleCategory: ['minigames', 'skilling'],
			isActivity: true
		},
		'Tithe Farm': {
			alias: ['tithe'],
			kcActivity: user => {
				return user.settings.get(UserSettings.Stats.TitheFarmsCompleted);
			},
			items: TitheFarmCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Trouble Brewing': {
			enabled: false,
			items: TroubleBrewingCl,
			roleCategory: ['minigames'],
			isActivity: true
		},
		'Volcanic Mine': {
			enabled: false,
			items: VolcanicMineCl,
			roleCategory: ['minigames'],
			isActivity: true
		}
	},
	Others: {
		'Aerial Fishing': {
			alias: ['af', 'aerial fishing'],
			items: AerialFishingCl,
			roleCategory: ['skilling']
		},
		'All Pets': {
			alias: ['pet', 'pets'],
			items: AllPetsCl,
			roleCategory: ['pets']
		},
		Camdozaal: {
			enabled: false,
			items: CamdozaalCl
		},
		"Champion's Challenge": {
			alias: ['champion', 'champion scrolls', 'champion scroll', 'scroll', 'scrolls'],
			items: ChampionsChallengeCl,
			isActivity: true
		},
		'Chaos Druids': {
			allItems: Monsters.ChaosDruid.allItems,
			kcActivity: Monsters.ChaosDruid.name,
			items: ChaosDruisCl
		},
		'Chompy Birds': {
			alias: ['chompy', 'bgc', 'big chompy hunting'],
			kcActivity: 'BigChompyBirdHunting',
			items: ChompyBirdsCl
		},
		'Creature Creation': {
			enabled: false,
			items: CreatureCreationCl
		},
		Cyclopes: {
			alias: ['cyclops', 'wg', 'warriors guild', 'warrior guild'],
			kcActivity: Monsters.Cyclops.name,
			allItems: Monsters.Cyclops.allItems,
			items: CyclopsCl
		},
		'Fossil Island Notes': {
			enabled: false,
			items: FossilIslandNotesCl
		},
		"Glough's Experiments": {
			alias: Monsters.DemonicGorilla.aliases,
			allItems: Monsters.DemonicGorilla.allItems,
			kcActivity: Monsters.DemonicGorilla.name,
			items: DemonicGorillaCl
		},
		'Monkey Backpacks': {
			alias: ['monkey', 'monkey bps', 'backpacks'],
			kcActivity: user => {
				return user.settings.get(UserSettings.LapsScores)[6];
			},
			items: MonkeyBackpacksCl,
			roleCategory: ['skilling'],
			isActivity: true
		},
		'Motherlode Mine': {
			enabled: false,
			items: MotherlodeMineCl
		},
		'Random Events': {
			alias: ['random'],
			items: RandomEventsCl
		},
		Revenants: {
			enabled: false,
			items: RevenantsCl
		},
		'Rooftop Agility': {
			alias: ['rooftop', 'laps', 'agility', 'agil'],
			items: RooftopAgilityCl,
			roleCategory: ['skilling'],
			isActivity: true
		},
		'Shayzien Armour': {
			enabled: false,
			items: ShayzienArmourCl
		},
		'Shooting Stars': { enabled: false, items: resolveItems(['Celestial ring (uncharged)', 'Star fragment']) },
		'Skilling Pets': {
			alias: ['skill pets'],
			items: SkillingPetsCl
		},
		Slayer: {
			alias: ['slay'],
			items: SlayerCl,
			roleCategory: ['slayer']
		},
		TzHaar: {
			kcActivity: [Monsters.TzHaarKet.name],
			allItems: Monsters.TzHaarKet.allItems,
			items: TzHaarCl
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
			items: MiscellaneousCl
		}
	},
	Custom: {
		Holiday: {
			items: HolidayCl
		},
		Daily: {
			alias: ['diango'],
			items: DailyCl
		},
		Capes: {
			items: CapesCl
		},
		Quest: {
			items: QuestCl
		}
	}
};

// Get all the log items into a single
export const allClItems = [
	...new Set(
		Object.entries(allCollectionLogs)
			.map(e =>
				Object.entries(e[1])
					.filter(f => f[1].enabled === undefined && f[1].hidden === undefined)
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
	overall: allClItems
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

export function clIntoBank(items: number[]) {
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
				const clItemBank = clIntoBank(items);
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
	const owned = clItems.filter(i => allClItems.includes(i));
	return [owned.length, allClItems.length];
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
	const clItemBank = clIntoBank(clItems);
	const totalCl = clItemBank.items().length;
	const userAmount = clItemBank.items().length - clItemBank.remove(usarBank).items().length;
	return [totalCl, userAmount];
}

// Main function that gets the user collection based on its search parameter
export async function getCollection(options: {
	user: KlasaUser;
	search: string;
	allItems?: boolean;
	logType?: 'collection' | 'sacrifice' | 'bank';
}): Promise<false | IToReturnCollection> {
	let { user, search, allItems, logType } = options;

	await user.settings.sync(true);

	if (allItems === undefined) allItems = false;
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

	const clItems = getCollectionItems(search, allItems ?? false);
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
				(stringMatchNoS(activityName, search) ||
					stringMatchNoS(activityName, search.substr(0, search.length - 1)) ||
					(attributes.alias && attributes.alias.find(a => stringMatchNoS(a, search))) ||
					(attributes.alias &&
						attributes.alias.find(a => stringMatchNoS(a, search.substr(0, search.length - 1)))))
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
		_type => stringMatchNoS(_type.name, search) || _type.aliases.some(name => stringMatchNoS(name, search))
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
