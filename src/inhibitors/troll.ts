import { randArrItem } from 'e';
import { Inhibitor, KlasaMessage } from 'klasa';

import { itemID, roll } from '../lib/util';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (msg.author.id === '294448484847976449' && roll(4)) {
			throw randArrItem([
				'https://tenor.com/view/delicious-sand-lithuania-gif-13803031',
				'https://tenor.com/view/pop-cat-epik-gif-19394020'
			]);
		} else if (msg.author.settings.get('troll') && roll(4)) {
			throw `${msg.author}, No.`;
		}
		if (msg.author.equippedPet() === itemID('Hammy') && roll(10)) {
			throw `<:Hamstare:685036648089780234> Hammy has interrupted your command because he is hungry and wants attention.`;
		}
	}
}
