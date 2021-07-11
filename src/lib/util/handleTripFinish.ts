import {
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageCollector,
	MessageOptions,
	TextChannel
} from 'discord.js';
import { roll, Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { Activity, BitField, COINS_ID, PerkTier } from '../constants';
import ClueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { ClientSettings } from '../settings/types/ClientSettings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, stringMatches, updateGPTrackSetting } from '../util';
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

	const lootClueScrolls = new Bank();
	const lootClueChests = new Bank();
	if (loot) {
		// Scrolls
		ClueTiers.filter(tier => loot[tier.scrollID]).forEach(tier =>
			lootClueScrolls.add(tier.scrollID, loot[tier.scrollID])
		);
		// Caskets (when doing clues)
		ClueTiers.filter(tier => loot[tier.id]).forEach(tier => lootClueChests.add(tier.id, loot[tier.id]));
	}
	const attachable = attachment
		? attachment instanceof MessageAttachment
			? attachment
			: new MessageAttachment(attachment)
		: undefined;
	//
	const channel = client.channels.cache.get(channelID);

	const options: MessageOptions = {
		content: message
	};

	if (attachable) {
		options.files = [attachable];
	}

	let componentsFunctions: Record<string, Function> = {};

	// If Patreon
	if (perkTier >= PerkTier.One) {
		if (onContinue || lootClueScrolls.items().length > 0 || lootClueChests.items().length > 0) {
			const messageComponents = new MessageActionRow();
			options.components = [messageComponents];

			if (onContinue) {
				messageComponents.components.push(
					new MessageButton({
						label: 'Continue trip',
						style: 'PRIMARY',
						customID: 'continueTrip'
					})
				);
				componentsFunctions.continueTrip = (msg: KlasaMessage) => {
					return onContinue(msg).catch(err => {
						msg.channel.send(err);
					});
				};
			}

			if (lootClueScrolls.items().length > 0) {
				lootClueScrolls.items().forEach(i => {
					const clueTier = ClueTiers.find(c => c.scrollID === i[0].id);
					if (clueTier) {
						messageComponents.components.push(
							new MessageButton({
								label: `${clueTier.name} clue`,
								style: 'SECONDARY',
								customID: `clueID_${i[0].id}`
							})
						);
						componentsFunctions[`clueID_${i[0].id}`] = (msg: KlasaMessage) => {
							return (client.commands.get('minion') as unknown as MinionCommand).clue(msg, [
								lootClueScrolls.amount(clueTier.scrollID),
								clueTier.name
							]);
						};
					}
				});
			}
			if (lootClueChests.items().length > 0) {
				lootClueChests.items().forEach(i => {
					const clueTier = ClueTiers.find(c => c.id === i[0].id);
					if (clueTier) {
						messageComponents.components.push(
							new MessageButton({
								label: `Open ${clueTier.name.toLowerCase()} casket`,
								style: 'SECONDARY',
								customID: `clueID_${i[0].id}`
							})
						);
						componentsFunctions[`clueID_${i[0].id}`] = (msg: KlasaMessage) => {
							return client.commands
								.get('open')!
								.run(msg, [lootClueChests.amount(clueTier.id), clueTier.name]);
						};
					}
				});
			}
			// Limit to 3 buttons per message
			messageComponents.components = messageComponents.components.slice(0, 3);
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
	}

	await sendToChannelID(client, channelID, options, user, componentsFunctions).then(() => {
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
				console.log(err);
				channel.send(err);
			} finally {
				setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
			}
		});
	}
}
