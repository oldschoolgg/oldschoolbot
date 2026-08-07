import {
	ButtonBuilder,
	type ButtonMInteraction,
	ButtonStyle,
	createInteractionCollector,
	type SendableFile,
	type SendableMessage
} from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, toKMB } from 'oldschooljs';

import { drawHighRollerImage } from '@/lib/canvas/highRollerImage.js';
import { BitField } from '@/lib/constants.js';
import { marketPriceOrBotPrice } from '@/lib/marketPrices.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

type HighRollerPayoutMode = 'winner_takes_all' | 'top_three';

type RollResult = {
	user: MUser;
	item: Item;
	value: number;
};

type JoinMode = { type: 'invites'; inviteIDs: string[] } | { type: 'open' };

const MAX_PARTICIPANTS = 50;
const MIN_PARTICIPANTS = 2;
const MIN_TOP_THREE_PARTICIPANTS = 3;

const randomGambleItems: Item[] = [
	...Items.filter(item => item.tradeable === true && marketPriceOrBotPrice(item.id) >= 1).values()
];

function pickRandomItem(rng: RNGProvider): Item {
	if (randomGambleItems.length === 0) {
		throw new Error('No tradeable items available to roll.');
	}
	const index = rng.randInt(0, randomGambleItems.length - 1);
	return randomGambleItems[index]!;
}

export function calculatePayouts({
	pot,
	participantCount,
	mode
}: {
	pot: number;
	participantCount: number;
	mode: HighRollerPayoutMode;
}): number[] {
	if (mode === 'winner_takes_all') {
		return [pot];
	}
	const ratios = [0.6, 0.3, 0.1].slice(0, Math.min(participantCount, 3));
	const ratioTotal = ratios.reduce((acc, ratio) => acc + ratio, 0);
	if (ratioTotal === 0) {
		return [];
	}
	const payouts = ratios.map(ratio => Math.floor((ratio / ratioTotal) * pot));
	const distributed = payouts.reduce((acc, value) => acc + value, 0);
	const remainder = pot - distributed;
	if (payouts.length > 0 && remainder > 0) {
		payouts[0] += remainder;
	}
	return payouts;
}

export function generateUniqueRolls({
	count,
	rollFn
}: {
	count: number;
	rollFn: () => { item: Item; value: number };
}): { item: Item; value: number }[] {
	if (count <= 0) return [];
	const rolls: ({ item: Item; value: number } | null)[] = new Array(count).fill(null);
	let indicesToRoll = new Set<number>(Array.from({ length: count }, (_, idx) => idx));
	let safety = 0;
	while (indicesToRoll.size > 0) {
		safety++;
		if (safety > 1000) {
			throw new Error('Failed to resolve unique rolls after many attempts.');
		}
		for (const index of indicesToRoll) {
			rolls[index] = rollFn();
		}
		const byValue = new Map<number, number[]>();
		rolls.forEach((roll, idx) => {
			if (!roll) return;
			const list = byValue.get(roll.value) ?? [];
			list.push(idx);
			byValue.set(roll.value, list);
		});
		indicesToRoll = new Set();
		for (const [, indexes] of byValue) {
			if (indexes.length > 1) {
				for (const idx of indexes) {
					indicesToRoll.add(idx);
				}
			}
		}
	}
	return rolls.map(roll => roll!) as { item: Item; value: number }[];
}

async function safeEdit(interaction: MInteraction, options: SendableMessage) {
	if (!interaction.deferred && !interaction.replied) {
		return interaction.reply(options);
	}
	return interaction.baseEditReply(options);
}

