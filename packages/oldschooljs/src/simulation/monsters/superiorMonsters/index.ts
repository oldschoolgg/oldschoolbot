import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { AraxyteTable } from '../low/a-f/Araxyte';
import AbhorrentSpectre from './AbhorrentSpectre';
import BasiliskSentinel from './BasiliskSentinel';
import CaveAbomination from './CaveAbomination';
import ChasmCrawler from './ChasmCrawler';
import ChokeDevil from './ChokeDevil';
import Cockathrice from './Cockathrice';
import ColossalHydra from './ColossalHydra';
import CrushingHand from './CrushingHand';
import FlamingPyrelord from './FlamingPyrelord';
import GiantRockslug from './GiantRockslug';
import GreaterAbyssalDemon from './GreaterAbyssalDemon';
import GuardianDrake from './GuardianDrake';
import InsatiableBloodveld from './InsatiableBloodveld';
import InsatiableMutatedBloodveld from './InsatiableMutatedBloodveld';
import KingKurask from './KingKurask';
import MalevolentMage from './MalevolentMage';
import MarbleGargoyle from './MarbleGargoyle';
import MonstrousBasilisk from './MonstrousBasilisk';
import Nechryarch from './Nechryarch';
import NightBeast from './NightBeast';
import NuclearSmokeDevil from './NuclearSmokeDevil';
import RepugnantSpectre from './RepugnantSpectre';
import ScreamingBanshee from './ScreamingBanshee';
import ScreamingTwistedBanshee from './ScreamingTwistedBanshee';
import ShadowWyrm from './ShadowWyrm';
import SpikedTuroth from './SpikedTuroth';
import VitreousJelly from './VitreousJelly';
import VitreousWarpedJelly from './VitreousWarpedJelly';

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

export const allSuperiorMonsters = {
	AbhorrentSpectre,
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
