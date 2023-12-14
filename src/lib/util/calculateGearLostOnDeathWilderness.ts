import { deepClone, objectEntries } from 'e';
import { Bank } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { GearSetup } from '../gear/types';
import getOSItem from './getOSItem';
import itemID from './itemID';
import resolveItems from './resolveItems';

interface IGearSwap {
	[key: number]: number[];
}
export const gearSwap: IGearSwap = {
	[itemID("Craw's bow")]: [itemID("Craw's bow (u)")],
	[itemID("Thammaron's sceptre")]: [itemID("Thammaron's sceptre (u)")],
	[itemID("Viggora's chainmace")]: [itemID("Viggora's chainmace (u)")],
	23_330: [itemID('Rune scimitar ornament kit (guthix)'), itemID('Rune scimitar')],
	23_332: [itemID('Rune scimitar ornament kit (saradomin)'), itemID('Rune scimitar')],
	23_334: [itemID('Rune scimitar ornament kit (zamorak)'), itemID('Rune scimitar')],
	[itemID('Rune defender (t)')]: [itemID('Rune defender'), itemID('Rune defender ornament kit')],
	[itemID('Dragon full helm (g)')]: [itemID('Dragon full helm'), itemID('Dragon full helm ornament kit')],
	[itemID('Dragon chainbody (g)')]: [itemID('Dragon chainbody'), itemID('Dragon chainbody ornament kit')],
	[itemID('Dragon platebody (g)')]: [itemID('Dragon platebody'), itemID('Dragon platebody ornament kit')],
	[itemID('Dragon platelegs (g)')]: [itemID('Dragon platelegs'), itemID('Dragon legs/skirt ornament kit')],
	[itemID('Dragon plateskirt (g)')]: [itemID('Dragon plateskirt'), itemID('Dragon legs/skirt ornament kit')],
	[itemID('Dragon boots (g)')]: [itemID('Dragon boots'), itemID('Dragon boots ornament kit')],
	[itemID('Dragon sq shield (g)')]: [itemID('Dragon sq shield'), itemID('Dragon sq shield ornament kit')],
	[itemID('Dragon kiteshield (g)')]: [itemID('Dragon kiteshield'), itemID('Dragon kiteshield ornament kit')],
	[itemID('Dragon scimitar (or)')]: [itemID('Dragon scimitar'), itemID('Dragon scimitar ornament kit')],
	[itemID('Dragon defender (t)')]: [itemID('Dragon defender'), itemID('Dragon defender ornament kit')],
	[itemID('Armadyl godsword (or)')]: [itemID('Armadyl godsword'), itemID('Armadyl godsword ornament kit')],
	[itemID('Bandos godsword (or)')]: [itemID('Bandos godsword'), itemID('Bandos godsword ornament kit')],
	[itemID('Saradomin godsword (or)')]: [itemID('Saradomin godsword'), itemID('Saradomin godsword ornament kit')],
	[itemID('Zamorak godsword (or)')]: [itemID('Zamorak godsword'), itemID('Zamorak godsword ornament kit')],
	[itemID('Tzhaar-ket-om (t)')]: [itemID('Tzhaar-ket-om'), itemID('Tzhaar-ket-om ornament kit')],
	[itemID('Berserker necklace (or)')]: [itemID('Berserker necklace'), itemID('Berserker necklace ornament kit')],
	[itemID('Amulet of fury (or)')]: [itemID('Amulet of fury'), itemID('Fury ornament kit')],
	[itemID('Amulet of torture (or)')]: [itemID('Amulet of torture'), itemID('Torture ornament kit')],
	[itemID('Necklace of anguish (or)')]: [itemID('Necklace of anguish'), itemID('Anguish ornament kit')],
	[itemID('Tormented bracelet (or)')]: [itemID('Tormented bracelet'), itemID('Tormented ornament kit')],
	[itemID('Occult necklace (or)')]: [itemID('Occult necklace'), itemID('Occult ornament kit')],
	[itemID('Dark infinity hat')]: [itemID('Infinity hat'), itemID('Dark infinity colour kit')],
	[itemID('Dark infinity top')]: [itemID('Infinity top'), itemID('Dark infinity colour kit')],
	[itemID('Dark infinity bottoms')]: [itemID('Infinity bottoms'), itemID('Dark infinity colour kit')],
	[itemID('Light infinity hat')]: [itemID('Infinity hat'), itemID('Light infinity colour kit')],
	[itemID('Light infinity top')]: [itemID('Infinity top'), itemID('Light infinity colour kit')],
	[itemID('Light infinity bottoms')]: [itemID('Infinity bottoms'), itemID('Light infinity colour kit')],
	[itemID('Twisted ancestral hat')]: [itemID('Ancestral hat'), itemID('Twisted ancestral colour kit')],
	[itemID('Twisted ancestral robe top')]: [itemID('Ancestral robe top'), itemID('Twisted ancestral colour kit')],
	[itemID('Twisted ancestral robe bottom')]: [
		itemID('Ancestral robe bottom'),
		itemID('Twisted ancestral colour kit')
	],
	[itemID('Holy ghrazi rapier')]: [itemID('Holy ornament kit'), itemID('Ghrazi rapier')],
	[itemID('Holy sanguinesti staff')]: [itemID('Holy ornament kit'), itemID('Sanguinesti staff')],
	[itemID('Holy scythe of vitur')]: [itemID('Holy ornament kit'), itemID('Scythe of vitur')],
	[itemID('Sanguine scythe of vitur')]: [itemID('Sanguine ornament kit'), itemID('Scythe of vitur')],
	24_743: [itemID('Graceful hood'), itemID('Dark dye')],
	24_749: [itemID('Graceful top'), itemID('Dark dye')],
	24_752: [itemID('Graceful legs'), itemID('Dark dye')],
	24_755: [itemID('Graceful gloves'), itemID('Dark dye')],
	24_758: [itemID('Graceful boots'), itemID('Dark dye')],
	24_746: [itemID('Graceful cape'), itemID('Dark dye')],
	25_069: [itemID('Graceful hood'), itemID('Trailblazer graceful ornament kit')],
	25_075: [itemID('Graceful top'), itemID('Trailblazer graceful ornament kit')],
	25_078: [itemID('Graceful legs'), itemID('Trailblazer graceful ornament kit')],
	25_081: [itemID('Graceful gloves'), itemID('Trailblazer graceful ornament kit')],
	25_084: [itemID('Graceful boots'), itemID('Trailblazer graceful ornament kit')],
	25_072: [itemID('Graceful cape'), itemID('Trailblazer graceful ornament kit')],
	[itemID('Dragon axe (or)')]: [itemID('Dragon axe'), itemID('Trailblazer tool ornament kit')],
	[itemID('Infernal axe (or)')]: [itemID('Infernal axe'), itemID('Trailblazer tool ornament kit')],
	[itemID('Dragon harpoon (or)')]: [itemID('Dragon harpoon'), itemID('Trailblazer tool ornament kit')],
	[itemID('Infernal harpoon (or)')]: [itemID('Infernal harpoon'), itemID('Trailblazer tool ornament kit')],
	25_376: [itemID('Dragon pickaxe'), itemID('Trailblazer tool ornament kit')],
	[itemID('Infernal pickaxe (or)')]: [itemID('Infernal pickaxe'), itemID('Trailblazer tool ornament kit')],
	[itemID('Dragon pickaxe (or)')]: [itemID('Dragon pickaxe'), itemID('Zalcano shard')],
	12_797: [itemID('Dragon pickaxe'), itemID('Dragon pickaxe upgrade kit')],
	12_795: [itemID('Steam battlestaff'), itemID('Steam staff upgrade kit')],
	21_198: [itemID('Lava battlestaff'), itemID('Lava staff upgrade kit')],
	12_807: [itemID('Odium ward'), itemID('Ward upgrade kit')],
	12_806: [itemID('Malediction ward'), itemID('Ward upgrade kit')],
	12_765: [itemID('Dark bow'), itemID('Green dark bow paint')],
	12_766: [itemID('Dark bow'), itemID('Blue dark bow paint')],
	12_767: [itemID('Dark bow'), itemID('Yellow dark bow paint')],
	12_768: [itemID('Dark bow'), itemID('White dark bow paint')],
	[itemID('Volcanic abyssal whip')]: [itemID('Abyssal whip'), itemID('Volcanic whip mix')],
	[itemID('Frozen abyssal whip')]: [itemID('Abyssal whip'), itemID('Frozen whip mix')],
	12_848: [itemID('Granite maul'), itemID('Granite clamp')],
	24_227: [24_225, itemID('Granite clamp')],
	[itemID('Abyssal tentacle')]: [itemID('Abyssal whip'), itemID('Kraken tentacle')],
	[itemID("Thammaron's sceptre (a)")]: [itemID("Thammaron's sceptre (au)")],
	[itemID('Webweaver bow')]: [itemID('Webweaver bow (u)')],
	[itemID('Ursine chainmace')]: [itemID('Ursine chainmace (u)')],
	[itemID('Accursed sceptre')]: [itemID('Accursed sceptre (u)')],
	[itemID('Accursed sceptre (a)')]: [itemID('Accursed sceptre (au)')],
	[itemID('Webweaver bow')]: [itemID('Webweaver bow (u)')],
	[itemID('Venator bow')]: [itemID('Venator bow (uncharged)')],
	// These 3 are NOT for BSO
	[itemID('Sanguine torva platebody')]: [itemID('Torva platebody')],
	[itemID('Sanguine torva platelegs')]: [itemID('Torva platelegs')],
	[itemID('Sanguine torva full helm')]: [itemID('Torva full helm')]
};

