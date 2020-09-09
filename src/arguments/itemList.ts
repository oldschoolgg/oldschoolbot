import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import getOSItem from '../lib/util/getOSItem';
import { ItemList } from '../lib/minions/types';
import { Util } from 'oldschooljs';
// import getOSItem from '../lib/util/getOSItem';
// import { addBanks } from 'oldschooljs/dist/util';
// import { ItemBank } from '../lib/types';

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
		const {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			args,
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			usage: { usageDelim }
		} = // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			message.prompter;
		const paramsToRemove =
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			(message.prompter ? message.prompter.usage.parsedUsage.length : 1) - 1;
		// remove unnecessary params
		// remove the previous parameters from the args list
		args.splice(0, paramsToRemove);
		const joinedItems = args
			.join(usageDelim)
			.trim()
			.replace(/,*$/, '') // remove trailing comma and spaces
			.split(',');
		const _toReturnItems: ItemList[] = [];
		for (let i = 0; i < joinedItems.length; i++) {
			let [itemQty, ...itemName] = joinedItems[i].trim().split(' ');
			// if qty is not a direct number...
			if (!Number(itemQty)) {
				// check if it a KMB valid number
				if (itemQty.replace(/[0-9,_.kmb]/gi, '').length === 0) {
					itemQty = Util.fromKMB(itemQty);
				} else {
					// otherwise it is part of the item
					itemName.unshift(itemQty);
					itemQty = 1;
				}
			}
			if (itemName.length === 0) {
				itemName.unshift(itemQty);
				itemQty = 1;
			}
			if (Boolean(itemName.join(' '))) {
				_toReturnItems.push({
					qty: itemQty,
					item: getOSItem(itemName.join(' '))
				});
			}
		}
		return _toReturnItems;
	}
}
