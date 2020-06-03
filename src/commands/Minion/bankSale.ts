import { KlasaMessage, CommandStore } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import getOSItem from '../../lib/util/getOSItem';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[ { [quantity:int{1}] <itemname:...string> }, ... ]',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true
		});
	}

	/*
	Inputs
	Msg is the command message being processed.
	Items is an array of arrays, where the user submits the name of the item, and an optional quantity.
		Each object contains the item name and the quantity they want to sell.
	Outputs
		Emits possible forseeable errors
			Will only process 10 lines at a time so that memo
	*/
	async run(msg: KlasaMessage, items: [[name, qty],...]: [[string, number | undefined],...]) {
		if (msg.author.isIronman) throw `Iron players can't sell items.`;
		/*  validSaleLines arr
			This holds the line items that *WILL* be totalled if the user confirms the sale.
			The format for this array will be [{name, qty, price},...]
		*/
		var validSaleLines 		= [];
		/*  invalidSaleLines arr
			This holds the line items that *WILL NOT* be totalled if the user confirms the sale.
			The format for this array will be [{name, error},...]
		*/
		var invalidSaleLines 	= [];
		/* limit number
			This limits the number of sellable line items to 10 so that the bot is not bogged down processing a single user's transaction.
		*/
		var limit 				= 10;
		
		// Ensure that we only process the correct number of lines within our original limit
		if ( items.length < limit ){ limit = items.length; }
		
		/* begin for loop
			Here each line is passed to our testItemFromList function.
			This function either throws an error, which is then caught 
			in order to push a new element onto the invalidSaleLines 
			array.
		*/
		for ( var i = 0; i < limit; i++ ){
			try {
				let current = await testItemFromList( msg: KlasaMessage, [ items[i][0], items[i][1] ] );
				validSaleLines.push( current );
			} catch ( err ){
				invalidSaleLines.push( items[i][0], err );
			}
		}
		/* end for loop */
		
		/* begin for loop
			Now let's traverse validSaleLines.
			We are counting the quantity of each item being sold.
			We are summing up the price for each item as well.
		*/
		var totalPrice = 0;
		var totalItems = 0;
		for ( var j=0; j< validSaleLines.length; j++) {
			totalPrice += Math.floor(validSaleLines[j][3] * 0.8);
			totalItems += validSaleLines[j][0];
		}
		/* end for loop */
		
		// Get confirmation from the user about the items being sold before fully processing them.
		const sellMsg = await msg.channel.send( 
			`${msg.author}, say \`confirm\` to sell ${totalItems} items for ${totalPrice.toLocaleString()} (${Util.toKMB(totalPrice)}).`
		);

		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id &&
					_msg.content.toLowerCase() === 'confirm',
				options
			);
		} catch ( err ) {
			return sellMsg.edit(`Cancelling sale of ${totalItems} items.`);
		}
		
		
		for( var k = 0; k < validSaleLines.length; k++ ) {
			let qty 		= validSaleLines[k][1];
			let itemId 		= validSaleLines[k][3];
			let itemPrice  	= validSaleLines[k][2]/validSaleLines[k][1];
			let linePrice 	= Math.floor(validSaleLines[k][2] * 0.8);
			
			await msg.author.removeItemFromBank( itemId, qty );
			await msg.author.settings.update( UserSettings.GP, msg.author.settings.get(UserSettings.GP) + linePrice );

			const itemSellTaxBank = this.client.settings.get( ClientSettings.EconomyStats.ItemSellTaxBank );
			const dividedAmount = (itemPrice * qty * 0.2) / 1000000;
			this.client.settings.update( ClientSettings.EconomyStats.ItemSellTaxBank, Math.floor( itemSellTaxBank + Math.round(dividedAmount * 100) / 100 ) );
			
			msg.author.log(`sold Quantity[${qty}] ItemID[${itemId}] for ${linePrice}`);
		}
		return msg.send( `Sold ${totalItems} items for ${totalPrice.toLocaleString()}gp (${Util.toKMB(totalPrice)})`);
	}
		
	async testItemFromList(msg: KlasaMessage, [name, qty]: [string, number | undefined]) {
		const osItem = getOSItem(name);

		if (!itemIsTradeable(osItem.id)) { throw `That item isn't tradeable.`; }
		
		const numItemsHas = await msg.author.numberOfItemInBank(osItem.id);
		if (numItemsHas === 0) { throw `You don't have any of this item to sell!`; }
		if (!qty) { qty = numItemsHas; }
		if (qty > numItemsHas) { throw `You dont have ${qty}x ${osItem.name}.`; }

		const priceOfItem = await this.client.fetchItemPrice(osItem.id);
		
		return [osItem.name, qty, priceOfItem*qty, osItem.id];
	}
}
