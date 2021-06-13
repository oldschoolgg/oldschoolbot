import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';
import { O } from 'ts-toolbelt';

import { Events } from '../../lib/constants';
import SimilarItems from '../../lib/data/similarItems';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import {
	addBanks,
	bankHasAllItemsFromBank,
	removeBankFromBank,
	removeItemFromBank
} from '../../lib/util';
import itemID from '../../lib/util/itemID';

export interface GetUserBankOptions {
	withGP?: boolean;
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public bank(this: User, { withGP = false }: GetUserBankOptions = {}) {
		const bank = new Bank(this.settings.get(UserSettings.Bank));
		if (withGP) bank.add('Coins', this.settings.get(UserSettings.GP));
		return bank;
	}

	public numOfItemsOwned(this: User, itemID: number) {
		const bank = this.settings.get(UserSettings.Bank);

		let numOwned = 0;

		if (typeof bank[itemID] !== 'undefined') {
			numOwned += bank[itemID];
		}

		for (const setup of Object.values(this.rawGear())) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) numOwned += thisItemEquipped.quantity;
		}

		return numOwned;
	}

	public numItemsInBankSync(this: User, itemID: number, similar = false) {
		const bank = this.settings.get(UserSettings.Bank);
		const itemQty = typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
		if (similar && itemQty === 0 && SimilarItems[itemID]) {
			for (const i of SimilarItems[itemID]) {
				if (bank[i] && bank[i] > 0) return bank[i];
			}
		}
		return itemQty;
	}

	public allItemsOwned(this: User): Bank {
		let totalBank = this.bank({ withGP: true });

		for (const setup of Object.values(this.rawGear())) {
			for (const equipped of Object.values(setup)) {
				if (equipped?.item) {
					totalBank.add(equipped.item, equipped.quantity);
				}
			}
		}

		const equippedPet = this.settings.get(UserSettings.Minion.EquippedPet);
		if (equippedPet) {
			totalBank.add(equippedPet);
		}

		return totalBank;
	}

	public async removeGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		if (currentGP < amount) throw `${this.sanitizedName} doesn't have enough GP.`;
		this.log(
			`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${
				currentGP - amount
			}]`
		);
		return this.queueFn(() => this.settings.update(UserSettings.GP, currentGP - amount));
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(
			`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`
		);
		return this.queueFn(() => this.settings.update(UserSettings.GP, currentGP + amount));
	}

	public async addItemsToBank(
		this: User,
		inputItems: ItemBank | Bank,
		collectionLog = false
	): Promise<{ previousCL: ItemBank; itemsAdded: ItemBank }> {
		const _items = inputItems instanceof Bank ? { ...inputItems.bank } : inputItems;
		await this.settings.sync(true);

		const previousCL = this.settings.get(UserSettings.CollectionLogBank);

		const items = {
			..._items
		};

		if (collectionLog) {
			await this.addItemsToCollectionLog(items);
		}

		if (items[995]) {
			await this.addGP(items[995]);
			delete items[995];
		}

		this.log(`Had items added to bank - ${JSON.stringify(items)}`);
		await this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				addBanks([
					items,
					{
						...this.settings.get(UserSettings.Bank)
					}
				])
			)
		);

		return {
			previousCL,
			itemsAdded: _items
		};
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(
				Events.Wtf,
				`${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`
			);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.log(`had Quantity[${amountToRemove}] of ItemID[${itemID}] removed from bank.`);
		return this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				removeItemFromBank(bank, itemID, amountToRemove)
			)
		);
	}

	public async removeItemsFromBank(this: User, _itemBank: O.Readonly<ItemBank>) {
		const itemBank = _itemBank instanceof Bank ? { ..._itemBank.bank } : _itemBank;

		await this.settings.sync(true);

		const currentBank = this.settings.get(UserSettings.Bank);
		const GP = this.settings.get(UserSettings.GP);
		if (!bankHasAllItemsFromBank({ ...currentBank, 995: GP }, itemBank)) {
			throw new Error(
				`Tried to remove ${new Bank(itemBank)} from ${
					this.username
				} but failed because they don't own all these items.`
			);
		}

		const items = {
			...itemBank
		};

		if (items[995]) {
			await this.removeGP(items[995]);
			delete items[995];
		}

		this.log(`Had items removed from bank - ${JSON.stringify(items)}`);
		return this.queueFn(() =>
			this.settings.update(UserSettings.Bank, removeBankFromBank(currentBank, items))
		);
	}

	public async hasItem(this: User, itemID: number, amount = 1, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' && bank[itemID] >= amount;
	}

	public async numberOfItemInBank(this: User, itemID: number, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
	}

	public owns(this: User, bank: ItemBank | Bank | string | number) {
		if (typeof bank === 'string' || typeof bank === 'number') {
			return Boolean(
				this.settings.get(UserSettings.Bank)[typeof bank === 'number' ? bank : itemID(bank)]
			);
		}
		const itemBank = bank instanceof Bank ? { ...bank.bank } : bank;
		return bankHasAllItemsFromBank(
			{
				...this.settings.get(UserSettings.Bank),
				995: this.settings.get(UserSettings.GP)
			},
			itemBank
		);
	}
}
