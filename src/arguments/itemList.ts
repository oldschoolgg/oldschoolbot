import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { ItemList } from '../lib/minions/types';
import { Util } from 'oldschooljs';

/**
 * Returns an ItemBank from the items define on the string. Defaults qty to 1.
 */
export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: '...itemList', aliases: ['...itemList'] });
	}

	/**
	 *
	 * @param arg
	 * @param possible
	 * @param message
	 * @return ToReturn[]
	 */
	async run(arg: string, possible: Possible, message: KlasaMessage): Promise<any> {
		let args: string[] = [];
		let usageDelim = ' ';
		let paramsToRemove = 0;
		if (message) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2341
			args = message.prompter?.args ?? [];
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2341
			usageDelim = message.prompter?.usage.usageDelim ?? ' ';
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2341
			paramsToRemove = (message.prompter ? message.prompter.usage.parsedUsage.length : 1) - 1;
		}
		// remove unnecessary params
		args.splice(0, paramsToRemove);
		const joinedItems = args
			.join(usageDelim)
			.trim()
			.replace(/,*$/, '') // remove trailing comma and spaces
			.split(',');
		const _toReturnItems: ItemList[] = [];
		for (let i = 0; i < joinedItems.length; i++) {
			let qtdInformed = true;
			let [itemQty, ...itemName] = joinedItems[i].trim().split(' ');
			// if qty is not a direct number...
			if (!Number(itemQty)) {
				// check if it a KMB valid number
				if (itemQty.replace(/[0-9,_.kmb]/gi, '').length === 0) {
					itemQty = Util.fromKMB(itemQty).toString();
				} else {
					// otherwise it is part of the item
					itemName.unshift(itemQty);
					itemQty = '1';
					qtdInformed = false;
				}
			}
			if (itemName.length === 0) {
				itemName.unshift(itemQty);
				itemQty = '1';
				qtdInformed = false;
			}
			const itemNameFinal = itemName.join(' ');
			if (Boolean(itemNameFinal)) {
				_toReturnItems.push({
					qty: Number(itemQty),
					qtyInformed: qtdInformed,
					possibilities: await this.store
						.get('item')!
						.run(itemNameFinal, possible, message)
				});
			}
		}
		return _toReturnItems;
	}
}
