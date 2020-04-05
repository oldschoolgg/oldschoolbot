import { toTitleCase } from '../../util';
import { GearTypes } from '..';

export default function readableGearTypeName(gearType: GearTypes.GearSetupTypes) {
	return toTitleCase(gearType);
}
