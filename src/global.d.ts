declare global {
	export type CommandOption = import('@/lib/discord/commandOptions.js').CommandOption;
	export type MInteraction = import('@/lib/discord/interaction/MInteraction.ts').MInteraction;
	export type MahojiUserOption = import('@/lib/discord/commandOptions.js').MahojiUserOption;
	export type RNGProvider = import('@oldschoolgg/rng').RNGProvider;
	export type CommandResponse = import('@/lib/discord/commandOptions.js').CommandResponse;
	export type CommandRunOptions = import('@/lib/discord/commandOptions.js').CommandRunOptions;
	export type SendableMessage = import('@/lib/discord/SendableMessage.js').SendableMessage;
	export type BaseSendableMessage = import('@/lib/discord/SendableMessage.js').BaseSendableMessage;
	export type SendableFile = import('@/lib/discord/SendableMessage.js').SendableFile;
}

export {};
