import { LootTable } from 'oldschooljs';

export const MALEDICT_MORTIMER_ID = 395_214;

export const MaledictMortimerOutfitTable = new LootTable()
	.add('Maledict amulet')
	.add('Maledict hat')
	.add('Maledict top')
	.add('Maledict legs')
	.add('Maledict boots')
	.add('Maledict cape')
	.add('Maledict ring')
	.add('Maledict gloves');

export const MaledictMortimerBackupTable = new LootTable()
	.add('Spooky crate (s3)', 1, 3)
	.add('Spooky crate key (s3)', 1, 1)
	.add('Splooky fwizzle', 1, 10)
	.add('Pumpkin', 1, 4);

export const mortimerStartMessages = [
	"Welcome, wanderer! I've foreseen your doom.",
	'My life begins where yours ends.',
	'Life is a game, and I hold the cards.',
	'Ghosts are spooky, but I am terrifying.',
	"You'll make a fine addition to my spellbook.",
	"Let's see how you handle a little chaos.",
	'Which of me is the real one?',
	'Ready for a game of deception?',
	"Careful, I'm full of surprises.",
	'You think you can outwit me?',
	"I've got a trick or two up my sleeve.",
	"Let's see if you can keep up.",
	"How do you plan to beat what you can't see?",
	"You're in my world now.",
	'Reality is what I make it.',
	"Do you trust your senses? You shouldn't.",
	'Brace yourself for a world of mischief.',
	'Fancy a game of hide and seek?',
	"I hope you like puzzles, because you're in one.",
	"Reality is the biggest illusion, let's bend it.",
	"Confused? You've seen nothing yet.",
	'Two roads diverged, which will you take? Wrong choice.',
	'Ah, a new player on my enchanted board!',
	'Bravery or foolishness? Both are but pieces in my game.',
	'Cross this threshold and reality itself will question you.',
	'Ready for a game of wits and whimsy?',
	"You're the latest star in my cosmic theater of tricks!",
	'Ah, more material for my illusionary tapestry.',
	'A new face! Are you prepared to question everything?',
	'Can you discern truth from deceit?',
	"Enter freely, but you'll leave part of you behind.",
	'The wheel of fortune spins; where it lands, only I know'
];

export const mortimerEndMessages = [
	'Defeated, yet my doom escapes me.',
	"You've won the battle, but not escaped your doom.",
	"My life's legacy won't be toppled by the likes of you.",
	"The wheel of fate turns even when I'm gone.",
	"You can defeat me, but you'll never win.",
	'Death is just another path, one that we all must take.',
	"I've been bested? Impossible!",
	'You got lucky, nothing more.',
	"You've beaten the illusion, but not the master.",
	"Curtain's closed, but the show's far from over.",
	'You survived my illusions, but can you trust your victory?',
	"You've got tricks, but you'll never understand the magic.",
	"The trick isn't winning; it's thinking you've won.",
	'Bested me? Or maybe that was my double.',
	'Your victory is but a footnote in my tome of tricks.',
	'The curtain closes, but every end is a new beginning.',
	'Ah, the tables have turned. But remember, I always have another trick.',
	"Like a phoenix, I'll rise from these ashes.",
	"In besting me, you've only unlocked the next challenge.",
	"You've escaped my maze, but can you escape your own doubts?"
];
