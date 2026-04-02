import { stringMatches } from '@oldschoolgg/toolkit';

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
	'Race car',
	'Kayak',
	'Rotator',
	'noon',
	'whale',
	'🐋',
	'Squirtle',
	'Wartortle',
	'Blastoise',
	'Psyduck',
	'Golduck',
	'Poliwag',
	'Poliwhirl',
	'Poliwrath',
	'Tentacool',
	'Tentacruel',
	'Slowpoke',
	'Slowbro',
	'Slowking',
	'Seel',
	'Dewgong',
	'Shellder',
	'Cloyster',
	'Krabby',
	'Kingler',
	'Horsea',
	'Seadra',
	'Kingdra',
	'Goldeen',
	'Seaking',
	'Staryu',
	'Starmie',
	'Magikarp',
	'Gyarados',
	'Lapras',
	'Vaporeon',
	'Omanyte',
	'Omastar',
	'Kabuto',
	'Kabutops',
	'Totodile',
	'Croconaw',
	'Feraligatr',
	'Chinchou',
	'Lanturn',
	'Marill',
	'Azumarill',
	'Politoed',
	'Wooper',
	'Quagsire',
	'Qwilfish',
	'Corsola',
	'Remoraid',
	'Octillery',
	'Mantine',
	'Suicune'
] as const;

export function countMagicWordsGuessed(user: MUser) {
	const magicWords = user.magicWordsGuessed;
	let count = 0;

	for (const word of MagicPhrases) {
		if (
			magicWords.some(i => {
				if (stringMatches('???', word)) {
					return i === word;
				} else {
					return stringMatches(word, i);
				}
			})
		)
			count++;
	}
	return count;
}
