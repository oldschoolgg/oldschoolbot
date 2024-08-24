import type { BaseMessageOptions, ButtonInteraction, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, chunk, noOp, roll, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { SILENT_ERROR } from '../../../lib/constants';
import { awaitMessageComponentInteraction, channelIsSendable } from '../../../lib/util';
import { handleMahojiConfirmation, silentButtonAck } from '../../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { logError } from '../../../lib/util/logError';
import { mahojiParseNumber, updateClientGPTrackSetting, updateGPTrackSetting } from '../../mahojiSettings';

export async function luckyPickCommand(user: MUser, luckypickamount: string, interaction: ChatInputCommandInteraction) {
	const amount = mahojiParseNumber({ input: luckypickamount, min: 1_000_000, max: 3_000_000_000 });

	if (!amount) {
		return 'amount must be between 1000000 and 3000000000 exclusively.';
	}

	await deferInteraction(interaction);

	interface Button {
		name: string;
		mod: (qty: number) => number;
		emoji?: string;
	}

	const buttons: Button[] = [
		{
			name: '0',
			mod: () => 0
		},
		{
			name: '1.5x',
			mod: (qty: number) => qty * 1.5
		},
		{
			name: '2x',
			mod: (qty: number) => qty * 2
		},
		{
			name: '3x',
			mod: (qty: number) => qty * 3
		},
		{
			name: '5x',
			mod: (qty: number) => qty * 5
		},
		{
			name: '10x',
			mod: (qty: number) => qty * 10
		}
	];

	function getButtons(): ButtonInstance[] {
		const buttonsToShow = [
			'0',
			'0',
			'0',
			'2x',
			'1.5x',
			'0',
			'1.5x',
			'0',
			'1.5x',
			'1.5x',
			'2x',
			'0',
			'3x',
			'2x',
			'0',
			'0',
			'2x',
			'0'
		];

		buttonsToShow.push(roll(10) ? '10x' : '0');
		buttonsToShow.push(roll(10) ? '5x' : '0');
		return shuffleArr(buttonsToShow.map(n => buttons.find(i => i.name === n)!)).map((item, index) => ({
			...item,
			picked: false,
			id: `LP_${index}`
		}));
	}

	interface ButtonInstance extends Button {
		id: string;
		picked: boolean;
	}
	if (user.isIronman) {
		return "Ironmen can't gamble! Go pickpocket some men for GP.";
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.`
	);
	await user.sync();
	const currentBalance = user.GP;
	if (currentBalance < amount) {
		return "You don't have enough GP to make this bet.";
	}
	await user.removeItemsFromBank(new Bank().add('Coins', amount));
	const buttonsToShow = getButtons();
	function getCurrentButtons({ showTrueNames }: { showTrueNames: boolean }): BaseMessageOptions['components'] {
		const chunkedButtons = chunk(buttonsToShow, 5);
		return chunkedButtons.map(c =>
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				c.map(b => {
					const button = new ButtonBuilder()

						.setCustomId(b.id.toString())
						.setStyle(
							b.picked
								? b.name !== '0'
									? ButtonStyle.Success
									: ButtonStyle.Danger
								: ButtonStyle.Secondary
						);

					if (showTrueNames) {
						button.setLabel(b.name);
					}
					if (!showTrueNames) {
						button.setEmoji('680783258488799277');
					}
					if (b.name === '10x' && !b.picked && showTrueNames) {
						button.setStyle(ButtonStyle.Primary);
					}
					return button;
				})
			)
		);
	}

	const channel = globalClient.channels.cache.get(interaction.channelId);
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	const sentMessage = await channel.send({
		content: `${user}, Pick *one* button!`,
		components: getCurrentButtons({ showTrueNames: false })
	});

	const finalize = async ({
		button
	}: {
		button: ButtonInstance;
	}) => {
		const amountReceived = Math.floor(button.mod(amount));
		if (amountReceived > 0) {
			await user.addItemsToBank({ items: new Bank().add('Coins', amountReceived) });
		}
		await updateClientGPTrackSetting('gp_luckypick', amountReceived - amount);
		await updateGPTrackSetting('gp_luckypick', amountReceived - amount, user);
		await sentMessage.edit({ components: getCurrentButtons({ showTrueNames: true }) }).catch(noOp);
		return amountReceived === 0
			? `${user} picked the wrong button and lost ${toKMB(amount)}!`
			: `${user} won ${toKMB(amountReceived)}!`;
	};

	const cancel = async () => {
		await sentMessage.delete();
		if (!buttonsToShow.some(b => b.picked)) {
			await user.addItemsToBank({ items: new Bank().add('Coins', amount) });
			return `You didn't pick any buttons in time, so you were refunded ${toKMB(amount)} GP.`;
		}
		throw new Error(SILENT_ERROR);
	};

	try {
		const selection = await awaitMessageComponentInteraction({
			message: sentMessage,
			filter: i => {
				if (i.user.id !== (user.id ?? interaction.user.id).toString()) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 10
		});
		sentMessage.delete().catch(noOp);

		const pickedButton = buttonsToShow.find(b => b.id === selection.customId)!;
		const index = Number.parseInt(pickedButton.id.split('_')[1]);
		buttonsToShow[index].picked = true;

		try {
			await silentButtonAck(selection as ButtonInteraction<CacheType>);
			const result = await finalize({ button: pickedButton });
			return {
				content: result,
				components: getCurrentButtons({ showTrueNames: true })
			};
		} catch (err) {
			logError(err);
			return 'Error.';
		}
	} catch (err) {
		return cancel();
	}
}
