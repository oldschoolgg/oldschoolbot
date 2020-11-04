import { Inhibitor, KlasaMessage } from 'klasa';

import { itemID, roll } from '../lib/util';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (msg.author.settings.get('troll') && roll(4)) {
			throw `${msg.author}, No.`;
		}
		if (msg.author.equippedPet() === itemID('Hammy') && roll(10)) {
			throw `<:Hamstare:685036648089780234> Hammy has interrupted your command because he is hungry and wants attention.`;
		}
	}
}
