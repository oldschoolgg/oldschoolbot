import itemID from './util/itemID';
import getOSItem from './util/getOSItem';
import { cleanString } from 'oldschooljs/dist/util';

interface Ornaments {
	baseItem: number;
	ornamentName: number;
	ornatedItem: number;
	returnOrnament: boolean;
	ornatedItemAliases?: string[];
}

const Ornaments: Ornaments[] = [
	{
		baseItem: itemID('Dragon full helm'),
		ornamentName: itemID('Dragon full helm ornament kit'),
		ornatedItem: itemID('Dragon full helm (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon chainbody'),
		ornamentName: itemID('Dragon chainbody ornament kit'),
		ornatedItem: itemID('Dragon chainbody (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon platebody'),
		ornamentName: itemID('Dragon platebody ornament kit'),
		ornatedItem: itemID('Dragon platebody (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon platelegs'),
		ornamentName: itemID('Dragon legs/skirt ornament kit'),
		ornatedItem: itemID('Dragon platelegs (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon plateskirt'),
		ornamentName: itemID('Dragon legs/skirt ornament kit'),
		ornatedItem: itemID('Dragon plateskirt (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon sq shield'),
		ornamentName: itemID('Dragon sq shield ornament kit'),
		ornatedItem: itemID('Dragon sq shield (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon kiteshield'),
		ornamentName: itemID('Dragon kiteshield ornament kit'),
		ornatedItem: itemID('Dragon kiteshield (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon scimitar'),
		ornamentName: itemID('Dragon scimitar ornament kit'),
		ornatedItem: itemID('Dragon scimitar (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon defender'),
		ornamentName: itemID('Dragon defender ornament kit'),
		ornatedItem: itemID('Dragon defender (t)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon boots'),
		ornamentName: itemID('Dragon boots ornament kit'),
		ornatedItem: itemID('Dragon boots (g)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Armadyl godsword'),
		ornamentName: itemID('Armadyl godsword ornament kit'),
		ornatedItem: itemID('Armadyl godsword (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Bandos godsword'),
		ornamentName: itemID('Bandos godsword ornament kit'),
		ornatedItem: itemID('Bandos godsword (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Saradomin godsword'),
		ornamentName: itemID('Saradomin godsword ornament kit'),
		ornatedItem: itemID('Saradomin godsword (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Zamorak godsword'),
		ornamentName: itemID('Zamorak godsword ornament kit'),
		ornatedItem: itemID('Zamorak godsword (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity hat'),
		ornamentName: itemID('Dark infinity colour kit'),
		ornatedItem: itemID('Dark infinity hat'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity top'),
		ornamentName: itemID('Dark infinity colour kit'),
		ornatedItem: itemID('Dark infinity top'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity bottoms'),
		ornamentName: itemID('Dark infinity colour kit'),
		ornatedItem: itemID('Dark infinity bottoms'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity hat'),
		ornamentName: itemID('Light infinity colour kit'),
		ornatedItem: itemID('Light infinity hat'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity top'),
		ornamentName: itemID('Light infinity colour kit'),
		ornatedItem: itemID('Light infinity top'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Infinity bottoms'),
		ornamentName: itemID('Light infinity colour kit'),
		ornatedItem: itemID('Light infinity bottoms'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Ancestral hat'),
		ornamentName: itemID('Twisted ancestral colour kit'),
		ornatedItem: itemID('Twisted ancestral hat'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Ancestral robe top'),
		ornamentName: itemID('Twisted ancestral colour kit'),
		ornatedItem: itemID('Twisted ancestral robe top'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Ancestral robe bottom'),
		ornamentName: itemID('Twisted ancestral colour kit'),
		ornatedItem: itemID('Twisted ancestral robe bottom'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Tzhaar-ket-om'),
		ornamentName: itemID('Tzhaar-ket-om ornament kit'),
		ornatedItem: itemID('Tzhaar-ket-om (t)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Berserker necklace'),
		ornamentName: itemID('Berserker necklace ornament kit'),
		ornatedItem: itemID('Berserker necklace (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Amulet of fury'),
		ornamentName: itemID('Fury ornament kit'),
		ornatedItem: itemID('Amulet of fury (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Amulet of torture'),
		ornamentName: itemID('Torture ornament kit'),
		ornatedItem: itemID('Amulet of torture (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Tormented bracelet'),
		ornamentName: itemID('Tormented ornament kit'),
		ornatedItem: itemID('Tormented bracelet (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Necklace of anguish'),
		ornamentName: itemID('Anguish ornament kit'),
		ornatedItem: itemID('Necklace of anguish (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Occult necklace'),
		ornamentName: itemID('Occult ornament kit'),
		ornatedItem: itemID('Occult necklace (or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon pickaxe'),
		ornamentName: itemID('Zalcano shard'),
		ornatedItem: itemID('Dragon pickaxe(or)'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Dragon pickaxe'),
		ornamentName: itemID('Dragon pickaxe upgrade kit'),
		ornatedItem: itemID('Dragon pickaxe upgraded'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Steam battlestaff'),
		ornamentName: itemID('Steam staff upgrade kit'),
		ornatedItem: itemID('Steam battlestaff or'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Lava battlestaff'),
		ornamentName: itemID('Lava staff upgrade kit'),
		ornatedItem: itemID('Lava battlestaff or'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Odium ward'),
		ornamentName: itemID('Ward upgrade kit'),
		ornatedItem: itemID('Odium ward or'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Malediction ward'),
		ornamentName: itemID('Ward upgrade kit'),
		ornatedItem: itemID('Malediction ward or'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Dark bow'),
		ornamentName: itemID('Green dark bow paint'),
		ornatedItem: itemID('Dark bow green'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Dark bow'),
		ornamentName: itemID('Blue dark bow paint'),
		ornatedItem: itemID('Dark bow blue'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Dark bow'),
		ornamentName: itemID('Yellow dark bow paint'),
		ornatedItem: itemID('Dark bow yellow'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Dark bow'),
		ornamentName: itemID('White dark bow paint'),
		ornatedItem: itemID('Dark bow white'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Abyssal whip'),
		ornamentName: itemID('Volcanic whip mix'),
		ornatedItem: itemID('Volcanic abyssal whip'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Abyssal whip'),
		ornamentName: itemID('Frozen whip mix'),
		ornatedItem: itemID('Frozen abyssal whip'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Granite maul'),
		ornamentName: itemID('Granite clamp'),
		ornatedItem: itemID('Granite maul or'),
		returnOrnament: false
	},
	{
		baseItem: itemID('Rune scimitar'),
		ornamentName: itemID('Rune scimitar ornament kit (guthix)'),
		ornatedItem: itemID('Rune scimitar guthix'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Rune scimitar'),
		ornamentName: itemID('Rune scimitar ornament kit (saradomin)'),
		ornatedItem: itemID('Rune scimitar saradomin'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Rune scimitar'),
		ornamentName: itemID('Rune scimitar ornament kit (zamorak)'),
		ornatedItem: itemID('Rune scimitar zamorak'),
		returnOrnament: true
	},
	{
		baseItem: itemID('Rune defender'),
		ornamentName: itemID('Rune defender ornament kit'),
		ornatedItem: itemID('Rune defender (t)'),
		returnOrnament: true
	}
];

// makes sure that all ornaments have aliases when they are not custom made, to make it easier for their creation
Ornaments.forEach(o => {
	if (!o.ornatedItemAliases) {
		o.ornatedItemAliases = [cleanString(getOSItem(o.ornatedItem).name)];
	}
});

export default Ornaments;
