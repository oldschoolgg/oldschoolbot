import type { Emoji as EmojiType } from '@oldschoolgg/toolkit';

import { defineSkill } from '@/lib/skilling/types.js';

const Sailing = defineSkill({
	aliases: ['sailing', 'sail'],
	id: 'sailing',
	// Emoji.Sailing doesn't exist in toolkit; use a simple sailboat emoji for now.
	emoji: '⛵' as EmojiType,
	name: 'Sailing'
});

export default Sailing;
