import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeArmour: DisassemblySourceGroup = {
	name: 'Melee Armour',
	items: [
		{
			item: i('Black chainbody'),
			lvl: 25
		},
		{
			item: i('Black platebody'),
			lvl: 25
		},
		{ item: i('Black platebody (g)'), lvl: 25 },
		{
			item: i('Black platebody (h1)'),
			lvl: 25
		},
		{
			item: i('Black platebody (h2)'),
			lvl: 25
		},
		{
			item: i('Black platebody (h3)'),
			lvl: 25
		},
		{
			item: i('Black platebody (h4)'),
			lvl: 25
		},
		{
			item: i('Black platebody (h5)'),
			lvl: 25
		},
		{ item: i('Black platebody (t)'), lvl: 25 },
		{ item: i('Initiate cuisse'), lvl: 25 },
		{ item: i('Initiate hauberk'), lvl: 25 },
		{ item: i('Proselyte hauberk'), lvl: 30 },
		{
			item: i('Bandos robe top'),
			lvl: 40
		},
		{ item: i('Fighter torso'), lvl: 50 },
		{ item: i('Rock-shell plate'), lvl: 50 },
		{ item: i('Rune platebody (g)'), lvl: 50 },
		{
			item: [
				'Rune platebody (h1)',
				'Rune platebody (h2)',
				'Rune platebody (h3)',
				'Rune platebody (h4)',
				'Rune platebody (h5)',
				'Rune platebody (g)',
				'Rune platebody (t)'
			].map(i),
			lvl: 50
		},
		{ item: i('Granite body'), lvl: 55 },
		{ item: i('Dragon chainbody'), lvl: 60 },
		{ item: i('Dragon platebody'), lvl: 60 },
		{
			item: i('Bandos chestplate'),
			lvl: 70
		},
		{ item: i("Statius's platebody"), lvl: 78 },
		{ item: i("Vesta's chainbody"), lvl: 78 },
		{ item: i('Bronze chainbody'), lvl: 10 },
		{ item: i('Bronze platebody'), lvl: 10 },
		{ item: i('Bronze platelegs'), lvl: 10 },
		{ item: i('Bronze plateskirt'), lvl: 10 },
		{ item: i('Iron chainbody'), lvl: 10 },
		{ item: i('Iron platebody'), lvl: 10 },
		{ item: i('Iron platelegs'), lvl: 10 },
		{ item: i('Steel chainbody'), lvl: 20 },
		{ item: i('Steel platebody'), lvl: 20 },
		{ item: i('Mithril chainbody'), lvl: 30 },
		{ item: i('Mithril platebody'), lvl: 30 },
		{ item: i('Rune chainbody'), lvl: 50 },
		{ item: i('Rune platebody'), lvl: 50 },
		{ item: i('Rune platelegs'), lvl: 50 },
		{
			item: i('Bandos cloak'),
			lvl: 40
		},
		{ item: i('Penance gloves'), lvl: 40 },
		{ item: i('Rock-shell gloves'), lvl: 50 },
		{ item: i('Steel gauntlets'), lvl: 20 },
		{ item: i('Black mask'), lvl: 20 },
		{
			item: i('Black full helm'),
			lvl: 25
		},
		{ item: i('Black full helm (g)'), lvl: 25 },
		{
			item: i('Black full helm (t)'),
			lvl: 25
		},
		{
			item: i('Black helm (h1)'),
			lvl: 25
		},
		{
			item: i('Black helm (h2)'),
			lvl: 25
		},
		{
			item: i('Black helm (h3)'),
			lvl: 25
		},
		{
			item: i('Black helm (h4)'),
			lvl: 25
		},
		{
			item: i('Black helm (h5)'),
			lvl: 25
		},
		{ item: i('Initiate sallet'), lvl: 25 },
		{
			item: i('White full helm'),
			lvl: 25
		},
		{ item: i('Fremennik helm'), lvl: 30 },
		{ item: i('Proselyte sallet'), lvl: 30 },
		{
			item: i('Bandos mitre'),
			lvl: 40
		},
		{ item: i('Berserker helm'), lvl: 45 },
		{ item: i('Warrior helm'), lvl: 45 },
		{ item: i('Dwarven helmet'), lvl: 50 },
		{ item: i('Fire cape'), lvl: 50 },
		{ item: i('Rock-shell helm'), lvl: 50 },
		{ item: i('Rune full helm (g)'), lvl: 50 },
		{ item: i('Rune full helm (t)'), lvl: 50 },
		{
			item: i('Rune helm (h1)'),
			lvl: 50
		},
		{
			item: i('Rune helm (h2)'),
			lvl: 50
		},
		{
			item: i('Rune helm (h3)'),
			lvl: 50
		},
		{
			item: i('Rune helm (h4)'),
			lvl: 50
		},
		{
			item: i('Rune helm (h5)'),
			lvl: 50
		},
		{ item: i('Granite helm'), lvl: 55 },
		{ item: i('Helm of neitiznot'), lvl: 55 },
		{ item: i('Dragon full helm'), lvl: 60 },
		{ item: i("Statius's full helm"), lvl: 78 },
		{ item: i('Bronze full helm'), lvl: 1 },
		{ item: i('Bronze med helm'), lvl: 1 },
		{ item: i('Iron full helm'), lvl: 10 },
		{ item: i('Iron med helm'), lvl: 10 },
		{ item: i('Steel full helm'), lvl: 20 },
		{ item: i('Steel med helm'), lvl: 20 },
		{ item: i('Mithril full helm'), lvl: 30 },
		{ item: i('Mithril med helm'), lvl: 30 },
		{ item: i('Rune full helm'), lvl: 50 },
		{ item: i('Rune med helm'), lvl: 50 },
		{
			item: i('Black platelegs'),
			lvl: 25
		},
		{ item: i('Black platelegs (g)'), lvl: 25 },
		{ item: i('Black platelegs (t)'), lvl: 25 },
		{ item: i('Black plateskirt'), lvl: 25 },
		{ item: i('Black plateskirt (g)'), lvl: 25 },
		{ item: i('Black plateskirt (t)'), lvl: 25 },
		{
			item: i('White platelegs'),
			lvl: 25
		},
		{
			item: i('White plateskirt'),
			lvl: 25
		},
		{ item: i('Proselyte cuisse'), lvl: 30 },
		{ item: i('Proselyte tasset'), lvl: 30 },
		{
			item: i('Bandos robe legs'),
			lvl: 40
		},
		{ item: i('Rock-shell legs'), lvl: 50 },
		{ item: i('Rune platelegs (g)'), lvl: 50 },
		{ item: i('Rune platelegs (t)'), lvl: 50 },
		{ item: i('Rune plateskirt (g)'), lvl: 50 },
		{ item: i('Rune plateskirt (t)'), lvl: 50 },
		{ item: i('Granite legs'), lvl: 55 },
		{ item: i('Dragon platelegs'), lvl: 60 },
		{ item: i('Dragon plateskirt'), lvl: 60 },
		{
			item: i('Bandos tassets'),
			lvl: 70
		},
		{ item: i("Statius's platelegs"), lvl: 78 },
		{ item: i("Vesta's plateskirt"), lvl: 78 },
		{ item: i('Iron plateskirt'), lvl: 10 },
		{ item: i('Steel platelegs'), lvl: 20 },
		{ item: i('Steel plateskirt'), lvl: 20 },
		{ item: i('Mithril platelegs'), lvl: 30 },
		{ item: i('Mithril plateskirt'), lvl: 30 },
		{ item: i('Adamant platelegs'), lvl: 40 },
		{ item: i('Adamant platebody'), lvl: 40 },
		{ item: i('Adamant plateskirt'), lvl: 40 },
		{ item: i('Rune plateskirt'), lvl: 50 },
		{ item: i('Rune platelegs'), lvl: 50 },
		// Boots
		{
			item: i('Bronze boots'),
			lvl: 1
		},
		{
			item: i('Black boots'),
			lvl: 25
		},
		{
			item: i('Mithril boots'),
			lvl: 30
		},
		{
			item: i('White boots'),
			lvl: 25
		},
		{ item: i('Rock-shell boots'), lvl: 50 },
		{ item: i('Dragon boots'), lvl: 60 },
		{
			item: i('Bandos boots'),
			lvl: 70
		}
	],
	parts: { plated: 30, strong: 3, protective: 2 }
};
