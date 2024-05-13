import { brokenTorvaOutfit, torvaOutfit } from '../../data/CollectionsExport';
import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeArmour: DisassemblySourceGroup = {
	name: 'Melee Armour',
	items: [
		{
			item: [
				'Bronze chainbody',
				'Bronze platebody',
				'Bronze platelegs',
				'Bronze plateskirt',
				'Bronze platelegs (g)',
				'Bronze platelegs (t)',
				'Bronze plateskirt (g)',
				'Bronze plateskirt (t)',
				'Bronze full helm (t)'
			].map(i),
			lvl: 1
		},
		{
			item: [
				'Iron platebody (g)',
				'Iron platebody (t)',
				'Iron platelegs (g)',
				'Iron platelegs (t)',
				'Iron plateskirt (g)',
				'Iron plateskirt (t)',
				'Iron full helm (g)',
				'Iron full helm (t)'
			].map(i),
			lvl: 10
		},
		{
			item: [
				'Black platebody (g)',
				'Black platebody',
				'Black chainbody',
				'Black platebody (h1)',
				'Black platebody (h2)',
				'Black platebody (h3)',
				'Black platebody (h4)',
				'Black platebody (h5)',
				'Black skirt',
				'Black skirt (g)',
				'Black skirt (t)',
				'Black platebody (t)',
				'Black med helm'
			].map(i),
			lvl: 25
		},
		{ item: i('Initiate cuisse'), lvl: 25 },
		{ item: i('Initiate hauberk'), lvl: 25 },
		{ item: i('Proselyte hauberk'), lvl: 30 },
		{ item: i('Fighter torso'), lvl: 50 },
		{ item: i('Rock-shell plate'), lvl: 50 },
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
		{ item: i('Dragon chainbody'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Dragon platebody'), lvl: 60, flags: new Set(['orikalkum']) },
		{
			item: i('Bandos chestplate'),
			lvl: 70
		},
		{ item: i("Statius's platebody"), lvl: 78 },
		{ item: i("Vesta's chainbody"), lvl: 78 },
		{ item: i('Iron chainbody'), lvl: 10 },
		{ item: i('Iron platebody'), lvl: 10 },
		{ item: i('Iron platelegs'), lvl: 10 },
		{
			item: [
				'Steel full helm (g)',
				'Steel chainbody',
				'Steel platebody',
				'Steel platebody (t)',
				'Steel platelegs (t)'
			].map(i),
			lvl: 20
		},
		{
			item: [
				'Mithril platebody',
				'Mithril chainbody',
				'Mithril platebody (g)',
				'Mithril platebody (t)',
				'Mithril plateskirt (g)',
				'Mithril full helm (g)',
				'Mithril full helm (t)'
			].map(i),
			lvl: 30
		},
		{ item: i('Rune chainbody'), lvl: 50 },
		{ item: i('Rune platebody'), lvl: 50 },
		{ item: i('Rune platelegs'), lvl: 50 },
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
		{ item: i('Dragon full helm'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i("Statius's full helm"), lvl: 78 },
		{
			item: ['Bronze full helm', 'Bronze full helm (g)', 'Bronze platebody (t)', 'Bronze platebody (g)'].map(
				getOSItem
			),
			lvl: 1
		},
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
		{ item: i('Rock-shell legs'), lvl: 50 },
		{ item: i('Rune platelegs (g)'), lvl: 50 },
		{ item: i('Rune platelegs (t)'), lvl: 50 },
		{ item: i('Rune plateskirt (g)'), lvl: 50 },
		{ item: i('Rune plateskirt (t)'), lvl: 50 },
		{ item: i('Granite legs'), lvl: 55 },
		{ item: i('Dragon platelegs'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Dragon plateskirt'), lvl: 60, flags: new Set(['orikalkum']) },
		{
			item: i('Bandos tassets'),
			lvl: 70
		},
		{ item: i("Statius's platelegs"), lvl: 78 },
		{ item: i("Vesta's plateskirt"), lvl: 78 },
		{ item: i('Iron plateskirt'), lvl: 10 },
		{
			item: [
				'Steel platelegs',
				'Steel platelegs (g)',
				'Steel plateskirt (t)',
				'Steel kiteshield (g)',
				'Steel platebody (g)',
				'Steel full helm (t)',
				'Steel plateskirt (g)',
				'Steel plateskirt'
			].map(i),
			lvl: 20
		},
		{
			item: ['Mithril platelegs', 'Mithril platelegs (t)', 'Mithril plateskirt (t)', 'Mithril platelegs (g)'].map(
				i
			),
			lvl: 30
		},
		{ item: i('Mithril plateskirt'), lvl: 30 },
		{
			item: [
				'Adamant platelegs',
				'Adamant platebody (g)',
				'Adamant platebody (h1)',
				'Adamant platebody (h2)',
				'Adamant platebody (h3)',
				'Adamant platebody (h4)',
				'Adamant platebody (h5)',
				'Adamant platebody (t)',
				'Adamant plateskirt (g)',
				'Adamant plateskirt (t)',
				'Adamant platelegs (t)',
				'Adamant platelegs (g)',
				'Adamant platebody',
				'Adamant plateskirt',
				'Adamant helm (h1)',
				'Adamant helm (h2)',
				'Adamant helm (h3)',
				'Adamant helm (h4)',
				'Adamant helm (h5)',
				'Adamant med helm',
				'Adamant full helm',
				'Adamant full helm (g)',
				'Adamant full helm (t)',
				'Adamant chainbody'
			].map(i),
			lvl: 40
		},
		{
			item: [
				'Rune plateskirt',
				'Bandos kiteshield',
				'Zamorak kiteshield',
				'Zamorak platebody',
				'Zamorak platelegs',
				'Zamorak plateskirt',
				'Zamorak full helm',
				'Bandos platebody',
				'Bandos platelegs',
				'Bandos plateskirt',
				'Bandos full helm',
				'Zamorak platebody',
				'Zamorak platelegs',
				'Zamorak plateskirt',
				'Zamorak full helm',
				'Zamorak kiteshield',
				'Saradomin kiteshield',
				'Saradomin platebody',
				'Saradomin platelegs',
				'Saradomin plateskirt',
				'Saradomin full helm',
				'Armadyl kiteshield',
				'Armadyl platebody',
				'Armadyl platelegs',
				'Armadyl plateskirt',
				'Armadyl full helm',
				'Guthix full helm',
				'Guthix kiteshield',
				'Guthix platebody',
				'Guthix platelegs',
				'Guthix plateskirt',
				'Ancient full helm',
				'Ancient platebody',
				'Ancient platelegs',
				'Ancient plateskirt'
			].map(i),
			lvl: 50
		},
		// Boots
		{
			item: i('Bronze boots'),
			lvl: 1
		},
		{
			item: i('Steel boots'),
			lvl: 10
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
			item: i('Adamant boots'),
			lvl: 40
		},
		{
			item: i('Rune boots'),
			lvl: 50
		},
		{
			item: i('Dragon med helm'),
			lvl: 60,
			flags: new Set(['orikalkum'])
		},
		{
			item: i('White boots'),
			lvl: 25
		},
		{ item: i('Rock-shell boots'), lvl: 50 },
		{ item: i('Dragon boots'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Royal dragon platebody'), lvl: 80, flags: new Set(['orikalkum']) },
		{ item: ['Primordial boots', 'Eternal boots', 'Pegasian boots'].map(i), lvl: 85 },
		{
			item: i('Bandos boots'),
			lvl: 70
		},
		{
			item: ['Dragonstone full helm', 'Dragonstone platebody', 'Dragonstone platelegs'].map(i),
			lvl: 75
		},
		{
			item: [...torvaOutfit, ...brokenTorvaOutfit].map(i),
			lvl: 99
		},
		{
			item: ['Abyssal cape', 'Avernic defender hilt'].map(i),
			lvl: 99
		},
		{
			item: ['Justiciar faceguard', 'Justiciar chestguard', 'Justiciar legguards'].map(i),
			lvl: 99,
			flags: new Set(['justiciar'])
		}
	],
	parts: { plated: 30, strong: 3, protective: 2 }
};
