import { ButtonBuilder, type ButtonMInteraction, ButtonStyle, dateFm } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

import { partyLockCache } from '@/lib/cache.js';
import { InteractionID } from '@/lib/InteractionID.js';
import type { MakeDuoOptions } from '@/lib/types/index.js';

export async function makeDuo(options: MakeDuoOptions): Promise<MUser[] | null> {
	if (process.env.TEST) return [options.leader];
	const interaction = options.interaction;
	const timeout = Time.Minute * 5;
	const autoStartAfter = options.autoStartAfter ?? Time.Minute;
	let autoActionDate = Date.now() + autoStartAfter;
	let pendingUser: MUser | null = null;
	let resolved = false;

	const waitingButtons = [
		new ButtonBuilder().setCustomId(InteractionID.Party.Join).setLabel('Join').setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(InteractionID.Party.Start).setLabel('Start Solo').setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(InteractionID.Party.Cancel).setLabel('Cancel').setStyle(ButtonStyle.Danger)
	];

	const confirmButtons = [
		new ButtonBuilder().setCustomId(InteractionID.Party.HostApprove).setLabel('Yes').setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(InteractionID.Party.HostDecline).setLabel('No').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId(InteractionID.Party.Cancel).setLabel('Cancel').setStyle(ButtonStyle.Danger)
	];

	const waitingContent = () => ({
		content: `${options.message}\n\nWaiting for one partner. The host can cancel this invite. If nobody joins, the host starts solo ${dateFm(
			autoActionDate
		)}.`,
		components: waitingButtons,
		allowedMentions: { users: [] as string[] }
	});

	const confirmContent = (user: MUser) => ({
		content:
			options.confirmMessage?.(user) ??
			`${options.leader.badgedUsername}, do you want to duo with ${user.badgedUsername}?`,
		components: confirmButtons,
		allowedMentions: { users: [options.leader.id, user.id] }
	});

	await interaction.defer({ ephemeral: false });
	await interaction.reply(waitingContent());

	return new Promise<MUser[] | null>(resolve => {
		let autoActionTimer: NodeJS.Timeout | null = null;

		const cleanupPending = () => {
			if (pendingUser) {
				partyLockCache.delete(pendingUser.id);
				pendingUser = null;
			}
		};

		const clearAutoActionTimer = () => {
			if (autoActionTimer) {
				clearTimeout(autoActionTimer);
				autoActionTimer = null;
			}
		};

		const finish = async (result: MUser[] | null, content: string) => {
			if (resolved) return;
			resolved = true;
			clearAutoActionTimer();
			cleanupPending();
			collector.stop('duoFinished');
			await interaction.reply({ content, components: [] });
			resolve(result);
		};

		// Todo: This timeout clashes with the autostart, but I'm not sure what will break and I gotta sleep.
		const collector = globalClient.createInteractionCollector({
			timeoutMs: timeout * 2,
			interaction,
			maxCollected: Infinity
		});

		const scheduleSoloStart = () => {
			clearAutoActionTimer();
			autoActionDate = Date.now() + autoStartAfter;
			autoActionTimer = setTimeout(() => {
				void finish([options.leader], 'No duo partner joined in time. Starting solo.');
			}, autoStartAfter);
		};

		const scheduleAutoAccept = (user: MUser) => {
			clearAutoActionTimer();
			autoActionDate = Date.now() + autoStartAfter;
			autoActionTimer = setTimeout(() => {
				void finish(
					[options.leader, user],
					`No host response in time. Automatically starting the duo with ${user.usernameOrMention}.`
				);
			}, autoStartAfter);
		};

		scheduleSoloStart();

		collector.on('collect', async (bi: ButtonMInteraction) => {
			const id = bi.customId;
			const allowedIDs = [
				InteractionID.Party.Join,
				InteractionID.Party.Start,
				InteractionID.Party.Cancel,
				InteractionID.Party.HostApprove,
				InteractionID.Party.HostDecline
			];
			if (!allowedIDs.includes(id as (typeof allowedIDs)[number])) {
				throw new Error(
					`When making a duo for ${JSON.stringify({ ...options, userId: interaction.userId })}, received invalid button ID: ${id}`
				);
			}

			if (id === InteractionID.Party.Cancel) {
				if (bi.userId !== options.leader.id) {
					await bi.reply({ content: 'Only the host can cancel this duo.', ephemeral: true });
					return;
				}
				await bi.silentButtonAck();
				await finish(null, 'The duo invite was cancelled.');
				return;
			}

			if (id === InteractionID.Party.Start) {
				if (bi.userId !== options.leader.id) {
					await bi.reply({ content: 'Only the host can start solo.', ephemeral: true });
					return;
				}
				if (pendingUser) {
					await bi.reply({ content: 'Respond to the pending duo partner first.', ephemeral: true });
					return;
				}
				await bi.silentButtonAck();
				await finish([options.leader], 'Starting solo.');
				return;
			}

			if (id === InteractionID.Party.HostApprove || id === InteractionID.Party.HostDecline) {
				if (bi.userId !== options.leader.id) {
					await bi.reply({ content: 'Only the host can respond to this duo request.', ephemeral: true });
					return;
				}
				if (!pendingUser) {
					await bi.reply({ content: 'There is no pending duo partner to respond to.', ephemeral: true });
					return;
				}

				if (id === InteractionID.Party.HostDecline) {
					const declinedUser = pendingUser;
					cleanupPending();
					scheduleSoloStart();
					await bi.silentButtonAck();
					await interaction.reply(waitingContent());
					await globalClient
						.sendMessage(bi.channelId, {
							content: `${declinedUser.mention}, the host declined your duo request.`,
							allowedMentions: { users: [declinedUser.id] },
							ephemeral: true
						})
						.catch(() => null);
					return;
				}

				const acceptedUser = pendingUser;
				await bi.silentButtonAck();
				await finish(
					[options.leader, acceptedUser],
					`The duo is starting with ${acceptedUser.usernameOrMention}.`
				);
				return;
			}

			if (pendingUser) {
				await bi.reply({ content: 'The host is deciding on a pending duo partner.', ephemeral: true });
				return;
			}

			if (bi.userId === options.leader.id) {
				await bi.reply({ content: 'You are already hosting this duo.', ephemeral: true });
				return;
			}
			if (options.usersAllowed && !options.usersAllowed.includes(bi.userId)) {
				await bi.reply({ content: 'You are not allowed to join this duo.', ephemeral: true });
				return;
			}
			if (partyLockCache.has(bi.userId)) {
				await bi.reply({ content: 'You cannot join this duo.', ephemeral: true });
				return;
			}

			const user = await mUserFetch(bi.userId);
			if ((!options.ironmanAllowed && user.isIronman) || (await user.minionIsBusy()) || !user.hasMinion) {
				await bi.reply({
					content: `You cannot join if you are busy${!options.ironmanAllowed ? ', an ironman' : ''}, or have no minion.`,
					ephemeral: true
				});
				return;
			}
			if (options.customDenier) {
				const [denied, reason] = await options.customDenier(user);
				if (denied) {
					await bi.reply({
						content: `You couldn't join this duo, for this reason: ${reason}`,
						ephemeral: true
					});
					return;
				}
			}

			pendingUser = user;
			partyLockCache.add(user.id);
			scheduleAutoAccept(user);
			await bi.silentButtonAck();
			await interaction.reply({
				...confirmContent(user),
				content: `${confirmContent(user).content}\n\nIf the host doesn't respond, this duo will automatically start ${dateFm(
					autoActionDate
				)}.`
			});
		});

		collector.once('end', async () => {
			if (resolved) return;
			clearAutoActionTimer();
			cleanupPending();
			resolved = true;
			await interaction.reply({ content: 'The duo invite expired.', components: [] }).catch(() => null);
			resolve(null);
		});
	});
}
