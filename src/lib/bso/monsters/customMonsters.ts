import { Akumu } from '@/lib/bso/monsters/bosses/Akumu.js';
import { Venatrix } from '@/lib/bso/monsters/bosses/Venatrix.js';
import { Malygos } from '@/lib/bso/monsters/demi-bosses/Malygos.js';
import { Nihiliz } from '@/lib/bso/monsters/demi-bosses/Nihiliz.js';
import { QueenBlackDragon } from '@/lib/bso/monsters/demi-bosses/QueenBlackDragon.js';
import { QueenGoldemar } from '@/lib/bso/monsters/demi-bosses/QueenGoldemar.js';
import { SeaKraken } from '@/lib/bso/monsters/demi-bosses/SeaKraken.js';
import { SuperiorTormentedDemon } from '@/lib/bso/monsters/demi-bosses/TormentedDemon.js';
import { Treebeard } from '@/lib/bso/monsters/demi-bosses/Treebeard.js';
import { VladimirDrakan } from '@/lib/bso/monsters/demi-bosses/VladimirDrakan.js';
import { Yeti } from '@/lib/bso/monsters/demi-bosses/Yeti.js';
import { CockroachSoldier, EliteBlackKnight } from '@/lib/bso/monsters/misc.js';
import { resourceDungeonMonsters } from '@/lib/bso/monsters/resourceDungeons.js';
import { SunMoonMonsters } from '@/lib/bso/monsters/SunMoon.js';

export const BSOMonsters = {
	Treebeard,
	SeaKraken,
	Malygos,
	QueenBlackDragon,
	Nihiliz,
	QueenGoldemar,
	SuperiorTormentedDemon,
	CockroachSoldier,
	EliteBlackKnight,
	Yeti,
	VladimirDrakan,
	Akumu,
	Venatrix,
	...resourceDungeonMonsters,
	...SunMoonMonsters
};
