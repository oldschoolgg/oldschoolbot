import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';

const options = {
    max: 1,
    time: 10000,
    errors: ['time']
};

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
        let re = /’/gi;
        const osItem = Items.get(itemName.replace(re, "'"));
        if (!osItem) throw `That item doesnt exist.`;

        const hasItem = await msg.author.hasItem(osItem.id, quantity);
        if (!hasItem) {
            throw `You dont have ${quantity}x ${osItem.name}.`;
        }

        const dropMsg = await msg.channel.send(
            `${msg.author}, say \`drop\` to drop ${quantity} ${
            osItem.name
            }.`
        );

        try {
            const collected = await msg.channel.awaitMessages(
                _msg =>
                    _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'drop',
                options
            );
            if (!collected || !collected.first()) {
                throw "This shouldn't be possible...";
            }
        } catch (err) {
            return dropMsg.edit(`Cancelling drop of ${quantity}x ${osItem.name}.`);
        }

        await msg.author.removeItemFromBank(osItem.id, quantity);

        msg.author.log(`dropped Quantity[${quantity}] ItemID[${osItem.id}]`);

        return msg.send(
            `dropped ${quantity}x ${osItem.name})`
        );
    }
}
