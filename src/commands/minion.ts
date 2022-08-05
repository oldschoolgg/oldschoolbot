import { MessageButton } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { ClueTiers } from '../lib/clues/clueTiers';
import { Emoji, lastTripCache } from '../lib/constants';
import { requiresMinion } from '../lib/minions/decorators';
import { runCommand } from '../lib/settings/settings';
import { BotCommand } from '../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse } from '../lib/util';
import { makeDoClueButton, makeRepeatTripButton } from '../lib/util/globalInteractions';
import { calculateBirdhouseDetails } from '../mahoji/lib/abstracted_commands/birdhousesCommand';
import { isUsersDailyReady } from '../mahoji/lib/abstracted_commands/dailyCommand';
import { canRunAutoContract } from '../mahoji/lib/abstracted_commands/farmingContractCommand';
import { minionBuyCommand } from '../mahoji/lib/abstracted_commands/minionBuyCommand';
import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';

const subCommands = ['buy', 'pat', 'info', 'blowpipe', 'bp'];

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			aliases: ['m'],
			usage: `[${subCommands.join('|')}] [quantity:int{1}|name:...string] [name:...string] [name:...string]`,
			usageDelim: ' ',
			subcommands: true,
			requiredPermissionsForBot: ['EMBED_LINKS']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const birdhouseDetails = await calculateBirdhouseDetails(msg.author.id);

		const extraButtons: MessageButton[] = [];

		const dailyIsReady = isUsersDailyReady(msg.author);
		if (dailyIsReady.isReady) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Claim Daily')
					.setEmoji(Emoji.MoneyBag)
					.setCustomID('CLAIM_DAILY')
					.setStyle('SECONDARY')
			);
		}

		if (msg.author.minionIsBusy) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Cancel Trip')
					.setEmoji(Emoji.Minion)
					.setCustomID('CANCEL_TRIP')
					.setStyle('SECONDARY')
			);
		}

		if (!msg.author.minionIsBusy) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Auto Slay')
					.setEmoji(Emoji.Slayer)
					.setCustomID('AUTO_SLAY')
					.setStyle('SECONDARY')
			);
		}

		extraButtons.push(
			new MessageButton()
				.setLabel('Check Patches')
				.setEmoji(Emoji.Stopwatch)
				.setCustomID('CHECK_PATCHES')
				.setStyle('SECONDARY')
		);

		if (!msg.author.minionIsBusy && birdhouseDetails.isReady) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Birdhouse Run')
					.setEmoji('692946556399124520')
					.setCustomID('DO_BIRDHOUSE_RUN')
					.setStyle('SECONDARY')
			);
		}

		if (!msg.author.minionIsBusy && (await canRunAutoContract(msg.author.id))) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Auto Farming Contract')
					.setEmoji('977410792754413668')
					.setCustomID('AUTO_FARMING_CONTRACT')
					.setStyle('SECONDARY')
			);
		}

		const lastTrip = lastTripCache.get(msg.author.id);
		if (lastTrip && !msg.author.minionIsBusy) {
			extraButtons.push(makeRepeatTripButton());
		}

		const bank = msg.author.bank();

		if (!msg.author.minionIsBusy) {
			for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
				.reverse()
				.slice(0, 3)) {
				extraButtons.push(makeDoClueButton(tier));
			}
		}

		return msg.channel.send({ content: msg.author.minionStatus, components: chunk(extraButtons, 5) });
	}

	async bp(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/minion blowpipe`');
	}

	async blowpipe(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/minion blowpipe`');
	}

	async info(msg: KlasaMessage) {
		return runCommand({
			commandName: 'rp',
			args: ['c', msg.author],
			bypassInhibitors: true,
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member
		});
	}

	async pat(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion pat`');
	}

	async buy(msg: KlasaMessage) {
		return msg.channel.send(
			convertMahojiResponseToDJSResponse(
				await minionBuyCommand(await mahojiUsersSettingsFetch(msg.author.id), false)
			)
		);
	}
}
