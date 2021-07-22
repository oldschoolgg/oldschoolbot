import { MessageButton, MessageComponentInteraction, MessageOptions } from 'discord.js';
import { chunk, randArrItem, roll, shuffleArr, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import SimpleTable from '../../lib/structures/SimpleTable';
import { updateGPTrackSetting } from '../../lib/util';

interface Button {
	name: string;
	mod: (qty: number) => number;
	weight: number;
}

const buttons: Button[] = [
	{
		name: '0',
		mod: () => 0,
		weight: 45
	},
	{
		name: '1x',
		mod: (qty: number) => qty,
		weight: 12
	},
	{
		name: '2x',
		mod: (qty: number) => qty * 2,
		weight: 25
	},
	{
		name: '3x',
		mod: (qty: number) => qty * 3,
		weight: 12
	},
	{
		name: '5x',
		mod: (qty: number) => qty * 5,
		weight: 5
	},
	{
		name: '10x',
		mod: (qty: number) => qty * 10,
		weight: 3
	}
];

const table = new SimpleTable<Button>();
for (const button of buttons.slice(1)) {
	table.add(button, button.weight);
}
function getButtons(): ButtonInstance[] {
	let buttonsToShow = [buttons[0], buttons[0], buttons[0], buttons[0]];
	if (!roll(4)) {
		buttonsToShow.push(buttons[0]);
	}
	while (buttonsToShow.length < 8) {
		buttonsToShow.push(table.roll());
	}
	return shuffleArr(buttonsToShow).map((item, index) => ({ ...item, picked: false, id: index }));
}

interface ButtonInstance extends Button {
	id: number;
	picked: boolean;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{1000000,1000000000}>',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		if (msg.flagArgs.simulate) {
			let houseBalance = 0;
			let betQuantity = 500_000;
			let betSize = 5_000_000;

			const pickedButtonsMap: Record<string, number> = {};
			for (let i = 0; i < betQuantity; i++) {
				houseBalance += betSize;
				const buttons = getButtons();
				const pickedButton = randArrItem(buttons);
				!pickedButtonsMap[pickedButton.name]
					? (pickedButtonsMap[pickedButton.name] = 1)
					: pickedButtonsMap[pickedButton.name]++;
				houseBalance -= pickedButton.mod(betSize);
			}
			console.log(pickedButtonsMap);
			return msg.channel.send(
				`With ${betQuantity} ${toKMB(betSize)} bets, the house ended up with ${toKMB(houseBalance)}.`
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
			let chunkedButtons = chunk(buttonsToShow, 4);
			return chunkedButtons.map(c =>
				c.map(b =>
					new MessageButton()
						.setLabel(showTrueNames ? b.name : '???')
						.setCustomID(b.id.toString())
						.setStyle(b.picked ? (b.name !== '0' ? 'SUCCESS' : 'DANGER') : 'SECONDARY')
				)
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
			buttonsToShow[button.id].picked = true;
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
			const pickedButton = buttonsToShow.find(b => b.id.toString() === interaction.customID);
			if (!pickedButton) return;
			try {
				await finalize({ button: pickedButton, interaction });
			} catch (err) {
				console.error(err);
			}
			collector.stop('PICKED');
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
