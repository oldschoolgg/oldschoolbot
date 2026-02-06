import { Time } from '@oldschoolgg/toolkit';
import { LootTable } from 'oldschooljs';

import type { SailingFacilityId } from '@/lib/skilling/skills/sailing/facilities.js';
import type { ShipPart } from '@/lib/skilling/skills/sailing/upgrades.js';

export type SailingActivityId =
	| 'sea_charting'
	| 'port_tasks'
	| 'shipwreck_salvaging'
	| 'tempor_tantrum'
	| 'jubbly_jive'
	| 'gwenith_glide'
	| 'survey'
	| 'deep_sea_trawling'
	| 'mineral_dredging'
	| 'sea_monster_hunting'
	| 'coral_farming';

export interface SailingActivity {
	id: SailingActivityId;
	name: string;
	level: number;
	xp: number;
	baseTime: number;
	// Failure chance per action before ship bonuses (0-1)
	baseRisk: number;
	lootTable: LootTable;
	petChance: number;
	reputation: number;
	allowedDifficulties?: Array<'easy' | 'standard' | 'hard' | 'elite'>;
	hazards?: Array<{ name: string; chance: number; effect: 'fail' | 'delay' | 'damage' }>;
	variants?: Array<{
		id: 'courier' | 'protection' | 'investigation' | 'swordfish' | 'shark' | 'marlin';
		name: string;
		xpMultiplier: number;
		lootMultiplier: number;
		timeMultiplier?: number;
		lootTable: LootTable;
	}>;
	requiredShipTiers?: Partial<Record<ShipPart, number>>;
	requiredItems?: string[];
	requiredFacility?: SailingFacilityId;
	requiredReputation?: number;
	qpRequired?: number;
}

const SeaChartingTable = new LootTable().add('Sea salt', [1, 3], 5).add('Sealed letter', 1, 2).oneIn(80, 'Ship ticket');

const PortTasksTable = new LootTable()
	.add('Coins', [250, 650], 12)
	.add('Oak plank', [1, 2], 3)
	.add('Rope', 1, 2)
	.add('Coconut', 1, 1)
	.add('Sea salt', [1, 3], 2)
	.add('Shipping order', 1, 1)
	.oneIn(120, 'Shipping contract');

const ShipwreckSalvageTable = new LootTable()
	.add('Coins', [500, 1200], 10)
	.add('Steel bar', 1, 3)
	.add('Uncut sapphire', 1, 2)
	.add('Uncut emerald', 1, 1)
	.add('Iron nails', [10, 30], 2)
	.add('Ironwood logs', [1, 2], 1)
	.add('Sealed message', 1, 1)
	.oneIn(120, 'Sea fishing map')
	.oneIn(180, 'Sea shell');

const BarracudaTrialsTable = new LootTable().add('Sea salt', [1, 2], 1);

const SurveyTable = new LootTable()
	.add('Sea salt', [2, 6], 3)
	.add('Coal', [4, 10], 4)
	.add('Mithril ore', [1, 3], 2)
	.oneIn(140, 'Clue bottle (medium)');

const DeepSeaTrawlingTable = new LootTable()
	.add('Raw shark', [1, 3], 4)
	.add('Raw manta ray', [1, 2], 2)
	.add('Seaweed', [5, 10], 3)
	.add('Harpoonfish', 1, 1)
	.oneIn(140, 'Clue bottle (easy)')
	.oneIn(220, "Trawler's trust");

const MineralDredgingTable = new LootTable()
	.add('Coal', [5, 12], 5)
	.add('Mithril ore', [1, 3], 3)
	.add('Adamantite ore', [1, 2], 2)
	.add('Nickel ore', [1, 2], 2)
	.add('Sea salt', [2, 6], 2)
	.oneIn(140, 'Clue bottle (medium)');

const SeaMonsterHuntingTable = new LootTable()
	.add('Death rune', [10, 20], 3)
	.add('Law rune', [15, 30], 3)
	.add('Raw manta ray', [1, 2], 2)
	.oneIn(120, 'Clue bottle (hard)');

const CoralFarmingTable = new LootTable()
	.add('Seaweed', [8, 16], 4)
	.add('Seaweed spore', [1, 2], 2)
	.add('Kelp', [3, 6], 3)
	.oneIn(180, 'Clue bottle (elite)');

