import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { toTitleCase } from '../../util';

export default function readableSlotName(slot: EquipmentSlot) {
	return toTitleCase(slot);
}
