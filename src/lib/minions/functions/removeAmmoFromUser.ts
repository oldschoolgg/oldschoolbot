import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { bankHasItem, itemID } from 'oldschooljs/dist/util';

import { roll } from '../../../lib/util';
import { itemInSlot } from '../../gear';
import { UserSettings } from '../../settings/types/UserSettings';
import { itemNameFromID } from '../../util';
import getOSItem from '../../util/getOSItem';

export default async function removeAmmoFromUser(user: KlasaUser, hits: number): Promise<string> {
	await user.settings.sync(true);
	const rangeWeapon = user.getGear('range').equippedWeapon();
	if (!rangeWeapon) throw 'No weapon is equipped in range.';
	const gear = user.getGear('range');
	const [cape] = itemInSlot(gear, EquipmentSlot.Cape);
	let [ammo] = itemInSlot(gear, EquipmentSlot.Ammo);
	let blowpipe = false;
	if (rangeWeapon.name.toLowerCase() === 'toxic blowpipe') {
		blowpipe = true;
		const blowpipeData = user.settings.get(UserSettings.Blowpipe);
		if (blowpipeData.dartID === null) throw 'No dart ID found';
		const dart = getOSItem(blowpipeData.dartID);
		ammo = dart;
		if (!ammo) throw 'No blowpipe dart have been choosen.';
	}
	if (!ammo) throw 'No ammo is equipped in range.';
	if (rangeWeapon.name.includes('dart')) {
		ammo = rangeWeapon;
	} else if (rangeWeapon.name.includes('cross')) {
		if (!ammo.name.includes('bolt')) {
			throw 'The ammunition type used by crossbows is bolts. Equip a bolt in the range setup.';
		}
	} else if (rangeWeapon.name.includes('ballista')) {
		if (!ammo.name.includes('javelin')) {
			throw 'The ammunition type used by ballistas is javelins. Equip a javelin in the range setup.';
		}
	} else if (!ammo.name.includes('arrow')) {
		throw 'The ammunition type used by bows is arrows. Equip a arrow in the range setup.';
	}
	let brokenAmmo = 0;
	let dropOnFloor = 1;
	// Make ava's and other capes affect dropOnFloor chance. 1 = 100 % currently.
	if (cape) {
		if (cape.name.includes('attractor')) {
			dropOnFloor = 5;
		} else if (cape.name.includes('accumulator')) {
			dropOnFloor = 12;
		} else if (cape.name.includes('assembler')) {
			dropOnFloor = 999_999;
		}
	}

	for (let i = 0; i < hits; i++) {
		if (roll(5)) {
			brokenAmmo++;
			continue;
		}
		if (roll(dropOnFloor)) {
			if (roll(4)) {
				brokenAmmo++;
				continue;
			}
		}
	}
	if (rangeWeapon.name.includes('ballista')) brokenAmmo = hits;

	const userBank = user.bank().values();
	let ammoToRemove = new Bank();
	if (!bankHasItem(userBank, ammo.id, brokenAmmo)) {
		throw `You don't have enough ${itemNameFromID(ammo.id)} in the bank.`;
	}
	if (blowpipe) {
		if (!bankHasItem(userBank, itemID("Zulrah's scales"), Math.floor(brokenAmmo * 3.3))) {
			throw "You don't have enough Zulrah's scales in the bank.";
		}
		ammoToRemove.add(itemID("Zulrah's scales"), Math.floor(brokenAmmo * 3.3));
	}
	// Remove the required items from their bank.
	ammoToRemove.add(ammo.id, brokenAmmo);
	await user.removeItemsFromBank(ammoToRemove);

	return `Removed ${ammoToRemove} from ${user.username}`;
}
