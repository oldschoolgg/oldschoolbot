import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { cryptoRng } from '@oldschoolgg/rng/crypto';
import { Bank, toKMB } from 'oldschooljs';
import { chunk } from 'remeda';

import { EmojiId } from '@/lib/data/emojis.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

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
interface Button {
	name: string;
	mod: (qty: number) => number;
	emoji?: string;
}

interface ButtonInstance extends Button {
	id: string;
	picked: boolean;
}
function getCurrentButtons({
	showTrueNames,
	buttons,
	pickedButtonId
}: {
	pickedButtonId: string | null;
	buttons: ButtonInstance[];
	showTrueNames: boolean;
}) {
	const chunkedButtons = chunk(buttons, 5);
	return chunkedButtons.map(c =>
		c.map(b => {
			const button = new ButtonBuilder()

				.setCustomId(b.id.toString())
				.setStyle(
					pickedButtonId === b.id
						? b.name !== '0'
							? ButtonStyle.Success
							: ButtonStyle.Danger
						: ButtonStyle.Secondary
				);

			if (showTrueNames) {
				button.setLabel(b.name);
			}
			if (!showTrueNames) {
				button.setEmoji({ id: EmojiId.MysteryBox });
			}
			if (b.name === '10x' && !b.picked && showTrueNames) {
				button.setStyle(ButtonStyle.Primary);
			}
			return button;
		})
	);
}

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

	buttonsToShow.push(cryptoRng.roll(10) ? '10x' : '0');
	buttonsToShow.push(cryptoRng.roll(10) ? '5x' : '0');
	return cryptoRng.shuffle(buttonsToShow.map(n => buttons.find(i => i.name === n)!)).map((item, index) => ({
		...item,
		picked: false,
		id: `LP_${index}`
	}));
}

export async function luckyPickCommand(user: MUser, luckypickamount: string, interaction: MInteraction) {
	const amount = mahojiParseNumber({ input: luckypickamount, min: 1_000_000, max: 10_000_000_000 });

	if (!amount) {
		return 'amount must be between 1,000,000 and 3,000,000,000 exclusively.';
	}

	if (user.isIronman) {
		return "Ironmen can't gamble! Go pickpocket some men for GP.";
	}

	await interaction.confirmation(
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.`
	);

	await user.sync();
	const currentBalance = user.GP;
	if (currentBalance < amount) {
		return "You don't have enough GP to make this bet.";
	}
	await user.removeItemsFromBank(new Bank().add('Coins', amount));

	const buttons = getButtons();
	await interaction.reply({
		content: `${user}, Pick *one* button!`,
		components: getCurrentButtons({ showTrueNames: false, pickedButtonId: null, buttons: getButtons() })
	});

	const selectionResult = await globalClient.pickStringWithButtons({
		interaction,
		options: buttons.map(_b => ({ label: '', id: _b.id, emoji: EmojiId.MysteryBox })),
		content: `${user}, Pick *one* button!`
	});
	if (!selectionResult) {
		await user.addItemsToBank({ items: new Bank().add('Coins', amount) });
		return `You didn't pick any buttons in time, so you were refunded ${toKMB(amount)} GP.`;
	}

	const pickedButton = buttons.find(b => b.id === selectionResult.choice.id)!;
	const amountReceived = Math.floor(pickedButton.mod(amount));
	if (amountReceived > 0) {
		await user.addItemsToBank({ items: new Bank().add('Coins', amountReceived) });
	}
	await ClientSettings.updateClientGPTrackSetting('gp_luckypick', amountReceived - amount);
	await user.updateGPTrackSetting('gp_luckypick', amountReceived - amount);
	const content =
		amountReceived === 0
			? `${user} picked the wrong button and lost ${toKMB(amount)}!`
			: `${user} won ${toKMB(amountReceived)}!`;
	return {
		content,
		components: getCurrentButtons({ showTrueNames: true, pickedButtonId: pickedButton.id, buttons })
	};
}
