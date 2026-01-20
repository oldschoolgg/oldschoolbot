import { Emoji } from '@oldschoolgg/toolkit';

import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import { defineSkill } from '@/lib/skilling/types.js';

for (const enchantable of Enchantables) {
	enchantable.input.freeze();
	enchantable.output.freeze();
}

for (const castable of Castables) {
	castable.input.freeze();
	if (castable.output) castable.output.freeze();
}

const Magic = defineSkill({
	aliases: ['mage', 'magic'],
	id: 'magic',
	emoji: Emoji.Magic,
	name: 'Magic',
	Enchantables,
	Castables
});

export default Magic;
