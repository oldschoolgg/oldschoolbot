import { Items } from 'oldschooljs';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { cleanString } from './util';
import getOSItem from './util/getOSItem';

function setItemAlias(id: number, name: string | string[]) {
	let firstName: string | null = null;
	// Add the item to the custom items array
	if (typeof name === 'string') {
		firstName = name;
		const cleanName = cleanString(name);
		itemNameMap.set(cleanName, id);
	} else {
		for (const _name of name) {
			if (!firstName) firstName = _name;
			const cleanName = cleanString(_name);
			itemNameMap.set(cleanName, id);
		}
	}
	// Update the item name to it's first alias
	Items.set(id, {
		...getOSItem(id),
		name: firstName!
	});
}

export function initItemAliases() {
	// Graceful sets -- Arceuus
	setItemAlias(13579, ['Arceuus graceful hood', 'Purple graceful hood']);
	setItemAlias(13581, ['Arceuus graceful cape', 'Purple graceful cape']);
	setItemAlias(13583, ['Arceuus graceful top', 'Purple graceful top']);
	setItemAlias(13585, ['Arceuus graceful legs', 'Purple graceful legs']);
	setItemAlias(13587, ['Arceuus graceful gloves', 'Purple graceful gloves']);
	setItemAlias(13589, ['Arceuus graceful boots', 'Purple graceful boots']);
	// Graceful sets -- Port Piscarilius
	setItemAlias(13591, ['Piscarilius graceful hood', 'Cyan graceful hood']);
	setItemAlias(13593, ['Piscarilius graceful cape', 'Cyan graceful cape']);
	setItemAlias(13595, ['Piscarilius graceful top', 'Cyan graceful top']);
	setItemAlias(13597, ['Piscarilius graceful legs', 'Cyan graceful legs']);
	setItemAlias(13599, ['Piscarilius graceful gloves', 'Cyan graceful gloves']);
	setItemAlias(13601, ['Piscarilius graceful boots', 'Cyan graceful boots']);
	// Graceful sets -- Lovakengj
	setItemAlias(13603, ['Lovakengj graceful hood', 'Yellow graceful hood']);
	setItemAlias(13605, ['Lovakengj graceful cape', 'Yellow graceful cape']);
	setItemAlias(13607, ['Lovakengj graceful top', 'Yellow graceful top']);
	setItemAlias(13609, ['Lovakengj graceful legs', 'Yellow graceful legs']);
	setItemAlias(13611, ['Lovakengj graceful gloves', 'Yellow graceful gloves']);
	setItemAlias(13613, ['Lovakengj graceful boots', 'Yellow graceful boots']);
	// Graceful sets -- Shayzien
	setItemAlias(13615, ['Shayzien graceful hood', 'Red graceful hood']);
	setItemAlias(13617, ['Shayzien graceful cape', 'Red graceful cape']);
	setItemAlias(13619, ['Shayzien graceful top', 'Red graceful top']);
	setItemAlias(13621, ['Shayzien graceful legs', 'Red graceful legs']);
	setItemAlias(13623, ['Shayzien graceful gloves', 'Red graceful gloves']);
	setItemAlias(13625, ['Shayzien graceful boots', 'Red graceful boots']);
	// Graceful sets -- Hosidius
	setItemAlias(13627, ['Hosidius graceful hood', 'Green graceful hood']);
	setItemAlias(13629, ['Hosidius graceful cape', 'Green graceful cape']);
	setItemAlias(13631, ['Hosidius graceful top', 'Green graceful top']);
	setItemAlias(13633, ['Hosidius graceful legs', 'Green graceful legs']);
	setItemAlias(13635, ['Hosidius graceful gloves', 'Green graceful gloves']);
	setItemAlias(13637, ['Hosidius graceful boots', 'Green graceful boots']);
	// Graceful sets -- All cities
	setItemAlias(13667, ['Kourend graceful hood', 'White graceful hood']);
	setItemAlias(13669, ['Kourend graceful cape', 'White graceful cape']);
	setItemAlias(13671, ['Kourend graceful top', 'White graceful top']);
	setItemAlias(13673, ['Kourend graceful legs', 'White graceful legs']);
	setItemAlias(13675, ['Kourend graceful gloves', 'White graceful gloves']);
	setItemAlias(13677, ['Kourend graceful boots', 'White graceful boots']);
	// Graceful sets -- Brimhaven
	setItemAlias(21061, ['Brimhaven graceful hood', 'Dark blue graceful hood']);
	setItemAlias(21064, ['Brimhaven graceful cape', 'Dark blue graceful cape']);
	setItemAlias(21067, ['Brimhaven graceful top', 'Dark blue graceful top']);
	setItemAlias(21070, ['Brimhaven graceful legs', 'Dark blue graceful legs']);
	setItemAlias(21073, ['Brimhaven graceful gloves', 'Dark blue graceful gloves']);
	setItemAlias(21076, ['Brimhaven graceful boots', 'Dark blue graceful boots']);
	// Graceful sets -- Brimhaven
	setItemAlias(24743, ['Hallowed graceful hood', 'Black graceful hood']);
	setItemAlias(24746, ['Hallowed graceful cape', 'Black graceful cape']);
	setItemAlias(24749, ['Hallowed graceful top', 'Black graceful top']);
	setItemAlias(24752, ['Hallowed graceful legs', 'Black graceful legs']);
	setItemAlias(24755, ['Hallowed graceful gloves', 'Black graceful gloves']);
	setItemAlias(24758, ['Hallowed graceful boots', 'Black graceful boots']);
}
