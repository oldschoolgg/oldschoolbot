import { objectEntries } from 'e';
import { convertXPtoLVL } from 'oldschooljs/dist/util';

import { Skills } from '../types';

export function skillsMeetRequirements(skills: Skills, requirements: Skills) {
	for (const [skillName, level] of objectEntries(requirements)) {
		const xpHas = skills[skillName];
		const levelHas = convertXPtoLVL(xpHas ?? 1);
		if (levelHas < level!) return false;
	}
	return true;
}
