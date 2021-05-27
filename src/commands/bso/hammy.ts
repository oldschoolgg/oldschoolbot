import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

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
	'The last time Hammy saw your {item} he was too small to eat it, but not anymore!'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:string>',
			usageDelim: ',',
			oneAtTime: true,
			aliases: ['feed','feedhammy'],
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr]: [string]) {
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);

		if (!bank.has(firstItem.id)) {
			return msg.send(`You don't have a ${firstItem.name}.`);
		}
		if (!bank.has(itemID('Hammy'))) {
			return msg.send(`You don't have a Hammy, so how could you feed it?`);
		}

		await msg.author.removeItemFromBank(firstItem.id);
		return msg.send(randArrItem(hammyMessages).replace(/\{item\}/g, firstItem.name));
	}
}
