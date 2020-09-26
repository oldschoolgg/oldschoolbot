import { Monsters } from 'oldschooljs';
import Loot from 'oldschooljs/dist/structures/Loot';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import Monster from 'oldschooljs/dist/structures/Monster';

import { Time } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import itemID from '../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';
import bosses from './bosses';

const KingTable = new LootTable()
	.tertiary(2300, 'Dwarven warhammer')
	.tertiary(10, 'Clue scroll (master)')
	.oneIn(
		30,
		new LootTable()
			.add('Dwarven crate')
			.add('Dwarven ore')
			.add('Coal', [2, 14])
			.add('Iron ore', [2, 14])
			.add('Royal crown')
			.add('Mystic jewel')
			.add('Dwarven lore')
			.add('Golden goblin')
			.add('Gold candlesticks')
	)
	.every('Bones')
	.add('Beer', [1, 4])
	.add('Kebab', [1, 4])
	.add('Hammer', 1)
	.add('Oily cloth')
	.add('Axe head')
	.add('Pickaxe handle')
	.add('Hair')
	.add('Gold bar')
	.add('Gold ring')
	.add('Dwarven helmet')
	.add('Jewellery')
	.add('Dwarven stout(m)')
	.add('Gold ore', [2, 20])
	.add('Coins', [50_000, 1_000_000])
	.add('Skull piece')
	.add('Dwarven rock cake')
	.add('Dwarven stout');

const FishTable = new LootTable()
	.add('Raw sea turtle', [1, 10])
	.add('Raw dark crab', [1, 10])
	.add('Raw anglerfish', [1, 20])
	.add('Raw shark', [1, 30])
	.add('Raw monkfish', [1, 40])
	.add('Raw karambwan', [1, 40])
	.add('Raw swordfish', [1, 50])
	.add('Raw bass', [1, 60])
	.add('Raw lobster', [1, 70])
	.add('Raw trout', [1, 80])
	.add('Raw tuna', [1, 90]);

const SeedPackTable = new LootTable()
	.add('Potato seed', [1, 4])
	.add('Onion seed', [1, 3])
	.add('Cabbage seed', [1, 3])
	.add('Tomato seed', [1, 2])
	.add('Sweetcorn seed', [1, 2])
	.add('Strawberry seed', 1)
	.add('Watermelon seed', 1)
	.add('Snape grass seed', 1)

	// Hops
	.add('Barley seed', [1, 12])
	.add('Hammerstone seed', [1, 10])
	.add('Asgarnian seed', [1, 10])
	.add('Jute seed', [1, 10])
	.add('Yanillian seed', [1, 10])
	.add('Krandorian seed', [1, 10])
	.add('Wildblood seed', [1, 3])

	// Flowers
	.add('Marigold seed', 1)
	.add('Nasturtium seed', 1)
	.add('Rosemary seed', 1)
	.add('Woad seed', 1)
	.add('Limpwurt seed', 1)

	// Bushes
	.add('Redberry seed', 1)
	.add('Cadavaberry seed', 1)
	.add('Dwellberry seed', 1)
	.add('Jangerberry seed', 1)
	.add('Whiteberry seed', 1)
	.add('Poison ivy seed', 1)

	// Herbs
	.add('Guam seed', 1)
	.add('Marrentill seed', 1)
	.add('Tarromin seed', 1)
	.add('Harralander seed', 1)
	.add('Ranarr seed', 1)
	.add('Toadflax seed', 1)
	.add('Irit seed', 1)
	.add('Avantoe seed', 1)
	.add('Kwuarm seed', 1)
	.add('Snapdragon seed', 1)
	.add('Cadantine seed', 1)
	.add('Lantadyme seed', 1)
	.add('Dwarf weed seed', 1)
	.add('Torstol seed', 1)

	// Special
	.add('Mushroom spore', 1)
	.add('Belladonna seed', 1)
	.add('Cactus seed', 1)
	.add('Potato cactus seed', 1);

const KrakenTable = new LootTable()
	.every(FishTable, [1, 3])
	.tertiary(3, SeedPackTable, [1, 4])
	.add('Coins', [50_000, 100_000])
	.add('Clue scroll (master)')
	.add('Clue scroll (elite)')
	.add('Clue scroll (hard)')
	.add('Pirate boots')
	.add('Harpoon')
	.add('Kraken tentacle')
	.add('Crystal key')
	.add('Seaweed')
	.add('Water rune', [20, 500]);

function makeKillTable(table: LootTable) {
	return (quantity: number) => {
		const loot = new Loot();

		for (let i = 0; i < quantity; i++) {
			loot.add(table.roll());
		}

		return loot.values();
	};
}

function setCustomMonster(
	id: number,
	name: string,
	table: LootTable,
	baseItem: Monster,
	newItemData?: Partial<Monster>
) {
	Monsters.set(id, {
		...baseItem,
		...newItemData,
		name,
		id,
		kill: makeKillTable(table)
	});
}

