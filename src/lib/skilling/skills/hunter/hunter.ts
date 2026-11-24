import { Emoji } from '@oldschoolgg/toolkit';
import { itemID } from 'oldschooljs';

import { defineSkill } from '@/lib/skilling/types.js';
import creatures from './creatures/index.js';

const Hunter = defineSkill({
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: 'hunter',
	emoji: Emoji.Hunter,
	name: 'Hunter'
});

export default Hunter;

const hunterOutfit = new Map([
	[itemID('Guild hunter headwear'), 0.4],
	[itemID('Guild hunter top'), 0.8],
	[itemID('Guild hunter legs'), 0.6],
	[itemID('Guild hunter boots'), 0.2]
]);

export function hasFullHunterOutfit(user: MUser): boolean {
	return user.hasEquipped([...hunterOutfit.keys()], true);
}

export function hunterOutfitBonus(user: MUser): number {
	if (hasFullHunterOutfit(user)) return 2.5;
	let bonus = 0;
	for (const [id, value] of hunterOutfit) if (user.hasEquipped(id)) bonus += value;
	return bonus;
}
