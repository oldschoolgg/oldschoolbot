import type { Emoji as EmojiType } from '@oldschoolgg/toolkit';

import { defineSkill } from '@/lib/skilling/types.js';

const Sailing = defineSkill({
	aliases: ['sailing', 'sail'],
	id: 'sailing',
	emoji: '<:Sailing:1537491722920267889>' as EmojiType,
	name: 'Sailing'
});

export default Sailing;
