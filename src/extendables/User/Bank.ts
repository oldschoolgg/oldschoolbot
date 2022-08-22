import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';

export interface GetUserBankOptions {
	withGP?: boolean;
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public bank(this: User, { withGP = false }: GetUserBankOptions = {}) {
		const bank = new Bank(this.settings.get('bank') as any as ItemBank);
		if (withGP) bank.add('Coins', this.settings.get(UserSettings.GP));
		return bank;
	}

	public async addItemsToBank(
		this: User,
		{
			items,
			collectionLog = false,
			filterLoot = true,
			dontAddToTempCL = false
		}: { items: ItemBank | Bank; collectionLog?: boolean; filterLoot?: boolean; dontAddToTempCL?: boolean }
	) {
		return transactItems({
			collectionLog,
			itemsToAdd: new Bank(items),
			filterLoot,
			dontAddToTempCL,
			userID: this.id
		});
	}

	public async removeItemsFromBank(this: User, _itemBank: Readonly<ItemBank>) {
		return transactItems({
			itemsToRemove: new Bank(_itemBank),
			userID: this.id
		});
	}
}
