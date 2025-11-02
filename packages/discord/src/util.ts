import { time } from '@discordjs/formatters';

/**
 * Checks if the bot can send a message to a channel object.
 * @param channel The channel to check if the bot can send a message to.
 */
// export function channelIsSendable(channel: Channel | undefined | null): channel is TextChannel {
// 	if (!channel) return false;
// 	if (!channel.isTextBased()) return false;
// 	if (channel.isDMBased()) return true;
// 	const permissions = channel.permissionsFor(channel.client.user!);
// 	if (!permissions) return false;
// 	return (
// 		permissions.has(PermissionsBitField.Flags.ViewChannel) &&
// 		permissions.has(PermissionsBitField.Flags.SendMessages)
// 	);
// }

// export function isGuildChannel(channel?: Channel): channel is GuildTextBasedChannel {
// 	return channel !== undefined && !channel.isDMBased() && Boolean(channel.guild);
// }

// export function discrimName(user: User) {
// 	return `${user.username}#${user.discriminator}`;
// }

// export async function hasBanMemberPerms(userID: string, guild: Guild) {
// 	const member = await guild.members.fetch(userID).catch(() => null);
// 	if (!member) return false;
// 	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
// }

// type InteractionFor<C extends MessageComponentType, G extends true> = MappedInteractionTypes<G>[C];

// export function awaitMessageComponentInteraction<ComponentType extends MessageComponentType>({
// 	message,
// 	filter,
// 	time
// }: {
// 	time: number;
// 	message: Message<true | false>;
// 	filter: CollectorFilter<
// 		[InteractionFor<ComponentType, true>, Collection<string, InteractionFor<ComponentType, true>>]
// 	>;
// }): Promise<InteractionFor<ComponentType, true>> {
// 	return new Promise((resolve, reject) => {
// 		const collector: InteractionCollector<InteractionFor<ComponentType, true>> =
// 			message.createMessageComponentCollector<ComponentType>({ max: 1, filter, time });

// 		collector.once('end', (interactions, reason) => {
// 			const interaction = interactions.first();
// 			if (interaction) resolve(interaction);
// 			else reject(new Error(reason));
// 		});
// 	});
// }

// export function makeComponents(components: ButtonBuilder[]): InteractionReplyOptions['components'] {
// 	return chunk(components, 5).map(i => ({ components: i, type: ComponentType.ActionRow }));
// }

export function dateFm(date: Date) {
	return `${time(date, 'T')} (${time(date, 'R')})`;
}