setCustomMonster(696969, 'King Goldemar', KingTable, Monsters.GeneralGraardor, {
	id: 696969,
	name: 'King Goldemar',
	aliases: ['king goldemar', 'dwarf king']
});

setCustomMonster(53466534, 'Sea Kraken', KrakenTable, Monsters.CommanderZilyana, {
	id: 53466534,
	name: 'Sea Kraken',
	aliases: ['sea kraken']
});

const KingGoldemar = Monsters.find(mon => mon.name === 'King Goldemar')!;
const SeaKraken = Monsters.find(mon => mon.name === 'Sea Kraken')!;

const killableMonsters: KillableMonster[] = [
	...bosses,
	{
		id: Monsters.Barrows.id,
		name: Monsters.Barrows.name,
		aliases: Monsters.Barrows.aliases,
		timeToFinish: Time.Minute * 4.15,
		table: Monsters.Barrows,
		emoji: '<:Dharoks_helm:403038864199122947>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 2,
			[itemID("Iban's staff")]: 5
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothPrime.id,
		name: Monsters.DagannothPrime.name,
		aliases: Monsters.DagannothPrime.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothPrime,
		emoji: '<:Pet_dagannoth_prime:324127376877289474>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth prime']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Armadyl chestplate')]: 2,
			[itemID('Armadyl chainskirt')]: 2
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothRex.id,
		name: Monsters.DagannothRex.name,
		aliases: Monsters.DagannothRex.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothRex,
		emoji: '<:Pet_dagannoth_rex:324127377091330049>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Bandos chestplate', "Torag's platebody"],
			['Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth rex']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 5,
			[itemID("Iban's staff")]: 5
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothSupreme.id,
		name: Monsters.DagannothSupreme.name,
		aliases: Monsters.DagannothSupreme.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothSupreme,
		emoji: '<:Pet_dagannoth_supreme:324127377066164245>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Bandos chestplate', "Torag's platebody"],
			['Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth supreme']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Bandos chestplate')]: 2,
			[itemID('Bandos tassets')]: 2,
			[itemID('Saradomin godsword')]: 2
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: Monsters.Man.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: Monsters.Guard.aliases,
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Woman.id,
		name: Monsters.Woman.name,
		aliases: Monsters.Woman.aliases,
		timeToFinish: Time.Second * 4.69,
		table: Monsters.Woman,
		emoji: '🧍‍♀️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Goblin,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Goblin champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.LizardmanShaman.id,
		name: Monsters.LizardmanShaman.name,
		aliases: Monsters.LizardmanShaman.aliases,
		timeToFinish: Time.Minute * 1.1,
		table: Monsters.LizardmanShaman,
		emoji: '<:Dragon_warhammer:405998717154623488>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			["Karil's crossbow", 'Rune crossbow', 'Armadyl crossbow']
		]),
		notifyDrops: resolveItems(['Dragon warhammer']),
		qpRequired: 30,
		itemInBankBoosts: {
			[itemID('Ring of the gods')]: 3
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Lizardman.id,
		name: Monsters.Lizardman.name,
		aliases: Monsters.Lizardman.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lizardman,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 30
	},
	{
		id: Monsters.GreaterDemon.id,
		name: Monsters.GreaterDemon.name,
		aliases: Monsters.GreaterDemon.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GreaterDemon,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '🐮',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Skeleton,
		emoji: '☠️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Skeleton champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Zombie,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Zombie champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 1.5,
		table: Monsters.Rat,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.FireGiant.id,
		name: Monsters.FireGiant.name,
		aliases: Monsters.FireGiant.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.FireGiant,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Giant champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.BlueDragon.id,
		name: Monsters.BlueDragon.name,
		aliases: Monsters.BlueDragon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.BlueDragon,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Zamorakian spear')]: 10
		}
	},
	{
		id: Monsters.Ankou.id,
		name: Monsters.Ankou.name,
		aliases: Monsters.Ankou.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.Ankou,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Dwarf.id,
		name: Monsters.Dwarf.name,
		aliases: Monsters.Dwarf.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Dwarf,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: KingGoldemar.id,
		name: KingGoldemar.name,
		aliases: KingGoldemar.aliases,
		timeToFinish: Time.Minute * 22,
		table: {
			kill: makeKillTable(KingTable)
		},
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 26,
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		minimumGearRequirements: {
			[GearStat.DefenceCrush]: 150,
			[GearStat.AttackCrush]: 80
		},
		groupKillable: true,
		respawnTime: Time.Second * 20,
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Dwarven warhammer', 'Dwarven crate', 'Dwarven ore'])
	},
	{
		id: SeaKraken.id,
		name: SeaKraken.name,
		aliases: SeaKraken.aliases,
		timeToFinish: Time.Minute * 17,
		table: {
			kill: makeKillTable(KrakenTable)
		},
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0,
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic],
		minimumGearRequirements: {
			[GearStat.DefenceMagic]: 150,
			[GearStat.AttackRanged]: 80
		},
		groupKillable: true,
		respawnTime: Time.Second * 20,
		levelRequirements: {
			prayer: 43
		}
	}
];

export default killableMonsters;
