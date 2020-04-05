import { GearTypes } from '..';
import { UserSettings } from '../../UserSettings';

export default function resolveGearTypeSetting(type: GearTypes.GearSetupTypes) {
	switch (type) {
		case GearTypes.GearSetupTypes.Melee:
			return UserSettings.Gear.Melee;
		case GearTypes.GearSetupTypes.Mage:
			return UserSettings.Gear.Mage;
		case GearTypes.GearSetupTypes.Range:
			return UserSettings.Gear.Range;
	}
}
