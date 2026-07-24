import { xp_gains_skill_enum } from '@/prisma/main.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { Skills } from '@/lib/skilling/skills/index.js';

export async function setMinigameKC(user: MUser, _minigame: string, kc: number) {
	if (_minigame.toLowerCase() === 'all') {
		await prisma.minigame.update({
			where: {
				user_id: user.id
			},
			data: Object.fromEntries(Minigames.map(game => [game.column, kc]))
		});
		await user.statsUpdate({
			tithe_farms_completed: kc
		});
		return `Set all ${Minigames.length} minigame KCs to ${kc}.`;
	}
	const minigame = Minigames.find(m => m.column === _minigame.toLowerCase());
	if (!minigame) return 'No kc set because invalid minigame.';
	await prisma.minigame.update({
		where: {
			user_id: user.id
		},
		data: {
			[minigame.column]: kc
		}
	});
	if (minigame.column === 'tithe_farm') {
		await user.statsUpdate({
			tithe_farms_completed: kc
		});
	}
	return `Set your ${minigame.name} KC to ${kc}.`;
}

export async function setXP(user: MUser, skillName: string, xp: number) {
	if (skillName === 'all') {
		await user.update(
			Object.fromEntries(Object.values(xp_gains_skill_enum).map(enumSkill => [`skills_${enumSkill}`, xp]))
		);
		return `Set all ${Object.values(xp_gains_skill_enum).length} skills to ${xp} XP.`;
	}
	const skill = Object.values(Skills).find(c => c.id === skillName);
	if (!skill) return 'No xp set because invalid skill.';
	await user.update({
		[`skills_${skill.id}`]: xp
	});
	return `Set ${skill.name} XP to ${xp}.`;
}