export const lockedItems = resolveItems([
	'Rune pouch (l)',
	'Fire cape (l)',
	'Infernal cape (l)',
	"Ava's assembler (l)",
	'Imbued guthix cape (l)',
	'Imbued saradomin cape (l)',
	'Imbued zamorak cape (l)',
	'Fire max cape (l)',
	'Infernal max cape (l)',
	'Assembler max cape (l)',
	'Imbued guthix max cape (l)',
	'Imbued saradomin max cape (l)',
	'Imbued zamorak max cape (l)',
	'Bronze defender (l)',
	'Iron defender (l)',
	'Steel defender (l)',
	'Black defender (l)',
	'Mithril defender (l)',
	'Adamant defender (l)',
	'Rune defender (l)',
	'Dragon defender (l)',
	'Avernic defender (l)',
	'Void melee helm (l)',
	'Void mage helm (l)',
	'Void ranger helm (l)',
	'Void knight top (l)',
	'Elite void top (l)',
	'Void knight robe (l)',
	'Elite void robe (l)',
	'Void knight gloves (l)',
	// Decorative armour gold
	// Helm
	24_158,
	// Body
	24_159,
	// Legs
	24_162,
	// Decorative magic armour
	// Helm
	24_163,
	// Body
	24_164,
	// Legs
	24_165,
	// Decorative ranged armour
	// Helm
	24_166,
	// Body
	24_167,
	// Legs
	24_168,
	'Guthix halo (l)',
	'Saradomin halo (l)',
	'Zamorak halo (l)',
	'Armadyl halo (l)',
	'Bandos halo (l)',
	'Seren halo (l)',
	'Ancient halo (l)',
	'Brassica halo (l)',
	'Fighter hat (l)',
	'Ranger hat (l)',
	'Healer hat (l)',
	'Fighter torso (l)',
	'Ancient sceptre (l)'
]);

