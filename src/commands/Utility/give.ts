import { KlasaClient, CommandStore, KlasaUser, KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';
import { Events } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';

const options = {
    max: 1,
    time: 10000,
    errors: ['time']
};

const specialUntradeables = [995];

export default class extends BotCommand {
    public constructor(
        client: KlasaClient,
        store: CommandStore,
        file: string[],
        directory: string
    ) {
        super(client, store, file, directory, {
            usage: '<user:user> <amount:int{1}> <itemname:...string>',
            usageDelim: ' ',
            oneAtTime: true,
            cooldown: 5,
            altProtection: true
        });
    }

    async run(msg: KlasaMessage, [user, quantity, itemName]: [KlasaUser, number, string]) {
        await msg.author.settings.sync(true);
        let re = /’/gi;
        const osItem = Items.get(itemName.replace(re, "'"));
        if (user.id === msg.author.id) throw `You can't send items to yourself.`;
        if (user.bot) throw `You can't send items to a bot.`;
        if (!osItem) throw `That item doesnt exist.`;
        if (
            specialUntradeables.includes(osItem.id) ||
            !('tradeable' in osItem) ||
            !osItem.tradeable
        ) {
            throw `That item isn't tradeable.`;
        }

        const hasItem = await msg.author.hasItem(osItem.id, quantity);
        if (!hasItem) {
            throw `You dont have ${quantity}x ${osItem.name}.`;
        }

        const giveMsg = await msg.channel.send(
            `${msg.author}, say \`give\` to send ${quantity} ${
            osItem.name
            } to ${user.sanitizedName}).`
        );
        try {
            const collected = await msg.channel.awaitMessages(
                _msg =>
                    _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'give',
                options
            );
            if (!collected || !collected.first()) {
                throw "This shouldn't be possible...";
            }
        } catch (err) {
            return giveMsg.edit(`Cancelling trade of ${quantity}x ${osItem.name}.`);
        }
        await msg.author.removeItemFromBank(osItem.id, quantity);
        await user.addItemsToBank({ [osItem.id]: quantity }, false);

        msg.author.log(`gave Quantity[${quantity}] ItemID[${osItem.id}] to ${user.sanitizedName}`);

        this.client.emit(
            Events.Log,
            `${msg.author.sanitizedName} sent ItemID[${osItem.id}] to ${user.sanitizedName}`
        );
        return msg.send(`You sent ${quantity}x ${osItem.name} to ${user}.`);
    }
}
