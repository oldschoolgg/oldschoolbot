import { Openables } from 'oldschooljs';

import { InfernalImpling } from './simulation/customImplings';
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

const bsoEmojis = [
	[InfernalImpling.id, '<:Infernal_impling:884794733166202880>'],
	[47_521, '<:Beach_mystery_box:884794733086539776>'],
	[19_939, '<:Untradeable_mystery_box:884793435301744640>'],
	[13_345, '<:Tester_gift_box:884793434962006037>'],
	[47_502, '<:Royal_mystery_box:884794733099122728>'],
	[3062, '<:Pet_mystery_Box:884793435326926888>'],
	[50_045, '<:Mystery_impling:884794733128466482>'],
	[48_218, '<:Magic_crate:884794733162025060>'],
	[3713, '<:Holiday_mystery_box:884793435117219861>'],
	[50_044, '<:Eternal_impling:884794733103312896>'],
	[47_509, '<:Equippable_mystery_box:884794732864213024>'],
	[8871, '<:Dwarven_crate:884793435347890187>'],
	[45_010, '<:Birthday_pack:884793435331129384>'],
	[6199, '<:Tradeable_mystery_box:884793435364655124>'],
	[48_226, '<:Chimpling:884794294957916170>'],
	[19_838, '<:Grandmaster_casket:884799334837813308>']
] as const;
for (const [id, emoji] of bsoEmojis) {
	emojiMap.set(id, emoji);
}
