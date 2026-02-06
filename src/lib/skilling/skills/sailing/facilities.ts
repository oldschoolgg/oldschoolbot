import { Bank } from 'oldschooljs';

export type SailingFacilityId =
	| 'captains_log'
	| 'salvaging_hook'
	| 'fishing_station'
	| 'racing_sails'
	| 'inoculation_station'
	| 'crystal_extractor';

export interface SailingFacility {
	id: SailingFacilityId;
	name: string;
	level: number;
	constructionLevel?: number;
	requiredItems?: Bank;
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
		constructionLevel: 55,
		cost: new Bank({ 'Mithril bar': 6, Rope: 6, 'Oak plank': 12 }),
		description: 'Required for higher-tier Barracuda Trials.'
	},
	{
		id: 'crystal_extractor',
		name: 'Crystal extractor',
		level: 73,
		constructionLevel: 67,
		cost: new Bank({
			'Ironwood plank': 6,
			'Cupronickel bar': 5,
			'Magic stone': 2
		}),
		requiredItems: new Bank({ 'Heart of Ithell': 1 }),
		description: 'Grants periodic Sailing XP during trips.'
	}
];

export const SailingFacilitiesById = new Map(SailingFacilities.map(f => [f.id, f]));
