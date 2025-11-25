export const PermissionFlags: {
	readonly CREATE_INSTANT_INVITE: bigint;
	readonly KICK_MEMBERS: bigint;
	readonly BAN_MEMBERS: bigint;
	readonly ADMINISTRATOR: bigint;
	readonly MANAGE_CHANNELS: bigint;
	readonly MANAGE_GUILD: bigint;
	readonly ADD_REACTIONS: bigint;
	readonly VIEW_AUDIT_LOG: bigint;
	readonly PRIORITY_SPEAKER: bigint;
	readonly STREAM: bigint;
	readonly VIEW_CHANNEL: bigint;
	readonly SEND_MESSAGES: bigint;
	readonly SEND_TTS_MESSAGES: bigint;
	readonly MANAGE_MESSAGES: bigint;
	readonly EMBED_LINKS: bigint;
	readonly ATTACH_FILES: bigint;
	readonly READ_MESSAGE_HISTORY: bigint;
	readonly MENTION_EVERYONE: bigint;
	readonly USE_EXTERNAL_EMOJIS: bigint;
	readonly VIEW_GUILD_INSIGHTS: bigint;
	readonly CONNECT: bigint;
	readonly SPEAK: bigint;
	readonly MUTE_MEMBERS: bigint;
	readonly DEAFEN_MEMBERS: bigint;
	readonly MOVE_MEMBERS: bigint;
	readonly USE_VAD: bigint;
	readonly CHANGE_NICKNAME: bigint;
	readonly MANAGE_NICKNAMES: bigint;
	readonly MANAGE_ROLES: bigint;
	readonly MANAGE_WEBHOOKS: bigint;
	readonly MANAGE_GUILD_EXPRESSIONS: bigint;
	readonly USE_APPLICATION_COMMANDS: bigint;
	readonly REQUEST_TO_SPEAK: bigint;
	readonly MANAGE_EVENTS: bigint;
	readonly MANAGE_THREADS: bigint;
	readonly CREATE_PUBLIC_THREADS: bigint;
	readonly CREATE_PRIVATE_THREADS: bigint;
	readonly USE_EXTERNAL_STICKERS: bigint;
	readonly SEND_MESSAGES_IN_THREADS: bigint;
	readonly USE_EMBEDDED_ACTIVITIES: bigint;
	readonly MODERATE_MEMBERS: bigint;
	readonly VIEW_CREATOR_MONETIZATION_ANALYTICS: bigint;
	readonly USE_SOUNDBOARD: bigint;
	readonly CREATE_GUILD_EXPRESSIONS: bigint;
	readonly CREATE_EVENTS: bigint;
	readonly USE_EXTERNAL_SOUNDS: bigint;
	readonly SEND_VOICE_MESSAGES: bigint;
	readonly SEND_POLLS: bigint;
	readonly USE_EXTERNAL_APPS: bigint;
	readonly PIN_MESSAGES: bigint;
} = {
	CREATE_INSTANT_INVITE: 1n << 0n,
	KICK_MEMBERS: 1n << 1n,
	BAN_MEMBERS: 1n << 2n,
	ADMINISTRATOR: 1n << 3n,
	MANAGE_CHANNELS: 1n << 4n,
	MANAGE_GUILD: 1n << 5n,
	ADD_REACTIONS: 1n << 6n,
	VIEW_AUDIT_LOG: 1n << 7n,
	PRIORITY_SPEAKER: 1n << 8n,
	STREAM: 1n << 9n,
	VIEW_CHANNEL: 1n << 10n,
	SEND_MESSAGES: 1n << 11n,
	SEND_TTS_MESSAGES: 1n << 12n,
	MANAGE_MESSAGES: 1n << 13n,
	EMBED_LINKS: 1n << 14n,
	ATTACH_FILES: 1n << 15n,
	READ_MESSAGE_HISTORY: 1n << 16n,
	MENTION_EVERYONE: 1n << 17n,
	USE_EXTERNAL_EMOJIS: 1n << 18n,
	VIEW_GUILD_INSIGHTS: 1n << 19n,
	CONNECT: 1n << 20n,
	SPEAK: 1n << 21n,
	MUTE_MEMBERS: 1n << 22n,
	DEAFEN_MEMBERS: 1n << 23n,
	MOVE_MEMBERS: 1n << 24n,
	USE_VAD: 1n << 25n,
	CHANGE_NICKNAME: 1n << 26n,
	MANAGE_NICKNAMES: 1n << 27n,
	MANAGE_ROLES: 1n << 28n,
	MANAGE_WEBHOOKS: 1n << 29n,
	MANAGE_GUILD_EXPRESSIONS: 1n << 30n,
	USE_APPLICATION_COMMANDS: 1n << 31n,
	REQUEST_TO_SPEAK: 1n << 32n,
	MANAGE_EVENTS: 1n << 33n,
	MANAGE_THREADS: 1n << 34n,
	CREATE_PUBLIC_THREADS: 1n << 35n,
	CREATE_PRIVATE_THREADS: 1n << 36n,
	USE_EXTERNAL_STICKERS: 1n << 37n,
	SEND_MESSAGES_IN_THREADS: 1n << 38n,
	USE_EMBEDDED_ACTIVITIES: 1n << 39n,
	MODERATE_MEMBERS: 1n << 40n,
	VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
	USE_SOUNDBOARD: 1n << 42n,
	CREATE_GUILD_EXPRESSIONS: 1n << 43n,
	CREATE_EVENTS: 1n << 44n,
	USE_EXTERNAL_SOUNDS: 1n << 45n,
	SEND_VOICE_MESSAGES: 1n << 46n,
	SEND_POLLS: 1n << 49n,
	USE_EXTERNAL_APPS: 1n << 50n,
	PIN_MESSAGES: 1n << 51n
} as const;

export type PermissionKey = keyof typeof PermissionFlags;

export class Permissions {
	private bits: bigint;
	private frozen = false;

	constructor(bits: string | bigint | number) {
		this.bits = typeof bits === 'bigint' ? bits : BigInt(bits);
	}

	private ensureMutable() {
		if (this.frozen) throw new Error('Permissions instance is frozen');
	}

	has(permission: PermissionKey): boolean {
		const value = PermissionFlags[permission];
		return (this.bits & value) === value;
	}

	add(permission: PermissionKey): this {
		this.ensureMutable();
		this.bits |= PermissionFlags[permission];
		return this;
	}

	remove(permission: PermissionKey): this {
		this.ensureMutable();
		this.bits &= ~PermissionFlags[permission];
		return this;
	}

	serialize(): string {
		return this.bits.toString();
	}

	freeze(): this {
		this.frozen = true;
		return this;
	}

	static from(...permissions: PermissionKey[]): Permissions {
		let bits = 0n;
		for (const p of permissions) bits |= PermissionFlags[p];
		return new Permissions(bits);
	}

	static fromRoles(bitfields: (string | bigint | number)[]): Permissions {
		let bits = 0n;
		for (const b of bitfields) bits |= BigInt(b);
		return new Permissions(bits);
	}

	static toKeys(bitfields: string): PermissionKey[] {
		const permissions = new Permissions(bitfields);
		const keys: PermissionKey[] = [];
		for (const key in PermissionFlags) {
			if (permissions.has(key as PermissionKey)) {
				keys.push(key as PermissionKey);
			}
		}
		return keys;
	}
}
