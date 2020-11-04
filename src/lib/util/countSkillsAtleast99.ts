import { KlasaUser } from 'klasa';
import { convertXPtoLVL } from 'oldschooljs/dist/util/util';

export default function countSkillsAtleast99(user: KlasaUser) {
	// @ts-ignore
	const skills: { [key: string]: number } = user.settings.get('skills').toJSON();
	return Object.values(skills).filter(xp => convertXPtoLVL(xp) >= 99).length;
}
