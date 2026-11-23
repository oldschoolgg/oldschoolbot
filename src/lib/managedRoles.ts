import { globalConfig, Roles } from '@/lib/constants.js';

export const managedRoles = [
	Roles.BSOTopSkiller,
	Roles.BSOTopCollector,
	Roles.BSOTopSacrificer,
	Roles.BSOTopMinigamer,
	Roles.BSOTopClueHunter,
	Roles.BSOTopFarmer,
	Roles.BSOTopSlayer,
	'1104155653745946746',
	Roles.BSOTopGlobalCL,
	Roles.BSOTopLeagues,
	Roles.BSOTopTamer,
	Roles.BSOTopMysterious,
	'886180040465870918',
	Roles.BSOTopInventor
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
