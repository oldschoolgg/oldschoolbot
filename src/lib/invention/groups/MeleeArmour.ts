import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeArmour: DisassemblySourceGroup = {
	name: 'MeleeArmour',
	items: [
		{
			item: i('Black chainbody'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black platebody'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Black platebody (g)'), lvl: 25, partQuantity: 8 },
		{
			item: i('Black platebody (h1)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black platebody (h2)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black platebody (h3)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black platebody (h4)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black platebody (h5)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Black platebody (t)'), lvl: 25, partQuantity: 8 },
		{ item: i('Initiate cuisse'), lvl: 25, partQuantity: 8 },
		{ item: i('Initiate hauberk'), lvl: 25, partQuantity: 8 },
		{
			item: i('White chainbody'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White platebody'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Proselyte hauberk'), lvl: 30, partQuantity: 8 },
		{
			item: i('Bandos robe top'),
			lvl: 40,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Fighter torso'), lvl: 50, partQuantity: 8 },
		{ item: i('Rock-shell plate'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune platebody (g)'), lvl: 50, partQuantity: 8 },
		{
			item: i('Rune platebody (h1)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune platebody (h2)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune platebody (h3)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune platebody (h4)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune platebody (h5)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Rune platebody (t)'), lvl: 50, partQuantity: 8 },
		{ item: i('Granite body'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon chainbody'), lvl: 60, partQuantity: 8 },
		{ item: i('Dragon platebody'), lvl: 60, partQuantity: 8 },
		{
			item: i('Bandos chestplate'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'bandos', chance: 100, amount: 8 }] }
		},
		{
			item: i("Dharok's platebody"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Guthan's platebody"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Torag's platebody"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Verac's brassard"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{ item: i("Statius's platebody"), lvl: 78, partQuantity: 8 },
		{ item: i("Vesta's chainbody"), lvl: 78, partQuantity: 8 },
		{ item: i('Bronze chainbody'), lvl: 1, partQuantity: 20 },
		{ item: i('Bronze platebody'), lvl: 1, partQuantity: 20 },
		{ item: i('Bronze platelegs'), lvl: 1, partQuantity: 20 },
		{ item: i('Bronze plateskirt'), lvl: 1, partQuantity: 20 },
		{ item: i('Iron chainbody'), lvl: 10, partQuantity: 20 },
		{ item: i('Iron platebody'), lvl: 10, partQuantity: 20 },
		{ item: i('Iron platelegs'), lvl: 10, partQuantity: 20 },
		{ item: i('Steel chainbody'), lvl: 20, partQuantity: 20 },
		{ item: i('Steel platebody'), lvl: 20, partQuantity: 20 },
		{ item: i('Mithril chainbody'), lvl: 30, partQuantity: 20 },
		{ item: i('Mithril platebody'), lvl: 30, partQuantity: 20 },
		{ item: i('Rune chainbody'), lvl: 50, partQuantity: 20 },
		{ item: i('Rune platebody'), lvl: 50, partQuantity: 20 },
		{ item: i('Rune platelegs'), lvl: 50, partQuantity: 20 },
		{ item: i('Fancy boots'), lvl: 1, partQuantity: 4 },
		{ item: i('Fighting boots'), lvl: 1, partQuantity: 4 },
		{ item: i('Rock-climbing boots'), lvl: 1, partQuantity: 4 },
		{
			item: i('Black boots'),
			lvl: 25,
			partQuantity: 4,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 4 }] }
		},
		{
			item: i('White boots'),
			lvl: 25,
			partQuantity: 4,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 4 }] }
		},
		{ item: i('Rock-shell boots'), lvl: 50, partQuantity: 4 },
		{ item: i('Dragon boots'), lvl: 60, partQuantity: 4 },
		{
			item: i('Bandos boots'),
			lvl: 70,
			partQuantity: 4,
			special: { always: true, parts: [{ type: 'bandos', chance: 100, amount: 4 }] }
		},
		{
			item: i('Bandos cloak'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Penance gloves'), lvl: 40, partQuantity: 4 },
		{ item: i('Rock-shell gloves'), lvl: 50, partQuantity: 4 },
		{ item: i('Steel gauntlets'), lvl: 20, partQuantity: 4 },
		{ item: i('Ram skull helm'), lvl: 1, partQuantity: 6 },
		{ item: i('Spiny helmet'), lvl: 5, partQuantity: 6 },
		{ item: i('Tyras helm'), lvl: 5, partQuantity: 6 },
		{ item: i('Black mask'), lvl: 20, partQuantity: 6 },
		{
			item: i('Black full helm'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 6 }] }
		},
		{ item: i('Black full helm (g)'), lvl: 25, partQuantity: 6 },
		{
			item: i('Black full helm (t)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 6 }] }
		},
		{
			item: i('Black helm (h1)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Black helm (h2)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Black helm (h3)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Black helm (h4)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Black helm (h5)'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Initiate sallet'), lvl: 25, partQuantity: 6 },
		{
			item: i('White full helm'),
			lvl: 25,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 6 }] }
		},
		{ item: i('Fremennik helm'), lvl: 30, partQuantity: 6 },
		{ item: i('Proselyte sallet'), lvl: 30, partQuantity: 6 },
		{
			item: i('Bandos mitre'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Berserker helm'), lvl: 45, partQuantity: 6 },
		{ item: i('Warrior helm'), lvl: 45, partQuantity: 6 },
		{ item: i('Dwarven helmet'), lvl: 50, partQuantity: 6 },
		{ item: i('Fighter hat'), lvl: 50, partQuantity: 6 },
		{ item: i('Fire cape'), lvl: 50, partQuantity: 6 },
		{ item: i('Rock-shell helm'), lvl: 50, partQuantity: 6 },
		{ item: i('Rune full helm (g)'), lvl: 50, partQuantity: 6 },
		{ item: i('Rune full helm (t)'), lvl: 50, partQuantity: 6 },
		{
			item: i('Rune helm (h1)'),
			lvl: 50,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Rune helm (h2)'),
			lvl: 50,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Rune helm (h3)'),
			lvl: 50,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Rune helm (h4)'),
			lvl: 50,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Rune helm (h5)'),
			lvl: 50,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Granite helm'), lvl: 55, partQuantity: 6 },
		{ item: i('Helm of neitiznot'), lvl: 55, partQuantity: 6 },
		{ item: i('Dragon full helm'), lvl: 60, partQuantity: 6 },
		{
			item: i("Dharok's helm"),
			lvl: 70,
			partQuantity: 6,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{
			item: i("Guthan's helm"),
			lvl: 70,
			partQuantity: 6,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{
			item: i("Torag's helm"),
			lvl: 70,
			partQuantity: 6,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{
			item: i("Verac's helm"),
			lvl: 70,
			partQuantity: 6,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{ item: i("Statius's full helm"), lvl: 78, partQuantity: 6 },
		{ item: i('Bronze full helm'), lvl: 1, partQuantity: 8 },
		{ item: i('Bronze med helm'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron full helm'), lvl: 10, partQuantity: 8 },
		{ item: i('Iron med helm'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel full helm'), lvl: 20, partQuantity: 8 },
		{ item: i('Steel med helm'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril full helm'), lvl: 30, partQuantity: 8 },
		{ item: i('Mithril med helm'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune full helm'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune med helm'), lvl: 50, partQuantity: 8 },
		{
			item: i('Black platelegs'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Black platelegs (g)'), lvl: 25, partQuantity: 8 },
		{ item: i('Black platelegs (t)'), lvl: 25, partQuantity: 8 },
		{ item: i('Black plateskirt'), lvl: 25, partQuantity: 8 },
		{ item: i('Black plateskirt (g)'), lvl: 25, partQuantity: 8 },
		{ item: i('Black plateskirt (t)'), lvl: 25, partQuantity: 8 },
		{
			item: i('White platelegs'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White plateskirt'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Proselyte cuisse'), lvl: 30, partQuantity: 8 },
		{ item: i('Proselyte tasset'), lvl: 30, partQuantity: 8 },
		{
			item: i('Bandos robe legs'),
			lvl: 40,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Rock-shell legs'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune platelegs (g)'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune platelegs (t)'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune plateskirt (g)'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune plateskirt (t)'), lvl: 50, partQuantity: 8 },
		{ item: i('Granite legs'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon platelegs'), lvl: 60, partQuantity: 8 },
		{ item: i('Dragon plateskirt'), lvl: 60, partQuantity: 8 },
		{
			item: i('Bandos tassets'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'bandos', chance: 100, amount: 8 }] }
		},
		{
			item: i("Dharok's platelegs"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Guthan's chainskirt"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Torag's platelegs"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{
			item: i("Verac's plateskirt"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{ item: i("Statius's platelegs"), lvl: 78, partQuantity: 8 },
		{ item: i("Vesta's plateskirt"), lvl: 78, partQuantity: 8 },
		{ item: i('Iron plateskirt'), lvl: 10, partQuantity: 12 },
		{ item: i('Steel platelegs'), lvl: 20, partQuantity: 12 },
		{ item: i('Steel plateskirt'), lvl: 20, partQuantity: 12 },
		{ item: i('Mithril platelegs'), lvl: 30, partQuantity: 12 },
		{ item: i('Mithril plateskirt'), lvl: 30, partQuantity: 12 },
		{ item: i('Rune plateskirt'), lvl: 50, partQuantity: 12 },
		{ item: i('Fremennik shield'), lvl: 1, partQuantity: 8 },
		{ item: i('Training shield'), lvl: 1, partQuantity: 8 },
		{ item: i('Wooden shield'), lvl: 1, partQuantity: 8 },
		{
			item: i('Black kiteshield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Black kiteshield (g)'), lvl: 25, partQuantity: 8 },
		{ item: i('Black kiteshield (t)'), lvl: 25, partQuantity: 8 },
		{
			item: i('Black shield (h1)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h2)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h3)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h4)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h5)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black sq shield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White kiteshield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White sq shield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Rune kiteshield (g)'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune kiteshield (t)'), lvl: 50, partQuantity: 8 },
		{
			item: i('Rune shield (h1)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h2)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h3)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h4)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h5)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Spirit shield'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon sq shield'), lvl: 60, partQuantity: 8 },
		{ item: i('Toktz-ket-xil'), lvl: 60, partQuantity: 8 },
		{
			item: i('Blessed spirit shield'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 8 }] }
		},
		{
			item: i('Crystal shield'),
			lvl: 70,
			partQuantity: 8,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 8 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{
			item: i('Dragonfire shield'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'dragonfire', chance: 100, amount: 3 }] }
		},
		{ item: i('Bronze kiteshield'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron kiteshield'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel kiteshield'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril kiteshield'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune kiteshield'), lvl: 50, partQuantity: 8 }
	],
	parts: { cover: 35, plated: 30, deflecting: 30, strong: 3, protective: 2 }
};

export default MeleeArmour;