export default function calculateGearLostOnDeathWilderness(
	options = <
		{
			gear: GearSetup;
			skulled: boolean;
			after20wilderness: boolean;
			smited: boolean;
			protectItem: boolean;
		}
	>{}
) {
	// 1 - Duplicate user gear
	let userGear = { ...deepClone(options.gear) };
	let removableItems: { slot: EquipmentSlot; sorter: number; originalItem: Item }[] = [];

	// 2 - Swap user gear to the correct gear for death calculations
	for (const [_slot, _data] of objectEntries(userGear)) {
		if (!_data || _data.item === undefined) continue;
		const originalItem = _data.item;
		let replacedGear = [_data.item];
		if (gearSwap[_data.item]) replacedGear = gearSwap[_data.item];

		removableItems.push({
			slot: _slot,
			sorter: replacedGear
				.map(_i => {
					const i = getOSItem(_i);
					if (lockedItems.includes(i.id)) return -1;
					// Get the hichest value for the item, be it protection value (cost), ge price or high alch
					return Math.max(i.price, i.cost, i.highalch ?? 0);
				})
				.reduce((sum, current) => sum + current, 0),
			originalItem: getOSItem(originalItem)
		});
	}

	// 3 - Sort gear
	const sortedGear = removableItems.sort((a, b) => b.sorter - a.sorter);

	// 4 - Decide how many items will be saved
	let itemsToSave = 3;
	if (options.skulled) itemsToSave -= 3;
	if (options.protectItem && !options.smited) itemsToSave += 1;

	// 5 - Replicate the sorting to the main gear
	const lostItemsBank = new Bank();
	for (const { slot, originalItem } of sortedGear.slice(itemsToSave)) {
		// Skip locked items
		if (lockedItems.includes(originalItem.id)) continue;
		userGear[slot] = null;
		lostItemsBank.add(originalItem.id);
	}

	// 6 - Return lost items + new gear
	return {
		lostItems: lostItemsBank,
		newGear: userGear
	};
}
