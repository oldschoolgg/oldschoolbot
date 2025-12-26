import { type MaterialType, materialTypes } from '@/lib/bso/skills/invention/index.js';

export function isValidMaterialType(type: string): type is MaterialType {
	return materialTypes.includes(type as MaterialType);
}
