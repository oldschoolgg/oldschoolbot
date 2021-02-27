import { randArrItem } from 'e';
import { Inhibitor, KlasaMessage } from 'klasa';

import { itemID, roll } from '../lib/util';

const ishiMessages = [
	'😀',
	'😃',
	'😄',
	'😁',
	'😅',
	'☺',
	'🥰',
	'😌',
	'😇',
	'😊',
	'😘',
	'😗',
	'😙',
	'😚',
	'😋',
	'😛',
	'😯',
	'😮',
	'😲',
	'🤤',
	'😑',
	'😐',
	'😬',
	'🙄',
	'🤗',
	'😳',
	'😭',
	'🐳',
	'❤',
	'💕'
];

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (msg.author.usingPet('Ishi') && roll(10)) {
			throw `**Ishi has interrupted your command to say this:** \n\n"${
				randArrItem(ishiMessages) + randArrItem(ishiMessages)
			}" - <:ishi:813000865417134090>`;
		}
		if (msg.author.equippedPet() === itemID('Hammy') && roll(10)) {
			throw `<:Hamstare:685036648089780234> Hammy has interrupted your command because he is hungry and wants attention.`;
		}
	}
}