export const SailingActivities: SailingActivity[] = [
	{
		id: 'sea_charting',
		name: 'Sea charting',
		level: 1,
		xp: 120,
		baseTime: Time.Minute * 1.5,
		baseRisk: 0.02,
		lootTable: SeaChartingTable,
		petChance: 450_000,
		reputation: 2,
		allowedDifficulties: ['easy', 'standard'],
		hazards: [{ name: 'Sudden squall', chance: 0.04, effect: 'fail' }],
		requiredFacility: 'captains_log'
	},
	{
		id: 'port_tasks',
		name: 'Port tasks',
		level: 1,
		xp: 200,
		baseTime: Time.Minute * 2,
		baseRisk: 0.04,
		lootTable: PortTasksTable,
		petChance: 400_000,
		reputation: 3,
		allowedDifficulties: ['easy', 'standard', 'hard'],
		variants: [
			{
				id: 'courier',
				name: 'Courier',
				xpMultiplier: 1,
				lootMultiplier: 1.05,
				lootTable: new LootTable().add('Coins', [200, 500], 5).add('Shipping order', 1, 2)
			},
			{
				id: 'protection',
				name: 'Protection',
				xpMultiplier: 1.15,
				lootMultiplier: 1,
				lootTable: new LootTable().add('Coins', [300, 700], 5).add('Sealed message', 1, 1)
			},
			{
				id: 'investigation',
				name: 'Investigation',
				xpMultiplier: 1.1,
				lootMultiplier: 1.1,
				lootTable: new LootTable().add('Sea salt', [2, 5], 3).add('Sealed letter', 1, 2)
			}
		]
	},
	{
		id: 'shipwreck_salvaging',
		name: 'Shipwreck salvaging',
		level: 10,
		xp: 280,
		baseTime: Time.Minute * 3.5,
		baseRisk: 0.14,
		lootTable: ShipwreckSalvageTable,
		petChance: 300_000,
		reputation: 4,
		allowedDifficulties: ['standard', 'hard', 'elite'],
		hazards: [
			{ name: 'Collapsed hull', chance: 0.08, effect: 'fail' },
			{ name: 'Hidden reef', chance: 0.03, effect: 'fail' }
		],
		requiredFacility: 'salvaging_hook',
		requiredShipTiers: { hull: 2 }
	},
	{
		id: 'tempor_tantrum',
		name: 'The Tempor Tantrum',
		level: 30,
		xp: 634,
		baseTime: Time.Second * 118,
		baseRisk: 0.06,
		lootTable: BarracudaTrialsTable,
		petChance: 260_000,
		reputation: 5,
		allowedDifficulties: ['standard'],
		hazards: [{ name: 'Whirlpool surge', chance: 0.05, effect: 'fail' }],
		requiredFacility: 'racing_sails',
		requiredShipTiers: { hull: 2, sails: 2 },
		variants: [
			{
				id: 'swordfish',
				name: 'Swordfish',
				xpMultiplier: 1,
				lootMultiplier: 1,
				timeMultiplier: 1,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'shark',
				name: 'Shark',
				xpMultiplier: 1.739,
				lootMultiplier: 1.05,
				timeMultiplier: 1.534,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'marlin',
				name: 'Marlin',
				xpMultiplier: 3.008,
				lootMultiplier: 1.1,
				timeMultiplier: 2.373,
				lootTable: BarracudaTrialsTable
			}
		]
	},
	{
		id: 'jubbly_jive',
		name: 'The Jubbly Jive',
		level: 55,
		xp: 2392,
		baseTime: Time.Second * 133,
		baseRisk: 0.08,
		lootTable: BarracudaTrialsTable,
		petChance: 240_000,
		reputation: 6,
		allowedDifficulties: ['standard'],
		hazards: [{ name: 'Crosswind drift', chance: 0.06, effect: 'fail' }],
		requiredFacility: 'inoculation_station',
		requiredShipTiers: { hull: 3, sails: 3 },
		variants: [
			{
				id: 'swordfish',
				name: 'Swordfish',
				xpMultiplier: 1,
				lootMultiplier: 1,
				timeMultiplier: 1,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'shark',
				name: 'Shark',
				xpMultiplier: 1.785,
				lootMultiplier: 1.05,
				timeMultiplier: 1.429,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'marlin',
				name: 'Marlin',
				xpMultiplier: 3.418,
				lootMultiplier: 1.1,
				timeMultiplier: 2.489,
				lootTable: BarracudaTrialsTable
			}
		]
	},
	{
		id: 'gwenith_glide',
		name: 'The Gwenith Glide',
		level: 72,
		xp: 4100,
		baseTime: Time.Second * 130,
		baseRisk: 0.1,
		lootTable: BarracudaTrialsTable,
		petChance: 220_000,
		reputation: 7,
		allowedDifficulties: ['standard'],
		hazards: [{ name: 'Riptide sweep', chance: 0.08, effect: 'fail' }],
		requiredFacility: 'racing_sails',
		requiredShipTiers: { hull: 4, sails: 4 },
		variants: [
			{
				id: 'swordfish',
				name: 'Swordfish',
				xpMultiplier: 1,
				lootMultiplier: 1,
				timeMultiplier: 1,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'shark',
				name: 'Shark',
				xpMultiplier: 2.272,
				lootMultiplier: 1.05,
				timeMultiplier: 1.785,
				lootTable: BarracudaTrialsTable
			},
			{
				id: 'marlin',
				name: 'Marlin',
				xpMultiplier: 4.429,
				lootMultiplier: 1.1,
				timeMultiplier: 2.915,
				lootTable: BarracudaTrialsTable
			}
		]
	},
	{
		id: 'survey',
		name: 'Survey',
		level: 30,
		xp: 360,
		baseTime: Time.Minute * 3,
		baseRisk: 0.12,
		lootTable: SurveyTable,
		petChance: 220_000,
		reputation: 6,
		allowedDifficulties: ['standard', 'hard'],
		hazards: [{ name: 'False reading', chance: 0.05, effect: 'fail' }],
		requiredFacility: 'enchanted_metal_detector',
		requiredReputation: 20
	},
	{
		id: 'deep_sea_trawling',
		name: 'Deep sea trawling',
		level: 35,
		xp: 360,
		baseTime: Time.Minute * 4,
		baseRisk: 0.14,
		lootTable: DeepSeaTrawlingTable,
		petChance: 200_000,
		reputation: 6,
		allowedDifficulties: ['standard', 'hard'],
		hazards: [{ name: 'Net tear', chance: 0.07, effect: 'fail' }],
		requiredFacility: 'fishing_station',
		requiredReputation: 18
	},
	{
		id: 'mineral_dredging',
		name: 'Mineral dredging',
		level: 40,
		xp: 420,
		baseTime: Time.Minute * 4.5,
		baseRisk: 0.18,
		lootTable: MineralDredgingTable,
		petChance: 190_000,
		reputation: 7,
		allowedDifficulties: ['standard', 'hard', 'elite'],
		hazards: [{ name: 'Snagged dredge', chance: 0.08, effect: 'fail' }],
		requiredFacility: 'weighted_dredging_net',
		requiredReputation: 25
	},
	{
		id: 'sea_monster_hunting',
		name: 'Sea monster hunting',
		level: 50,
		xp: 650,
		baseTime: Time.Minute * 5,
		baseRisk: 0.25,
		lootTable: SeaMonsterHuntingTable,
		petChance: 170_000,
		reputation: 10,
		allowedDifficulties: ['hard', 'elite'],
		hazards: [{ name: 'Sea monster strike', chance: 0.1, effect: 'fail' }],
		requiredFacility: 'harpoon_mount',
		requiredShipTiers: { hull: 4, crew: 3 },
		requiredReputation: 50
	},
	{
		id: 'coral_farming',
		name: 'Coral farming',
		level: 55,
		xp: 520,
		baseTime: Time.Minute * 4,
		baseRisk: 0.1,
		lootTable: CoralFarmingTable,
		petChance: 160_000,
		reputation: 9,
		allowedDifficulties: ['standard', 'hard'],
		hazards: [{ name: 'Coral blight', chance: 0.04, effect: 'fail' }],
		requiredFacility: 'coral_pens',
		requiredShipTiers: { cargo: 3 },
		requiredReputation: 40
	}
];

export const SailingActivityById = new Map(SailingActivities.map(activity => [activity.id, activity]));
