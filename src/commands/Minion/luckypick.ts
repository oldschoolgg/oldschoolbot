import { MessageButton, MessageComponentInteraction, MessageOptions } from 'discord.js';
import { chunk, randArrItem, randInt, roll, shuffleArr, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateGPTrackSetting } from '../../lib/util';
import { logError } from '../../lib/util/logError';

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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{1000000,3000000000}>',
			cooldown: 5,
			altProtection: true,
			aliases: ['lp']
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		if (msg.author.isIronman) {
			return msg.channel.send("Ironmen can't gamble! Go pickpocket some men for GP.");
		}
		if (msg.flagArgs.simulate && !production) {
			let houseBalance = 0;
			let betQuantity = 10_000;

			const pickedButtonsMap: Record<string, number> = {};
			for (let i = 0; i < betQuantity; i++) {
				let betSize = randInt(1_000_000, 1_000_000_000);

				houseBalance += betSize;
				const buttons = getButtons();
				const pickedButton = randArrItem(buttons);
				!pickedButtonsMap[pickedButton.name]
					? (pickedButtonsMap[pickedButton.name] = 1)
					: pickedButtonsMap[pickedButton.name]++;
				houseBalance -= pickedButton.mod(betSize);
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
		function getCurrentButtons({ showTrueNames }: { showTrueNames: boolean }): MessageOptions['components'] {
			let chunkedButtons = chunk(buttonsToShow, 5);
			return chunkedButtons.map(c =>
				c.map(b => {
					let button = new MessageButton()
						.setLabel(showTrueNames ? b.name : '')
						.setCustomID(b.id.toString())
						.setStyle(b.picked ? (b.name !== '0' ? 'SUCCESS' : 'DANGER') : 'SECONDARY');
					if (!showTrueNames) {
						button.setEmoji('680783258488799277');
					}
					if (b.name === '10x' && !b.picked && showTrueNames) {
						button.setStyle('PRIMARY');
					}
					return button;
				})
			);
		}

		const sentMessage = await msg.channel.send({
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
			let amountReceived = button.mod(amount);
			await msg.author.addGP(amountReceived);
			await updateGPTrackSetting(
				this.client,
				ClientSettings.EconomyStats.GPSourceLuckyPick,
				amountReceived - amount
			);
			await updateGPTrackSetting(msg.author, UserSettings.GPLuckyPick, amountReceived - amount);

			await interaction.update({ components: getCurrentButtons({ showTrueNames: true }) });
			return sentMessage.channel.send(
				amountReceived === 0
					? 'Unlucky, you picked the wrong button and lost your bet!'
					: `You won ${toKMB(amountReceived)}!`
			);
		};

		const collector = sentMessage!.createMessageComponentInteractionCollector({
			time: Time.Second * 10,
			filter: i => i.user.id === msg.author.id
		});

		collector.on('collect', async interaction => {
			const pickedButton = buttonsToShow.find(b => b.id.toString() === interaction.customID)!;
			buttonsToShow[pickedButton.id].picked = true;
			collector.stop('PICKED');
			try {
				await finalize({ button: pickedButton, interaction });
			} catch (err) {
				logError(err);
			}
		});

		collector.on('end', async () => {
			if (collector.endReason === 'PICKED') return;
			if (!buttonsToShow.some(b => b.picked)) {
				await msg.author.addGP(amount);
				await msg.channel.send(
					`You didn't pick any buttons in time, so you were refunded ${toKMB(amount)} GP.`
				);
			}
		});
	}
}
