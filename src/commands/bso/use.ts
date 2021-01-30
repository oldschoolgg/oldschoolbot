import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

const hammyMessages = [
	'You try to use a {item} on Hammy, he swiftly eats it.',
	"You shove the {item} in Hammy's face, he crushes it with his teeth in rage, barely missing your hand.",
	'You offer the {item} to Hammy, and he throws it to the floor.'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:string> <item:string>',
			usageDelim: ',',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr, secondItemStr]: [string, string]) {
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);
		const secondItem = getOSItem(secondItemStr);
		const firstName = firstItem.name.toLowerCase();
		const secondName = secondItem.name.toLowerCase();
		if (!bank.has(firstItem.id)) {
			return msg.send(`You don't have a ${firstItem.name}.`);
		}
		if (!bank.has(secondItem.id)) {
			return msg.send(`You don't have a ${secondItem.name}.`);
		}

		if (secondItem.id === itemID('Hammy')) {
			await msg.author.removeItemFromBank(firstItem.id);
			return msg.send(randArrItem(hammyMessages).replace('{item}', firstItem.name));
		}

		if ([firstItem.id, secondItem.id].includes(itemID('Fremennik blade'))) {
			return msg.send(
				`You use ${firstItem.name} on ${secondItem.name}..... Nothing interesting would've happened.`
			);
		}

		if (
			[firstName, secondName].some(name => name.includes('dwarven') || name.includes('dwarf'))
		) {
			return msg.send(`You uh... tried to use ${firstItem.name} on ${secondItem.name}....`);
		}

		if ([firstName, secondName].some(name => name.includes('mystery'))) {
			return msg.send(
				`You used ${firstItem.name} on ${secondItem.name}..... Mysteriously... Nothing interesting happens.`
			);
		}

		if (firstName.includes('a') && secondName.includes('i')) {
			return msg.send(`Nothing interesting didn't happen.`);
		}

		if (firstName.startsWith('a') || firstName.startsWith('e')) {
			return msg.send(`Nothing interesting was going to happen.`);
		}

		if (firstName.includes('x') || secondName.includes('x')) {
			return msg.send(`Nothing happens.`);
		}

		return msg.send(
			`You used ${firstItem.name} on ${secondItem.name}..... Nothing interesting happens.`
		);
	}
}