async function collectDirectInvites({
	interaction,
	host,
	inviteIDs,
	stakeDisplay,
	payoutDescription
}: {
	interaction: MInteraction;
	host: MUser;
	inviteIDs: string[];
	stakeDisplay: string;
	payoutDescription: string;
}): Promise<string[] | null> {
	if (inviteIDs.length === 0) {
		return [host.id];
	}
	const uniqueInviteIDs = [...new Set(inviteIDs)];

	// Host always participates, so invites must leave room for host.
	const maxInvites = MAX_PARTICIPANTS - 1;

	if (uniqueInviteIDs.length > maxInvites) {
		await safeEdit(interaction, {
			content: `You can invite at most ${maxInvites} players (max ${MAX_PARTICIPANTS} including you).`,
			components: []
		});
		return null;
	}

	const mentionList = uniqueInviteIDs.map(id => `<@${id}>`).join(', ');
	const row: ButtonBuilder[] = [
		new ButtonBuilder().setCustomId('HR_CONFIRM').setLabel('Confirm').setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId('HR_DECLINE').setLabel('Decline').setStyle(ButtonStyle.Secondary)
	];
	await safeEdit(interaction, {
		content: `${host.badgedUsername} has challenged ${mentionList} to a High Roller Pot for **${stakeDisplay}** each (Payout: ${payoutDescription}). Click Confirm to join.`,
		components: row,
		allowedMentions: { users: uniqueInviteIDs }
	});
	const confirmed = new Set<string>();
	const declined = new Set<string>();
	const collector = createInteractionCollector({
		interaction,
		timeoutMs: Time.Second * 30,
		maxCollected: Infinity
	});
	return new Promise(resolve => {
		collector.on('collect', async (button: ButtonMInteraction) => {
			if (!uniqueInviteIDs.includes(button.userId)) {
				await button.reply({ content: `You weren't invited to this gamble.`, ephemeral: true });
				return;
			}
			if (button.customId === 'HR_DECLINE') {
				declined.add(button.userId);
				await button.silentButtonAck();
				collector.stop('declined');
				return;
			}
			if (confirmed.has(button.userId)) {
				await button.reply({ content: `You've already confirmed.`, ephemeral: true });
				return;
			}
			confirmed.add(button.userId);
			await button.silentButtonAck();
			await safeEdit(interaction, {
				content: `${host.badgedUsername} is waiting on confirmations... (${confirmed.size}/${uniqueInviteIDs.length} ready)\nPayout: ${payoutDescription}`,
				components: row,
				allowedMentions: { users: [] }
			});
			if (confirmed.size === uniqueInviteIDs.length) {
				collector.stop('confirmed');
			}
		});
		collector.on('end', async (_collected, reason) => {
			if (reason === 'confirmed') {
				await safeEdit(interaction, {
					content: `${host.badgedUsername}'s High Roller Pot is starting with ${uniqueInviteIDs.length + 1} participants.`,
					components: [],
					allowedMentions: { users: [] }
				});
				resolve([host.id, ...uniqueInviteIDs]);
				return;
			}
			const missing = uniqueInviteIDs.filter(id => !confirmed.has(id));
			const declinedMentions = [...declined, ...missing]
				.filter((value, index, array) => array.indexOf(value) === index)
				.map(id => `<@${id}>`);
			await safeEdit(interaction, {
				content: declinedMentions.length
					? `The gamble was cancelled because ${declinedMentions.join(', ')} didn't confirm in time.`
					: `The gamble was cancelled because not everyone confirmed in time.`,
				components: []
			});
			resolve(null);
		});
	});
}

async function collectOpenLobby({
	interaction,
	host,
	stake,
	stakeDisplay,
	payoutDescription
}: {
	interaction: MInteraction;
	host: MUser;
	stake: number;
	stakeDisplay: string;
	payoutDescription: string;
}): Promise<string[] | null> {
	const joined = new Set<string>([host.id]);
	const row: ButtonBuilder[] = [
		new ButtonBuilder().setCustomId('HR_JOIN').setLabel('Join gamble').setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId('HR_LEAVE').setLabel('Leave').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('HR_FORCE_START').setLabel('Force start').setStyle(ButtonStyle.Primary)
	];
	await safeEdit(interaction, {
		content: `${host.badgedUsername} opened a High Roller Pot for **${stakeDisplay}** each (Payout: ${payoutDescription}). Click Join to participate! (30s)`,
		components: row,
		allowedMentions: { users: [] }
	});

	const getParticipantListMessage = () =>
		`${host.badgedUsername}'s High Roller Pot (**${stakeDisplay}**)\nPayout: ${payoutDescription}\nParticipants (${joined.size}): ${[
			...joined
		]
			.map(id => `<@${id}>`)
			.join(', ')}`;

	const updateParticipantsMessage = async () =>
		safeEdit(interaction, {
			content: getParticipantListMessage(),
			components: row,
			allowedMentions: { users: [] }
		});

	const collector = createInteractionCollector({
		interaction,
		timeoutMs: Time.Second * 30,
		maxCollected: Infinity
	});

	return new Promise(resolve => {
		collector.on('collect', async (button: ButtonMInteraction) => {
			const mUser = await mUserFetch(button.userId);
			if (button.customId === 'HR_JOIN') {
				if (joined.has(mUser.id)) {
					await button.reply({ content: `You're already in this gamble.`, ephemeral: true });
					return;
				}
				if (joined.size >= MAX_PARTICIPANTS) {
					await button.reply({
						content: `This gamble already has ${MAX_PARTICIPANTS} participants.`,
						ephemeral: true
					});
					return;
				}
				if (mUser.bitfield.includes(BitField.SelfGamblingLocked)) {
					await button.reply({ content: `You have gambling disabled.`, ephemeral: true });
					return;
				}
				await mUser.sync();
				if (mUser.GP < stake) {
					await button.reply({ content: `You need ${toKMB(stake)} GP to join.`, ephemeral: true });
					return;
				}
				joined.add(mUser.id);
				await button.silentButtonAck();
				await updateParticipantsMessage();
				return;
			}

			if (button.customId === 'HR_FORCE_START') {
				if (button.userId !== host.id) {
					await button.reply({ content: `Only the host can force start this gamble.`, ephemeral: true });
					return;
				}
				if (joined.size < MIN_PARTICIPANTS) {
					await button.reply({
						content: `You need at least ${MIN_PARTICIPANTS} participants to start this gamble.`,
						ephemeral: true
					});
					return;
				}
				await button.silentButtonAck();
				collector.stop('force_start');
				return;
			}

			if (button.customId === 'HR_LEAVE') {
				if (mUser.id === host.id) {
					await button.reply({ content: `The host cannot leave this gamble.`, ephemeral: true });
					return;
				}
				if (!joined.has(mUser.id)) {
					await button.reply({ content: `You're not part of this gamble.`, ephemeral: true });
					return;
				}
				joined.delete(mUser.id);
				await button.silentButtonAck();
				await updateParticipantsMessage();
			}
		});

		collector.on('end', async (_collected, reason) => {
			const participants = [...joined];
			if (participants.length < MIN_PARTICIPANTS) {
				await safeEdit(interaction, {
					content: `Not enough participants joined the High Roller Pot.`,
					components: []
				});
				resolve(null);
				return;
			}

			if (reason === 'force_start') {
				await safeEdit(interaction, {
					content: `${host.badgedUsername} force-started the High Roller Pot with ${participants.length} participants.`,
					components: []
				});
			} else {
				await safeEdit(interaction, {
					content: `${host.badgedUsername}'s High Roller Pot is starting with ${participants.length} participants.`,
					components: [],
					allowedMentions: { users: [] }
				});
			}

			resolve(participants);
		});
	});
}

