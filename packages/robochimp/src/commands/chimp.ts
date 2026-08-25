import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { formatDuration, parseDuration, sleep, Time } from '@oldschoolgg/toolkit';

import { globalConfig } from '@/constants.js';
import { type BotService, botServiceChoices, getBotShutdown, setBotShutdown } from '@/lib/botControl.js';
import { detectMischief } from '@/lib/mischiefDetection.js';
import { patreonTask } from '@/lib/patreon.js';
import {
	fetchPremiumTimeBalance,
	formatPremiumTimeGrant,
	grantPremiumTime,
	validatePremiumTimeGrant,
	validPremiumTimeTiers
} from '@/lib/premiumTime.js';
import type { RUser } from '@/structures/RUser.js';
import { serviceManager } from '@/structures/ServiceManager.js';
import { CHANNELS, tiers } from '@/util.js';

const tierChoices = [...tiers].reverse().map(tier => ({
	name: `Magna Tier ${tier.number} (perkTier ${tier.perkTier})`,
	value: tier.perkTier.toString()
}));

function availableTiersString() {
	return tierChoices.map(tier => `${tier.name}: \`${tier.value}\``).join('\n');
}

async function addPatreonTime(timeMs: number, tier: number, userToGive: RUser, interaction: MInteraction) {
	if (!validatePremiumTimeGrant(timeMs, tier)) return 'Invalid input.';

	const currentUser = await fetchPremiumTimeBalance(userToGive.id);
	const currentBalanceTier = currentUser.premium_balance_tier;

	if (currentBalanceTier !== null && currentBalanceTier !== tier) {
		await interaction.confirmation(
			`They already have Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
		);
	}
	await interaction.confirmation(
		`Are you sure you want to add ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive.mention}?`
	);

	const grant = await grantPremiumTime({ userID: userToGive.id, timeMs, tier });

	return `Gave ${formatPremiumTimeGrant(grant)} patron to ${userToGive.mention}. They have ${formatDuration(
		grant.remainingTime
	)} remaining.`;
}

function botWarning(action: 'start' | 'stop', bot: BotService) {
	return `WARNING: This will ${action} the ${bot.toUpperCase()} production service. Confirm only if you intend to affect the live bot.`;
}

export const chimpCommand = defineCommand({
	name: 'chimp',
	description: 'RoboChimp tools.',
	options: [
		{
			type: 'Subcommand',
			name: 'setgithubid',
			description: 'Set someones github ID',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: 'String',
					name: 'github_username',
					description: 'The github username (leave blank to reset)',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'detect_mischief',
			description: 'Mischief!'
		},
		{
			type: 'SubcommandGroup',
			name: 'patreon',
			description: 'Patreon tools.',
			options: [
				{
					type: 'Subcommand',
					name: 'sync',
					description: 'Patreon sync'
				},
				{
					type: 'Subcommand',
					name: 'debug',
					description: 'Debug Patreon'
				},
				{
					type: 'Subcommand',
					name: 'change_tier',
					description: 'Change or remove patron perks for a user group.',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user',
							required: true
						},
						{
							type: 'String',
							name: 'tier',
							description: 'The perk tier number.',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) => {
								const normalizedValue = value?.toLowerCase() ?? '';
								return tierChoices.filter(tier =>
									normalizedValue
										? `${tier.name} ${tier.value}`.toLowerCase().includes(normalizedValue)
										: true
								);
							}
						},
						{
							type: 'Boolean',
							name: 'remove',
							description: 'Remove patron perks instead of changing tier.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'add_time',
					description: 'Give user temporary patron time.',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: 'Integer',
							name: 'tier',
							description: 'The tier to give.',
							required: true,
							choices: validPremiumTimeTiers.map(tier => ({ name: tier.toString(), value: tier }))
						},
						{
							type: 'String',
							name: 'time',
							description: 'The time.',
							required: true
						}
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'start_bot',
			description: 'Start a bot service.',
			options: [
				{
					type: 'String',
					name: 'bot',
					description: 'The bot to start.',
					required: true,
					choices: botServiceChoices
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'stop_bot',
			description: 'Stop a bot service.',
			options: [
				{
					type: 'String',
					name: 'bot',
					description: 'The bot to stop.',
					required: true,
					choices: botServiceChoices
				},
				{
					type: 'Boolean',
					name: 'force',
					description: 'Force stop with systemctl after a 2 minute cancel window.',
					required: false
				}
			]
		}
	],
	run: async ({ options, user, interaction }) => {
		await interaction.defer();

		// Support Staff+ Commands:
		if (!user.isSupport()) return 'Ook';

		if (options.patreon?.sync) {
			const res = await patreonTask.run();
			if (res) {
				console.log(res.join('\n').slice(0, 1950));
			}
			return 'Done.';
		}

		if (!user.isMod()) return 'Ook';
		// Mod+ Commands:

		if (options.start_bot) {
			const bot = options.start_bot.bot as BotService;
			await interaction.confirmation(botWarning('start', bot));
			await serviceManager.start(bot);
			return `Started ${bot.toUpperCase()}.`;
		}

		if (options.stop_bot) {
			const bot = options.stop_bot.bot as BotService;
			await interaction.confirmation(botWarning('stop', bot));
			await setBotShutdown(bot, true);

			if (!options.stop_bot.force) {
				return `Set ${bot.toUpperCase()} shutdown flag. It will shut down on its next shutdown ticker.`;
			}

			const cancelId = `chimp.stop_bot.cancel.${bot}`;
			await globalClient.sendMessage(interaction.channelId, {
				content: `Pending ${bot.toUpperCase()} shutdown, click to cancel...`,
				components: [new ButtonBuilder().setCustomId(cancelId).setLabel('CANCEL').setStyle(ButtonStyle.Danger)]
			});

			await sleep(Time.Minute * 2);
			if (!(await getBotShutdown(bot))) {
				return `${bot.toUpperCase()} force shutdown was cancelled.`;
			}

			await serviceManager.stop(bot);
			return `Stopped ${bot.toUpperCase()}.`;
		}

		if (options.setgithubid) {
			const githubSetUser = await globalClient.fetchRUser(options.setgithubid.user.user.id);
			const { github_username } = options.setgithubid;

			if (!github_username) {
				await githubSetUser.update({ github_id: null });
				return `Reset ${options.setgithubid.user.user.username}'s github ID.`;
			}
			const res = (await fetch(`https://api.github.com/users/${encodeURIComponent(github_username)}`)
				.then(res => res.json())
				.catch(() => null)) as Record<string, string> | null;
			if (!res || !res.id) {
				return 'Could not find user in github API. Is the username written properly?';
			}
			const num = Number.parseInt(res.id);
			if (!num) {
				return 'Invalid id';
			}
			const alreadyHasName = await roboChimpClient.user.count({
				where: {
					github_id: num
				}
			});
			if (alreadyHasName > 0) {
				return `Someone (${alreadyHasName}) already has this Github account connected.`;
			}

			await githubSetUser.update({
				github_id: num
			});
			await patreonTask.syncGithub();
			return `Set ${options.setgithubid.user.user.username}'s github ID to ${githubSetUser.githubId}, and synced their patron tier to: ${githubSetUser.perkTier}.`;
		}
		if (options.patreon?.add_time) {
			const { tier, time, user: targetUser } = options.patreon.add_time;
			const ms = parseDuration(time);
			return addPatreonTime(ms, tier, await globalClient.fetchRUser(targetUser.user.id), interaction);
		}
		if (!user.isAdmin()) return 'Sorry, these are restricted to admins only';
		if (options.patreon?.change_tier) {
			const changeTier = options.patreon.change_tier;
			const targetUser = await globalClient.fetchRUser(changeTier.user.user.id);
			const targetMention = targetUser.mention;

			if (changeTier.remove) {
				await patreonTask.removePerks(targetUser, `Admin command by ${user.id}`);
				return `Removed patron perks from ${targetMention}.`;
			}

			if (!changeTier.tier) {
				return `Pick a tier, or enter its perk tier number:\n${availableTiersString()}`;
			}

			const perkTier = Number(changeTier.tier);
			const tier = Number.isInteger(perkTier) ? tiers.find(t => t.perkTier === perkTier) : null;
			if (!tier) {
				return `Invalid perk tier: \`${changeTier.tier}\`.\nAvailable tiers:\n${availableTiersString()}`;
			}

			await patreonTask.changeTier(targetUser, tier);
			return `Changed ${targetMention} to Magna Tier ${tier.number} (perkTier ${tier.perkTier}).`;
		}
		if (options.patreon?.debug) {
			const res = await patreonTask.fetchPatrons();
			return {
				content: 'Debug',
				files: [{ buffer: Buffer.from(JSON.stringify(res)), name: 'data.json' }]
			};
		}
		if (options.detect_mischief) {
			if (
				globalConfig.isProduction &&
				![CHANNELS.MODERATORS, CHANNELS.MODERATORS_OTHER].includes(interaction.channelId)
			) {
				return "You can't run this command in this channel.";
			}
			const [osbResult, bsoResult] = await Promise.all([detectMischief('osb'), detectMischief('bso')]);
			return {
				content: "Here's the mischief reports!",
				files: [
					{ buffer: Buffer.from(osbResult), name: 'osb.txt' },
					{ buffer: Buffer.from(bsoResult), name: 'bso.txt' }
				]
			};
		}
		return 'Invalid command.';
	}
});
