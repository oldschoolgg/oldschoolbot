import { KlasaUser, SettingsFolder } from 'klasa';
import { convertXPtoLVL } from 'oldschooljs/dist/util/util';

export default function countSkillsAtleast99(user: KlasaUser) {
	const skills = (user.settings.get('skills') as SettingsFolder).toJSON() as Record<
		string,
		number
	>;
	return Object.values(skills).filter(xp => convertXPtoLVL(xp) >= 99).length;
}
