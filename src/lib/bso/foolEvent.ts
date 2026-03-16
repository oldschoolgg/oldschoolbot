import { roll } from '@oldschoolgg/rng/src/index.js';
import { Bank } from 'oldschooljs/src/index.js';

import type { FoolEventOptions } from '@/lib/types/minions.js';

export const MagicPhrases = [
	'You fooled us.',
	'Good night from Las Vegas',
	'Penn',
	'Teller',
	'Penn & Teller',
	'Las Vegas',
	'Palm Springs',
	'Magic',
	'Palming',
	'Marked cards',
	'Cheating',
	'Stripper deck',
	'Svengali deck',
	'Fake thumb',
	// Extraordinary attorney woo.
	'Extraordinary Attorney Woo',
	'Sperm whale',
	'Humpback whale',
	'Woo',
	'Woo Young-woo',
	"My name is Woo Young-woo, whether it's read straight or flipped, it's still Woo Young-woo. Kayak, deed, rotator, noon, race car, Woo Young-woo",
	'Race care',
	'Kayak',
	'Rotator',
	'noon',
	'🐋'
] as const;

type MagicPhrasesType = typeof MagicPhrases[number];

export type FoolEventData = {
	fooled: number;
	tricked: number;
	magicWordsGuessed: MagicPhrasesType[]
};

export const foolTask: MinionTask = {
	type: 'Enchanting',
	async run(data: FoolEventOptions, { user, handleTripFinish }) {
		if (data.command === 'us') {
			return;
		}

		function countMagicWordsGuessed(user: MUser) {
			return user.getFoolData().magicWordsGuessed.filter(w => MagicPhrases.includes(w)).length;
		}
		if (!roll(10)) return;
		const action = data.command === 'fool' ? 'fool' : 'trick';
		const target = await mUserFetch(data.target);

		const userPrize = new Bank();
		const targetPrize = new Bank();

		const winner = roll(2) ? user : target;

		let whaleOdds = 10;

		if (!winner.cl.has('The whale card')) {
			const wordsGuessed = countMagicWordsGuessed(winner)
			if (wordsGuessed > 3) whaleOdds -= Math.min(wordsGuessed, 8);
			whaleOdds = Math.min(whaleOdds, 2);
		}
		// Total chance is 1 in 200, 10% chance to ping, 10% chance to hit 50% chance for it to be yours.  Only 192 rolls possible at 24/7 gameplay
		const gotWhaled = roll(10);
		let msg = '';

		if (gotWhaled) {
			if (roll(2)) {
				if (target.isIronman) {
					msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but you won the roll... too bad you're an ironman 😭!`;
				} else {
					msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but jokes on them! You got The whale card!`;
					targetPrize.add('The whale card');
				}
			} else {
				msg = `🐋 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won The whale card!`;
				userPrize.add('The whale card');
			}
		} else {
			msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won The whale card!`;
		}


	}
};
