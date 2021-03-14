import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { hasItemEquipped } from '../../gear';
import { UserSettings } from '../../settings/types/UserSettings';
import Magic from '../../skilling/skills/combat/magic/magic';
import { stringMatches } from '../../util';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import { staves } from '../../util/determineRunes';
import { SkillsEnum } from './../../skilling/types';

export default async function removeRunesFromUser(
	client: KlasaClient,
	user: KlasaUser,
	casts: number
): Promise<string> {
	await user.settings.sync(true);
	// Check if tridents are used and consume runes depending on trident if so in future
	const castName = user.settings.get(UserSettings.Minion.CombatSpell);
	if (!castName) throw `No combat spell been set.`;
	const castableItem = Magic.Castables.find(item => stringMatches(item.name, castName));
	if (!castableItem) {
		throw `That is not a valid spell that been set.`;
	}
	if (user.skillLevel(SkillsEnum.Magic) < castableItem.level) {
		throw `${user.minionName} needs ${castableItem.level} Magic to cast ${castableItem.name}.`;
	}
	const userBank = user.bank();
	let runeBank = castableItem.inputItems.clone().multiply(casts);
	const gear = user.rawGear();
	const staff = gear.mage.weapon;
	if (hasItemEquipped(itemID('Tome of fire'), gear.mage) && castableItem.name.toLowerCase().includes('fire')) {
		runeBank.add('Burnt page', Math.max(Math.floor(casts / 20), 1));
	}
	let trident = false;
	let coins = false;
	if (
		staff &&
		(staff.item === itemID('trident of the seas') ||
			staff.item === itemID('trident of the seas (e)'))
	) {
		trident = true;
		coins = true;
		runeBank = new Bank()
			.add('Death rune')
			.add('Chaos rune')
			.add('Fire rune', 5);
		runeBank = runeBank.clone().multiply(casts);
		if (user.settings.get(UserSettings.GP) < casts * 10) {
			throw `You don't have enough GP to use the trident.`;
		}
		await user.removeGP(casts * 10);
	}
	if (
		staff &&
		(staff.item === itemID('trident of the swamp') ||
			staff.item === itemID('trident of the swamp (e)'))
	) {
		trident = true;
		runeBank = new Bank()
			.add('Death rune')
			.add('Chaos rune')
			.add('Fire rune', 5)
			.add("Zulrah's scales");
		runeBank = runeBank.clone().multiply(casts);
	}
	if (staff) {
		for (const [staffSet, runes] of staves) {
			if (staffSet.includes(staff.item)) {
				for (const rune of runes) {
					runeBank.remove(rune, runeBank.amount(rune));
				}
			}
		}
	}
	if (!userBank.has(runeBank.bank)) {
		throw `You don't have the materials needed to cast ${casts}x ${trident ? 'Built-in magic spell' : castableItem.name}, you need ${runeBank}, you're missing **${runeBank
			.clone()
			.remove(userBank)}**.`;
	}
	await user.removeItemsFromBank(runeBank.bank);

	return `${await createReadableItemListFromBank(client, runeBank.bank)}${coins ? `, ${casts * 10}x Coins` : ''} from ${user.username}`;
}
