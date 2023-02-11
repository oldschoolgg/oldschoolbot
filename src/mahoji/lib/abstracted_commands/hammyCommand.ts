import { ChatInputCommandInteraction } from 'discord.js';
import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { roll } from '../../../lib/util';
import { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';

// roll(chanceToDouble) to decide if the item doubles
const chanceToDouble = 100;

// roll(chanceToSave) to decide if the item is saved
const chanceToSave = 10;

const hammyMessages = [
	'You try to use a {item} on Hammy, he swiftly eats it.',
	"You shove the {item} in Hammy's face; he crushes it with his teeth in rage, barely missing your hand.",
	'You offer the {item} to Hammy, and he throws it to the floor.',
	'You gently hand the {item} to Hammy. He squeaks excitedly before tearing it to shreds.',
	'You hand the {item} to Hammy too quickly nearly crushing him. In response, he crushes your {item}.',
	'Hammy tries to hold the {item}, but his hands are too small and he drops it, never to be seen again.',
	'You ask Hammy to play with your {item}, but he breaks it instead not knowing any better.',
	'You hold Hammy up to your {item}, but accidentally drop them both. Luckily Hammy survived.',
	"Your Hammy gnaws on the {item} until it's a worthless piece of junk which you discard.",
	'You show Hammy your {item} and he hides it in his cheeks. You spend hours trying to get it out, only to give up in despair.',
	'The last time Hammy saw your {item} he was too small to eat it, but not anymore!',
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\n He lost. ${Emoji.Sad}`,
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\n He won, but ate the profit as well as your {item}. ${Emoji.Sad}`
];

const hammyFailMessages = [
	'You gave {item} to Hammy. He hurriedly chokes it down, before spitting it back up in disgust. It seems ok...',
	"Hammy refused to eat {item} for personal reasons. Don't ask.",
	'Hammy will NEVER eat another {item} after what happened last summer...',
	'You dropped your {item} but Hammy helpfully caught it and slipped it back into your pack.',
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\nHe won, but ate the profit. At least you didn't lost anything ${Emoji.Joy}`
];

const hammyDoubleMessages = [
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\nHe won, and actually brought you the profit! ${Emoji.Joy}`,
	'You feed {item} to Hammy and he hides it in his cheeks. You go to pull it out and find it doubled. How did that happen?',
	"You give {item} to Hammy while he's on his hamster wheel. When he stops and the dust settles, you realize there are now two.",
	"Hammy takes your {item} while you aren't looking and runs to the casino. He comes back rich and hands you an extra {item} for your trouble."
];

export async function feedHammyCommand(interaction: ChatInputCommandInteraction, user: MUser, itemName: string) {
	const firstItem = getItem(itemName);
	if (!firstItem) return "That's not a valid item.";

	await handleMahojiConfirmation(
		interaction,
		`${user}, are you sure you want to give ${firstItem.name} to Hammy? You probably won't get it back.`
	);

	const { bank } = user;
	if (!bank.has(firstItem.id)) {
		return `You don't have a ${firstItem.name}.`;
	}
	if (!bank.has('Hammy')) {
		return "You don't have a Hammy, so how could you feed it?";
	}

	if (roll(chanceToDouble)) {
		let loot = new Bank();
		loot.add(firstItem.id);
		await user.addItemsToBank({ items: loot, collectionLog: false });
		return randArrItem(hammyDoubleMessages).replace(/\{item\}/g, firstItem.name);
	}
	if (roll(chanceToSave)) {
		return randArrItem(hammyFailMessages).replace(/\{item\}/g, firstItem.name);
	}
	await user.removeItemsFromBank(new Bank().add(firstItem.id));
	return randArrItem(hammyMessages).replace(/\{item\}/g, firstItem.name);
}
