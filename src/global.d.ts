declare global {
	export type CommandOption = import('@/lib/discord/commandOptions.js').CommandOption;
	export type MInteraction = import('@/lib/structures/MInteraction.js').MInteraction;
	export type CompatibleResponse = import('@/lib/structures/PaginatedMessage.js').CompatibleResponse;
	export type MahojiUserOption = import('@/lib/discord/commandOptions.js').MahojiUserOption;
	export type RNGProvider = import('@oldschoolgg/rng').RNGProvider;
	export type OSBMahojiCommand = import('@/lib/discord/commandOptions.js').OSBMahojiCommand;
	export type CommandResponse = import('@/lib/discord/commandOptions.js').CommandResponse;
	export type CommandRunOptions = import('@/lib/discord/commandOptions.js').CommandRunOptions;
}

export {};
