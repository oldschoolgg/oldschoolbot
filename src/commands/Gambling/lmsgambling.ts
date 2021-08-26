import { MessageButton } from 'discord.js';
import { objectEntries, objectValues, sleep, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { toKMB } from '../../../.yalc/oldschooljs/dist/util';
import { Activity } from '../../lib/constants';
import { ironsCantUse, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { LmsGamblingActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import LastManStandingCommand, { channelsPlayingLms } from '../OSRS_Fun/LastManStanding';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[price:int{0,1000000000}] [minUsers:int{3,40}] [maxUsers:int{3,40}]',
			usageDelim: ' ',
			aliases: ['lmsg']
		});
	}

	@ironsCantUse
	@requiresMinion
	async run(msg: KlasaMessage, [price = 0, minUsers = 2, maxUsers = 40]: [number, number, number]) {
		if (msg.author.settings.get(UserSettings.GP) < price) {
			return msg.channel.send('You do not have enough GP to host this LMS.');
		}

		if (msg.flagArgs.min && !isNaN(Number(msg.flagArgs.min))) minUsers = Number(msg.flagArgs.min);
		if (msg.flagArgs.max && !isNaN(Number(msg.flagArgs.max))) maxUsers = Number(msg.flagArgs.max);

		if (channelsPlayingLms.has(msg.channel.id)) {
			return msg.channel.send(
				'There is a LMS going on on this channel at the moment. Try again in a few moments.'
			);
		}

		await msg.confirm(
			`Do you want to host a LMS ${price > 0 ? `with a fee of ${price.toLocaleString()} GP` : 'for free'}?`
		);

		channelsPlayingLms.add(msg.channel.id);

		let usersIn = [
			{ id: msg.author.id, name: `${msg.author.username}#${msg.author.discriminator}`, user: msg.author }
		];
		let started = false;

		let contentMsg = () => {
			const prize = usersIn.length * price;
			const str = `${msg.author} is hosting a Last Man Standing! The fee to enter is ${
				prize > 0 ? `${toKMB(price)} GP` : '**Free**'
			}! Press Join to enter!\n**Current users in:** ${usersIn.length}\n${usersIn
				.map(u => u.name)
				.join(', ')}\n\n**Total prize pool:** ${(prize > 0
				? toKMB(prize)
				: 'Free Entrance - No prize'
			).toLocaleString()}\n**Min. Users to Start:** ${minUsers}\n**Users to auto start:** ${maxUsers}`;
			return {
				content: str,
				components: [
					[
						new MessageButton({
							label: `Join (${price > 0 ? `Pay ${toKMB(price)} GP` : 'Free'})`,
							style: 'PRIMARY',
							customID: 'CONFIRM',
							emoji: '<:RSGP:369349580040437770>'
						}),
						new MessageButton({
							label: 'Force Start',
							style: 'SECONDARY',
							customID: 'START',
							disabled: usersIn.length < minUsers
						}),
						new MessageButton({
							label: 'Cancel / Leave',
							style: 'DANGER',
							customID: 'CANCEL'
						})
					]
				]
			};
		};

		const confirmMessage = await msg.channel.send(contentMsg());

		const collector = confirmMessage.createMessageComponentInteractionCollector({
			time: Time.Minute * 2,
			filter: i => {
				if (i.customID === 'CONFIRM') {
					if (usersIn.map(u => u.user).includes(i.user)) {
						i.reply({ ephemeral: true, content: 'You already joined this LMS.' });
						return false;
					}
					if (i.user.settings.get(UserSettings.GP) < price) {
						i.reply({
							ephemeral: true,
							content: `You do not have enough GP (${toKMB(
								price
							)} / ${price.toLocaleString()}) to join this LMS.`
						});
						return false;
					}
					if (i.user.isIronman) {
						i.reply({ ephemeral: true, content: "Ironman can't join this LMS." });
						return false;
					}
				}
				if (!usersIn.map(u => u.user).includes(i.user) && i.customID === 'CANCEL') {
					i.reply({ ephemeral: true, content: 'You can not leave what you never joined!' });
					return false;
				}
				if (i.user === msg.author && i.customID === 'START' && usersIn.length < minUsers) {
					i.reply({
						ephemeral: true,
						content: 'You can not start the LMS before the minimum amount of users is reached.'
					});
					return false;
				}
				return true;
			}
		});

		collector.on('collect', async interaction => {
			if (interaction.isButton()) {
				if (interaction.customID === 'CONFIRM') {
					usersIn.push({
						id: interaction.user.id,
						name: `${interaction.user.username}#${interaction.user.discriminator}`,
						user: interaction.user
					});
					if (usersIn.length < maxUsers) {
						await interaction.update(contentMsg());
					} else {
						started = true;
						collector.stop();
					}
				}
				if (interaction.customID === 'CANCEL') {
					if (interaction.user.id !== msg.author.id) {
						const userIndex = usersIn.findIndex(f => f.id === interaction.user.id);
						usersIn.splice(userIndex, 1);
						usersIn.filter(f => f);
						await interaction.update(contentMsg());
					} else {
						usersIn = [];
						started = false;
						collector.stop();
					}
				}
				if (interaction.customID === 'START' && usersIn.length >= minUsers) {
					started = true;
					collector.stop();
				}
			}
		});

		collector.on('end', async () => {
			let extraReason = '';
			if (started || usersIn.length >= minUsers) {
				for (const data of usersIn) {
					try {
						await data.user.removeGP(price);
					} catch (e) {
						const userIndex = usersIn.findIndex(f => f.id === data.id);
						usersIn.splice(userIndex, 1);
						extraReason += `\n${data.user} was removed because it does not have enough cash for the entrance fee.`;
					}
				}
				// Remove undefined
				usersIn.filter(f => f);
				if (usersIn.length < minUsers) {
					await Promise.all(usersIn.map(u => u.user.addGP(price)));
					started = false;
				}
			}

			if (started || usersIn.length >= minUsers) {
				await confirmMessage.edit({ components: [] });
				await msg.channel.send({
					content: `The LMS has started! Good luck!${extraReason ? `\n${extraReason}` : ''}`
				});

				const lmsCommand = this.client.commands.get('lastmanstanding') as unknown as LastManStandingCommand;
				const lmsGame = lmsCommand.playAsyncLms(new Set(usersIn.map(u => u.name)));
				const winner = await usersIn.find(f => f.name === lmsGame.winner)!.id;
				await addSubTaskToActivityTask<LmsGamblingActivityTaskOptions>({
					userID: msg.author.id,
					channelID: msg.channel.id,
					winner,
					users: usersIn.map(u => u.id),
					prize: price * usersIn.length,
					duration: addArrayOfNumbers(objectValues(lmsGame.messages).map(m => m.time)),
					type: Activity.LmsGambling
				});
				for (const [message, data] of objectEntries(lmsGame.messages)) {
					const gameMessage = await msg.channel.send(message);
					await sleep(data.time);
					gameMessage.delete();
				}
			} else {
				channelsPlayingLms.delete(msg.channel.id);
				await confirmMessage.edit({ components: [] });
				await msg.channel.send({ content: `The LMS failed to start.${extraReason ? `${extraReason}` : ''}` });
			}
		});
	}
}