async function ensureParticipantsReady({
	participants,
	stake
}: {
	participants: MUser[];
	stake: number;
}): Promise<void> {
	const missingFunds: string[] = [];
	for (const participant of participants) {
		await participant.sync();
		if (participant.bitfield.includes(BitField.SelfGamblingLocked)) {
			throw new Error(`${participant.badgedUsername} has gambling disabled.`);
		}
		if (participant.GP < stake) {
			missingFunds.push(participant.badgedUsername);
		}
	}
	if (missingFunds.length > 0) {
		throw new Error(`${missingFunds.join(', ')} lacked the GP required to start the gamble.`);
	}
}

async function payoutWinners({
	interaction,
	sortedResults,
	stake,
	mode
}: {
	interaction: MInteraction;
	sortedResults: RollResult[];
	stake: number;
	mode: HighRollerPayoutMode;
}) {
	const participantCount = sortedResults.length;
	const pot = stake * participantCount;
	const payouts = calculatePayouts({ pot, participantCount, mode });
	const payoutsMessages: string[] = [];

	const potAccount = BigInt(0);

	await prisma.economyTransaction.createMany({
		data: sortedResults.map(result => ({
			guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
			sender: BigInt(result.user.id),
			recipient: potAccount,
			type: 'duel',
			items_sent: new Bank().add('Coins', stake).toJSON(),
			items_received: undefined
		}))
	});

	for (const [index, amount] of payouts.entries()) {
		const winner = sortedResults[index];
		if (!winner || amount <= 0) continue;
		await winner.user.addItemsToBank({ items: new Bank().add('Coins', amount) });
		await prisma.economyTransaction.create({
			data: {
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
				sender: potAccount,
				recipient: BigInt(winner.user.id),
				type: 'duel',
				items_sent: new Bank().add('Coins', amount).toJSON(),
				items_received: undefined
			}
		});
		payoutsMessages.push(`🏆 ${winner.user.badgedUsername} receives ${toKMB(amount)} GP.`);
	}
	return { pot, payoutsMessages };
}

