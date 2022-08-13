import { MessageActionRow, MessageButton } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { CLIENT_ID } from '../../config';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { Emoji, lastTripCache, PerkTier } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { makeDoClueButton, makeRepeatTripButton } from '../../lib/util/globalInteractions';
import { getItemContractDetails } from '../../mahoji/commands/ic';
import { spawnLampIsReady } from '../../mahoji/commands/tools';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { isUsersDailyReady } from '../../mahoji/lib/abstracted_commands/dailyCommand';
import { canRunAutoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';

const subCommands = ['buy', 'pat', 'info'];

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

	async run(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			return {
				content:
					"You haven't bought a minion yet! Click the button below to buy a minion and start playing the bot.",
				components: new MessageActionRow().addComponents([
					new MessageButton().setCustomID('BUY_MINION').setLabel('Buy Minion').setEmoji('778418736180494347')
				])
			};
		}

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

		const mahojiUser = await mahojiUsersSettingsFetch(msg.author.id);
		const [spawnLampReady] = spawnLampIsReady(mahojiUser, msg.channel.id);
		if (spawnLampReady) {
			extraButtons.push(
				new MessageButton()
					.setLabel('Spawn Lamp')
					.setEmoji('988325171498721290')
					.setCustomID('SPAWN_LAMP')
					.setStyle('SECONDARY')
			);
		}

		const icDetails = getItemContractDetails(mahojiUser);
		if (msg.author.perkTier >= PerkTier.Two && icDetails.currentItem && icDetails.owns) {
			extraButtons.push(
				new MessageButton()
					.setLabel(`IC: ${icDetails.currentItem.name.slice(0, 20)}`)
					.setEmoji('988422348434718812')
					.setCustomID('ITEM_CONTRACT_SEND')
					.setStyle('SECONDARY')
			);
		}

		const bank = msg.author.bank();

		if (!msg.author.minionIsBusy) {
			for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
				.reverse()
				.slice(0, 3)) {
				extraButtons.push(makeDoClueButton(tier));
			}
		}

		return msg.channel.send({
			content: `${msg.author.minionStatus}
*This command will be removed soon, switch to \`/minion\`,  \`/m\`, or just tag the bot to see the buttons (<@${CLIENT_ID}>)*`,
			components: chunk(extraButtons, 5)
		});
	}

	async info(msg: KlasaMessage) {
		return msg.channel.send('This command is now `/minion info`');
	}

	async buy(msg: KlasaMessage) {
		return msg.channel.send('This command is now `/minion buy`');
	}
}
