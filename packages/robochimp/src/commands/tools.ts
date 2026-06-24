import { globalConfig } from '@/constants.js';
import { detectMischief } from '@/lib/mischiefDetection.js';
import { patreonTask } from '@/lib/patreon.js';
import { CHANNELS, tiers } from '@/util.js';

const tierChoices = [...tiers].reverse().map(tier => ({
	name: `Patron Tier ${tier.number} (perkTier ${tier.perkTier})`,
	value: tier.perkTier.toString()
}));

function availableTiersString() {
	return tierChoices.map(tier => `${tier.name}: \`${tier.value}\``).join('\n');
}

export const toolsCommand = defineCommand({
	name: 'tools',
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
			type: 'Subcommand',
			name: 'patreon_sync',
			description: 'Patreon sync'
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
					description: 'The perk tier number, or choose a patron tier.',
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
			name: 'debug_patreon',
			description: 'debug_patreon'
		}
	],
	run: async ({ options, user, interaction }) => {
		await interaction.defer();

		// Support Staff+ Commands:
		if (!user.isSupport()) return 'Ook';

		if (options.patreon_sync) {
			const res = await patreonTask.run();
			if (res) {
				console.log(res.join('\n').slice(0, 1950));
			}
			return 'Done.';
		}

		if (!user.isMod()) return 'Ook';
		// Mod+ Commands:

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
		if (!user.isAdmin()) return 'Sorry, these are restricted to admins only';
		if (options.change_tier) {
			const targetUser = await globalClient.fetchRUser(options.change_tier.user.user.id);
			const targetMention = targetUser.mention;

			if (options.change_tier.remove) {
				await patreonTask.removePerks(targetUser, `Admin command by ${user.id}`);
				return `Removed patron perks from ${targetMention}.`;
			}

			if (!options.change_tier.tier) {
				return `Pick a tier, or enter its perk tier number:\n${availableTiersString()}`;
			}

			const perkTier = Number(options.change_tier.tier);
			const tier = Number.isInteger(perkTier) ? tiers.find(t => t.perkTier === perkTier) : null;
			if (!tier) {
				return `Invalid perk tier: \`${options.change_tier.tier}\`.\nAvailable tiers:\n${availableTiersString()}`;
			}

			await patreonTask.changeTier(targetUser, tier);
			return `Changed ${targetMention} to Patron Tier ${tier.number} (perkTier ${tier.perkTier}).`;
		}
		if (options.debug_patreon) {
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
