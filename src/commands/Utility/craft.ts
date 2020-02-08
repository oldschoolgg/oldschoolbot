import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import craftableItems from './craftableItems'
import { stringMatches } from '../../lib/util';
import { Items } from 'oldschooljs';
const options = {
    max: 1,
    time: 10000,
    errors: ['time']
};

var Name: Array<number> = [];
export default class extends BotCommand {
    public constructor(
        client: KlasaClient,
        store: CommandStore,
        file: string[],
        directory: string
    ) {
        super(client, store, file, directory, {
            cooldown: 1,
            usage: '<quantity:int{1}> <itemname:...string>',
            usageDelim: ' ',
            oneAtTime: true
        });
    }
    async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {

        const item = craftableItems.Items.find(
            item => stringMatches(item.outputItem, itemName) || stringMatches(item.outputItem.split(' ')[0], itemName)
        );

        if (!item) {
            throw `Thats not a valid item to craft. Valid items are ${craftableItems.Items.map(
                (item: { outputItem: any; }) => item.outputItem
            ).join(', ')}.`;
        }

        // main code //
        for (let t = 0; t <= item.inputItems.length; t++) {
            let osItem = Items.get(item.inputItems[t]);
            const hasItem = await msg.author.hasItem(osItem.id, quantity);
            if (!hasItem) {
                throw `You dont have all required items.`;
            }
        }
        const craftMsg = await msg.channel.send(
            `${msg.author}, say \`confirm\` to craft ${quantity} ${itemName}(s).`);
        try {
            const collected = await msg.channel.awaitMessages(
                _msg =>
                    _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
                options
            );
            if (!collected || !collected.first()) {
                throw "This shouldn't be possible...";
            }
        } catch (err) {
            return craftMsg.edit(`Cancelling craft of ${quantity}x ${itemName}(s).`);
        }
        for (let i = 1; i < Name.length; i++) {
            await msg.author.removeItemFromBank(Name[i], quantity);
        }
        await msg.author.addItemsToBank({ [Name[0]]: quantity }, false);
        msg.author.log(`crafted Quantity[${quantity}] ${itemName}(s)`);

        return msg.send(
            `Crafted ${quantity}x ${itemName}(s)`);
    }
}
