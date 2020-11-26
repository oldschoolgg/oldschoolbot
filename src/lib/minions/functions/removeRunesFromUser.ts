import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, bankHasItem, removeItemFromBank } from 'oldschooljs/dist/util';

import { UserSettings } from '../../settings/types/UserSettings';
import Magic from '../../skilling/skills/combat/magic/magic';
import { itemNameFromID, stringMatches } from '../../util';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import { SkillsEnum } from './../../skilling/types';
import { ItemBank } from './../../types/index';

export default async function removeRunesFromUser(
	client: KlasaClient,
	user: KlasaUser,
	casts: number
): Promise<string> {
	await user.settings.sync(true);
	const castName = user.settings.get(UserSettings.Minion.CombatSpell);
	if (!castName) throw `No combat spell been set.`;
	const castableItem = Magic.Castables.find(item => stringMatches(item.name, castName));
	if (!castableItem) {
		throw `That is not a valid spell that been set.`;
	}
	if (user.skillLevel(SkillsEnum.Magic) < castableItem.level) {
		throw `${user.minionName} needs ${castableItem.level} Magic to cast ${castableItem.name}.`;
	}
	const userBank = user.settings.get(UserSettings.Bank);
	const requiredItems: [string, number][] = Object.entries(castableItem.inputItems);
	for (const [itemID, qty] of requiredItems) {
		const itemsOwned = userBank[parseInt(itemID)];
		if (itemsOwned < qty) {
			throw `You dont have enough ${itemNameFromID(parseInt(itemID))}.`;
		}
	}
	// Check the user has the required items to cast.
	for (const [itemID, qty] of requiredItems) {
		const id = parseInt(itemID);
		if (!bankHasItem(userBank, id, qty * casts)) {
			throw `You don't have enough ${itemNameFromID(id)}.`;
		}
	}
	// Remove the required items from their bank.
	let newBank = { ...userBank };
	let runesToRemove: ItemBank = {};
	for (const [itemID, qty] of requiredItems) {
		runesToRemove = addBanks([runesToRemove, { [itemID]: qty * casts }]);
		newBank = removeItemFromBank(newBank, parseInt(itemID), qty * casts);
	}

	await user.settings.update(UserSettings.Bank, newBank);

	return `${await createReadableItemListFromBank(client, runesToRemove)} from ${user.username}`;
}
