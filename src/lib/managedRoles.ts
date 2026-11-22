import { globalConfig, Roles } from '@/lib/constants.js';

export const managedRoles = [
	Roles.OSBTopSkiller,
	Roles.OSBTopCollector,
	Roles.OSBTopSacrificer,
	Roles.OSBTopMinigamer,
	Roles.OSBTopClueHunter,
	Roles.OSBTopFarmer,
	Roles.OSBTopSlayer,
	'1052481561603346442',
	Roles.OSBTopGlobalCL
];

export async function getManagedRoleMembers(): Promise<Map<string, Set<string>>> {
	const guildId = globalConfig.supportServerID;
	return new Map(
		await Promise.all(
			managedRoles.map(async role => {
				let members = await Cache.getManagedRoleMembers(guildId, role);
				if (members === null) {
					await Cache.initializeManagedRole(guildId, role, []);
					members = await Cache.getManagedRoleMembers(guildId, role);
				}
				return [role, new Set(members ?? [])] as const;
			})
		)
	);
}
