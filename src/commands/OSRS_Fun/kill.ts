import { KlasaMessage, Command, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { toTitleCase } from '../../lib/util';

import * as killWorkerFunction from '../../../data/new_monsters/utils/killWorkerFunction';
import { ItemBank } from 'oldschooljs/dist/meta/types';

export default class extends Command {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 1,
			description: 'Simulate killing bosses (shows only rare drops).',
			usage: '<quantity:int{1}> <BossName:...str>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, bossName]: [number, string]) {
		//@ts-ignore
		const result: ItemBank = await killWorkerFunction(quantity, bossName);
		if (typeof result === 'string') {
			return msg.send(result);
		}

		const image = await this.client.tasks
			.get('bankImage')
			.generateBankImage(
				result,
				`Loot from ${quantity} ${toTitleCase(bossName)}`,
				true,
				msg.flagArgs
			);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
