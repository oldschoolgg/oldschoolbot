import z from 'zod';

export const PosInt = z.number().int().positive();

export const ZPermission = z.enum([
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'ADMINISTRATOR',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS',
	'VIEW_AUDIT_LOG',
	'PRIORITY_SPEAKER',
	'STREAM',
	'VIEW_CHANNEL',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'USE_EXTERNAL_EMOJIS',
	'VIEW_GUILD_INSIGHTS',
	'CONNECT',
	'SPEAK',
	'MUTE_MEMBERS',
	'DEAFEN_MEMBERS',
	'MOVE_MEMBERS',
	'USE_VAD',
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES',
	'MANAGE_ROLES',
	'MANAGE_WEBHOOKS',
	'MANAGE_GUILD_EXPRESSIONS',
	'USE_APPLICATION_COMMANDS',
	'REQUEST_TO_SPEAK',
	'MANAGE_EVENTS',
	'MANAGE_THREADS',
	'CREATE_PUBLIC_THREADS',
	'CREATE_PRIVATE_THREADS',
	'USE_EXTERNAL_STICKERS',
	'SEND_MESSAGES_IN_THREADS',
	'USE_EMBEDDED_ACTIVITIES',
	'MODERATE_MEMBERS',
	'VIEW_CREATOR_MONETIZATION_ANALYTICS',
	'USE_SOUNDBOARD',
	'CREATE_GUILD_EXPRESSIONS',
	'CREATE_EVENTS',
	'USE_EXTERNAL_SOUNDS',
	'SEND_VOICE_MESSAGES',
	'SEND_POLLS',
	'USE_EXTERNAL_APPS',
	'PIN_MESSAGES'
]);
export type IPermission = z.infer<typeof ZPermission>;

export const ZSnowflake = z.string().regex(/^\d+$/);
export type ISnowflake = z.infer<typeof ZSnowflake>;

export const ZBotType = z.enum(['osb', 'bso']);
export type IBotType = z.infer<typeof ZBotType>;

export const ZStringInteger = z.string().refine(
	val => {
		const num = Number(val);
		return !isNaN(num) && Number.isInteger(num);
	},
	{ message: 'Invalid integer string' }
);
export type TStringInteger = z.infer<typeof ZStringInteger>;

export const AServiceTypes = ['osb', 'bso', 'robochimp'] as const;
export const ZServiceType = z.enum(['osb', 'bso', 'robochimp']);
export type IServiceType = z.infer<typeof ZServiceType>;
