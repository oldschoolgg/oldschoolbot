import type { IGuild, IMember, IMessage } from '@oldschoolgg/schemas';
import { PerkTier } from '@oldschoolgg/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runInhibitors } from '@/discord/inhibitors.js';
import { Channel, globalConfig } from '@/lib/constants.js';
import { createMentionInteraction } from '@/lib/util/mentionCommandInteraction.js';
import { mockMUser } from './userutil.js';

describe('mention command channel restrictions', () => {
	const command = { name: 'fish' } as AnyCommand;
	let user: MUser;
	let message: IMessage;
	let member: IMember;
	let guild: IGuild;
	const getMember = vi.fn();
	const getGuild = vi.fn();
	const memberHasPermissions = vi.fn(async (member: IMember, permissions: IMember['permissions']) =>
		permissions.every(permission => member.permissions.includes(permission))
	);

	beforeEach(() => {
		user = mockMUser({ id: '123' });
		vi.spyOn(user, 'fetchPerkTier').mockResolvedValue(0);
		vi.spyOn(user, 'isModOrAdmin').mockReturnValue(false);
		message = {
			id: '456',
			content: '@bot repeat',
			channel_id: '789',
			guild_id: '987',
			author_id: user.id
		};
		member = { user_id: user.id, guild_id: message.guild_id!, roles: [], permissions: [] };
		guild = {
			id: member.guild_id,
			staff_only_channels: [message.channel_id],
			disabled_commands: [],
			petchannel: null
		};
		getMember.mockResolvedValue(member);
		getGuild.mockResolvedValue(guild);
		vi.stubGlobal('Cache', { getMember, getGuild, getDisabledCommands: vi.fn().mockResolvedValue([]) });
		vi.stubGlobal('globalClient', { isReady: true, isShuttingDown: false, memberHasPermissions });
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	async function checkRestrictions() {
		const interaction = await createMentionInteraction({ user, message });
		return runInhibitors({ user, command, interaction });
	}

	it('checks membership in servers outside the member cache', async () => {
		const interaction = await createMentionInteraction({ user, message });
		expect(getMember).toHaveBeenCalledWith({ guildId: message.guild_id, userId: user.id, externalServer: true });
		expect(interaction.member).toEqual(member);
	});

	it('blocks non-staff members in staff-only channels', async () => {
		expect(await checkRestrictions()).toEqual({
			reason: { content: "You need the 'Ban Members' permission to use commands in disabled channels." },
			silent: true
		});
		expect(memberHasPermissions).toHaveBeenCalledWith(member, ['BAN_MEMBERS']);
	});

	it('allows members with the required permission in staff-only channels', async () => {
		member.permissions.push('BAN_MEMBERS');
		expect(await checkRestrictions()).toBeUndefined();
	});

	it('allows eligible patrons in the general channel', async () => {
		message.guild_id = globalConfig.supportServerID;
		message.channel_id = Channel.ServerGeneral;
		member.guild_id = message.guild_id;
		guild.staff_only_channels = [];
		vi.mocked(user.fetchPerkTier).mockResolvedValue(PerkTier.Two);
		expect(await checkRestrictions()).toBeUndefined();
	});

	it('blocks non-patrons in the general channel', async () => {
		message.guild_id = globalConfig.supportServerID;
		message.channel_id = Channel.ServerGeneral;
		member.guild_id = message.guild_id;
		expect(await checkRestrictions()).toEqual({
			reason: { content: "You cannot use commands in the general channel unless you're a patron" },
			silent: true
		});
	});

	it('preserves server command restrictions', async () => {
		guild.disabled_commands = [command.name];
		expect(await checkRestrictions()).toEqual({
			reason: { content: 'This command is disabled in this server.' },
			silent: false
		});
	});

	it('rejects guild repeats when membership cannot be verified', async () => {
		getMember.mockResolvedValue(null);
		await expect(checkRestrictions()).rejects.toThrow("Couldn't verify your server membership.");
		expect(memberHasPermissions).not.toHaveBeenCalled();
	});

	it('rejects guild repeats when fetching membership fails', async () => {
		getMember.mockRejectedValue(new Error('Member lookup failed'));
		await expect(checkRestrictions()).rejects.toThrow('Member lookup failed');
	});

	it('allows direct messages without fetching a guild member', async () => {
		message.guild_id = null;
		const interaction = await createMentionInteraction({ user, message });
		expect(interaction.member).toBeNull();
		expect(getMember).not.toHaveBeenCalled();
		expect(await runInhibitors({ user, command, interaction })).toBeUndefined();
	});
});
