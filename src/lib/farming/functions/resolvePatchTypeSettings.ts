import { PatchTypes } from '..';
import { UserSettings } from '../../settings/types/UserSettings';

export default function resolvePatchTypeSetting(type: PatchTypes.FarmingPatchTypes) {
	switch (type) {
		case PatchTypes.FarmingPatchTypes.Herb:
			return UserSettings.FarmingPatches.Herb;
		case PatchTypes.FarmingPatchTypes.FruitTree:
			return UserSettings.FarmingPatches.FruitTree;
		case PatchTypes.FarmingPatchTypes.Tree:
			return UserSettings.FarmingPatches.Tree;
		case PatchTypes.FarmingPatchTypes.Allotment:
			return UserSettings.FarmingPatches.Allotment;
		case PatchTypes.FarmingPatchTypes.Cactus:
			return UserSettings.FarmingPatches.Cactus;
		case PatchTypes.FarmingPatchTypes.Bush:
			return UserSettings.FarmingPatches.Bush;
		case PatchTypes.FarmingPatchTypes.Spirit:
			return UserSettings.FarmingPatches.Spirit;
		case PatchTypes.FarmingPatchTypes.Hardwood:
			return UserSettings.FarmingPatches.Hardwood;
		case PatchTypes.FarmingPatchTypes.Seaweed:
			return UserSettings.FarmingPatches.Seaweed;
		case PatchTypes.FarmingPatchTypes.Vine:
			return UserSettings.FarmingPatches.Vine;
		case PatchTypes.FarmingPatchTypes.Calquat:
			return UserSettings.FarmingPatches.Calquat;
		case PatchTypes.FarmingPatchTypes.Redwood:
			return UserSettings.FarmingPatches.Redwood;
		case PatchTypes.FarmingPatchTypes.Crystal:
			return UserSettings.FarmingPatches.Crystal;
		case PatchTypes.FarmingPatchTypes.Celastrus:
			return UserSettings.FarmingPatches.Celastrus;
	}
}
