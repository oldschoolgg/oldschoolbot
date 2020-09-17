import { GearTypes } from '..';
import { toTitleCase } from '../../util';

export default function readableGearTypeName(gearType: GearTypes.GearSetupTypes) {
	return toTitleCase(gearType);
}
