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

export function countMagicWordsSimple(magicWordsGuessed: string[]) {
	return foolListMatchingWords(magicWordsGuessed).length;
}
export function countMagicWordsGuessed(user: MUser) {
	const magicWords = user.magicWordsGuessed;
	return countMagicWordsSimple(magicWords);
}

export function foolListMatchingWords(words: string[]) {
	const foolList: string[] = [];
	for (const foolWord of MagicPhrases) {
		if (words.some(word => stringMatches(word, foolWord))) {
			foolList.push(foolWord);
		}
	}
	return foolList;
}
export function foolMakeHelpMessage(count: number) {
	return `You have guessed ${count} magic words so far.
# Instructions:

Use </fool us:1489151141265670195> To guess the "magic words" (hint: \`/fool us guess:magic\`).

Everytime you guess one of the hard-coded magic words, it boosts your drop rate for the (first) The whale card.
Also, every guess has a roll for the card. Even if you don't put anything in.


Use </fool trick_someone:1489151141265670195> to play a trick on or fool another player. You will see the results in #bso-general.
Use </fool fool_someone:1489151141265670195> to play a trick on or fool another player. You will see the results in #bso-general.
*Yes that's intentional ^*

This command, \`/fool info\` or \`/fool help\` no longer count against your cooldowns.

What are the cooldowns?

You can guess a word 5 times every 5 minutes, the 5 minute timer stats as soon as your first guess, not last. So if you only make 3 guesses, it still resets in 5 minutes.

You can play a trick or fool someone 2x every 10 minutes. This has a much more common drop rate for the rare item, and also becomes a basic guarantee if you have at least 12 correctly guessed words/phrases.

Only the first card is a basic guarantee, the others are only slightly improved, and ***no they don't get rarer the more you get!***

# **Public hints:**
*guess hints:*
1. Whale theme - (ie. \`whale\`)
2. Fool Us - TV Show - (ie. \`penn & teller\`)
3. Extroardinary attorney woo.  (ie. \`woo\`)

If you see a New Player message, it means 1 of 2 things:
- Minion < 90 days old
- Minion older than we started tracking start date

New players can ask a mod for the 'New Player' role, which will disable that nerf. This is to stop alts.
Old players can do the same, or just find your oldest bso command in this server and show it to a mod (you need message id, or a link, not a screenshot... We have to put the ID in the command)`;
}
