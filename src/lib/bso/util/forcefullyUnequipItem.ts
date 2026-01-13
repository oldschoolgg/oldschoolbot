import { objectEntries } from '@oldschoolgg/toolkit';
import type { Item } from 'oldschooljs';

export async function forcefullyUnequipItem(user: MUser, item: Item) {
	const setup = objectEntries(user.gear).find(g => g[1].hasEquipped(item.id, false, false));
	if (!setup) {
		throw new Error(`User[${user.id}] does not have ${item.name} equipped, cannot forcefully remove.`);
	}
	await user.update({
		[`gear_${setup[0]}`]: {
			...setup[1].raw(),
			[item.equipment!.slot]: null
		}
	});
	Logging.logDebug(`Forcefully unequipped ${item.name} from ${user.id}.`);
}
