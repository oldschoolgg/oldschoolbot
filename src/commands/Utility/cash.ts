import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji } from '../../lib/constants';

export default class extends BotCommand {
    public constructor(
        client: KlasaClient,
        store: CommandStore,
        file: string[],
        directory: string
    ) {
        super(client, store, file, directory, {
            cooldown: 3,
            aliases: ['bal', 'gp'],
            description: 'Shows how much virtual GP you own.'
        });
    }

    async run(msg: KlasaMessage) {
        await msg.author.settings.sync(true);
        const coins: number = msg.author.settings.get('GP');
        
        if (coins === 0) {
			throw `You have no GP yet <:Sad:421822898316115969> You can get some GP by using the ${msg.cmdPrefix}daily command.`;
        }
        
        return msg.channel.send(`${Emoji.MoneyBag} You have ${coins.toLocaleString()} GP!`);
    }
}