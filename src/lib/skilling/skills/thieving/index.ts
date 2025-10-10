import { Emoji } from '@oldschoolgg/toolkit';

import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import { rogueOutfitPercentBonus } from '@/lib/skilling/skills/thieving/thievingUtils.js';
import { defineSkill } from '@/lib/skilling/types.js';

export const Thieving = defineSkill({
	aliases: ['thieving', 'stealing'],
	id: 'thieving',
	emoji: Emoji.Thieving,
	name: 'Thieving',
	stealables,
	rogueOutfitPercentBonus
});
