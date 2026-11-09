import { LootTable } from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { AraxyteTable } from '../low/a-f/Araxyte.js';
import { AbhorrentSpectre } from './AbhorrentSpectre.js';
import { AncientCustodian } from './AncientCustodian.js';
import { BasiliskSentinel } from './BasiliskSentinel.js';
import { CaveAbomination } from './CaveAbomination.js';
import { ChasmCrawler } from './ChasmCrawler.js';
import { ChokeDevil } from './ChokeDevil.js';
import { Cockathrice } from './Cockathrice.js';
import { ColossalHydra } from './ColossalHydra.js';
import { CrushingHand } from './CrushingHand.js';
import { FlamingPyrelord } from './FlamingPyrelord.js';
import { GiantRockslug } from './GiantRockslug.js';
import { GreaterAbyssalDemon } from './GreaterAbyssalDemon.js';
import { GuardianDrake } from './GuardianDrake.js';
import { InsatiableBloodveld } from './InsatiableBloodveld.js';
import { InsatiableMutatedBloodveld } from './InsatiableMutatedBloodveld.js';
import { KingKurask } from './KingKurask.js';
import { MalevolentMage } from './MalevolentMage.js';
import { MarbleGargoyle } from './MarbleGargoyle.js';
import { MonstrousBasilisk } from './MonstrousBasilisk.js';
import { Nechryarch } from './Nechryarch.js';
import { NightBeast } from './NightBeast.js';
import { NuclearSmokeDevil } from './NuclearSmokeDevil.js';
import { RepugnantSpectre } from './RepugnantSpectre.js';
import { ScreamingBanshee } from './ScreamingBanshee.js';
import { ScreamingTwistedBanshee } from './ScreamingTwistedBanshee.js';
import { ShadowWyrm } from './ShadowWyrm.js';
import { SpikedTuroth } from './SpikedTuroth.js';
import { VitreousJelly } from './VitreousJelly.js';
import { VitreousWarpedJelly } from './VitreousWarpedJelly.js';

const DreadbornAraxyte = new SimpleMonster({
	id: 13680,
	name: 'Dreadborn araxyte',
	table: new LootTable()
		.every('Araxyte venom sack')
		.every(AraxyteTable, 3)
		.tertiary(64, 'Mist battlestaff')
		.tertiary(64, 'Dust battlestaff')
		.tertiary(224, 'Eternal gem')
		.tertiary(224, 'Imbued heart'),
	aliases: ['dreadborn araxyte']
});

export const allSuperiorMonsters: Record<string, SimpleMonster> = {
	AbhorrentSpectre,
	AncientCustodian,
	BasiliskSentinel,
	CaveAbomination,
	ChasmCrawler,
	ChokeDevil,
	Cockathrice,
	ColossalHydra,
	CrushingHand,
	DreadbornAraxyte,
	FlamingPyrelord,
	GiantRockslug,
	GreaterAbyssalDemon,
	GuardianDrake,
	InsatiableBloodveld,
	InsatiableMutatedBloodveld,
	KingKurask,
	MalevolentMage,
	MarbleGargoyle,
	MonstrousBasilisk,
	Nechryarch,
	NightBeast,
	NuclearSmokeDevil,
	RepugnantSpectre,
	ScreamingBanshee,
	ScreamingTwistedBanshee,
	ShadowWyrm,
	SpikedTuroth,
	VitreousJelly,
	VitreousWarpedJelly
};
