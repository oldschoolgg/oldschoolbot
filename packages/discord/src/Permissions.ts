export const PermissionFlags = {
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
