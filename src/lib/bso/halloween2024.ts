import { Time, randArrItem } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { clAdjustedDroprate, percentChance, roll } from '../util';
import { mahojiChatHead } from '../util/chatHeadImage';

export const treatTable = new LootTable()
	.add('Candy teeth', 1, 350)
	.add('Toffeet', 1, 240)
	.add('Chocolified skull', 1, 240)
	.add('Rotten sweets', 1, 240)
	.add('Hairyfloss', 1, 240)
	.add('Eyescream', 1, 180)
	.add('Goblinfinger soup', 1, 180)
	.add("Benny's brain brew", 1, 60)
	.add("Choc'rock", 1, 7);

const trickChance = 55; // treat chance = 1 - trickChance
const miniPhCost = new Bank().add('Spookling token', 100);

export const spooklingTrickMessages = [
	'Feeling cold? That’s just the chill of knowing I’m nearby.',
	'Hey, is that a shadow following you? Oh wait, it’s just me!',
	'Oops! Did I just jinx your luck for the next hour? Heh, sorry not sorry!',
	'Oops! Did I just trip you up, or was that your own clumsy feet?',
	'I didn’t steal some of your loot… or did I? You’ll never know!',
	'Don’t worry, it’s just a tiny curse. Nothing too permanent!',

	'Shhh, don’t tell Scruffy, but I borrowed his ghostly chew toy. Now it’s haunted!',
	'Remy told me you’d be here… and that you’re really easy to spook!',
	'Careful where you step! You don’t want to fall into one of Doug’s holes...',
	'Flappy might have wings, but I’ve got a trick that’ll send you flying!',
	'Do you hear that eerie howl? Oh, it’s just Scruffy… or is it?',
	'Feeling a little dizzy? That’s just Plopper’s way of saying hello!'
];

export const spooklingTreatMessages = [
	'Fine, fine, you can have this… don’t spend it all in one place.',
	'Ugh, I guess you earned it. Enjoy… or don’t, I don’t care.',
	'Here, take this! I wasn’t using it anyway.',
	'Consider this a little… accident. Yeah, that’s it. Take it.',
	'Alright, alright, here’s your treat. Now scram!',
	'I was saving that for myself, but whatever… it’s yours now.',
	'Don’t say I never gave you anything!',
	'Guess it’s your lucky day. Just don’t get used to it!',
	'Here, take this before I change my mind!'
];

export const spooklingTreatChaseMessages = [
	'Ugh, why did it have to be you? I guess you get the big one… this time.',
	'You must have cheated! But… fine, take it. But don’t brag about it!',
	'No way! I didn’t actually mean to give that out! Well, it’s yours now.',
	'Wait, you got the grand prize?! Oh, this is embarrassing…',
	'Ugh, that’s the jackpot. I’m never gonna hear the end of this!'
];
export const spooklingTrickChaseMessages = [
	'I didn’t even know I had that left! Well, enjoy the pet. It wasn’t meant for you… but whatever.',
	'You’ve gotta be kidding me! That was supposed to be for someone else! Well, I guess it’s yours now.',
	'I’m not crying, you’re crying! You’ve won the pet. But I’m still the real winner, right?'
];

async function handlePumpkinhead(user: MUser): Promise<{ loot: Bank | null; message: string }> {
	const loot = new Bank();
	if (!user.cl.has('Spookling token')) {
		return { loot: null, message: "We don't have any business..." };
	}
	if (!user.bank.has(miniPhCost)) {
		return { loot: null, message: "You think that's enough tokens to earn a mini me?" };
	}
	if (user.cl.amount('Miniature pumpkin head') >= 3) {
		return { loot: null, message: 'How many heads do you think I have? Get lost!' };
	}
	await user.removeItemsFromBank(miniPhCost);
	loot.add('Miniature pumpkin head');
	return { loot, message: 'I think this is what you came for...' };
}
export async function killPumpkinhead(user: MUser) {
	const result = await handlePumpkinhead(user);
	if (result.loot) {
		await user.addItemsToBank({ items: result.loot, collectionLog: true });
	}
	return mahojiChatHead({ head: 'pumpkin', content: result.message });
}
export function handleHalloweenEvent(user: MUser, duration: number): { loot: Bank | null; message: string } {
	const accountAge = user.accountAgeInDays();
	let petDropratePerTrick = 80;
	const trickChancePerMinute = 12;

	let spookMsg = '';
	// Don't give pet if account age is < 31
	if (accountAge) {
		if (accountAge < 31) {
			// Troll accounts that can't get pet: (Make them think they rolled it)
			if (roll(20)) spookMsg = "Aww, you aren't old enough to get fully spooked.";

			// Make pet drop rate extremely rare for new accounts.
			petDropratePerTrick *= 100;
		}
	}

	const minutes = Math.floor(duration / Time.Minute);

	let trickCount = 0;
	for (let i = 0; i < minutes; i++) {
		if (roll(trickChancePerMinute)) {
			trickCount++;
		}
	}

	const loot = new Bank();
	let lootCount = 0;
	for (let i = 0; i < trickCount; i++) {
		if (roll(2)) lootCount++;
		if (roll(clAdjustedDroprate(user, 'Polterpup', petDropratePerTrick, 5))) {
			loot.add('Polterpup');
		}
	}
	const isTrick = percentChance(trickChance);

	if (loot.has('Polterpup')) {
		spookMsg = isTrick ? randArrItem(spooklingTrickChaseMessages) : randArrItem(spooklingTreatChaseMessages);
	} else if (lootCount > 0) {
		if (!isTrick) {
			loot.add(treatTable.roll(lootCount));
			spookMsg = randArrItem(spooklingTreatMessages);
		} else {
			spookMsg = randArrItem(spooklingTrickMessages);
		}
		loot.add('Spookling token', trickCount);
	}

	return { loot: loot.length > 0 ? loot : null, message: spookMsg };
}
