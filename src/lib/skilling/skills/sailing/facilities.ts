import { Bank } from 'oldschooljs';

export type SailingFacilityId =
	| 'captains_log'
	| 'salvaging_hook'
	| 'fishing_station'
	| 'harpoon_mount'
	| 'enchanted_metal_detector'
	| 'weighted_dredging_net'
	| 'coral_pens'
	| 'racing_sails'
	| 'inoculation_station';

export interface SailingFacility {
	id: SailingFacilityId;
	name: string;
	level: number;
	cost: Bank;
	description: string;
}

export const SailingFacilities: SailingFacility[] = [
	{
		id: 'captains_log',
		name: "Captain's log",
		level: 1,
		cost: new Bank({ Plank: 8, Rope: 2, 'Sea salt': 5 }),
		description: 'Enables sea charting.'
	},
	{
		id: 'salvaging_hook',
		name: 'Salvaging hook',
		level: 10,
		cost: new Bank({ 'Oak plank': 20, 'Iron nails': 50, Rope: 4 }),
		description: 'Enables shipwreck salvaging.'
	},
	{
		id: 'fishing_station',
		name: 'Fishing station',
		level: 20,
		cost: new Bank({ 'Fishing net': 2, Rope: 6, Sails: 1 }),
		description: 'Enables deep sea trawling.'
	},
	{
		id: 'enchanted_metal_detector',
		name: 'Enchanted metal detector',
		level: 30,
		cost: new Bank({ 'Steel bar': 5, Rope: 4, 'Sea salt': 10 }),
		description: 'Enables survey activities.'
	},
	{
		id: 'weighted_dredging_net',
		name: 'Weighted dredging net',
		level: 35,
		cost: new Bank({ 'Fishing net': 2, Rope: 6, 'Steel nails': 40 }),
		description: 'Enables mineral dredging.'
	},
	{
		id: 'harpoon_mount',
		name: 'Harpoon mount',
		level: 40,
		cost: new Bank({ Harpoon: 1, Rope: 4, 'Steel nails': 60 }),
		description: 'Enables sea monster hunting.'
	},
	{
		id: 'coral_pens',
		name: 'Coral pens',
		level: 45,
		cost: new Bank({ 'Oak plank': 30, Rope: 8, Kelp: 10, Seaweed: 10 }),
		description: 'Enables coral farming.'
	},
	{
		id: 'racing_sails',
		name: 'Racing sails',
		level: 25,
		cost: new Bank({ Sails: 1, Rope: 6, 'Bolt of cloth': 20 }),
		description: 'Enables Barracuda Trials.'
	},
	{
		id: 'inoculation_station',
		name: 'Inoculation station',
		level: 50,
		cost: new Bank({ 'Mithril bar': 6, Rope: 6, 'Oak plank': 12 }),
		description: 'Required for higher-tier Barracuda Trials.'
	}
];

export const SailingFacilitiesById = new Map(SailingFacilities.map(f => [f.id, f]));
