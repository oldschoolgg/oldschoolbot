import { PerkTier } from '@oldschoolgg/toolkit';

import type { InhibitorResult } from '@/discord/preCommand.js';
import { BadgesEnum, Channel, globalConfig } from '@/lib/constants.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import { learningTheRopesButton, minionBuyButton } from '@/lib/sharedComponents.js';

type InhibitorRunOptions = {
	user: MUser;
	command: AnyCommand;
	interaction: MInteraction;
	options: CommandOptions;
};
interface Inhibitor {
	name: string;
	run: (options: InhibitorRunOptions) => false | BaseSendableMessage | Promise<BaseSendableMessage | false>;
	silent?: true;
}

const inhibitors: Inhibitor[] = [
	{
		name: 'Restarting',
		run: () => {
			if (globalClient.isShuttingDown || !globalClient.isReady) {
				return { content: 'The bot is currently restarting, please try again later.' };
			}
			return false;
		}
	},
	{
		name: 'hasMinion',
		run: ({ user, command }) => {
			if (!command.attributes?.requiresMinion) return false;

			if (!user.hasMinion) {
				return {
					content: 'You need a minion to use this command.',
					components: [minionBuyButton],
					flags: undefined
				};
			}

			return false;
		}
	},
	{
		name: 'tutorialIsland',
		run: ({ user, command, options }) => {
			const isMinionCommand =
				Boolean(command.attributes?.requiresMinion) ||
				command.name === 'minion' ||
				command.name === 'activities';
			if (!isMinionCommand) return false;

			if (!user.hasMinion || user.user.finished_quest_ids.includes(QuestID.LearningTheRopes)) {
				return false;
			}

			const isTutorialQuestCommand =
				command.name === 'activities' &&
				'quest' in options &&
				options.quest &&
				typeof options.quest === 'object' &&
				'name' in options.quest &&
				typeof options.quest.name === 'string' &&
				options.quest.name.toLowerCase() === 'learning the ropes';
			const isMinionIronmanCommand =
				command.name === 'minion' &&
				'ironman' in options &&
				options.ironman &&
				typeof options.ironman === 'object';

			if (isTutorialQuestCommand || isMinionIronmanCommand) return false;

			const questMention = globalClient.mentionCommand('activities', 'quest');
			return {
				content: `Before you can use minion commands, you must complete **Learning the Ropes**.
Start it with ${questMention} and set the quest name to \`Learning the Ropes\`, or press the button below.`,
				components: [learningTheRopesButton],
				flags: undefined
			};
		}
	},
	{
		name: 'minionNotBusy',
		run: async ({ user, command }) => {
			if (!command.attributes?.requiresMinionNotBusy) return false;

			if (await user.minionIsBusy()) {
				return { content: 'Your minion must not be busy to use this command.' };
			}

			return false;
		}
	},
	{
		name: 'disabled',
		run: async ({ command, interaction, user }) => {
			const disabledCommands = await Cache.getDisabledCommands();
			if (
				!globalConfig.adminUserIDs.includes(user.id) &&
				(command.attributes?.enabled === false || disabledCommands.includes(command.name))
			) {
				return { content: 'This command is globally disabled.' };
			}
			if (!interaction.guildId) return false;
			const cachedSettings = await Cache.getGuild(interaction.guildId);
			if (cachedSettings.disabled_commands.includes(command.name)) {
				return { content: 'This command is disabled in this server.' };
			}
			return false;
		}
	},
	{
		name: 'commandRoleLimit',
		run: async ({ interaction, user }) => {
			if (!interaction.guildId || interaction.guildId !== globalConfig.supportServerID || !interaction.channelId)
				return false;
			if (interaction.channelId !== Channel.ServerGeneral) return false;
			const perkTier = await user.fetchPerkTier();
			if (interaction.member && perkTier >= PerkTier.Two) {
				return false;
			}

			return { content: "You cannot use commands in the general channel unless you're a patron" };
		},
		silent: true
	},
	{
		name: 'onlyStaffCanUseCommands',
		run: async ({ user, interaction }) => {
			if (!interaction.guildId || !interaction.member || !interaction.channelId) return false;
			// Allow green gem badge holders to run commands in support channel:
			if (interaction.channelId === Channel.HelpAndSupport && user.user.badges.includes(BadgesEnum.GreenGem)) {
				return false;
			}

			// Allow contributors + moderators to use disabled channels in SupportServer
			if (interaction.guildId === globalConfig.supportServerID && user.isModOrAdmin()) {
				return false;
			}

			// Allow guild-moderators to use commands in disabled channels
			const guildSettings = await Cache.getGuild(interaction.guildId);
			if (!guildSettings.staff_only_channels.includes(interaction.channelId)) return false;
			const hasPerms = await globalClient.memberHasPermissions(interaction.member, ['BAN_MEMBERS']);
			if (!hasPerms) {
				return { content: "You need the 'Ban Members' permission to use commands in disabled channels." };
			}
			return false;
		},
		silent: true
	}
];

export async function runInhibitors(opts: InhibitorRunOptions): Promise<undefined | InhibitorResult> {
	for (const { run, silent } of inhibitors) {
		const result = await run(opts);
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
