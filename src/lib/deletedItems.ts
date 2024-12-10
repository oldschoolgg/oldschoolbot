import { cleanString } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import getOSItem from './util/getOSItem';

export const itemsToDelete = [
	[26_237, 'Zaryte bow'],
	[26_239, 'Zaryte bow'],
	[26_241, 'Virtus mask'],
	[26_243, 'Virtus robe top'],
	[26_245, 'Virtus robe bottom'],
	[26_382, 'Torva full helm'],
	[26_384, 'Torva platebody'],
	[26_386, 'Torva platelegs'],

	[26_376, 'Torva full helm (damaged)'],
	[26_378, 'Torva platebody (damaged)'],
	[26_380, 'Torva platelegs (damaged)'],

	[26_686, "Maoma's med helm (broken)"],
	[26_687, "Maoma's full helm (broken)"],
	[26_688, "Maoma's great helm (broken)"],
	[26_689, 'Calamity chest (broken)'],
	[26_690, 'Superior calamity chest (broken)'],
	[26_691, 'Elite calamity chest (broken)'],
	[26_692, 'Calamity breeches (broken)'],
	[26_693, 'Superior calamity breeches (broken)'],
	[26_694, 'Elite calamity breeches (broken)'],
	[26_695, 'Centurion cuirass (broken)'],
	[26_696, 'Wristbands of the arena (broken)'],
	[26_697, 'Hardened wristbands of the arena (broken)'],
	[26_698, "Koriff's headband (broken)"],
	[26_699, "Koriff's cowl (broken)"],
	[26_700, "Koriff's coif (broken)"],
	[26_701, "Saika's hood (broken)"],
	[26_702, "Saika's veil (broken)"],
	[26_703, "Saika's shroud (broken)"],
	[26_705, 'Blighted surge sack'],
	[26_706, 'Scroll of imbuing'],
	[26_707, 'Dragon claws ornament kit'],
	[26_708, 'Dragon claws (or)'],
	[26_709, 'Dragon warhammer ornament kit'],
	[26_710, 'Dragon warhammer (or)'],
	[26_711, 'Heavy ballista ornament kit'],
	[26_712, 'Heavy ballista (or)'],
	[26_713, 'Armadyl armour ornament kit'],
	[26_714, 'Armadyl helmet (or)'],
	[26_715, 'Armadyl chestplate (or)'],
	[26_716, 'Armadyl chainskirt (or)'],
	[26_717, 'Bandos armour ornament kit'],
	[26_718, 'Bandos chestplate (or)'],
	[26_719, 'Bandos tassets (or)'],
	[26_720, 'Bandos boots (or)'],
	[26_721, 'Centurion cuirass'],
	[26_722, 'Centurion cuirass (l)'],
	[26_723, 'Wristbands of the arena'],
	[26_724, 'Wristbands of the arena (l)'],
	[26_725, 'Wristbands of the arena (c)'],
	[26_726, 'Wristbands of the arena (cl)'],
	[26_727, 'Wristbands of the arena (i)'],
	[26_728, 'Wristbands of the arena (il)'],
	[26_729, 'Wristbands of the arena (ic)'],
	[26_730, 'Wristbands of the arena (ilc)'],
	[26_731, "Saika's hood"],
	[26_732, "Saika's hood (l)"],
	[26_733, "Saika's veil"],
	[26_734, "Saika's veil (l)"],
	[26_735, "Saika's shroud"],
	[26_736, "Saika's shroud (l)"],
	[26_737, "Koriff's headband"],
	[26_738, "Koriff's headband (l)"],
	[26_739, "Koriff's cowl"],
	[26_740, "Koriff's cowl (l)"],
	[26_741, "Koriff's coif"],
	[26_742, "Koriff's coif (l)"],
	[26_743, "Maoma's med helm"],
	[26_744, "Maoma's med helm (l)"],
	[26_745, "Maoma's full helm"],
	[26_746, "Maoma's full helm (l)"],
	[26_747, "Maoma's great helm"],
	[26_748, "Maoma's great helm (l)"],
	[26_749, 'Calamity chest'],
	[26_750, 'Calamity chest (l)'],
	[26_751, 'Superior calamity chest'],
	[26_752, 'Superior calamity chest (l)'],
	[26_753, 'Elite calamity chest'],
	[26_754, 'Elite calamity chest (l)'],
	[26_755, 'Calamity breeches'],
	[26_756, 'Calamity breeches (l)'],
	[26_757, 'Superior calamity breeches'],
	[26_758, 'Superior calamity breeches (l)'],
	[26_759, 'Elite calamity breeches'],
	[26_760, 'Elite calamity breeches (l)']
] as const;

export function deleteItem(itemID: number, itemName: string) {
	const existing = Items.get(itemID);
	if (!existing) {
		if (!process.env.TEST) console.warn(`Tried to delete non-existent item ${itemName}${itemID}`);
		return;
	}
	if (existing.name !== itemName) throw new Error(`Tried to delete item with non-matching name ${itemName}${itemID}`);
	Items.delete(itemID);
	const cleanName = cleanString(itemName);
	if (itemNameMap.get(cleanName) === itemID) itemNameMap.delete(cleanString(itemName));
	let itemTest = null;
	try {
		itemTest = getOSItem(itemID);
	} catch {}
	if (itemTest !== null) {
		throw new Error(`Failed to delete ${itemName} ${itemID}, got: ${JSON.stringify(itemTest, null, 4)}`);
	}
}

for (const [id, name] of itemsToDelete) deleteItem(id, name);
