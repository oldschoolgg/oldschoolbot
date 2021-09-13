import { Openables } from 'oldschooljs';

import getOSItem from './util/getOSItem';

export const emojiMap = new Map([
	[Openables.BabyImpling.id, '<:Baby_impling_jar:883170214068514877>'],
	[Openables.YoungImpling.id, '<:Young_impling_jar:883170214483750923>'],
	[Openables.GourmetImpling.id, '<:Gourmet_impling_jar:883170214534082560>'],
	[Openables.EarthImpling.id, '<:Earth_impling_jar:883170214219501639>'],
	[Openables.EssenceImpling.id, '<:Essence_impling_jar:883170214244667473>'],
	[Openables.EclecticImpling.id, '<:Eclectic_impling_jar:883170214479544401>'],
	[Openables.NatureImpling.id, '<:Nature_impling_jar:883170214504722432>'],
	[Openables.MagpieImpling.id, '<:Magpie_impling_jar:883170214458576947>'],
	[Openables.NinjaImpling.id, '<:Ninja_impling_jar:883170214508900422>'],
	[Openables.CrystalImpling.id, '<:Crystal_impling_jar:883170214152405013>'],
	[Openables.DragonImpling.id, '<:Dragon_impling_jar:883170214131417119>'],
	[Openables.LuckyImpling.id, '<:Lucky_impling_jar:883170214534074448>'],
	[getOSItem('Builders supply crate').id, '<:Builders_supply_crate:883173659731198002>'],
	[getOSItem('Spoils of war').id, '<:Spoils_of_war:883173659613736960>']
]);
