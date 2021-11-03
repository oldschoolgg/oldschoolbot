import { MessageButton, MessageOptions } from 'discord.js';
import { chunk, randInt, sleep } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';
import { toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateGPTrackSetting } from '../../lib/util';

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
		name: 'Scruffy',
		mod: (qty: number) => qty,
		emoji: '886284972221157526'
	},
	{
		name: 'Plopper',
		mod: (qty: number) => qty * 1.5,
		emoji: '886284972367945828'
	},
	{
		name: 'Peky',
		mod: (qty: number) => qty * 2,
		emoji: '886284972263084133'
	},
	{
		name: 'Wintertoad',
		mod: (qty: number) => qty * 3,
		emoji: '886284972141457439'
	},
	{
		name: 'Flappy',
		mod: (qty: number) => qty * 5,
		emoji: '884799334737129513'
	},
	{
		name: 'Smokey',
		mod: (qty: number) => qty * 10,
		emoji: '886284971914969149'
	}
];

const buttonTable = new SimpleTable<Button>()
	.add(buttonsData[0], 55)
	.add(buttonsData[1], 50)
	.add(buttonsData[2], 50)
	.add(buttonsData[3], 50)
	.add(buttonsData[4], 50)
	.add(buttonsData[5], 45);

function generateColumn() {
	const column: ButtonInstance[] = [];
	while (column.length < 3) {
		const button = buttonTable.roll().item;
		if (column.some(i => i.name === button.name)) continue;
		column.push({ ...button, id: randInt(1, 999_999_999).toString() });
	}
	return column;
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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{20000000,5000000000}>',
			oneAtTime: true,
			cooldown: 15,
			altProtection: true,
			aliases: ['lp']
		});
	}

	determineWinnings(bet: number, buttons: ButtonInstance[]) {
		const winningRow = chunk(buttons, 3).find(row => row.every(b => b.name === row[0].name));
		let amountReceived = winningRow ? winningRow[0].mod(bet) : 0;
		return {
			amountReceived,
			winningRow
		};
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		if (msg.author.isIronman) {
			return msg.channel.send("Ironmen can't gamble! Go pickpocket some men for GP.");
		}
		if (msg.flagArgs.simulate && !production) {
			let houseBalance = 0;
			let betQuantity = 10_000;

			for (let i = 0; i < betQuantity; i++) {
				let betSize = randInt(20_000_000, 5_000_000_000);
				houseBalance += betSize;
				const buttons = getButtons();
				const { amountReceived } = this.determineWinnings(betSize, buttons);
				houseBalance -= amountReceived;
			}
			return msg.channel.send(
				`With ${betQuantity} bets, the house ended up with ${toKMB(houseBalance)}. Average profit of ${toKMB(
					houseBalance / betQuantity
				)} per bet.`
			);
		}

		await msg.confirm(
			`Are you sure you want to gamble ${toKMB(amount)}? You might lose it all, you might win a lot.`
		);
		const currentBalance = msg.author.settings.get(UserSettings.GP);
		if (currentBalance < amount) {
			return msg.channel.send("You don't have enough GP to make this bet.");
		}
		await msg.author.removeGP(amount);
		const buttonsToShow = getButtons();
		let chunkedButtons = chunk(buttonsToShow, 3);

		const { winningRow, amountReceived } = this.determineWinnings(amount, buttonsToShow);

		function getCurrentButtons({ columnsToHide }: { columnsToHide: number[] }): MessageOptions['components'] {
			return chunkedButtons.map(c =>
				c.map((b, index) => {
					const shouldShowThisButton = !columnsToHide.includes(index);
					const isWinning = columnsToHide.length === 0 && winningRow?.includes(b);
					return new MessageButton()
						.setCustomID(b.id)
						.setStyle(!shouldShowThisButton ? 'SECONDARY' : isWinning ? 'SUCCESS' : 'SECONDARY')
						.setEmoji(shouldShowThisButton ? b.emoji : '❓');
				})
			);
		}

		const sentMessage = await msg.channel.send({
			content: 'Slots',
			components: getCurrentButtons({ columnsToHide: [0, 1, 2] })
		});
		await sleep(2000);
		sentMessage.edit({ content: 'Slots', components: getCurrentButtons({ columnsToHide: [1, 2] }) });
		await sleep(500);
		sentMessage.edit({ content: 'Slots', components: getCurrentButtons({ columnsToHide: [2] }) });
		await sleep(500);
		sentMessage.edit({ content: 'Slots', components: getCurrentButtons({ columnsToHide: [] }) });

		await msg.author.addGP(amountReceived);
		await updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceSlots, amountReceived - amount);
		await updateGPTrackSetting(msg.author, UserSettings.GPSlots, amountReceived - amount);

		return sentMessage.edit({
			content:
				amountReceived === 0
					? "Unlucky, you didn't win anything, and lost your bet!"
					: `You won ${toKMB(amountReceived)}!`,
			components: getCurrentButtons({ columnsToHide: [] })
		});
	}
}
