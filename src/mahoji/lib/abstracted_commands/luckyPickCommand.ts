import {
	ActionRowBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	MessageComponentInteraction
} from 'discord.js';
import { chunk, noOp, roll, shuffleArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { BitField, SILENT_ERROR } from '../../../lib/constants';
import { awaitMessageComponentInteraction, channelIsSendable } from '../../../lib/util';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { logError } from '../../../lib/util/logError';
import { mahojiParseNumber, updateClientGPTrackSetting, updateGPTrackSetting } from '../../mahojiSettings';

export async function luckyPickCommand(
	user: MUser,
	luckypickamount: string,
	interaction: ChatInputCommandInteraction
): Promise<string> {
	const amount = mahojiParseNumber({ input: luckypickamount, min: 1_000_000, max: 3_000_000_000 });

	if (!amount) {
		return 'amount must be between 1000000 and 3000000000 exclusively.';
	}

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
		// prettier-ignore
		let buttonsToShow = ['0', '0', '0',
		'2x', '1.5x', '0', '1.5x', '0',
		'1.5x', '1.5x', '2x', '0', '3x',
		'2x', '0', '0', '2x', '0'];

		buttonsToShow.push(roll(10) ? '10x' : '0');
		buttonsToShow.push(roll(10) ? '5x' : '0');
		return shuffleArr(buttonsToShow.map(n => buttons.find(i => i.name === n)!)).map((item, index) => ({
			...item,
			picked: false,
			id: index
		}));
	}

	interface ButtonInstance extends Button {
		id: number;
		picked: boolean;
	}
	if (user.isIronman) {
		return "Ironmen can't gamble! Go pickpocket some men for GP.";
	}
	if (user.bitfield.includes(BitField.SelfGamblingLocked)) {
		return 'You locked yourself from gambling!';
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
		let chunkedButtons = chunk(buttonsToShow, 5);
		return chunkedButtons.map(c =>
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				c.map(b => {
					let button = new ButtonBuilder()

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
		content: 'Pick *one* button!',
		components: getCurrentButtons({ showTrueNames: false })
	});

	const finalize = async ({
		button,
		interaction
	}: {
		button: ButtonInstance;
		interaction: MessageComponentInteraction;
	}) => {
		let amountReceived = Math.floor(button.mod(amount));
		await user.addItemsToBank({ items: new Bank().add('Coins', amountReceived) });
		await updateClientGPTrackSetting('gp_luckypick', amountReceived - amount);
		await updateGPTrackSetting('gp_luckypick', amountReceived - amount, user);

		await interaction.update({ components: getCurrentButtons({ showTrueNames: true }) }).catch(noOp);
		return amountReceived === 0
			? 'Unlucky, you picked the wrong button and lost your bet!'
			: `You won ${toKMB(amountReceived)}!`;
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

		const pickedButton = buttonsToShow.find(b => b.id.toString() === selection.customId)!;
		buttonsToShow[pickedButton.id].picked = true;

		try {
			const result = await finalize({ button: pickedButton, interaction: selection });
			return result;
		} catch (err) {
			logError(err);
			return 'Error.';
		}
	} catch (err) {
		return cancel();
	}
}
