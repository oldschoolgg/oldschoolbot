import { z } from 'zod';

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
	'🐋'
] as const;

export const ZMagicPhrase = z.enum(MagicPhrases);
export type IMagicPhrase = z.infer<typeof ZMagicPhrase>;

export const ZFoolEventData = z.strictObject({
	magicWordsGuessed: z.array(ZMagicPhrase)
});

export type IFoolEventData = z.infer<typeof ZFoolEventData>;
