import { noOp } from '@oldschoolgg/toolkit';

export const thingsToReset = [
	{
		name: 'Everything/All',
		run: async (user: MUser) => {
			await prisma.slayerTask.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.commandUsage.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.gearPreset.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.giveaway.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.minigame.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.newUser.deleteMany({ where: { id: user.id } }).catch(noOp);
			await prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.user.deleteMany({ where: { id: user.id } }).catch(noOp);
			return 'Reset all your data.';
		}
	},
	{
		name: 'Bank',
		run: async (user: MUser) => {
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					bank: {}
				}
			});
			return 'Reset your bank.';
		}
	}
];

export const thingsToWipe = [
	'bank',
	'combat_achievements',
	'cl',
	'quests',
	'buypayout',
	'kc',
	'cooldowns',
	'birdhouses',
	'giveaways'
] as const;
