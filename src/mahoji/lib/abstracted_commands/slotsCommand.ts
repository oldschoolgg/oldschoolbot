import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { cryptoRng } from '@oldschoolgg/rng/crypto';
import { Bank, toKMB } from 'oldschooljs';
import { chunk } from 'remeda';

import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

interface Button {
	name: string;
	emoji: string;
	mod: (qty: number) => number;
}

interface ButtonInstance extends Button {
	id: string;
}

const buttonsData: Button[] = [
	{
		name: 'Scroll',
		mod: (qty: number) => qty * 2,
		emoji: '403018312906309632'
	},
	{
		name: 'Dinhs',
		mod: (qty: number) => qty * 3,
		emoji: '403018312960835595'
	},
	{
		name: 'DClaws',
		mod: (qty: number) => qty * 5,
		emoji: '403018313124282368'
	},
	{
		name: 'TBow',
		mod: (qty: number) => qty * 15,
		emoji: '403018312402862081'
	}
];

const buttonTable = new SimpleTable<Button>()
	.add(buttonsData[0], 80)
	.add(buttonsData[1], 50)
	.add(buttonsData[2], 50)
	.add(buttonsData[3], 30);

function generateColumn() {
	const column: ButtonInstance[] = [];
	while (column.length < 3) {
		const button = buttonTable.rollOrThrow();
		if (column.some(i => i.name === button.name)) continue;
		column.push({ ...button, id: cryptoRng.randInt(1, 999_999_999).toString() });
	}
	return cryptoRng.shuffle(column);
}

function getButtons(): ButtonInstance[] {
	const columns = [1, 2, 3].map(() => generateColumn());
	const buttons: ButtonInstance[] = [];
	for (let i = 0; i < 3; i++) {
		buttons.push(columns[0][i]);
		buttons.push(columns[1][i]);
		buttons.push(columns[2][i]);
	}

	return buttons;
}

function determineWinnings(bet: number, buttons: ButtonInstance[]) {
	const winningRow = chunk(buttons, 3)
		.filter(row => row.every(b => b.name === row[0].name))
		.sort((a, b) => b[0].mod(bet) - a[0].mod(bet))[0];
	const amountReceived = winningRow ? winningRow[0].mod(bet) : 0;
	return {
		amountReceived,
		winningRow
	};
}

export async function slotsCommand(
	interaction: MInteraction,
	user: MUser,
	_amount: string | undefined
): CommandResponse {
	await interaction.defer();
	const amount = mahojiParseNumber({ input: _amount, min: 1 });
	if (user.isIronman) {
		return "Ironmen can't gamble! Go pickpocket some men for GP.";
	}
	if (!amount) {
		return `**Slots**
- Get 3 in a row horizontally to win! You must gamble between 20m and 1b.
- The bot will remove your bet from your balance, and then you will have a chance at receiving a multiple of your bet back, from 2x up to 15x.

${buttonsData.map(b => `${b.name}: ${b.mod(1)}x`).join('\n')}`;
	}

	if (amount < 20_000_000 || amount > 1_000_000_000) {
		return 'You can only gamble between 20m and 1b.';
	}

	await interaction.confirmation(
		`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.`
	);
	await user.sync();
	const currentBalance = user.GP;
	if (currentBalance < amount) {
		return "You don't have enough GP to make this bet.";
	}

	await user.transactItems({ itemsToRemove: new Bank().add('Coins', amount) });
	const buttonsToShow = getButtons();
	const chunkedButtons = chunk(buttonsToShow, 3);

	const { winningRow, amountReceived } = determineWinnings(amount, buttonsToShow);

	function getCurrentButtons({ columnsToHide }: { columnsToHide: number[] }) {
		return chunkedButtons.map(c =>
			c.map((b, index) => {
				const shouldShowThisButton = !columnsToHide.includes(index);
				const isWinning = columnsToHide.length === 0 && winningRow?.includes(b);
				return new ButtonBuilder()
					.setCustomId(b.id)
					.setStyle(
						!shouldShowThisButton
							? ButtonStyle.Secondary
							: isWinning
								? ButtonStyle.Success
								: ButtonStyle.Secondary
					)
					.setEmoji(shouldShowThisButton ? { id: b.emoji } : { name: '❓' });
			})
		);
	}

	await interaction.reply({
		content: 'Slots',
		components: getCurrentButtons({ columnsToHide: [0, 1, 2] })
	});

	await sleep(2000);

	const finishContent =
		amountReceived === 0
			? "Unlucky, you didn't win anything, and lost your bet!"
			: `You won ${toKMB(amountReceived)}!`;

	await user.transactItems({ itemsToAdd: new Bank().add('Coins', amountReceived), collectionLog: false });
	await ClientSettings.updateClientGPTrackSetting('gp_slots', amountReceived - amount);
	await user.updateGPTrackSetting('gp_slots', amountReceived - amount);

	return { content: finishContent, components: getCurrentButtons({ columnsToHide: [] }) };
}
