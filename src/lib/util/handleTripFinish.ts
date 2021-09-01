import { Message, MessageAttachment, MessageCollector, MessageOptions, TextChannel } from 'discord.js';
import { roll, Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Openables } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { Activity, BitField, COINS_ID, Emoji, lastTripCache, PerkTier } from '../constants';
import { Offerables } from '../data/offerData';
import { handlePassiveImplings } from '../implings';
import ClueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { ClientSettings } from '../settings/types/ClientSettings';
import { UserSettings } from '../settings/types/UserSettings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, stringMatches, updateGPTrackSetting } from '../util';
import { customMessageComponents } from './customMessageComponents';
import getUsersPerkTier from './getUsersPerkTier';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource = [
	Activity.GroupMonsterKilling,
	Activity.MonsterKilling,
	Activity.Raids,
	Activity.ClueCompletion
];

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue: undefined | ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: ItemBank | null
) {
	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);

	if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
		const GP = loot[COINS_ID];
		if (typeof GP === 'number') {
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourcePVMLoot, GP);
		}
	}

	const imp = handlePassiveImplings(user, data);

	const attachable = attachment
		? attachment instanceof MessageAttachment
			? attachment
			: new MessageAttachment(attachment)
		: undefined;

	const channel = client.channels.cache.get(channelID);

	const options: MessageOptions = {
		content: message
	};

	if (attachable) options.files = [attachable];
	const components = new customMessageComponents().setClient(client);
	const lootClueScrolls = new Bank();
	const lootClueChests = new Bank();
	let newSlayerTask = options.content?.includes('return to a Slayer master.');

	if (loot) {
		// Scrolls
		ClueTiers.filter(tier => loot[tier.scrollID]).forEach(tier =>
			lootClueScrolls.add(tier.scrollID, loot[tier.scrollID])
		);
		// Caskets (when doing clues)
		ClueTiers.filter(tier => loot[tier.id]).forEach(tier => lootClueChests.add(tier.id, loot[tier.id]));
	}

	// Imp message
	if (imp) {
		if (imp.bank.length > 0) {
			const many = imp.bank.length > 1;
			options.content += `\n\nYour minion caught ${many ? 'some' : 'an'} impling${
				many ? 's' : ''
			}, you received: ${imp.bank}.`;
			await user.addItemsToBank(imp.bank, true);
		}

		if (imp.missed.length > 0) {
			options.content += `\n\nYou missed out on these implings, because your hunter level is too low: ${imp.missed}.`;
		}
	}

	// If Patreon
	if (perkTier >= PerkTier.One) {
		components.setOptions({ time: Time.Minute * 10 });
		if (onContinue) {
			components.addButton({
				label: 'Continue trip',
				style: 'PRIMARY',
				customID: 'continueTrip',
				onClick: msg =>
					onContinue(msg).catch(err => {
						msg.channel.send(err);
					}),
				messageCharacter: 'y'
			});
		}
		if (lootClueScrolls.items().length > 0) {
			let tripChars = ['c', 'v', 'n', 'm', 'x', 'z', 'a'];
			let j = 0;
			lootClueScrolls.forEach(i => {
				const clueTier = ClueTiers.find(c => c.scrollID === i.id);
				if (clueTier) {
					components.addButton({
						label: `${clueTier.name} clue`,
						style: 'SECONDARY',
						customID: `clueID_${i.id}`,
						onClick: msg =>
							(client.commands.get('minion') as unknown as MinionCommand).clue(msg, [
								lootClueScrolls.amount(clueTier.scrollID),
								clueTier.name
							]),
						messageCharacter: tripChars[j] ?? undefined
					});
					j++;
				}
			});
		}
		if (lootClueChests.items().length > 0) {
			let tripChars = ['o', 'p', 'e', 'n', 'h', 'l', 'u'];
			let j = 0;
			lootClueChests.forEach(i => {
				const clueTier = ClueTiers.find(c => c.id === i.id);
				if (clueTier) {
					components.addButton({
						label: `Open ${clueTier.name.toLowerCase()} casket`,
						style: 'SECONDARY',
						customID: `clueID_${i.id}`,
						onClick: msg =>
							client.commands.get('open')!.run(msg, [lootClueChests.amount(clueTier.id), clueTier.name]),
						messageCharacter: tripChars[j] ?? undefined
					});
					j++;
				}
			});
		}
		// Check for offer custom items (Unsired, Chewed bones, etc)
		for (const offerable of Offerables) {
			if (loot && loot[offerable.itemID]) {
				components.addButton({
					label: `Offer ${offerable.name.toLowerCase()}`,
					style: 'SECONDARY',
					customID: `offer${offerable.itemID}`,
					onClick: msg =>
						client.commands.get('offer')!.run(msg, [loot[offerable.itemID], offerable.name.toLowerCase()])
				});
			}
		}
		// Only show slayer button if the user has a slayer master saved
		if (newSlayerTask && user.settings.get(UserSettings.Slayer.RememberSlayerMaster)) {
			components.addButton({
				label: 'New Slayer Task',
				style: 'PRIMARY',
				customID: 'newSlayerTask',
				emoji: Emoji.Slayer,
				onClick: msg => client.commands.get('slayertask')!.run(msg, [undefined]),
				messageCharacter: 'y'
			});
		}
		if (imp && imp.bank.length > 0) {
			imp.bank.forEach(i => {
				const impOpenable = Openables.find(c => c.id === i.id);
				if (impOpenable) {
					components.addButton({
						label: `Loot ${imp.bank.amount(i.id)}x ${impOpenable.name}`,
						style: 'SECONDARY',
						customID: `imp_${i.id}`,
						removeAfterClick: true,
						onClick: msg =>
							client.commands
								.get('open')!
								.run(msg, [imp.bank.amount(i.id), impOpenable.aliases[0] ?? impOpenable.name]),
						messageCharacter: `i${impOpenable.aliases[0]
							.split(' ')
							.map(s => s[0])
							.join('')}`
					});
				}
			});
		}
	} else {
		if (onContinue) {
			options.content += `\nSay \`${continuationChar}\` to repeat this trip.`;
		}
		if (lootClueScrolls.items().length > 0) {
			const command: string[] = [];
			lootClueScrolls.items().forEach(i => {
				const clueTier = ClueTiers.find(c => c.scrollID === i[0].id);
				if (clueTier) {
					command.push(`\`+m clue ${clueTier.name.toLowerCase()}\``);
				}
			});
			options.content += `\nYou received a clue scroll on your loot! To do this clue, do ${command.join(' or ')}`;
		}
		if (lootClueChests.items().length > 0) {
			const command: string[] = [];
			lootClueChests.items().forEach(i => {
				const clueTier = ClueTiers.find(c => c.id === i[0].id);
				if (clueTier) {
					command.push(`\`+open ${clueTier.name.toLowerCase()}\``);
				}
			});
			options.content += `\nTo open this clue casket, do ${command.join(' or ')}`;
		}
		// Check for offer custom items (Unsired, Chewed bones, etc)
		for (const offerable of Offerables) {
			if (loot && loot[offerable.itemID]) {
				options.content += `\n\n**You received ${loot[offerable.itemID]}x ${
					offerable.name
				}!** You can offer it for loot using \`+offer ${offerable.name.toLowerCase()}\`.`;
			}
		}
	}

	await sendToChannelID(client, channelID, options, user, components).then(() => {
		const minutes = Math.min(30, data.duration / Time.Minute);
		const randomEventChance = 60 - minutes;
		if (
			channel &&
			!user.bitfield.includes(BitField.DisabledRandomEvents) &&
			roll(randomEventChance) &&
			channel instanceof TextChannel
		) {
			triggerRandomEvent(channel, user);
		}
	});

	if (onContinue) lastTripCache.set(user.id, { data, continue: onContinue });

	if (perkTier < PerkTier.One) {
		if (!onContinue) return;
		const existingCollector = collectors.get(user.id);
		if (existingCollector) {
			existingCollector.stop();
			collectors.delete(user.id);
		}
		if (!channelIsSendable(channel)) return;
		const collector = new MessageCollector(channel, {
			filter: (mes: Message) => mes.author === user && stringMatches(mes.content, continuationChar),
			time: Time.Minute * 2,
			max: 1
		});
		collectors.set(user.id, collector);
		collector.on('collect', async (mes: KlasaMessage) => {
			if (user.minionIsBusy || client.oneCommandAtATimeCache.has(mes.author.id)) {
				collector.stop();
				collectors.delete(user.id);
				return;
			}
			client.oneCommandAtATimeCache.add(mes.author.id);
			try {
				if (onContinue && stringMatches(mes.content, continuationChar)) {
					await onContinue(mes).catch(err => {
						channel.send(err);
					});
				}
			} catch (err) {
				console.log({ err });
				channel.send(err);
			} finally {
				setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
			}
		});
	}
}