export async function highRollerCommand({
	interaction,
	user,
	rng,
	stakeInput,
	payoutMode,
	invitesInput
}: {
	interaction: MInteraction;
	user: MUser;
	rng: RNGProvider;
	stakeInput: string | null | undefined;
	payoutMode?: HighRollerPayoutMode | null;
	invitesInput: string | null | undefined;
}): Promise<CommandResponse> {
	await interaction.defer();

	const stake = mahojiParseNumber({ input: stakeInput ?? undefined, min: 1, max: 500_000_000_000 });
	if (!stake) {
		return `Please provide a valid stake of at least 1 GP.`;
	}
	if (user.bitfield.includes(BitField.SelfGamblingLocked)) {
		return 'You have gambling disabled and cannot join High Roller Pots.';
	}

	const stakeDisplay = toKMB(stake);
	const mode: HighRollerPayoutMode = payoutMode ?? 'winner_takes_all';

	const payoutDescription = mode === 'winner_takes_all' ? 'Winner takes all' : 'Top 3 (60/30/10)';

	await user.sync();
	if (user.GP < stake) {
		return `You need at least ${toKMB(stake)} GP to host this High Roller Pot.`;
	}

	const mentionMatches = invitesInput
		? [...invitesInput.matchAll(/<@!?([0-9]{16,20})>/g)].map(match => match[1])
		: [];
	const numericMatches = invitesInput ? invitesInput.split(/\s+/).filter(part => /^\d{16,20}$/.test(part)) : [];
	const inviteIDs = [...new Set([...mentionMatches, ...numericMatches])].filter(id => id !== user.id);

	const joinMode: JoinMode = inviteIDs.length > 0 ? { type: 'invites', inviteIDs } : { type: 'open' };

	const participantIDs =
		joinMode.type === 'invites'
			? await collectDirectInvites({
					interaction,
					host: user,
					inviteIDs: joinMode.inviteIDs,
					stakeDisplay,
					payoutDescription
				})
			: await collectOpenLobby({
					interaction,
					host: user,
					stake,
					stakeDisplay,
					payoutDescription
				});

	if (!participantIDs || participantIDs.length === 0) {
		return interaction.returnStringOrFile('The High Roller Pot was cancelled.');
	}

	if (!participantIDs.includes(user.id)) {
		participantIDs.unshift(user.id);
	}

	if (participantIDs.length > MAX_PARTICIPANTS) {
		await safeEdit(interaction, {
			content: `This pot couldn't start because there were too many participants.`,
			components: [],
			allowedMentions: { users: [] }
		});
		return interaction.returnStringOrFile('The High Roller Pot was cancelled.');
	}
	const participants = await Promise.all(participantIDs.map(async id => (id === user.id ? user : mUserFetch(id))));

	if (mode === 'top_three' && participants.length < MIN_TOP_THREE_PARTICIPANTS) {
		await safeEdit(interaction, {
			content: `Top 3 payout mode requires at least ${MIN_TOP_THREE_PARTICIPANTS} participants. Only ${participants.length} joined.`,
			components: []
		});
		return interaction.returnStringOrFile(
			`Top 3 payout mode requires at least ${MIN_TOP_THREE_PARTICIPANTS} participants. Only ${participants.length} joined.`
		);
	}

	try {
		await ensureParticipantsReady({ participants, stake });
	} catch (error) {
		const reason = (error as Error).message;
		await safeEdit(interaction, {
			content: `The High Roller Pot could not start: ${reason}`,
			components: []
		});
		return interaction.returnStringOrFile(`The High Roller Pot could not start: ${reason}`);
	}

	const removedParticipants: MUser[] = [];
	try {
		for (const participant of participants) {
			await participant.removeItemsFromBank(new Bank().add('Coins', stake));
			removedParticipants.push(participant);
		}
	} catch (error) {
		for (const participant of removedParticipants) {
			await participant.addItemsToBank({ items: new Bank().add('Coins', stake) });
		}
		const reason = (error as Error).message ?? 'an unknown error occurred while reserving GP.';
		await safeEdit(interaction, {
			content: `The High Roller Pot could not start: ${reason}`,
			components: []
		});
		return interaction.returnStringOrFile(`The High Roller Pot could not start: ${reason}`);
	}

	const rolls = generateUniqueRolls({
		count: participants.length,
		rollFn: () => {
			const item = pickRandomItem(rng);
			const value = marketPriceOrBotPrice(item.id);
			return { item, value };
		}
	});

	const rollResults: RollResult[] = participants.map((participant, index) => ({
		user: participant,
		item: rolls[index]!.item,
		value: rolls[index]!.value
	}));

	rollResults.sort((a, b) => b.value - a.value);

	let highRollerImage: SendableFile | null = null;
	try {
		highRollerImage = await drawHighRollerImage({
			rolls: rollResults.map((result, index) => ({
				position: index + 1,
				username: result.user.badgedUsername,
				itemID: result.item.id,
				itemName: result.item.name,
				value: result.value
			}))
		});
	} catch (err) {
		console.error('Error generating High Roller image:', err);
	}

	const { pot, payoutsMessages } = await payoutWinners({ interaction, sortedResults: rollResults, stake, mode });

	const summary = `**High Roller Pot** (${
		mode === 'winner_takes_all' ? 'Winner takes all' : 'Top 3 (60/30/10)'
	})\nStake: ${toKMB(stake)} GP (Total pot ${toKMB(pot)} GP)\nParticipants (${rollResults.length}): ${rollResults
		.map(result => result.user.badgedUsername)
		.join(', ')}\n\n${payoutsMessages.join('\n')}`;

	const response = highRollerImage
		? { content: summary, components: [], files: [highRollerImage] }
		: { content: summary, components: [] };

	await safeEdit(interaction, response);
	return interaction.returnStringOrFile(highRollerImage ? { content: summary, files: [highRollerImage] } : summary);
}
