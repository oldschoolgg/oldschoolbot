import { User } from 'discord.js';
import { Extendable, ExtendableStore, SettingsUpdateResult } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util/bank';
import { O } from 'ts-toolbelt';

import { Events } from '../../lib/constants';
import { similarItems } from '../../lib/data/similarItems';
import clueTiers from '../../lib/minions/data/clueTiers';
import { ExchangeItemsFromBankOptions } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { bankHasAllItemsFromBank, removeBankFromBank, removeItemFromBank, removeZeroQtyFromBank } from '../../lib/util';
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
		if (similar && itemQty === 0 && similarItems.get(itemID)) {
			for (const i of similarItems.get(itemID)!) {
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
		this.log(`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${currentGP - amount}]`);
		return this.settings.update(UserSettings.GP, currentGP - amount);
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`);
		return this.settings.update(UserSettings.GP, currentGP + amount);
	}

	public async petEquip(this: User, petID: number): Promise<SettingsUpdateResult> {
		return this.queueFn(async user => {
			// Ensure pet isn't equipped, as this is queued.
			await user.settings.sync(true);
			const equippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
			if (equippedPet) throw 'You already have a pet equipped.';

			const newBank = user.bank();
			newBank.remove(petID);
			return user.settings.update([
				[UserSettings.Minion.EquippedPet, petID],
				[UserSettings.Bank, newBank.bank]
			]);
		});
	}

	public async petUnequip(this: User): Promise<SettingsUpdateResult> {
		return this.queueFn(async user => {
			// Ensure pet is equipped, as this is queued.
			await user.settings.sync(true);
			const equippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
			if (!equippedPet) throw "You don't have a pet equipped.";

			const newBank = user.bank();
			newBank.add(equippedPet);
			return user.settings.update([
				[UserSettings.Bank, newBank.bank],
				[UserSettings.Minion.EquippedPet, null]
			]);
		});
	}

	public async exchangeItemsFromBank(
		this: User,
		options: ExchangeItemsFromBankOptions
	): Promise<SettingsUpdateResult> {
		return this.queueFn(async user => {
			const _lootBank = options.lootBank instanceof Bank ? { ...options.lootBank.bank } : options.lootBank;
			const _costBank = options.costBank ? removeZeroQtyFromBank(options.costBank) : options.costBank;

			await user.settings.sync(true);

			let newBank = user.settings.get(UserSettings.Bank);
			const GP = user.settings.get(UserSettings.GP);
			let gpToAdd = 0;

			// Remove items from our newBank object:
			if (_costBank) {
				if (!bankHasAllItemsFromBank({ ...newBank, 995: GP }, _costBank)) {
					throw new Error(
						`Tried to remove ${new Bank(_costBank)} from ${
							user.username
						} but failed because they don't own all these items.`
					);
				}

				const costBank = {
					..._costBank
				};

				if (costBank[995]) {
					gpToAdd -= costBank[995];
					delete costBank[995];
				}

				user.log(`Had items removed from bank - ${JSON.stringify(costBank)}`);
				newBank = removeBankFromBank(newBank, costBank);
			}

			// Add items to our newBank object
			if (_lootBank) {
				for (const { scrollID } of clueTiers) {
					// If they didnt get any of this clue scroll in their loot, continue to next clue tier.
					if (!_lootBank[scrollID]) continue;
					const alreadyHasThisScroll = newBank[scrollID];
					if (alreadyHasThisScroll) {
						// If they already have this scroll in their bank, delete it from the loot.
						delete _lootBank[scrollID];
					} else {
						// If they dont have it in their bank, reset the amount to 1 incase they got more than 1 of the clue.
						_lootBank[scrollID] = 1;
					}
				}

				const lootBank = {
					..._lootBank
				};

				if (options.collectionLog) {
					await user.addItemsToCollectionLog(lootBank);
				}

				if (lootBank[995]) {
					gpToAdd += lootBank[995];
					delete lootBank[995];
				}

				user.log(`Had items added to bank - ${JSON.stringify(lootBank)}`);

				newBank = addBanks([newBank, lootBank]);
			}
			await user.addGP(gpToAdd);
			return this.settings.update(UserSettings.Bank, newBank);
		});
	}

	public async addItemsToBank(
		this: User,
		inputItems: ItemBank | Bank,
		collectionLog = false
	): Promise<{ previousCL: ItemBank; itemsAdded: ItemBank }> {
		return this.queueFn(async user => {
			const _items = inputItems instanceof Bank ? { ...inputItems.bank } : inputItems;
			await user.settings.sync(true);

			const previousCL = user.settings.get(UserSettings.CollectionLogBank);

			for (const { scrollID } of clueTiers) {
				// If they didnt get any of this clue scroll in their loot, continue to next clue tier.
				if (!_items[scrollID]) continue;
				const alreadyHasThisScroll = user.settings.get(UserSettings.Bank)[scrollID];
				if (alreadyHasThisScroll) {
					// If they already have this scroll in their bank, delete it from the loot.
					delete _items[scrollID];
				} else {
					// If they dont have it in their bank, reset the amount to 1 incase they got more than 1 of the clue.
					_items[scrollID] = 1;
				}
			}

			const items = {
				..._items
			};

			if (collectionLog) {
				await user.addItemsToCollectionLog(items);
			}

			if (items[995]) {
				await user.addGP(items[995]);
				delete items[995];
			}

			user.log(`Had items added to bank - ${JSON.stringify(items)}`);
			await user.settings.update(UserSettings.Bank, user.bank().add(items).bank);

			return {
				previousCL,
				itemsAdded: _items
			};
		});
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(Events.Wtf, `${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.log(`had Quantity[${amountToRemove}] of ItemID[${itemID}] removed from bank.`);
		return this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				removeItemFromBank({ ...this.settings.get(UserSettings.Bank) }, itemID, amountToRemove)
			)
		);
	}

	public async removeItemsFromBank(this: User, _itemBank: O.Readonly<ItemBank>) {
		return this.queueFn(async user => {
			const itemBank = removeZeroQtyFromBank(_itemBank);
			await user.settings.sync(true);

			const currentBank = user.settings.get(UserSettings.Bank);
			const GP = user.settings.get(UserSettings.GP);
			if (!bankHasAllItemsFromBank({ ...currentBank, 995: GP }, itemBank)) {
				throw new Error(
					`Tried to remove ${new Bank(itemBank)} from ${
						user.username
					} but failed because they don't own all these items.`
				);
			}

			const items = {
				...itemBank
			};

			if (items[995]) {
				await user.removeGP(items[995]);
				delete items[995];
			}

			user.log(`Had items removed from bank - ${JSON.stringify(items)}`);
			return user.settings.update(UserSettings.Bank, removeBankFromBank(currentBank, items));
		});
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
			return Boolean(this.settings.get(UserSettings.Bank)[typeof bank === 'number' ? bank : itemID(bank)]);
		}
		const itemBank = bank instanceof Bank ? { ...bank.bank } : bank;
		return bankHasAllItemsFromBank(
			{ ...this.settings.get(UserSettings.Bank), 995: this.settings.get(UserSettings.GP) },
			itemBank
		);
	}
}
